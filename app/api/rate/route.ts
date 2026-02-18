import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getAvellumBalance, getSolBalance } from '@/lib/helius';
import { verifyMemoTransaction } from '@/lib/verify-memo-tx';
import { getExplorerUrl } from '@/lib/memo';
import { validateRatingRequest, ValidationError } from '@/lib/validation';
import { checkEndpointRateLimit, addRateLimitHeaders, rateLimitExceededResponse } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const log = logger;

/**
 * POST /api/rate
 * Submit a rating for an agent (requires on-chain memo verification)
 */
export async function POST(request: Request) {
    // Rate limiting check
    const rateLimitResult = checkEndpointRateLimit(request, 'rate');
    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    try {
        const body = await request.json();

        // Validate input
        let validatedData;
        try {
            validatedData = validateRatingRequest(body);
        } catch (err) {
            if (err instanceof ValidationError) {
                return NextResponse.json(
                    { error: err.message, code: err.code, field: err.field },
                    { status: 400 }
                );
            }
            throw err;
        }

        const { walletAddress, agentAddress, score, timestamp, txSignature } = validatedData;

        log.debug('Rating submission:', {
            walletAddress: walletAddress.slice(0, 8) + '...',
            agentAddress: agentAddress.slice(0, 8) + '...',
            score,
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
        let avlmBalance = 0;
        try {
            avlmBalance = await getAvellumBalance(walletAddress);
            log.debug('AVLM balance:', avlmBalance);
        } catch (avlmError) {
            log.debug('AVLM balance fetch failed (expected on mainnet):', avlmError);
        }

        const MIN_AVLM = 10000;
        const MIN_SOL = 0.1;

        let tokenBalance: number;
        let tokenWeight: number;
        let tokenType: 'AVLM' | 'SOL';

        if (avlmBalance >= MIN_AVLM) {
            tokenBalance = avlmBalance;
            tokenWeight = Math.floor(avlmBalance);
            tokenType = 'AVLM';
            log.debug('Using AVLM for voting. Balance:', avlmBalance, 'Weight:', tokenWeight);
        } else {
            const solBalance = await getSolBalance(walletAddress);
            log.debug('SOL balance:', solBalance);
            if (solBalance >= MIN_SOL) {
                tokenBalance = solBalance;
                tokenWeight = Math.floor(solBalance * 10000);
                tokenType = 'SOL';
                log.debug('Using SOL for voting. Balance:', solBalance, 'Weight:', tokenWeight);
            } else {
                return NextResponse.json(
                    { error: `You need at least ${MIN_AVLM.toLocaleString()} $AVLM or ${MIN_SOL} SOL to rate agents` },
                    { status: 403 }
                );
            }
        }

        const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
        const explorerUrl = getExplorerUrl(txSignature, network);

        const supabase = createServerClient();

        // Check tx_signature not already used (replay protection)
        const { data: existingTx, error: txCheckError } = await supabase
            .from('ratings')
            .select('id')
            .eq('tx_signature', txSignature)
            .maybeSingle();

        if (txCheckError) {
            log.error('Error checking tx_signature:', txCheckError);
        }

        if (existingTx) {
            return NextResponse.json(
                { error: 'This transaction has already been used for a rating' },
                { status: 409 }
            );
        }

        // Get or create verifier
        const { data: existingVerifier, error: verifierError } = await supabase
            .from('verifiers')
            .select('*')
            .eq('wallet_address', walletAddress)
            .maybeSingle();

        if (verifierError) {
            log.error('Error fetching verifier:', verifierError);
        }

        let verifierId: string;
        let verifierRatingsCount = 0;

        if (!existingVerifier) {
            const { data: newVerifier, error: createError } = await supabase
                .from('verifiers')
                .insert({
                    wallet_address: walletAddress,
                    token_balance: tokenWeight,
                    last_balance_check: new Date().toISOString()
                })
                .select()
                .single();

            if (createError || !newVerifier) {
                log.error('Failed to create verifier:', createError);
                throw createError || new Error('Failed to create verifier');
            }
            verifierId = newVerifier.id;
        } else {
            verifierId = existingVerifier.id;
            verifierRatingsCount = existingVerifier.total_ratings_given || 0;

            const { error: updateError } = await supabase
                .from('verifiers')
                .update({
                    token_balance: tokenWeight,
                    last_balance_check: new Date().toISOString()
                })
                .eq('id', verifierId);

            if (updateError) {
                log.error('Failed to update verifier:', updateError);
            }
        }

        // Get agent
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('id')
            .eq('address', agentAddress)
            .maybeSingle();

        if (agentError) {
            log.error('Error fetching agent:', agentError);
            throw new Error(`Agent fetch error: ${agentError.message}`);
        }

        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Upsert rating
        const ratingData = {
            verifier_id: verifierId,
            agent_id: agent.id,
            score: Math.floor(score),
            token_weight: tokenWeight,
            tx_signature: txSignature,
            updated_at: new Date().toISOString()
        };

        const { error: ratingError } = await supabase
            .from('ratings')
            .upsert(ratingData, { onConflict: 'verifier_id,agent_id' })
            .select()
            .single();

        if (ratingError) {
            log.error('Failed to upsert rating:', ratingError);
            throw ratingError;
        }

        // Update verifier's rating count
        await supabase
            .from('verifiers')
            .update({
                total_ratings_given: verifierRatingsCount + 1
            })
            .eq('id', verifierId);

        // Update agent's total_ratings count and recalculate trust_score
        const { data: agentRatings } = await supabase
            .from('ratings')
            .select('score, token_weight')
            .eq('agent_id', agent.id);

        if (agentRatings && agentRatings.length > 0) {
            let totalWeight = 0;
            let weightedSum = 0;
            for (const r of agentRatings) {
                const weight = r.token_weight || 1;
                const ratingScore = r.score || 0;
                totalWeight += weight;
                weightedSum += ratingScore * weight;
            }
            const newTrustScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

            await supabase
                .from('agents')
                .update({
                    total_ratings: agentRatings.length,
                    trust_score: newTrustScore,
                    updated_at: new Date().toISOString()
                })
                .eq('id', agent.id);
        }

        const response = NextResponse.json({
            success: true,
            txSignature,
            explorerUrl,
            tokenWeight,
            displayBalance: tokenBalance,
            tokenType,
        });

        addRateLimitHeaders(response.headers, rateLimitResult);
        return response;

    } catch (error) {
        log.error('Rate API error:', error);
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
    // Rate limiting check (using same limit as POST for simplicity)
    const rateLimitResult = checkEndpointRateLimit(request, 'rate');
    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const agentAddress = searchParams.get('agent');

    if (!walletAddress || !agentAddress) {
        return NextResponse.json(
            { error: 'Both wallet and agent parameters required' },
            { status: 400 }
        );
    }

    try {
        const supabase = createServerClient();

        const { data: verifier } = await supabase
            .from('verifiers')
            .select('id')
            .eq('wallet_address', walletAddress)
            .maybeSingle();

        if (!verifier) {
            return NextResponse.json({ rating: null });
        }

        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('address', agentAddress)
            .maybeSingle();

        if (!agent) {
            return NextResponse.json({ rating: null });
        }

        const { data: rating } = await supabase
            .from('ratings')
            .select('*')
            .eq('verifier_id', verifier.id)
            .eq('agent_id', agent.id)
            .maybeSingle();

        const response = NextResponse.json({ rating });
        addRateLimitHeaders(response.headers, rateLimitResult);
        return response;

    } catch (error) {
        log.error('Rate GET error:', error);
        return NextResponse.json({ rating: null });
    }
}
