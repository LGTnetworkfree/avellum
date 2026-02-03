import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getAvellumBalance } from '@/lib/helius';
import { verifyMemoTransaction } from '@/lib/verify-memo-tx';
import { getExplorerUrl } from '@/lib/memo';

// In-memory mock storage for ratings when database is not available
const mockRatings: Map<string, { score: number; tokenWeight: number; txSignature: string; updatedAt: string }> = new Map();

interface RatingRequest {
    walletAddress: string;
    agentAddress: string;
    score: number;
    timestamp: number;
    txSignature: string;
}

/**
 * POST /api/rate
 * Submit a rating for an agent (requires on-chain memo verification)
 */
export async function POST(request: Request) {
    const supabase = createServerClient();
    try {
        const body: RatingRequest = await request.json();
        const { walletAddress, agentAddress, score, timestamp, txSignature } = body;

        // Validate inputs
        if (!walletAddress || !agentAddress || score === undefined || !txSignature || !timestamp) {
            return NextResponse.json(
                { error: 'Missing required fields: walletAddress, agentAddress, score, timestamp, txSignature' },
                { status: 400 }
            );
        }

        if (score < 0 || score > 100) {
            return NextResponse.json(
                { error: 'Score must be between 0 and 100' },
                { status: 400 }
            );
        }

        // Verify the on-chain memo transaction
        const verification = await verifyMemoTransaction(txSignature, walletAddress, agentAddress, score, timestamp);
        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || 'Transaction verification failed' },
                { status: 400 }
            );
        }

        // Check token balance
        const tokenBalance = await getAvellumBalance(walletAddress);

        if (tokenBalance < 10000) {
            return NextResponse.json(
                { error: 'You must hold at least 10,000 $AVLM to rate agents' },
                { status: 403 }
            );
        }

        const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
        const explorerUrl = getExplorerUrl(txSignature, network);

        // Try database operation first
        try {
            // Check tx_signature not already used (replay protection)
            const { data: existingTx } = await supabase
                .from('ratings')
                .select('id')
                .eq('tx_signature', txSignature)
                .single();

            if (existingTx) {
                return NextResponse.json(
                    { error: 'This transaction has already been used for a rating' },
                    { status: 409 }
                );
            }

            // Get or create verifier
            let { data: verifier } = await supabase
                .from('verifiers')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (!verifier) {
                const { data: newVerifier, error: createError } = await supabase
                    .from('verifiers')
                    .insert({
                        wallet_address: walletAddress,
                        token_balance: tokenBalance,
                        last_balance_check: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                verifier = newVerifier;
            } else {
                // Update token balance
                await supabase
                    .from('verifiers')
                    .update({
                        token_balance: tokenBalance,
                        last_balance_check: new Date().toISOString()
                    })
                    .eq('id', verifier.id);
            }

            // Get agent
            const { data: agent, error: agentError } = await supabase
                .from('agents')
                .select('id')
                .eq('address', agentAddress)
                .single();

            if (agentError || !agent) throw new Error('Agent not in database');

            // Upsert rating
            const { error: ratingError } = await supabase
                .from('ratings')
                .upsert(
                    {
                        verifier_id: verifier.id,
                        agent_id: agent.id,
                        score,
                        token_weight: tokenBalance,
                        tx_signature: txSignature,
                        updated_at: new Date().toISOString()
                    },
                    {
                        onConflict: 'verifier_id,agent_id'
                    }
                );

            if (ratingError) throw ratingError;

            // Update verifier's rating count
            await supabase
                .from('verifiers')
                .update({
                    total_ratings_given: (verifier.total_ratings_given || 0) + 1
                })
                .eq('id', verifier.id);

            return NextResponse.json({
                success: true,
                txSignature,
                explorerUrl,
                tokenWeight: tokenBalance,
                source: 'database'
            });
        } catch (dbError) {
            // Database not available, use mock storage
            console.log('Using mock rating storage');

            const ratingKey = `${walletAddress}:${agentAddress}`;
            mockRatings.set(ratingKey, {
                score,
                tokenWeight: tokenBalance,
                txSignature,
                updatedAt: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                txSignature,
                explorerUrl,
                tokenWeight: tokenBalance,
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

/**
 * GET /api/rate
 * Get rating for a specific wallet/agent pair
 */
export async function GET(request: Request) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const agentAddress = searchParams.get('agent');

    if (!walletAddress || !agentAddress) {
        return NextResponse.json(
            { error: 'Both wallet and agent parameters required' },
            { status: 400 }
        );
    }

    // Check mock storage first
    const ratingKey = `${walletAddress}:${agentAddress}`;
    const mockRating = mockRatings.get(ratingKey);

    if (mockRating) {
        return NextResponse.json({
            score: mockRating.score,
            tokenWeight: mockRating.tokenWeight,
            updatedAt: mockRating.updatedAt,
            source: 'mock'
        });
    }

    // Try database
    try {
        const { data: verifier } = await supabase
            .from('verifiers')
            .select('id')
            .eq('wallet_address', walletAddress)
            .single();

        if (!verifier) {
            return NextResponse.json({ rating: null });
        }

        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('address', agentAddress)
            .single();

        if (!agent) {
            return NextResponse.json({ rating: null });
        }

        const { data: rating } = await supabase
            .from('ratings')
            .select('*')
            .eq('verifier_id', verifier.id)
            .eq('agent_id', agent.id)
            .single();

        return NextResponse.json({
            rating,
            source: 'database'
        });
    } catch {
        return NextResponse.json({ rating: null });
    }
}
