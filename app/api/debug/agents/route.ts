import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/debug/agents
 * Debug endpoint to list all agents and their addresses
 */
export async function GET() {
    const supabase = createServerClient();

    try {
        const { data: agents, error } = await supabase
            .from('agents')
            .select('id, address, name, trust_score, total_ratings')
            .order('name');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            agents: agents?.map(a => ({
                id: a.id,
                address: a.address,
                addressPreview: `${a.address.slice(0, 12)}...${a.address.slice(-8)}`,
                name: a.name,
                trust_score: a.trust_score,
                total_ratings: a.total_ratings
            })),
            total: agents?.length || 0
        });
    } catch (error) {
        console.error('[debug/agents] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }
}
