'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import TrustBadge from './TrustBadge';
import RatingSlider from './RatingSlider';
import type { Agent } from '@/lib/supabase';

interface Props {
    agent: Agent;
    showRating?: boolean;
}

export default function AgentCard({ agent, showRating = true }: Props) {
    const { connected, publicKey } = useWallet();
    const { setVisible } = useWalletModal();
    const [rating, setRating] = useState(50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [showRatingPanel, setShowRatingPanel] = useState(false);
    const [copied, setCopied] = useState(false);

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

    async function submitRating() {
        if (!connected || !publicKey) {
            setSubmitMessage('Please connect your wallet first');
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    agentAddress: agent.address,
                    score: rating,
                    signature: '' // TODO: Add wallet signature
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitMessage(`Rating submitted! Weight: ${data.tokenWeight?.toLocaleString()} tokens`);
                setShowRatingPanel(false);
            } else {
                setSubmitMessage(data.error || 'Failed to submit rating');
            }
        } catch (error) {
            setSubmitMessage('Failed to submit rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            {/* Registry badge */}
            <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${registryColors[agent.registry]} text-white shadow-lg`}>
                {registryLabels[agent.registry]}
            </div>

            <div className="flex items-start justify-between gap-4 mt-2">
                <div className="flex-1 min-w-0">
                    <Link href={`/agents/${agent.address}`}>
                        <h3 className="text-xl font-bold text-white hover:text-purple-400 transition-colors cursor-pointer truncate">
                            {agent.name || 'Unnamed Agent'}
                        </h3>
                    </Link>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {agent.description || 'No description available'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]">
                            {agent.address.slice(0, 8)}...{agent.address.slice(-6)}
                        </span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(agent.address);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-gray-500 hover:text-purple-400 transition-colors"
                            title="Copy address"
                        >
                            {copied ? (
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <TrustBadge score={agent.trust_score} size="md" />
            </div>

            {/* Rating stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{agent.total_ratings} ratings</span>
                </div>

                {showRating && (
                    <button
                        onClick={() => {
                            if (!connected) {
                                setVisible(true);
                            } else {
                                setShowRatingPanel(!showRatingPanel);
                            }
                        }}
                        className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300"
                    >
                        {connected ? (showRatingPanel ? 'Cancel' : 'Rate Agent') : 'Connect to Rate'}
                    </button>
                )}
            </div>

            {/* Rating panel */}
            {showRatingPanel && connected && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
                    <RatingSlider value={rating} onChange={setRating} disabled={isSubmitting} />

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Your rating will be weighted by your $AVELLUM balance
                        </span>
                        <button
                            onClick={submitRating}
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white transition-all duration-300 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>

                    {submitMessage && (
                        <p className={`text-sm ${submitMessage.includes('submitted') ? 'text-green-400' : 'text-red-400'}`}>
                            {submitMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
