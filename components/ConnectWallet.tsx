'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

interface Props {
    showBalance?: boolean;
}

export default function ConnectWallet({ showBalance = true }: Props) {
    const { publicKey, connected } = useWallet();
    const [tokenBalance, setTokenBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchBalance() {
            if (!connected || !publicKey) {
                setTokenBalance(null);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/verifier?wallet=${publicKey.toBase58()}`);
                const data = await response.json();
                setTokenBalance(data.tokenBalance || 0);
            } catch (error) {
                console.error('Error fetching balance:', error);
                setTokenBalance(0);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBalance();
    }, [connected, publicKey]);

    return (
        <div className="flex items-center gap-4">
            {connected && showBalance && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                    <span className="text-sm text-gray-400">$AVELLUM</span>
                    <span className="text-sm font-bold text-white">
                        {isLoading ? '...' : tokenBalance?.toLocaleString() || '0'}
                    </span>
                </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-500 hover:!to-pink-500 !rounded-xl !h-11 !font-semibold !text-sm !transition-all !duration-300" />
        </div>
    );
}
