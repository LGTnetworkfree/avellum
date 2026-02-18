import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getAvellumBalance } from '@/lib/helius';
import { isValidSolanaAddress } from '@/lib/validation';
import { checkEndpointRateLimit, addRateLimitHeaders, rateLimitExceededResponse } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/verifier?wallet=ADDRESS
 * Get verifier stats and ratings
 */
export async function GET(request: Request) {
    // Rate limiting check
    const rateLimitResult = checkEndpointRateLimit(request, 'verifier');
    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('wallet');

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        if (!isValidSolanaAddress(walletAddress)) {
            return NextResponse.json(
                { error: 'Invalid wallet address format' },
                { status: 400 }
            );
        }

        // Get fresh token balance
        const tokenBalance = await getAvellumBalance(walletAddress);

        const supabase = createServerClient();

        const { data: verifier, error: verifierError } = await supabase
            .from('verifiers')
            .select('*')
            .eq('wallet_address', walletAddress)
            .maybeSingle();

        if (verifierError) {
            logger.error('Database error fetching verifier:', verifierError.message);
            return NextResponse.json(
                { error: 'Failed to fetch verifier' },
                { status: 500 }
            );
        }

        if (!verifier) {
            const response = NextResponse.json({
                isVerifier: tokenBalance > 0,
                tokenBalance,
                totalRatingsGiven: 0,
                totalRevenueEarned: 0,
                ratings: [],
            });
            addRateLimitHeaders(response.headers, rateLimitResult);
            return response;
        }

        // Get ratings given by this verifier
        const { data: ratings, error: ratingsError } = await supabase
            .from('ratings')
            .select(`
                *,
                agents:agent_id (
                    address,
                    name,
                    registry,
                    trust_score
                )
            `)
            .eq('verifier_id', verifier.id)
            .order('updated_at', { ascending: false });

        if (ratingsError) {
            logger.error('Database error fetching ratings:', ratingsError.message);
        }

        const response = NextResponse.json({
            isVerifier: true,
            walletAddress: verifier.wallet_address,
            tokenBalance,
            totalRatingsGiven: verifier.total_ratings_given || 0,
            totalRevenueEarned: parseFloat(verifier.total_revenue_earned) || 0,
            ratings: ratings || [],
            memberSince: verifier.created_at,
        });

        addRateLimitHeaders(response.headers, rateLimitResult);
        return response;

    } catch (error) {
        logger.error('Verifier API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
