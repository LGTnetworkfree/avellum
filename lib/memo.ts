import { PublicKey } from '@solana/web3.js';

export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const MEMO_PREFIX = 'avellum:rate';

/**
 * Build a memo string for an on-chain rating vote.
 * Format: "avellum:rate:{agentAddress}:{score}:{timestamp}"
 */
export function buildMemoString(agentAddress: string, score: number, timestamp: number): string {
    return `${MEMO_PREFIX}:${agentAddress}:${score}:${timestamp}`;
}

/**
 * Parse a memo string back into its component fields.
 * Returns null if the format doesn't match.
 */
export function parseMemoString(memo: string): { agentAddress: string; score: number; timestamp: number } | null {
    const parts = memo.split(':');
    if (parts.length !== 5) return null;
    if (parts[0] !== 'avellum' || parts[1] !== 'rate') return null;

    const agentAddress = parts[2];
    const score = Number(parts[3]);
    const timestamp = Number(parts[4]);

    if (!agentAddress || isNaN(score) || isNaN(timestamp)) return null;

    return { agentAddress, score, timestamp };
}

/**
 * Build a Solana Explorer URL for a transaction signature.
 */
export function getExplorerUrl(txSignature: string, network: string = 'devnet'): string {
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
    return `https://explorer.solana.com/tx/${txSignature}${cluster}`;
}
