'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState, useCallback } from 'react';

export const AVLM_MINT = new PublicKey('D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9');
export const MIN_AVLM_TO_VOTE = 10_000;

const DECIMALS = 9;

export function useTokenBalance() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!connected || !publicKey) {
            setBalance(null);
            setError(null);
            return;
        }

        setFetching(true);
        setError(null);

        try {
            console.log('[useTokenBalance] Fetching for', publicKey.toBase58().slice(0, 8), '… mint:', AVLM_MINT.toBase58().slice(0, 8));
            const res = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: AVLM_MINT });
            console.log('[useTokenBalance] Token accounts found:', res.value.length);

            if (res.value.length === 0) {
                console.log('[useTokenBalance] No token account → balance = 0');
                setBalance(0);
            } else {
                const info = res.value[0].account.data.parsed.info.tokenAmount;
                const bal = Number(info.amount) / 10 ** DECIMALS;
                console.log('[useTokenBalance] Raw:', info.amount, '→', bal, 'AVLM');
                setBalance(bal);
            }
        } catch (err) {
            console.error('[useTokenBalance] RPC error:', err);
            setError('Failed to fetch AVLM balance');
            // Keep balance as null (unknown) — don't set to 0
        } finally {
            setFetching(false);
        }
    }, [connection, publicKey, connected]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // loading = actively fetching OR wallet connected but balance not yet resolved
    const loading = fetching || (connected && !!publicKey && balance === null && !error);

    return { balance, loading, error, refetch: fetchBalance };
}
