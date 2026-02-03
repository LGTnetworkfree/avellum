'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import TrustBadge from './TrustBadge';
import RatingSlider from './RatingSlider';
import { useTokenBalance, MIN_AVLM_TO_VOTE, MIN_SOL_TO_VOTE } from '@/hooks/useTokenBalance';
import { useMemoVote } from '@/hooks/useMemoVote';
import type { Agent } from '@/lib/supabase';

interface Props {
    agent: Agent;
    showRating?: boolean;
}

const registryLabels: Record<string, string> = {
    x402scan: 'x402',
    mcp: 'MCP',
    a2a: 'A2A'
};

export default function AgentCard({ agent, showRating = true }: Props) {
    const { connected, publicKey } = useWallet();
    const { setVisible } = useWalletModal();
    const {
        avlmBalance,
        solBalance,
        loading: balanceLoading,
        error: balanceError,
        canVote,
        voteToken,
        displayBalance,
        refetch: refetchBalance
    } = useTokenBalance();
    const { submitVote, isSubmitting } = useMemoVote();
    const [rating, setRating] = useState(50);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
    const [showRatingPanel, setShowRatingPanel] = useState(false);
    const [copied, setCopied] = useState(false);

    // canVote now comes from useTokenBalance hook (checks AVLM first, then SOL fallback)

    useEffect(() => {
        if (canVote && submitMessage?.includes('must hold')) {
            setSubmitMessage(null);
        }
    }, [canVote, submitMessage]);

    async function handleSubmitRating() {
        if (!connected || !publicKey) {
            setSubmitMessage('Please connect your wallet first');
            return;
        }

        if (!canVote) {
            setSubmitMessage(`You need at least ${MIN_AVLM_TO_VOTE.toLocaleString()} $AVLM or ${MIN_SOL_TO_VOTE} SOL to rate agents`);
            return;
        }

        setSubmitMessage(null);
        setExplorerUrl(null);

        const result = await submitVote(agent.address, rating);

        if (result.success) {
            setSubmitMessage(`Rating submitted! Weight: ${(displayBalance ?? 0).toLocaleString()} ${voteToken === 'SOL' ? 'SOL' : '$AVLM'}`);
            setExplorerUrl(result.explorerUrl ?? null);
            setShowRatingPanel(false);
        } else {
            setSubmitMessage(result.error || 'Failed to submit rating');
        }
    }

    return (
        <div className="card-hover p-6 group cursor-default flex flex-col relative h-full">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent group-hover:via-[#00ffff]/50 transition-all duration-500" />

            {/* Header: registry + trust score */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="border border-[#1e3a5a] text-[#00d4ff] font-sans font-medium text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1 group-hover:border-[#00ffff]/40 group-hover:bg-[#00ffff]/5 transition-all duration-300">
                            {registryLabels[agent.registry] || agent.registry}
                        </span>
                        <span className="h-px flex-1 bg-[#1e3a5a] group-hover:bg-[#00ffff]/30 transition-colors duration-500" />
                    </div>

                    <Link href={`/agents/${agent.address}`}>
                        <h3 className="text-[1.1rem] font-bold text-white group-hover:text-[#00ffff] transition-colors duration-300 truncate uppercase" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                            {agent.name || 'Unnamed Agent'}
                        </h3>
                    </Link>
                </div>

                <TrustBadge score={agent.trust_score} size="sm" showLabel={false} />
            </div>

            {/* Description */}
            <p className="text-[#4b6a8a] text-[0.82rem] leading-relaxed group-hover:text-[#8aa0b8] transition-colors duration-300 line-clamp-2 mb-4 flex-1" style={{ fontFamily: 'var(--font-sans)' }}>
                {agent.description || 'No description available'}
            </p>

            {/* Address + copy */}
            <div className="flex items-center gap-2 mb-4">
                <span className="font-sans font-medium text-[0.6rem] text-[#2a4a6a] tracking-[0.08em] bg-[#0a1628]/60 px-2 py-0.5 rounded-sm">
                    {agent.address.slice(0, 8)}...{agent.address.slice(-6)}
                </span>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(agent.address);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[#2a4a6a] hover:text-[#00d4ff] transition-colors"
                    title="Copy address"
                >
                    {copied ? (
                        <svg className="w-3.5 h-3.5 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Bottom bar: ratings count + action */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1e3a5a]/40">
                <span className="font-sans font-medium text-[0.6rem] tracking-[0.12em] uppercase text-[#4b6a8a]">
                    {agent.total_ratings} {agent.total_ratings === 1 ? 'rating' : 'ratings'}
                </span>

                {showRating && (
                    <button
                        onClick={() => {
                            if (!connected) {
                                setVisible(true);
                            } else {
                                setShowRatingPanel(!showRatingPanel);
                            }
                        }}
                        className="font-sans font-medium text-[0.6rem] tracking-[0.12em] uppercase border border-[#1e3a5a] text-[#4b6a8a] px-3 py-1.5 hover:border-[#00ffff]/40 hover:text-[#00ffff] hover:bg-[#00ffff]/5 transition-all duration-300"
                    >
                        {connected ? (showRatingPanel ? 'Cancel' : 'Rate') : 'Connect'}
                    </button>
                )}
            </div>

            {/* Rating panel */}
            {showRatingPanel && connected && (
                <div className="mt-4 pt-4 border-t border-[#1e3a5a]/50 space-y-4">
                    {balanceLoading ? (
                        <p className="font-sans text-xs font-medium text-[#4b6a8a]">Loading $AVLM balance...</p>
                    ) : balanceError ? (
                        <div className="flex items-center gap-3">
                            <p className="font-sans text-xs font-medium text-[#ff6b6b]">
                                Could not fetch $AVLM balance.
                            </p>
                            <button onClick={refetchBalance} className="font-sans text-xs font-medium text-[#00d4ff] hover:text-[#00ffff] underline transition-colors">
                                Retry
                            </button>
                        </div>
                    ) : !canVote ? (
                        <p className="font-sans text-xs font-medium text-[#ff6b6b]">
                            You need at least {MIN_AVLM_TO_VOTE.toLocaleString()} $AVLM or {MIN_SOL_TO_VOTE} SOL to rate agents
                        </p>
                    ) : (
                        <>
                            <RatingSlider value={rating} onChange={setRating} disabled={isSubmitting} />

                            <div className="flex items-center justify-between gap-4">
                                <span className="font-sans font-medium text-[0.6rem] tracking-[0.15em] text-[#2a4a6a] uppercase">
                                    Weight: {(displayBalance ?? 0).toLocaleString()} {voteToken === 'SOL' ? 'SOL' : '$AVLM'}
                                </span>
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={isSubmitting}
                                    className="btn-angular bg-[#00ffff] text-[#0a1628] px-5 py-2 font-sans font-semibold text-[0.65rem] uppercase tracking-[0.08em] hover:bg-white transition-all duration-300 disabled:opacity-50 shrink-0"
                                >
                                    {isSubmitting ? 'Signing...' : 'Submit'}
                                </button>
                            </div>
                        </>
                    )}

                    {submitMessage && (
                        <p className={`font-sans text-xs font-medium ${submitMessage.includes('submitted') ? 'text-[#00ffff]' : 'text-[#ff6b6b]'}`}>
                            {submitMessage}
                        </p>
                    )}

                    {explorerUrl && (
                        <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-xs font-medium text-[#00d4ff] hover:text-[#00ffff] transition-colors inline-block"
                        >
                            View on Solana Explorer &rarr;
                        </a>
                    )}
                </div>
            )}

            {/* Explorer link shown after panel closes on success */}
            {!showRatingPanel && explorerUrl && (
                <div className="mt-4 pt-4 border-t border-[#1e3a5a]/50">
                    {submitMessage && (
                        <p className="font-sans text-xs font-medium text-[#00ffff] mb-2">{submitMessage}</p>
                    )}
                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs font-medium text-[#00d4ff] hover:text-[#00ffff] transition-colors inline-block"
                    >
                        View on Solana Explorer &rarr;
                    </a>
                </div>
            )}
        </div>
    );
}
