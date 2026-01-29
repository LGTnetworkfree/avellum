'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import TrustBadge from '@/components/TrustBadge';

interface VerifierData {
    isVerifier: boolean;
    walletAddress?: string;
    tokenBalance: number;
    totalRatingsGiven: number;
    totalRevenueEarned: number;
    ratings: Array<{
        id: string;
        score: number;
        token_weight: number;
        updated_at: string;
        agents: {
            address: string;
            name: string;
            registry: string;
            trust_score: number;
        };
    }>;
    memberSince?: string;
}

export default function DashboardPage() {
    const { connected, publicKey } = useWallet();
    const [data, setData] = useState<VerifierData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!connected || !publicKey) {
                setData(null);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/verifier?wallet=${publicKey.toBase58()}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching verifier data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [connected, publicKey]);

    if (!connected) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">🔐</div>
                    <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
                    <p className="text-gray-400 mb-8">
                        Connect your Solana wallet to view your verifier dashboard, track your ratings, and see your earned revenue.
                    </p>
                    <p className="text-sm text-purple-400">
                        Hold $AVELLUM tokens to become a verifier and start earning
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Verifier Dashboard</h1>
                    <p className="text-gray-400">
                        Track your ratings, token balance, and earned revenue
                    </p>
                </div>

                {/* Stats cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6">
                        <div className="text-sm text-gray-400 mb-2">$AVELLUM Balance</div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {data?.tokenBalance?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Voting weight</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6">
                        <div className="text-sm text-gray-400 mb-2">Ratings Given</div>
                        <div className="text-3xl font-bold text-white">
                            {data?.totalRatingsGiven || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Agents rated</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6">
                        <div className="text-sm text-gray-400 mb-2">Revenue Earned</div>
                        <div className="text-3xl font-bold text-green-400">
                            {data?.totalRevenueEarned?.toFixed(4) || '0.0000'} SOL
                        </div>
                        <div className="text-xs text-gray-500 mt-1">From API fees</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6">
                        <div className="text-sm text-gray-400 mb-2">Member Since</div>
                        <div className="text-xl font-bold text-white">
                            {data?.memberSince
                                ? new Date(data.memberSince).toLocaleDateString()
                                : 'New Verifier'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {data?.isVerifier ? 'Active verifier' : 'Not yet verified'}
                        </div>
                    </div>
                </div>

                {/* Wallet info */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6 mb-12">
                    <h2 className="text-lg font-bold text-white mb-4">Connected Wallet</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-mono text-white">{publicKey?.toBase58()}</div>
                            <div className="text-sm text-gray-400">
                                {data?.isVerifier ? '✓ Verified holder' : 'Not holding $AVELLUM'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating history */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700/50">
                        <h2 className="text-lg font-bold text-white">Your Ratings</h2>
                    </div>

                    {data?.ratings && data.ratings.length > 0 ? (
                        <div className="divide-y divide-gray-700/50">
                            {data.ratings.map((rating) => (
                                <Link
                                    key={rating.id}
                                    href={`/agents/${rating.agents.address}`}
                                    className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <TrustBadge score={rating.score} size="sm" showLabel={false} />
                                        <div>
                                            <div className="font-semibold text-white">
                                                {rating.agents.name || 'Unnamed Agent'}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {rating.agents.registry} • Weighted: {rating.token_weight.toLocaleString()} tokens
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">
                                            {rating.score}/100
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(rating.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-5xl mb-4">⭐</div>
                            <h3 className="text-xl font-bold text-white mb-2">No ratings yet</h3>
                            <p className="text-gray-400 mb-6">
                                Start rating agents to build trust in the A2A economy
                            </p>
                            <Link
                                href="/agents"
                                className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all duration-300"
                            >
                                Browse Agents
                            </Link>
                        </div>
                    )}
                </div>

                {/* Revenue info */}
                <div className="mt-12 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                    <h3 className="text-lg font-bold text-white mb-2">💰 Revenue Distribution</h3>
                    <p className="text-gray-400 text-sm">
                        100% of API fees are distributed to verifiers proportionally to their activity.
                        The more agents you rate, the larger your share of the revenue pool.
                    </p>
                </div>
            </div>
        </div>
    );
}
