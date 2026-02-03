'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useState, useEffect } from 'react';

interface Props {
    showBalance?: boolean;
}

export default function ConnectWallet({ showBalance = true }: Props) {
    const { publicKey, connected } = useWallet();
    const { avlmBalance, solBalance, loading, error } = useTokenBalance();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Debug logging
    useEffect(() => {
        if (connected) {
            console.log('[ConnectWallet] Balance state:', {
                avlmBalance,
                solBalance,
                loading,
                error,
                wallet: publicKey?.toBase58().slice(0, 8)
            });
        }
    }, [connected, avlmBalance, solBalance, loading, error, publicKey]);

    if (!mounted) {
        return (
            <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-[#1e3a5a]/50 animate-pulse rounded" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {connected && showBalance && (
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 border border-[#00d4ff]/20 bg-[#00d4ff]/5 rounded-sm">
                    {loading ? (
                        <span className="text-xs font-sans font-bold text-[#00d4ff]">...</span>
                    ) : (
                        <>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-sans font-medium text-[#4b6a8a] tracking-tight">$AVLM</span>
                                <span className="text-xs font-sans font-bold text-[#00d4ff]">
                                    {avlmBalance?.toLocaleString() || '0'}
                                </span>
                            </div>
                            <span className="text-[#2a4a6a]">|</span>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-sans font-medium text-[#4b6a8a] tracking-tight">SOL</span>
                                <span className="text-xs font-sans font-bold text-[#00d4ff]">
                                    {solBalance?.toFixed(4) || '0'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
            <WalletMultiButton className="!h-10 !px-6 !shadow-none">
                {connected ? (publicKey ? `${publicKey.toBase58().substring(0, 4)}...${publicKey.toBase58().substring(publicKey.toBase58().length - 4)}` : 'CONNECTED') : 'CONNECT WALLET'}
            </WalletMultiButton>
        </div>
    );
}
