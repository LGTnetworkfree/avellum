import { describe, it, expect } from 'vitest';
import {
    isValidSolanaAddress,
    validateRatingRequest,
    sanitizeSearchQuery,
    isValidRegistry,
    validatePagination,
    validateScoreRange,
    ValidationError,
} from '@/lib/validation';

describe('isValidSolanaAddress', () => {
    it('returns true for valid Solana addresses', () => {
        // Valid mainnet addresses
        expect(isValidSolanaAddress('11111111111111111111111111111111')).toBe(true);
        expect(isValidSolanaAddress('D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9')).toBe(true);
        expect(isValidSolanaAddress('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')).toBe(true);
    });

    it('returns false for invalid addresses', () => {
        expect(isValidSolanaAddress('')).toBe(false);
        expect(isValidSolanaAddress(null)).toBe(false);
        expect(isValidSolanaAddress(undefined)).toBe(false);
        expect(isValidSolanaAddress('too-short')).toBe(false);
        expect(isValidSolanaAddress('invalid-characters-0OIl!')).toBe(false);
        expect(isValidSolanaAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(false); // Ethereum address
    });
});

describe('validateRatingRequest', () => {
    const validRequest = {
        walletAddress: 'D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9',
        agentAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        score: 75,
        timestamp: Date.now(),
        txSignature: 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12',
    };

    it('validates a correct request', () => {
        const result = validateRatingRequest(validRequest);
        expect(result.walletAddress).toBe(validRequest.walletAddress);
        expect(result.agentAddress).toBe(validRequest.agentAddress);
        expect(result.score).toBe(75);
    });

    it('throws for missing walletAddress', () => {
        const request = { ...validRequest, walletAddress: undefined };
        expect(() => validateRatingRequest(request)).toThrow(ValidationError);
    });

    it('throws for invalid walletAddress format', () => {
        const request = { ...validRequest, walletAddress: 'invalid' };
        expect(() => validateRatingRequest(request)).toThrow(ValidationError);
    });

    it('throws for score out of range', () => {
        expect(() => validateRatingRequest({ ...validRequest, score: -1 })).toThrow(ValidationError);
        expect(() => validateRatingRequest({ ...validRequest, score: 101 })).toThrow(ValidationError);
    });

    it('throws for invalid timestamp', () => {
        const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
        expect(() => validateRatingRequest({ ...validRequest, timestamp: oldTimestamp })).toThrow(ValidationError);
    });

    it('throws for invalid body type', () => {
        expect(() => validateRatingRequest(null)).toThrow(ValidationError);
        expect(() => validateRatingRequest('string')).toThrow(ValidationError);
    });
});

describe('sanitizeSearchQuery', () => {
    it('returns null for empty/invalid input', () => {
        expect(sanitizeSearchQuery(null)).toBe(null);
        expect(sanitizeSearchQuery(undefined)).toBe(null);
        expect(sanitizeSearchQuery('')).toBe(null);
        expect(sanitizeSearchQuery('   ')).toBe(null);
    });

    it('trims and limits length', () => {
        expect(sanitizeSearchQuery('  hello  ')).toBe('hello');
        expect(sanitizeSearchQuery('a'.repeat(200))).toHaveLength(100);
    });

    it('removes SQL injection patterns', () => {
        expect(sanitizeSearchQuery('test--comment')).toBe('testcomment');
        expect(sanitizeSearchQuery("test'; DROP TABLE users;")).toBe('test DROP TABLE users');
        expect(sanitizeSearchQuery('test\nline')).toBe('testline');
    });
});

describe('isValidRegistry', () => {
    it('returns true for valid registries', () => {
        expect(isValidRegistry('x402scan')).toBe(true);
        expect(isValidRegistry('mcp')).toBe(true);
        expect(isValidRegistry('a2a')).toBe(true);
    });

    it('returns false for invalid registries', () => {
        expect(isValidRegistry('invalid')).toBe(false);
        expect(isValidRegistry(null)).toBe(false);
        expect(isValidRegistry('')).toBe(false);
    });
});

describe('validatePagination', () => {
    it('returns defaults for null inputs', () => {
        const result = validatePagination(null, null);
        expect(result.limit).toBe(24);
        expect(result.offset).toBe(0);
    });

    it('clamps limit to maxLimit', () => {
        const result = validatePagination('200', '0', 100);
        expect(result.limit).toBe(100);
    });

    it('ensures minimum limit of 1', () => {
        // parseInt('0') returns 0, then Math.max(0, 1) = 1
        const result = validatePagination('-5', '0');
        expect(result.limit).toBe(1);
    });

    it('ensures minimum offset of 0', () => {
        const result = validatePagination('10', '-5');
        expect(result.offset).toBe(0);
    });
});

describe('validateScoreRange', () => {
    it('returns null for invalid inputs', () => {
        const result = validateScoreRange(null, null);
        expect(result.minScore).toBe(null);
        expect(result.maxScore).toBe(null);
    });

    it('parses valid score values', () => {
        const result = validateScoreRange('50.5', '90');
        expect(result.minScore).toBe(50.5);
        expect(result.maxScore).toBe(90);
    });

    it('rejects out-of-range values', () => {
        const result = validateScoreRange('-10', '150');
        expect(result.minScore).toBe(null);
        expect(result.maxScore).toBe(null);
    });
});
