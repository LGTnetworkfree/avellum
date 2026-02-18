import { PublicKey } from '@solana/web3.js';

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
    public readonly field?: string;
    public readonly code: string;

    constructor(message: string, code: string = 'VALIDATION_ERROR', field?: string) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
        this.field = field;
    }
}

/**
 * Validate a Solana public key address
 * Returns true if the address is a valid base58-encoded Solana public key
 */
export function isValidSolanaAddress(address: string | null | undefined): boolean {
    if (!address || typeof address !== 'string') {
        return false;
    }

    // Quick length check - Solana addresses are 32-44 characters
    if (address.length < 32 || address.length > 44) {
        return false;
    }

    // Base58 character set check (no 0, O, I, l)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(address)) {
        return false;
    }

    // Try to create a PublicKey - this validates the address structure
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}

/**
 * Rating request validation
 */
export interface RatingRequestInput {
    walletAddress?: string;
    agentAddress?: string;
    score?: number;
    timestamp?: number;
    txSignature?: string;
}

export interface ValidatedRatingRequest {
    walletAddress: string;
    agentAddress: string;
    score: number;
    timestamp: number;
    txSignature: string;
}

/**
 * Validate a rating submission request
 * Throws ValidationError if invalid, returns validated data if valid
 */
export function validateRatingRequest(input: unknown): ValidatedRatingRequest {
    if (!input || typeof input !== 'object') {
        throw new ValidationError('Request body must be an object', 'INVALID_BODY');
    }

    const data = input as RatingRequestInput;

    // Validate walletAddress
    if (!data.walletAddress) {
        throw new ValidationError('walletAddress is required', 'MISSING_FIELD', 'walletAddress');
    }
    if (!isValidSolanaAddress(data.walletAddress)) {
        throw new ValidationError('Invalid wallet address format', 'INVALID_ADDRESS', 'walletAddress');
    }

    // Validate agentAddress
    if (!data.agentAddress) {
        throw new ValidationError('agentAddress is required', 'MISSING_FIELD', 'agentAddress');
    }
    if (!isValidSolanaAddress(data.agentAddress)) {
        throw new ValidationError('Invalid agent address format', 'INVALID_ADDRESS', 'agentAddress');
    }

    // Validate score
    if (data.score === undefined || data.score === null) {
        throw new ValidationError('score is required', 'MISSING_FIELD', 'score');
    }
    if (typeof data.score !== 'number' || !Number.isFinite(data.score)) {
        throw new ValidationError('score must be a number', 'INVALID_TYPE', 'score');
    }
    if (data.score < 0 || data.score > 100) {
        throw new ValidationError('score must be between 0 and 100', 'OUT_OF_RANGE', 'score');
    }

    // Validate timestamp
    if (!data.timestamp) {
        throw new ValidationError('timestamp is required', 'MISSING_FIELD', 'timestamp');
    }
    if (typeof data.timestamp !== 'number' || !Number.isFinite(data.timestamp)) {
        throw new ValidationError('timestamp must be a number', 'INVALID_TYPE', 'timestamp');
    }
    // Check timestamp is within reasonable range (not more than 5 minutes in the past or future)
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (data.timestamp < now - fiveMinutesMs || data.timestamp > now + fiveMinutesMs) {
        throw new ValidationError('timestamp is out of valid range', 'TIMESTAMP_INVALID', 'timestamp');
    }

    // Validate txSignature
    if (!data.txSignature) {
        throw new ValidationError('txSignature is required', 'MISSING_FIELD', 'txSignature');
    }
    if (typeof data.txSignature !== 'string') {
        throw new ValidationError('txSignature must be a string', 'INVALID_TYPE', 'txSignature');
    }
    // Solana transaction signatures are 88 characters base58
    if (data.txSignature.length < 80 || data.txSignature.length > 90) {
        throw new ValidationError('Invalid transaction signature format', 'INVALID_SIGNATURE', 'txSignature');
    }

    return {
        walletAddress: data.walletAddress,
        agentAddress: data.agentAddress,
        score: Math.floor(data.score), // Ensure integer
        timestamp: data.timestamp,
        txSignature: data.txSignature,
    };
}

/**
 * Sanitize search query to prevent SQL injection patterns
 * Returns sanitized string safe for use in database queries
 */
export function sanitizeSearchQuery(query: string | null | undefined): string | null {
    if (!query || typeof query !== 'string') {
        return null;
    }

    // Trim and limit length
    let sanitized = query.trim().slice(0, 100);

    // Remove SQL injection patterns
    const sqlPatterns = [
        /--/g,           // SQL comments
        /;/g,            // Statement terminators
        /'/g,            // Single quotes (escape instead in real queries)
        /"/g,            // Double quotes
        /\\/g,           // Backslashes
        /\x00/g,         // Null bytes
        /\n/g,           // Newlines
        /\r/g,           // Carriage returns
        /\t/g,           // Tabs
    ];

    for (const pattern of sqlPatterns) {
        sanitized = sanitized.replace(pattern, '');
    }

    // Return null if empty after sanitization
    return sanitized.length > 0 ? sanitized : null;
}

/**
 * Validate registry parameter
 */
export function isValidRegistry(registry: string | null | undefined): registry is 'x402scan' | 'mcp' | 'a2a' {
    return registry === 'x402scan' || registry === 'mcp' || registry === 'a2a';
}

/**
 * Validate pagination parameters
 */
export interface PaginationParams {
    limit: number;
    offset: number;
}

export function validatePagination(
    limitParam: string | null,
    offsetParam: string | null,
    maxLimit: number = 100,
    defaultLimit: number = 24
): PaginationParams {
    const limit = Math.min(
        Math.max(parseInt(limitParam || String(defaultLimit)) || defaultLimit, 1),
        maxLimit
    );
    const offset = Math.max(parseInt(offsetParam || '0') || 0, 0);

    return { limit, offset };
}

/**
 * Validate score range parameters
 */
export interface ScoreRangeParams {
    minScore: number | null;
    maxScore: number | null;
}

export function validateScoreRange(
    minScoreParam: string | null,
    maxScoreParam: string | null
): ScoreRangeParams {
    let minScore: number | null = null;
    let maxScore: number | null = null;

    if (minScoreParam) {
        const parsed = parseFloat(minScoreParam);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
            minScore = parsed;
        }
    }

    if (maxScoreParam) {
        const parsed = parseFloat(maxScoreParam);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
            maxScore = parsed;
        }
    }

    return { minScore, maxScore };
}
