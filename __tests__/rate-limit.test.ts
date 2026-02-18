import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    checkRateLimit,
    getRateLimitIdentifier,
    RATE_LIMITS,
} from '@/lib/rate-limit';

describe('getRateLimitIdentifier', () => {
    it('extracts IP from x-forwarded-for header', () => {
        const request = new Request('http://localhost/api/test', {
            headers: {
                'x-forwarded-for': '192.168.1.1, 10.0.0.1',
            },
        });
        expect(getRateLimitIdentifier(request)).toBe('192.168.1.1');
    });

    it('extracts IP from x-real-ip header', () => {
        const request = new Request('http://localhost/api/test', {
            headers: {
                'x-real-ip': '192.168.1.2',
            },
        });
        expect(getRateLimitIdentifier(request)).toBe('192.168.1.2');
    });

    it('returns unknown-client when no IP headers present', () => {
        const request = new Request('http://localhost/api/test');
        expect(getRateLimitIdentifier(request)).toBe('unknown-client');
    });
});

describe('checkRateLimit', () => {
    beforeEach(() => {
        // Reset time mock if any
        vi.useRealTimers();
    });

    it('allows requests within limit', () => {
        const config = { maxRequests: 5, windowMs: 60000 };
        const identifier = `test-${Date.now()}-1`;

        for (let i = 0; i < 5; i++) {
            const result = checkRateLimit(identifier, config);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4 - i);
        }
    });

    it('blocks requests over limit', () => {
        const config = { maxRequests: 3, windowMs: 60000 };
        const identifier = `test-${Date.now()}-2`;

        // Use up the limit
        for (let i = 0; i < 3; i++) {
            checkRateLimit(identifier, config);
        }

        // This should be blocked
        const result = checkRateLimit(identifier, config);
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('includes correct metadata in result', () => {
        const config = { maxRequests: 10, windowMs: 60000 };
        const identifier = `test-${Date.now()}-3`;

        const result = checkRateLimit(identifier, config);

        expect(result.limit).toBe(10);
        expect(result.remaining).toBe(9);
        expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('resets after window expires', () => {
        vi.useFakeTimers();
        const config = { maxRequests: 2, windowMs: 1000 };
        const identifier = `test-reset`;

        // Use up the limit
        checkRateLimit(identifier, config);
        checkRateLimit(identifier, config);
        expect(checkRateLimit(identifier, config).allowed).toBe(false);

        // Advance time past the window
        vi.advanceTimersByTime(1100);

        // Should be allowed again
        const result = checkRateLimit(identifier, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);

        vi.useRealTimers();
    });
});

describe('RATE_LIMITS configuration', () => {
    it('has expected endpoints configured', () => {
        expect(RATE_LIMITS.rate).toBeDefined();
        expect(RATE_LIMITS.agents).toBeDefined();
        expect(RATE_LIMITS.score).toBeDefined();
        expect(RATE_LIMITS.verifier).toBeDefined();
        expect(RATE_LIMITS.userRatings).toBeDefined();
    });

    it('has reasonable limits', () => {
        // POST /api/rate should be the most restrictive
        expect(RATE_LIMITS.rate.maxRequests).toBeLessThanOrEqual(RATE_LIMITS.agents.maxRequests);
        expect(RATE_LIMITS.rate.maxRequests).toBeLessThanOrEqual(RATE_LIMITS.score.maxRequests);
    });
});
