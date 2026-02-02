import { Connection } from '@solana/web3.js';
import { getConnection } from '@/lib/helius';
import { parseMemoString, MEMO_PROGRAM_ID } from '@/lib/memo';

const TIMESTAMP_WINDOW_SECONDS = 5 * 60; // 5 minutes

interface VerificationResult {
    valid: boolean;
    error?: string;
}

/**
 * Verify a memo transaction on-chain.
 * Checks: tx confirmed, wallet is signer, memo instruction found, memo fields match, timestamp within window.
 */
export async function verifyMemoTransaction(
    txSignature: string,
    walletAddress: string,
    agentAddress: string,
    score: number,
    timestamp: number
): Promise<VerificationResult> {
    let connection: Connection;
    try {
        connection = getConnection();
    } catch {
        return { valid: false, error: 'Failed to create Solana connection' };
    }

    let tx;
    try {
        tx = await connection.getParsedTransaction(txSignature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
    } catch {
        return { valid: false, error: 'Failed to fetch transaction from chain' };
    }

    if (!tx) {
        return { valid: false, error: 'Transaction not found or not yet confirmed' };
    }

    // Check that the wallet is a signer
    const signers = tx.transaction.message.accountKeys
        .filter((key) => key.signer)
        .map((key) => key.pubkey.toBase58());

    if (!signers.includes(walletAddress)) {
        return { valid: false, error: 'Wallet is not a signer of this transaction' };
    }

    // Find the memo instruction
    const instructions = tx.transaction.message.instructions;
    let memoData: string | null = null;

    for (const ix of instructions) {
        if ('parsed' in ix) {
            // Parsed instruction — memo program returns parsed string
            if (ix.program === 'spl-memo' || ix.programId.toBase58() === MEMO_PROGRAM_ID.toBase58()) {
                memoData = typeof ix.parsed === 'string' ? ix.parsed : JSON.stringify(ix.parsed);
                break;
            }
        } else {
            // Partially decoded instruction
            if (ix.programId.toBase58() === MEMO_PROGRAM_ID.toBase58()) {
                // Data is base58-encoded in partially decoded instructions
                const bs58 = await import('bs58');
                try {
                    memoData = Buffer.from(bs58.default.decode(ix.data)).toString('utf-8');
                } catch {
                    memoData = ix.data;
                }
                break;
            }
        }
    }

    if (!memoData) {
        return { valid: false, error: 'No memo instruction found in transaction' };
    }

    // Parse and validate memo fields
    const parsed = parseMemoString(memoData);
    if (!parsed) {
        return { valid: false, error: 'Memo format is invalid' };
    }

    if (parsed.agentAddress !== agentAddress) {
        return { valid: false, error: 'Agent address in memo does not match request' };
    }

    if (parsed.score !== score) {
        return { valid: false, error: 'Score in memo does not match request' };
    }

    if (parsed.timestamp !== timestamp) {
        return { valid: false, error: 'Timestamp in memo does not match request' };
    }

    // Check timestamp freshness
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > TIMESTAMP_WINDOW_SECONDS) {
        return { valid: false, error: 'Transaction timestamp is too old (>5 min)' };
    }

    return { valid: true };
}
