import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/debug/ratings
 * Debug endpoint to view recent ratings and verify data
 *
 * Query params:
 * - agent: filter by agent address
 * - limit: number of ratings to return (default 20)
 */
export async function GET(request: Request) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const agentAddress = searchParams.get('agent');
    const limit = parseInt(searchParams.get('limit') || '20');

    try {
        // Get recent ratings with verifier and agent info
        let query = supabase
            .from('ratings')
            .select(`
                id,
                score,
                token_weight,
                tx_signature,
                created_at,
                updated_at,
                verifier:verifiers(wallet_address),
                agent:agents(address, name, trust_score, total_ratings)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        // Filter by agent if provided
        if (agentAddress) {
            const { data: agent } = await supabase
                .from('agents')
                .select('id')
                .eq('address', agentAddress)
                .single();

            if (agent) {
                query = query.eq('agent_id', agent.id);
            }
        }

        const { data: ratings, error: ratingsError } = await query;

        if (ratingsError) {
            console.error('[debug/ratings] Query error:', ratingsError);
            return NextResponse.json({ error: ratingsError.message }, { status: 500 });
        }

        // Also get agent stats if filtering by agent
        let agentStats = null;
        if (agentAddress) {
            const { data: agent } = await supabase
                .from('agents')
                .select('*')
                .eq('address', agentAddress)
                .single();
            agentStats = agent;
        }

        // Calculate what the trust score SHOULD be based on ratings
        let calculatedTrustScore = null;
        if (ratings && ratings.length > 0) {
            let totalWeight = 0;
            let weightedSum = 0;
            for (const r of ratings) {
                const weight = r.token_weight || 1;
                const score = r.score || 0;
                totalWeight += weight;
                weightedSum += score * weight;
            }
            calculatedTrustScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        }

        return NextResponse.json({
            ratings: ratings?.map(r => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const verifier = r.verifier as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const agent = r.agent as any;
                return {
                    id: r.id,
                    score: r.score,
                    token_weight: r.token_weight,
                    tx_signature: r.tx_signature?.slice(0, 20) + '...',
                    created_at: r.created_at,
                    wallet: verifier?.wallet_address?.slice(0, 8) + '...',
                    agent_name: agent?.name,
                    agent_address: agent?.address?.slice(0, 8) + '...',
                    agent_current_trust_score: agent?.trust_score,
                    agent_total_ratings: agent?.total_ratings,
                };
            }),
            agentStats,
            calculatedTrustScore,
            totalRatings: ratings?.length || 0,
            message: agentAddress
                ? `Showing ratings for agent ${agentAddress.slice(0, 8)}...`
                : `Showing ${ratings?.length || 0} most recent ratings`
        });
    } catch (error) {
        console.error('[debug/ratings] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }
}
