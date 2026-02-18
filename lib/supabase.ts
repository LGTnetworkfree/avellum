import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for API routes)
// IMPORTANT: This client uses the service role key which bypasses RLS
export function createServerClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
            'Server-side operations require the service role key.'
        );
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            // Disable session persistence for server-side client
            persistSession: false,
            // Auto-refresh is not needed for service role
            autoRefreshToken: false,
        },
    });
}

// Type definitions for database tables
export interface Agent {
    id: string;
    address: string;
    name: string | null;
    description: string | null;
    registry: 'x402scan' | 'mcp' | 'a2a';
    metadata: Record<string, unknown>;
    trust_score: number;
    total_ratings: number;
    indexed_at: string;
    updated_at: string;
}

export interface Verifier {
    id: string;
    wallet_address: string;
    token_balance: number;
    last_balance_check: string | null;
    total_ratings_given: number;
    total_revenue_earned: number;
    created_at: string;
}

export interface Rating {
    id: string;
    verifier_id: string;
    agent_id: string;
    score: number;
    token_weight: number;
    tx_signature: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiUsage {
    id: string;
    endpoint: string;
    agent_address: string | null;
    fee_amount: number;
    caller_ip: string | null;
    called_at: string;
}
