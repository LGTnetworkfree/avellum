'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';

export const AVLM_MINT = new PublicKey('D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9');
export const MIN_AVLM_TO_VOTE = 10_000;
export const MIN_SOL_TO_VOTE = 0.1;

const DECIMALS = 9;

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

        let avlmFailed = false;
        let solFailed = false;

        // Log the RPC endpoint being used
        console.log('[useTokenBalance] Connection endpoint:', connection.rpcEndpoint);
        console.log('[useTokenBalance] Wallet:', publicKey.toBase58());

        // Fetch AVLM balance (separate try/catch)
        try {
            console.log('[useTokenBalance] Fetching AVLM for', publicKey.toBase58().slice(0, 8), 'mint:', AVLM_MINT.toBase58().slice(0, 8));
            const res = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: AVLM_MINT });
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
            const errMsg = err instanceof Error ? err.message : String(err);
            console.error('[useTokenBalance] AVLM fetch error:', errMsg);
            console.error('[useTokenBalance] AVLM full error:', err);
            setAvlmBalance(0); // Default to 0 on error
            avlmFailed = true;
        }

        // Fetch SOL balance (separate try/catch)
        try {
            console.log('[useTokenBalance] Fetching SOL balance for', publicKey.toBase58().slice(0, 8));
            const lamports = await connection.getBalance(publicKey);
            console.log('[useTokenBalance] Raw lamports:', lamports);
            const solBal = lamports / 1e9;
            console.log('[useTokenBalance] SOL balance:', solBal, 'SOL');
            setSolBalance(solBal);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.error('[useTokenBalance] SOL fetch error:', errMsg);
            console.error('[useTokenBalance] SOL full error:', err);
            setSolBalance(null);
            solFailed = true;
        }

        // Only set error if BOTH fetches failed
        if (avlmFailed && solFailed) {
            console.error('[useTokenBalance] Both AVLM and SOL fetches failed!');
            setError('Failed to fetch balances. Check console for details.');
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
