import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const REGISTRY_URL = 'https://registry.modelcontextprotocol.io/v0/servers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface McpServer {
    server: {
        name: string;
        description?: string;
        repository?: { url?: string };
        version?: string;
    };
    _meta?: Record<string, unknown>;
}

interface RegistryResponse {
    servers: McpServer[];
    metadata?: { nextCursor?: string };
}

/** Deterministic address from the MCP server name: first 32 bytes of SHA-256, hex-encoded. */
function nameToAddress(name: string): string {
    return createHash('sha256').update(name).digest('hex').slice(0, 40);
}

async function fetchAllServers(): Promise<McpServer[]> {
    const all: McpServer[] = [];
    let cursor: string | undefined;

    while (true) {
        const url = cursor ? `${REGISTRY_URL}?cursor=${encodeURIComponent(cursor)}` : REGISTRY_URL;
        console.log(`Fetching ${url} ...`);

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Registry API returned ${res.status}: ${await res.text()}`);
        }

        const data: RegistryResponse = await res.json();
        all.push(...data.servers);
        console.log(`  got ${data.servers.length} servers (total so far: ${all.length})`);

        cursor = data.metadata?.nextCursor;
        if (!cursor) break;
    }

    return all;
}

async function main() {
    console.log('Fetching MCP servers from registry...\n');
    const servers = await fetchAllServers();
    console.log(`\nTotal servers fetched: ${servers.length}\n`);

    // Deduplicate by name (keep first occurrence)
    const seen = new Set<string>();
    const unique: McpServer[] = [];
    for (const s of servers) {
        const name = s.server.name;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        unique.push(s);
    }
    console.log(`Unique servers after dedup: ${unique.length}\n`);

    const rows = unique.map((s) => {
        const name = s.server.name;
        const repoUrl = s.server.repository?.url ?? null;
        return {
            address: nameToAddress(name),
            name,
            description: s.server.description || null,
            registry: 'mcp' as const,
            metadata: {
                repository_url: repoUrl,
                version: s.server.version ?? null,
            },
            trust_score: 0,
            total_ratings: 0,
            updated_at: new Date().toISOString(),
        };
    });

    // Upsert in batches of 50
    const BATCH = 50;
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const { data, error } = await supabase
            .from('agents')
            .upsert(batch, { onConflict: 'address' })
            .select('address');

        if (error) {
            console.error(`Batch ${i / BATCH + 1} error:`, error.message);
            continue;
        }

        const count = data?.length ?? 0;
        inserted += count;
        console.log(`Batch ${Math.floor(i / BATCH) + 1}: upserted ${count} agents`);
    }

    console.log(`\nDone. ${inserted} agents upserted into Supabase (registry=mcp).`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
