import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sanitizeSearchQuery, isValidRegistry, validatePagination, validateScoreRange } from '@/lib/validation';
import { checkEndpointRateLimit, addRateLimitHeaders, rateLimitExceededResponse } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/agents
 * List all indexed agents with optional filters
 */
export async function GET(request: Request) {
    // Rate limiting check
    const rateLimitResult = checkEndpointRateLimit(request, 'agents');
    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult);
    }

    try {
        const { searchParams } = new URL(request.url);

        // Validate and sanitize inputs
        const registryParam = searchParams.get('registry');
        const registry = isValidRegistry(registryParam) ? registryParam : null;

        const search = sanitizeSearchQuery(searchParams.get('search'));
        const { limit, offset } = validatePagination(
            searchParams.get('limit'),
            searchParams.get('offset')
        );
        const { minScore, maxScore } = validateScoreRange(
            searchParams.get('minScore'),
            searchParams.get('maxScore')
        );

        const supabase = createServerClient();
        let query = supabase.from('agents').select('*', { count: 'exact' });

        if (registry) {
            query = query.eq('registry', registry);
        }

        if (search) {
            // Use parameterized pattern - Supabase handles escaping
            const pattern = `%${search}%`;
            query = query.or(`name.ilike.${pattern},description.ilike.${pattern},address.ilike.${pattern}`);
        }

        if (minScore !== null) {
            query = query.gte('trust_score', minScore);
        }

        if (maxScore !== null) {
            query = query.lte('trust_score', maxScore);
        }

        query = query.order('trust_score', { ascending: false });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            logger.error('Database error fetching agents:', error.message);
            return NextResponse.json(
                { error: 'Failed to fetch agents' },
                { status: 500 }
            );
        }

        const response = NextResponse.json({
            agents: data || [],
            total: count ?? 0,
            limit,
            offset,
        });

        // Add caching headers
        response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        addRateLimitHeaders(response.headers, rateLimitResult);

        return response;

    } catch (error) {
        logger.error('Agents API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
