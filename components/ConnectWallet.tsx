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
    const { balance, loading } = useTokenBalance();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#00d4ff]/20 bg-[#00d4ff]/5 rounded-sm">
                    <span className="text-[10px] font-mono text-[#4b6a8a] tracking-tight">$AVLM</span>
                    <span className="text-xs font-mono font-bold text-[#00d4ff]">
                        {loading ? '...' : balance?.toLocaleString() || '0'}
                    </span>
                </div>
            )}
            <WalletMultiButton className="!h-10 !px-6 !shadow-none">
                {connected ? (publicKey ? `${publicKey.toBase58().substring(0, 4)}...${publicKey.toBase58().substring(publicKey.toBase58().length - 4)}` : 'CONNECTED') : 'CONNECT WALLET'}
            </WalletMultiButton>
        </div>
    );
}
