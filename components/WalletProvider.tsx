'use client';

import { useMemo, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
    children: ReactNode;
}

export default function SolanaWalletProvider({ children }: Props) {
    // Get network from environment
    const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
    const network = networkEnv as WalletAdapterNetwork;

    // Use Helius RPC if available, otherwise fallback to public RPC
    const endpoint = useMemo(() => {
        const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
        let url: string;

        // Debug: log whether env var is found
        console.log('[WalletProvider] NEXT_PUBLIC_HELIUS_API_KEY present:', !!heliusKey);
        console.log('[WalletProvider] NEXT_PUBLIC_SOLANA_NETWORK:', networkEnv);

        if (heliusKey && heliusKey.length > 10) {
            // Helius uses 'mainnet' and 'devnet', not 'mainnet-beta'
            const heliusNetwork = networkEnv === 'mainnet-beta' ? 'mainnet' : networkEnv;
            url = `https://${heliusNetwork}.helius-rpc.com/?api-key=${heliusKey}`;
            console.log('[WalletProvider] Using Helius RPC for', heliusNetwork);
        } else {
            // Fallback to public RPC if no Helius key
            url = clusterApiUrl(network);
            console.log('[WalletProvider] No Helius key found, using public RPC:', url);
        }
        return url;
    }, [network, networkEnv]);

    // Supported wallets
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
