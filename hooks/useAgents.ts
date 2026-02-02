'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAvellumProgram } from './useAvellumProgram';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface OnChainAgent {
    publicKey: PublicKey;
    account: {
        address: PublicKey;
        trustScore: BN;
        totalWeight: BN;
        ratingCount: number;
        confidence: number;
        bump: number;
    };
}

export interface OnChainProtocolState {
    authority: PublicKey;
    totalAgents: number;
    totalRatings: BN;
    bump: number;
}

export function useAgents() {
    const { program } = useAvellumProgram();
    const [agents, setAgents] = useState<OnChainAgent[]>([]);
    const [protocolState, setProtocolState] = useState<OnChainProtocolState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!program) return;
        setLoading(true);
        setError(null);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accountNs = program.account as any;
            const allAgents = await accountNs.agent.all();
            const sorted = (allAgents as OnChainAgent[]).sort((a, b) => {
                const aScore = a.account.trustScore.toNumber();
                const bScore = b.account.trustScore.toNumber();
                return bScore - aScore;
            });
            setAgents(sorted);

            const states = await accountNs.protocolState.all();
            if (states.length > 0) {
                setProtocolState(states[0].account as OnChainProtocolState);
            }
        } catch (err) {
            console.error('Failed to fetch on-chain data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch on-chain data');
        } finally {
            setLoading(false);
        }
    }, [program]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { agents, protocolState, loading, error, refetch };
}
