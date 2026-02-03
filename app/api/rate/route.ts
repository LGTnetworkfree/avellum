import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getAvellumBalance, getSolBalance } from '@/lib/helius';
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

        console.log('[rate API] Rating submission:', {
            walletAddress: walletAddress.slice(0, 8) + '...',
            agentAddress: agentAddress.slice(0, 8) + '...',
            score,
            timestamp
        });

        // Verify the on-chain memo transaction
        const verification = await verifyMemoTransaction(txSignature, walletAddress, agentAddress, score, timestamp);
        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || 'Transaction verification failed' },
                { status: 400 }
            );
        }

        // Check token balance - AVLM first, then SOL fallback
        // Note: AVLM fetch may fail on mainnet if token doesn't exist there, that's OK
        let avlmBalance = 0;
        try {
            avlmBalance = await getAvellumBalance(walletAddress);
            console.log('[rate API] AVLM balance fetched:', avlmBalance);
        } catch (avlmError) {
            console.log('[rate API] AVLM balance fetch failed (expected on mainnet):', avlmError);
            // Continue - we'll fall back to SOL
        }

        const MIN_AVLM = 10000;
        const MIN_SOL = 0.1;

        let tokenBalance: number;
        let tokenWeight: number; // Stored in DB - always an integer
        let tokenType: 'AVLM' | 'SOL';

        if (avlmBalance >= MIN_AVLM) {
            tokenBalance = avlmBalance;
            tokenWeight = Math.floor(avlmBalance); // Store as integer
            tokenType = 'AVLM';
            console.log('[rate API] Using AVLM for voting. Balance:', avlmBalance, 'Weight:', tokenWeight);
        } else {
            // Fallback to SOL
            const solBalance = await getSolBalance(walletAddress);
            console.log('[rate API] SOL balance fetched:', solBalance);
            if (solBalance >= MIN_SOL) {
                tokenBalance = solBalance;
                // Convert SOL to lamports for storage (integer)
                // This makes SOL weight comparable: 0.15 SOL = 150,000,000 lamports
                // But that's too big. Let's use SOL * 10000 for reasonable weighting
                // 0.15 SOL = 1500 weight (comparable to someone with 1500 AVLM)
                tokenWeight = Math.floor(solBalance * 10000);
                tokenType = 'SOL';
                console.log('[rate API] Using SOL for voting. Balance:', solBalance, 'Weight:', tokenWeight);
            } else {
                return NextResponse.json(
                    { error: `You need at least ${MIN_AVLM.toLocaleString()} $AVLM or ${MIN_SOL} SOL to rate agents` },
                    { status: 403 }
                );
            }
        }

        const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
        const explorerUrl = getExplorerUrl(txSignature, network);

        // Try database operation first
        try {
            console.log('[rate API] ========== DATABASE OPERATIONS START ==========');
            console.log('[rate API] Step 1: Checking if tx_signature already used...');
            console.log('[rate API] txSignature value:', txSignature);
            console.log('[rate API] txSignature type:', typeof txSignature);

            // Check tx_signature not already used (replay protection)
            // Use .maybeSingle() instead of .single() to avoid error when no match found
            const { data: existingTx, error: txCheckError } = await supabase
                .from('ratings')
                .select('id')
                .eq('tx_signature', txSignature)
                .maybeSingle();

            console.log('[rate API] Step 1 complete. existingTx:', existingTx, 'error:', txCheckError);

            if (txCheckError) {
                console.error('[rate API] Error checking tx_signature:', txCheckError);
            }

            if (existingTx) {
                return NextResponse.json(
                    { error: 'This transaction has already been used for a rating' },
                    { status: 409 }
                );
            }

            console.log('[rate API] Step 2: Transaction signature is new, looking up verifier...');

            // Get or create verifier
            let { data: verifier, error: verifierError } = await supabase
                .from('verifiers')
                .select('*')
                .eq('wallet_address', walletAddress)
                .maybeSingle();

            console.log('[rate API] Step 2 complete. verifier:', verifier?.id || 'null', 'error:', verifierError);

            if (verifierError) {
                console.error('[rate API] Error fetching verifier:', verifierError);
            }

            if (!verifier) {
                console.log('[rate API] Step 2b: Creating new verifier...');
                const verifierData = {
                    wallet_address: walletAddress,
                    token_balance: tokenWeight, // Use integer weight
                    last_balance_check: new Date().toISOString()
                };
                console.log('[rate API] Step 2b: Inserting verifier data:', JSON.stringify(verifierData));

                const { data: newVerifier, error: createError } = await supabase
                    .from('verifiers')
                    .insert(verifierData)
                    .select()
                    .single();

                console.log('[rate API] Step 2b complete. newVerifier:', newVerifier?.id || 'null', 'error:', createError);
                if (createError) {
                    console.error('[rate API] Step 2b FAILED with code:', createError.code, 'message:', createError.message);
                    throw createError;
                }
                verifier = newVerifier;
            } else {
                console.log('[rate API] Step 2c: Updating existing verifier balance...');
                // Update token balance
                const { error: updateError } = await supabase
                    .from('verifiers')
                    .update({
                        token_balance: tokenWeight, // Use integer weight
                        last_balance_check: new Date().toISOString()
                    })
                    .eq('id', verifier.id);
                console.log('[rate API] Step 2c complete. updateError:', updateError);
                if (updateError) {
                    console.error('[rate API] Step 2c FAILED with code:', updateError.code, 'message:', updateError.message);
                }
            }

            console.log('[rate API] Step 3: Looking up agent by address:', agentAddress);

            // Get agent
            const { data: agent, error: agentError } = await supabase
                .from('agents')
                .select('id')
                .eq('address', agentAddress)
                .maybeSingle();

            console.log('[rate API] Step 3 complete. agent:', agent?.id || 'null', 'error:', agentError);

            if (agentError) {
                console.error('[rate API] Error fetching agent:', agentError);
                throw new Error(`Agent fetch error: ${agentError.message}`);
            }

            if (!agent) {
                console.error('[rate API] Agent not found for address:', agentAddress);
                throw new Error('Agent not in database');
            }

            console.log('[rate API] Step 4: Found agent with ID:', agent.id, '- Upserting rating...');

            // Upsert rating - ensure all values are correct types
            const ratingData = {
                verifier_id: verifier.id,
                agent_id: agent.id,
                score: Math.floor(score), // Ensure integer
                token_weight: tokenWeight, // Already an integer
                tx_signature: txSignature,
                updated_at: new Date().toISOString()
            };

            console.log('[rate API] Step 4: Upserting rating data:', JSON.stringify(ratingData));
            console.log('[rate API] Step 4: Data types - verifier_id:', typeof verifier.id, 'agent_id:', typeof agent.id, 'score:', typeof ratingData.score, 'token_weight:', typeof ratingData.token_weight);

            const { data: upsertedRating, error: ratingError } = await supabase
                .from('ratings')
                .upsert(ratingData, { onConflict: 'verifier_id,agent_id' })
                .select()
                .single();

            console.log('[rate API] Step 4 complete. upsertedRating:', upsertedRating?.id || 'null', 'error:', ratingError);

            if (ratingError) {
                console.error('[rate API] Step 4 FAILED with code:', ratingError.code, 'message:', ratingError.message, 'details:', ratingError.details);
                throw ratingError;
            }

            console.log('[rate API] Step 5: Rating upserted successfully! Updating verifier count...');

            // Update verifier's rating count
            await supabase
                .from('verifiers')
                .update({
                    total_ratings_given: (verifier.total_ratings_given || 0) + 1
                })
                .eq('id', verifier.id);

            // Update agent's total_ratings count and recalculate trust_score
            // First get the current count and all ratings for this agent
            const { data: agentRatings, error: ratingsQueryError } = await supabase
                .from('ratings')
                .select('score, token_weight')
                .eq('agent_id', agent.id);

            console.log('[rate API] Agent ID:', agent.id);
            console.log('[rate API] Ratings query error:', ratingsQueryError);
            console.log('[rate API] All ratings for agent:', agentRatings);

            if (agentRatings && agentRatings.length > 0) {
                // Calculate weighted trust score
                let totalWeight = 0;
                let weightedSum = 0;
                for (const r of agentRatings) {
                    const weight = r.token_weight || 1;
                    const ratingScore = r.score || 0;
                    totalWeight += weight;
                    weightedSum += ratingScore * weight;
                    console.log(`[rate API] Rating: score=${ratingScore}, weight=${weight}`);
                }
                const newTrustScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

                console.log('[rate API] Calculation:', {
                    totalWeight,
                    weightedSum,
                    newTrustScore,
                    totalRatings: agentRatings.length
                });

                const { error: updateError } = await supabase
                    .from('agents')
                    .update({
                        total_ratings: agentRatings.length,
                        trust_score: newTrustScore,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', agent.id);

                console.log('[rate API] Agent update error:', updateError);
            } else {
                console.log('[rate API] No ratings found for agent!');
            }

            console.log('[rate API] ========== DATABASE OPERATIONS SUCCESS ==========');
            console.log('[rate API] Rating saved to database successfully!');

            return NextResponse.json({
                success: true,
                txSignature,
                explorerUrl,
                tokenWeight: tokenWeight,
                displayBalance: tokenBalance, // Original balance for display
                tokenType,
                source: 'database'
            });
        } catch (dbError) {
            // Database not available, use mock storage
            console.error('[rate API] ========== DATABASE ERROR - FALLING BACK TO MOCK ==========');
            console.error('[rate API] Error type:', dbError?.constructor?.name);
            console.error('[rate API] Error message:', dbError instanceof Error ? dbError.message : String(dbError));
            console.error('[rate API] Full error:', dbError);

            const ratingKey = `${walletAddress}:${agentAddress}`;
            mockRatings.set(ratingKey, {
                score,
                tokenWeight: tokenWeight,
                txSignature,
                updatedAt: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                txSignature,
                explorerUrl,
                tokenWeight: tokenWeight,
                displayBalance: tokenBalance, // Original balance for display
                tokenType,
                source: 'mock',
                debugError: dbError instanceof Error ? dbError.message : String(dbError)
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
