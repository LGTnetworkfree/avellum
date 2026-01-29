'use client';

import { useEffect, useState, use } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import TrustBadge from '@/components/TrustBadge';
import RatingSlider from '@/components/RatingSlider';
import type { Agent } from '@/lib/supabase';

interface Props {
    params: Promise<{ address: string }>;
}

interface Rating {
    id: string;
    score: number;
    token_weight: number;
    created_at: string;
    verifier?: {
        wallet_address: string;
    };
}

export default function AgentDetailPage({ params }: Props) {
    const { address } = use(params);
    const { connected, publicKey } = useWallet();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAgent() {
            try {
                const response = await fetch(`/api/score/${address}`);
                if (response.ok) {
                    const data = await response.json();
                    setAgent(data);
                }
            } catch (error) {
                console.error('Error fetching agent:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAgent();
    }, [address]);

    async function submitRating() {
        if (!connected || !publicKey) return;

        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    agentAddress: address,
                    score: rating,
                    signature: ''
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitMessage(`Rating submitted successfully!`);
                // Refresh agent data
                const refreshResponse = await fetch(`/api/score/${address}`);
                if (refreshResponse.ok) {
                    setAgent(await refreshResponse.json());
                }
            } else {
                setSubmitMessage(data.error || 'Failed to submit rating');
            }
        } catch (error) {
            setSubmitMessage('Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    }

    const registryColors: Record<string, string> = {
        x402scan: 'from-blue-500 to-cyan-500',
        mcp: 'from-purple-500 to-pink-500',
        a2a: 'from-orange-500 to-amber-500'
    };

    const registryLabels: Record<string, string> = {
        x402scan: 'x402scan',
        mcp: 'MCP Registry',
        a2a: 'A2A Registry'
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🤖</div>
                <h1 className="text-2xl font-bold text-white mb-2">Agent Not Found</h1>
                <p className="text-gray-400 mb-6">This agent hasn&apos;t been indexed yet.</p>
                <Link
                    href="/agents"
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                    ← Back to Agents
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    href="/agents"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Agents
                </Link>

                {/* Agent header */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-8 mb-8">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            {/* Registry badge */}
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${registryColors[agent.registry] || 'from-gray-500 to-gray-600'} text-white mb-4`}>
                                {registryLabels[agent.registry] || agent.registry}
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-2">
                                {agent.name || 'Unnamed Agent'}
                            </h1>

                            <p className="text-gray-400 text-lg mb-4">
                                {agent.description || 'No description available'}
                            </p>

                            {/* Address */}
                            <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl">
                                <span className="text-xs text-gray-500 font-mono">{agent.address}</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(agent.address)}
                                    className="text-gray-500 hover:text-purple-400 transition-colors"
                                    title="Copy address"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <TrustBadge score={agent.trust_score} size="lg" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-700/50">
                        <div>
                            <div className="text-2xl font-bold text-white">{agent.total_ratings}</div>
                            <div className="text-sm text-gray-400">Total Ratings</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{agent.trust_score.toFixed(1)}</div>
                            <div className="text-sm text-gray-400">Trust Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{agent.registry}</div>
                            <div className="text-sm text-gray-400">Registry</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {new Date(agent.indexed_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-400">Indexed</div>
                        </div>
                    </div>
                </div>

                {/* Rating section */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-8 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Rate This Agent</h2>

                    {connected ? (
                        <div className="space-y-6">
                            <RatingSlider value={rating} onChange={setRating} disabled={isSubmitting} />

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">
                                    Your rating will be weighted by your $AVELLUM balance
                                </span>
                                <button
                                    onClick={submitRating}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>

                            {submitMessage && (
                                <p className={`text-sm ${submitMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                                    {submitMessage}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">Connect your wallet to rate this agent</p>
                            <p className="text-sm text-gray-500">You must hold $AVELLUM tokens to submit ratings</p>
                        </div>
                    )}
                </div>

                {/* API usage example */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700/50">
                        <h2 className="text-lg font-bold text-white">API Access</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-400 text-sm mb-4">
                            Query this agent&apos;s trust score programmatically:
                        </p>
                        <div className="bg-gray-800/50 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                            GET /api/score/{agent.address}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
