import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAvellumBalance } from '@/lib/helius';

/**
 * GET /api/verifier?wallet=ADDRESS
 * Get verifier stats and ratings
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('wallet');

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Get fresh token balance
        const tokenBalance = await getAvellumBalance(walletAddress);

        // Try to get verifier data from database
        try {
            const { data: verifier } = await supabase
                .from('verifiers')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (!verifier) {
                return NextResponse.json({
                    isVerifier: tokenBalance > 0,
                    tokenBalance,
                    totalRatingsGiven: 0,
                    totalRevenueEarned: 0,
                    ratings: [],
                    source: 'new'
                });
            }

            // Get ratings given by this verifier
            const { data: ratings } = await supabase
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

            return NextResponse.json({
                isVerifier: true,
                walletAddress: verifier.wallet_address,
                tokenBalance,
                totalRatingsGiven: verifier.total_ratings_given || 0,
                totalRevenueEarned: parseFloat(verifier.total_revenue_earned) || 0,
                ratings: ratings || [],
                memberSince: verifier.created_at,
                source: 'database'
            });
        } catch (dbError) {
            // Database not available, return mock data
            console.log('Database not available, returning mock verifier data');

            return NextResponse.json({
                isVerifier: tokenBalance > 0,
                walletAddress,
                tokenBalance,
                totalRatingsGiven: 0,
                totalRevenueEarned: 0,
                ratings: [],
                memberSince: new Date().toISOString(),
                source: 'mock'
            });
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
