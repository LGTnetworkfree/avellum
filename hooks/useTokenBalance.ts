'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';

export const AVLM_MINT = new PublicKey('D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9');
export const MIN_AVLM_TO_VOTE = 10_000;
export const MIN_SOL_TO_VOTE = 0.1;

const DECIMALS = 9;

// Fallback public RPC endpoints (tried in order)
const FALLBACK_RPCS = [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
    'https://solana-mainnet.rpc.extrnode.com',
];

interface TokenBalanceState {
    avlmBalance: number | null;
    solBalance: number | null;
    loading: boolean;
    error: string | null;
    canVote: boolean;
    voteToken: 'AVLM' | 'SOL' | null;
    displayBalance: number | null;
    refetch: () => Promise<void>;
}

export function useTokenBalance(): TokenBalanceState {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [avlmBalance, setAvlmBalance] = useState<number | null>(null);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!connected || !publicKey) {
            setAvlmBalance(null);
            setSolBalance(null);
            setError(null);
            return;
        }

        setFetching(true);
        setError(null);

        // Helper to add timeout to a promise
        function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
            return Promise.race([
                promise,
                new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error(`Timeout after ${ms}ms for ${label}`)), ms)
                )
            ]);
        }

        // Helper to try fetching with fallback RPCs
        async function fetchWithFallback<T>(
            fetchFn: (conn: Connection) => Promise<T>,
            description: string
        ): Promise<T> {
            const TIMEOUT_MS = 10000;

            // Try primary connection first
            try {
                return await withTimeout(fetchFn(connection), TIMEOUT_MS, 'primary');
            } catch {
                // Primary failed, try fallbacks
            }

            // Try fallback RPCs
            for (const rpcUrl of FALLBACK_RPCS) {
                try {
                    const fallbackConn = new Connection(rpcUrl, { commitment: 'confirmed' });
                    return await withTimeout(fetchFn(fallbackConn), TIMEOUT_MS, rpcUrl);
                } catch {
                    // This fallback failed, try next
                }
            }

            throw new Error(`All RPCs failed for ${description}`);
        }

        let avlmFailed = false;
        let solFailed = false;

        // Fetch AVLM balance
        try {
            const res = await fetchWithFallback(
                async (conn) => conn.getParsedTokenAccountsByOwner(publicKey, { mint: AVLM_MINT }),
                'AVLM balance'
            );

            if (res.value.length === 0) {
                setAvlmBalance(0);
            } else {
                const info = res.value[0].account.data.parsed.info.tokenAmount;
                const bal = Number(info.amount) / 10 ** DECIMALS;
                setAvlmBalance(bal);
            }
        } catch {
            setAvlmBalance(0);
            avlmFailed = true;
        }

        // Fetch SOL balance
        try {
            const lamports = await fetchWithFallback(
                async (conn) => conn.getBalance(publicKey),
                'SOL balance'
            );
            const solBal = lamports / 1e9;
            setSolBalance(solBal);
        } catch {
            setSolBalance(null);
            solFailed = true;
        }

        // Only set error if BOTH fetches failed on ALL RPCs
        if (avlmFailed && solFailed) {
            setError('Failed to fetch balances. Please try again.');
        } else {
            setError(null);
        }

        setFetching(false);
    }, [connection, publicKey, connected]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // loading = actively fetching OR wallet connected but balance not yet resolved
    const loading = fetching || (connected && !!publicKey && avlmBalance === null && solBalance === null && !error);

    // Determine if user can vote and with which token
    // Priority: AVLM first, then SOL fallback
    const hasEnoughAvlm = avlmBalance !== null && avlmBalance >= MIN_AVLM_TO_VOTE;
    const hasEnoughSol = solBalance !== null && solBalance >= MIN_SOL_TO_VOTE;
    const canVote = hasEnoughAvlm || hasEnoughSol;
    const voteToken: 'AVLM' | 'SOL' | null = hasEnoughAvlm ? 'AVLM' : hasEnoughSol ? 'SOL' : null;
    const displayBalance = hasEnoughAvlm ? avlmBalance : hasEnoughSol ? solBalance : (avlmBalance ?? solBalance);

    return {
        avlmBalance,
        solBalance,
        loading,
        error,
        canVote,
        voteToken,
        displayBalance,
        refetch: fetchBalance
    };
}
