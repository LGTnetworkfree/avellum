import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/user/ratings
 * Get all ratings submitted by a specific wallet address
 *
 * Query params:
 * - wallet: wallet address (required)
 */
export async function GET(request: Request) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
        return NextResponse.json(
            { error: 'wallet parameter is required' },
            { status: 400 }
        );
    }

    try {
        // First get the verifier ID for this wallet
        const { data: verifier, error: verifierError } = await supabase
            .from('verifiers')
            .select('id')
            .eq('wallet_address', walletAddress)
            .maybeSingle();

        if (verifierError) {
            console.error('[user/ratings] Verifier query error:', verifierError);
            return NextResponse.json({ error: verifierError.message }, { status: 500 });
        }

        if (!verifier) {
            // No verifier found = no ratings
            return NextResponse.json({
                ratings: [],
                totalRatings: 0,
                totalWeight: 0
            });
        }

        // Get all ratings for this verifier with agent info
        const { data: ratings, error: ratingsError } = await supabase
            .from('ratings')
            .select(`
                id,
                score,
                token_weight,
                tx_signature,
                created_at,
                updated_at,
                agent:agents(address, name)
            `)
            .eq('verifier_id', verifier.id)
            .order('updated_at', { ascending: false });

        if (ratingsError) {
            console.error('[user/ratings] Ratings query error:', ratingsError);
            return NextResponse.json({ error: ratingsError.message }, { status: 500 });
        }

        // Calculate totals
        let totalWeight = 0;
        const formattedRatings = ratings?.map(r => {
            totalWeight += r.token_weight || 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const agent = r.agent as any;
            return {
                id: r.id,
                agentAddress: agent?.address || '',
                agentName: agent?.name || 'Unknown Agent',
                score: r.score,
                tokenWeight: r.token_weight,
                txSignature: r.tx_signature,
                date: r.updated_at || r.created_at
            };
        }) || [];

        return NextResponse.json({
            ratings: formattedRatings,
            totalRatings: formattedRatings.length,
            totalWeight
        });
    } catch (error) {
        console.error('[user/ratings] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }
}
