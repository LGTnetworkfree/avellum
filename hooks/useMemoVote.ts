'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { MEMO_PROGRAM_ID, buildMemoString, getExplorerUrl } from '@/lib/memo';

interface VoteResult {
    success: boolean;
    txSignature?: string;
    explorerUrl?: string;
    error?: string;
    source?: 'database' | 'mock';
    debugError?: string;
}

export function useMemoVote() {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitVote = useCallback(async (agentAddress: string, score: number): Promise<VoteResult> => {
        if (!publicKey) {
            return { success: false, error: 'Wallet not connected' };
        }

        setIsSubmitting(true);
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const memoString = buildMemoString(agentAddress, score, timestamp);

            // Build the memo instruction
            const memoInstruction = new TransactionInstruction({
                keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
                programId: MEMO_PROGRAM_ID,
                data: Buffer.from(memoString, 'utf-8'),
            });

            const transaction = new Transaction().add(memoInstruction);

            // Send and confirm
            const txSignature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(txSignature, 'confirmed');

            const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
            const explorerUrl = getExplorerUrl(txSignature, network);

            // POST to the API for server-side verification and persistence
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    agentAddress,
                    score,
                    timestamp,
                    txSignature,
                }),
            });

            const data = await response.json();
            console.log('[useMemoVote] API response:', data);

            if (!response.ok) {
                return { success: false, txSignature, explorerUrl, error: data.error || 'Server rejected the rating' };
            }

            // Include source and debugError from API response for debugging
            return {
                success: true,
                txSignature,
                explorerUrl,
                source: data.source,
                debugError: data.debugError
            };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            // Detect wallet rejection
            if (message.includes('User rejected') || message.includes('rejected')) {
                return { success: false, error: 'Transaction was rejected by wallet' };
            }
            return { success: false, error: message };
        } finally {
            setIsSubmitting(false);
        }
    }, [publicKey, sendTransaction, connection]);

    return { submitVote, isSubmitting };
}
