import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { isValidSolanaAddress } from '@/lib/validation';
import { checkEndpointRateLimit, addRateLimitHeaders, rateLimitExceededResponse } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/user/ratings
 * Get all ratings submitted by a specific wallet address
 *
 * Query params:
 * - wallet: wallet address (required)
 */
export async function GET(request: Request) {
    // Rate limiting check
    const rateLimitResult = checkEndpointRateLimit(request, 'userRatings');
    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
        return NextResponse.json(
            { error: 'wallet parameter is required' },
            { status: 400 }
        );
    }

    if (!isValidSolanaAddress(walletAddress)) {
        return NextResponse.json(
            { error: 'Invalid wallet address format' },
            { status: 400 }
        );
    }

    try {
        const supabase = createServerClient();

        // First get the verifier ID for this wallet
        const { data: verifier, error: verifierError } = await supabase
            .from('verifiers')
            .select('id')
            .eq('wallet_address', walletAddress)
            .maybeSingle();

        if (verifierError) {
            logger.error('Verifier query error:', verifierError.message);
            return NextResponse.json(
                { error: 'Failed to fetch verifier' },
                { status: 500 }
            );
        }

        if (!verifier) {
            // No verifier found = no ratings
            const response = NextResponse.json({
                ratings: [],
                totalRatings: 0,
                totalWeight: 0
            });
            addRateLimitHeaders(response.headers, rateLimitResult);
            return response;
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
            logger.error('Ratings query error:', ratingsError.message);
            return NextResponse.json(
                { error: 'Failed to fetch ratings' },
                { status: 500 }
            );
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

        const response = NextResponse.json({
            ratings: formattedRatings,
            totalRatings: formattedRatings.length,
            totalWeight
        });

        addRateLimitHeaders(response.headers, rateLimitResult);
        return response;

    } catch (error) {
        logger.error('User ratings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ratings' },
            { status: 500 }
        );
    }
}
