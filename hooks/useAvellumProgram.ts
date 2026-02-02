'use client';

import { useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import idl from '@/app/idl/avellum.json';

// Read-only wallet stub for fetching data without a connected wallet
const READONLY_WALLET = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: () => Promise.reject(new Error('Read-only')),
    signAllTransactions: () => Promise.reject(new Error('Read-only')),
};

export function useAvellumProgram() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const { program, provider } = useMemo(() => {
        const effectiveWallet = wallet ?? READONLY_WALLET;
        const provider = new AnchorProvider(connection, effectiveWallet, {
            commitment: 'confirmed',
        });
        const program = new Program(idl as Idl, provider);
        return { program, provider };
    }, [connection, wallet]);

    return { program, provider, connected: !!wallet };
}
