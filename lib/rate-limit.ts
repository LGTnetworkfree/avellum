/**
 * In-memory rate limiting middleware
 * For production, consider using Redis or a distributed cache
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
        return;
    }

    lastCleanup = now;
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Rate limit configurations per endpoint
 */
export const RATE_LIMITS = {
    // POST /api/rate - 10 requests per minute
    rate: { maxRequests: 10, windowMs: 60 * 1000 },

    // GET /api/agents - 30 requests per minute
    agents: { maxRequests: 30, windowMs: 60 * 1000 },

    // GET /api/score/[address] - 60 requests per minute
    score: { maxRequests: 60, windowMs: 60 * 1000 },

    // GET /api/verifier - 20 requests per minute
    verifier: { maxRequests: 20, windowMs: 60 * 1000 },

    // GET /api/user/ratings - 20 requests per minute
    userRatings: { maxRequests: 20, windowMs: 60 * 1000 },
} as const;

export type RateLimitEndpoint = keyof typeof RATE_LIMITS;

/**
 * Result of rate limit check
 */
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    limit: number;
}

/**
 * Extract client identifier from request for rate limiting
 * Uses X-Forwarded-For, X-Real-IP, or falls back to a default
 */
export function getRateLimitIdentifier(request: Request): string {
    // Try X-Forwarded-For first (for proxied requests like Vercel)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP in the chain (original client)
        return forwardedFor.split(',')[0].trim();
    }

    // Try X-Real-IP
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    // Fallback - this shouldn't happen in production
    return 'unknown-client';
}

/**
 * Check if a request is within rate limits
 * @param identifier - Client identifier (usually IP address)
 * @param endpoint - The endpoint being accessed
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    // Run cleanup occasionally
    cleanupExpiredEntries();

    const now = Date.now();
    const key = `${identifier}`;
    const entry = rateLimitStore.get(key);

    // If no entry or window expired, create new entry
    if (!entry || entry.resetTime < now) {
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        rateLimitStore.set(key, newEntry);

        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: newEntry.resetTime,
            limit: config.maxRequests,
        };
    }

    // Increment count
    entry.count++;

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    return {
        allowed,
        remaining,
        resetTime: entry.resetTime,
        limit: config.maxRequests,
    };
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
    headers: Headers,
    result: RateLimitResult
): void {
    headers.set('X-RateLimit-Limit', String(result.limit));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): Response {
    const headers = new Headers({
        'Content-Type': 'application/json',
    });
    addRateLimitHeaders(headers, result);

    return new Response(
        JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
            status: 429,
            headers,
        }
    );
}

/**
 * Convenience function to check rate limit for a specific endpoint
 */
export function checkEndpointRateLimit(
    request: Request,
    endpoint: RateLimitEndpoint
): RateLimitResult {
    const identifier = getRateLimitIdentifier(request);
    const config = RATE_LIMITS[endpoint];
    const key = `${endpoint}:${identifier}`;
    return checkRateLimit(key, config);
}
