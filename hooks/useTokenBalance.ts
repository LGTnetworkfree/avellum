'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export const AVLM_MINT = new PublicKey('D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9');
export const MIN_AVLM_TO_VOTE = 10_000;

const DECIMALS = 9;

export function useTokenBalance() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(connected && !!publicKey);

    useEffect(() => {
        if (!connected || !publicKey) {
            setBalance(null);
            return;
        }

        let cancelled = false;
        setLoading(true);

        connection
            .getParsedTokenAccountsByOwner(publicKey, { mint: AVLM_MINT })
            .then((res) => {
                if (cancelled) return;
                const amount =
                    res.value[0]?.account.data.parsed.info.tokenAmount.amount ?? '0';
                setBalance(Number(amount) / 10 ** DECIMALS);
            })
            .catch(() => {
                if (!cancelled) setBalance(0);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [connection, publicKey, connected]);

    return { balance, loading };
}
