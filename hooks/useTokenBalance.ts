'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';

export const AVLM_MINT = new PublicKey('D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9');
export const MIN_AVLM_TO_VOTE = 10_000;
export const MIN_SOL_TO_VOTE = 0.1;

const DECIMALS = 9;

// Fallback public RPC endpoints (tried in order)
// These are free, reliable mainnet RPCs
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

        // Log the RPC endpoint being used
        console.log('[useTokenBalance] ========== BALANCE FETCH START ==========');
        console.log('[useTokenBalance] Primary RPC:', connection.rpcEndpoint);
        console.log('[useTokenBalance] Wallet address:', publicKey.toBase58());

        // Quick connectivity test - get slot number
        try {
            const slot = await connection.getSlot();
            console.log('[useTokenBalance] Primary RPC is alive, current slot:', slot);
        } catch (e) {
            console.warn('[useTokenBalance] Primary RPC connectivity test failed:', e);
        }

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
            const TIMEOUT_MS = 10000; // 10 second timeout per RPC

            // Try primary connection first
            try {
                console.log(`[useTokenBalance] Trying ${description} with primary RPC:`, connection.rpcEndpoint);
                return await withTimeout(fetchFn(connection), TIMEOUT_MS, 'primary');
            } catch (primaryErr) {
                const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
                console.warn(`[useTokenBalance] Primary RPC failed for ${description}:`, errMsg);
            }

            // Try fallback RPCs
            for (const rpcUrl of FALLBACK_RPCS) {
                try {
                    console.log(`[useTokenBalance] Trying ${description} with fallback:`, rpcUrl);
                    const fallbackConn = new Connection(rpcUrl, { commitment: 'confirmed' });
                    return await withTimeout(fetchFn(fallbackConn), TIMEOUT_MS, rpcUrl);
                } catch (fallbackErr) {
                    const errMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
                    console.warn(`[useTokenBalance] Fallback ${rpcUrl} failed:`, errMsg);
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
            console.log('[useTokenBalance] AVLM token accounts found:', res.value.length);

            if (res.value.length === 0) {
                console.log('[useTokenBalance] No AVLM token account → balance = 0');
                setAvlmBalance(0);
            } else {
                const info = res.value[0].account.data.parsed.info.tokenAmount;
                const bal = Number(info.amount) / 10 ** DECIMALS;
                console.log('[useTokenBalance] AVLM balance:', bal);
                setAvlmBalance(bal);
            }
        } catch (err: unknown) {
            console.error('[useTokenBalance] AVLM fetch failed on all RPCs:', err);
            setAvlmBalance(0);
            avlmFailed = true;
        }

        // Fetch SOL balance
        try {
            const lamports = await fetchWithFallback(
                async (conn) => conn.getBalance(publicKey),
                'SOL balance'
            );
            console.log('[useTokenBalance] Raw lamports:', lamports);
            const solBal = lamports / 1e9;
            console.log('[useTokenBalance] SOL balance:', solBal, 'SOL');
            setSolBalance(solBal);
        } catch (err: unknown) {
            console.error('[useTokenBalance] SOL fetch failed on all RPCs:', err);
            setSolBalance(null);
            solFailed = true;
        }

        // Only set error if BOTH fetches failed on ALL RPCs
        if (avlmFailed && solFailed) {
            console.error('[useTokenBalance] ❌ Both AVLM and SOL fetches failed on all RPCs!');
            setError('Failed to fetch balances. Please try again.');
        } else {
            console.log('[useTokenBalance] ✅ At least one balance fetched successfully');
            setError(null);
        }

        console.log('[useTokenBalance] ========== BALANCE FETCH END ==========');
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
