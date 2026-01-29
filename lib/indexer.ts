import { supabase, type Agent } from './supabase';

// Mock agent data for development
const MOCK_AGENTS: Omit<Agent, 'id' | 'indexed_at' | 'updated_at'>[] = [
    {
        address: 'AGT1x402scanAgent123456789abcdef',
        name: 'PaymentBot Pro',
        description: 'Automated payment processing agent for seamless crypto transactions',
        registry: 'x402scan',
        metadata: { version: '2.1', capabilities: ['payments', 'swaps'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT2x402scanAgent987654321fedcba',
        name: 'DataOracle X',
        description: 'Real-time data feeds for DeFi protocols',
        registry: 'x402scan',
        metadata: { version: '1.5', capabilities: ['oracles', 'feeds'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT3mcpRegistryAgent111222333aaa',
        name: 'CodeAssist AI',
        description: 'AI-powered code review and suggestion agent',
        registry: 'mcp',
        metadata: { version: '3.0', capabilities: ['code-review', 'suggestions'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT4mcpRegistryAgent444555666bbb',
        name: 'SecurityAudit Bot',
        description: 'Smart contract security auditing agent',
        registry: 'mcp',
        metadata: { version: '2.0', capabilities: ['auditing', 'vulnerability-scan'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT5a2aRegistryAgent777888999ccc',
        name: 'TradingAgent Alpha',
        description: 'Autonomous trading agent with ML strategies',
        registry: 'a2a',
        metadata: { version: '4.0', capabilities: ['trading', 'analysis'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT6a2aRegistryAgentaaabbbcccddd',
        name: 'ContentGen Pro',
        description: 'Multi-modal content generation agent',
        registry: 'a2a',
        metadata: { version: '1.8', capabilities: ['text', 'images', 'video'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT7x402scanAgenteeefffggghhh',
        name: 'BridgeBot',
        description: 'Cross-chain asset bridging agent',
        registry: 'x402scan',
        metadata: { version: '2.3', capabilities: ['bridges', 'swaps'] },
        trust_score: 0,
        total_ratings: 0
    },
    {
        address: 'AGT8mcpRegistryAgentiiijjjkkklll',
        name: 'DocuSign AI',
        description: 'Document verification and signing agent',
        registry: 'mcp',
        metadata: { version: '1.2', capabilities: ['documents', 'verification'] },
        trust_score: 0,
        total_ratings: 0
    }
];

/**
 * Fetch agents from x402scan registry (placeholder)
 */
export async function indexX402Scan(): Promise<Agent[]> {
    console.log('Indexing agents from x402scan...');
    // TODO: Implement actual x402scan API integration
    return [];
}

/**
 * Fetch agents from MCP registry (placeholder)
 */
export async function indexMCPRegistry(): Promise<Agent[]> {
    console.log('Indexing agents from MCP registry...');
    // TODO: Implement actual MCP registry API integration
    return [];
}

/**
 * Fetch agents from A2A registry (placeholder)
 */
export async function indexA2ARegistry(): Promise<Agent[]> {
    console.log('Indexing agents from A2A registry...');
    // TODO: Implement actual A2A registry API integration
    return [];
}

/**
 * Seed mock agents into database (for development)
 */
export async function seedMockAgents(): Promise<{ success: boolean; count: number }> {
    try {
        const { data, error } = await supabase
            .from('agents')
            .upsert(
                MOCK_AGENTS.map(agent => ({
                    ...agent,
                    indexed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })),
                { onConflict: 'address' }
            )
            .select();

        if (error) {
            console.error('Error seeding agents:', error);
            return { success: false, count: 0 };
        }

        return { success: true, count: data?.length || 0 };
    } catch (error) {
        console.error('Error seeding agents:', error);
        return { success: false, count: 0 };
    }
}

/**
 * Get all indexed agents with optional filters
 */
export async function getAgents(options?: {
    registry?: 'x402scan' | 'mcp' | 'a2a';
    minScore?: number;
    maxScore?: number;
    limit?: number;
    offset?: number;
}): Promise<{ agents: Agent[]; total: number }> {
    try {
        let query = supabase.from('agents').select('*', { count: 'exact' });

        if (options?.registry) {
            query = query.eq('registry', options.registry);
        }

        if (options?.minScore !== undefined) {
            query = query.gte('trust_score', options.minScore);
        }

        if (options?.maxScore !== undefined) {
            query = query.lte('trust_score', options.maxScore);
        }

        query = query.order('trust_score', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching agents:', error);
            return { agents: [], total: 0 };
        }

        return { agents: data as Agent[], total: count || 0 };
    } catch (error) {
        console.error('Error fetching agents:', error);
        return { agents: [], total: 0 };
    }
}

/**
 * Get agent by address
 */
export async function getAgentByAddress(address: string): Promise<Agent | null> {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('address', address)
        .single();

    if (error) {
        console.error('Error fetching agent:', error);
        return null;
    }

    return data as Agent;
}

/**
 * Run full indexer (placeholder - combines all registries)
 */
export async function runFullIndex(): Promise<{
    x402scan: number;
    mcp: number;
    a2a: number;
}> {
    const results = {
        x402scan: 0,
        mcp: 0,
        a2a: 0
    };

    // For now, just seed mock data
    const mockResult = await seedMockAgents();
    if (mockResult.success) {
        results.x402scan = 3;
        results.mcp = 3;
        results.a2a = 2;
    }

    return results;
}
