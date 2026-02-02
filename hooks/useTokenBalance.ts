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

        console.log('[useTokenBalance] Fetching AVLM balance', {
            wallet: publicKey.toBase58(),
            mint: AVLM_MINT.toBase58(),
            rpc: connection.rpcEndpoint,
        });

        connection
            .getParsedTokenAccountsByOwner(publicKey, { mint: AVLM_MINT })
            .then((res) => {
                if (cancelled) return;
                console.log('[useTokenBalance] RPC response:', JSON.stringify(res.value.map(v => v.account.data.parsed.info.tokenAmount)));
                const amount =
                    res.value[0]?.account.data.parsed.info.tokenAmount.amount ?? '0';
                const humanBalance = Number(amount) / 10 ** DECIMALS;
                console.log('[useTokenBalance] Balance:', humanBalance);
                setBalance(humanBalance);
            })
            .catch((err) => {
                console.error('[useTokenBalance] RPC error:', err);
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
