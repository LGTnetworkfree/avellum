import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { isValidSolanaAddress } from '@/lib/validation';
import { checkEndpointRateLimit, addRateLimitHeaders, rateLimitExceededResponse } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface RouteParams {
    params: Promise<{ address: string }>;
}

/**
 * GET /api/score/[address]
 * Public API endpoint to get trust score for an agent
 */
export async function GET(request: Request, { params }: RouteParams) {
    // Rate limiting check
    const rateLimitResult = checkEndpointRateLimit(request, 'score');
    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    try {
        const { address } = await params;

        // Validate address format
        if (!address) {
            return NextResponse.json(
                { error: 'Agent address is required' },
                { status: 400 }
            );
        }

        if (!isValidSolanaAddress(address)) {
            return NextResponse.json(
                { error: 'Invalid agent address format' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        const { data: agent, error } = await supabase
            .from('agents')
            .select('*')
            .eq('address', address)
            .maybeSingle();

        if (error) {
            logger.error('Database error fetching agent:', error.message);
            return NextResponse.json(
                { error: 'Failed to fetch agent' },
                { status: 500 }
            );
        }

        if (!agent) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Log API usage for revenue tracking (non-blocking)
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        supabase.from('api_usage').insert({
            endpoint: `/api/score/${address}`,
            agent_address: address,
            fee_amount: 0.001,
            caller_ip: clientIp
        }).then(() => { }, () => { });

        const response = NextResponse.json({
            address: agent.address,
            name: agent.name,
            description: agent.description,
            registry: agent.registry,
            trust_score: parseFloat(agent.trust_score) || 0,
            total_ratings: agent.total_ratings || 0,
            indexed_at: agent.indexed_at,
            updated_at: agent.updated_at,
        });

        // Cache for 30s, allow stale for 5 min while revalidating
        response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
        addRateLimitHeaders(response.headers, rateLimitResult);

        return response;

    } catch (error) {
        logger.error('Score API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
