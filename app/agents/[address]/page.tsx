'use client';

import { useEffect, useState, use } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import TrustBadge from '@/components/TrustBadge';
import RatingSlider from '@/components/RatingSlider';
import Footer from '@/components/Footer';
import { useTokenBalance, MIN_AVLM_TO_VOTE, MIN_SOL_TO_VOTE } from '@/hooks/useTokenBalance';
import { useMemoVote } from '@/hooks/useMemoVote';
import type { Agent } from '@/lib/supabase';

interface Props {
    params: Promise<{ address: string }>;
}

const registryLabels: Record<string, string> = {
    x402scan: 'x402',
    mcp: 'MCP',
    a2a: 'A2A'
};

export default function AgentDetailPage({ params }: Props) {
    const { address } = use(params);
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
    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(50);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

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

    async function handleSubmitRating() {
        if (!connected || !publicKey) return;
        if (!canVote) {
            setSubmitMessage(`You need at least ${MIN_AVLM_TO_VOTE.toLocaleString()} $AVLM or ${MIN_SOL_TO_VOTE} SOL to rate agents`);
            return;
        }

        setSubmitMessage(null);
        setExplorerUrl(null);

        const result = await submitVote(address, rating);

        if (result.success) {
            setSubmitMessage('Rating submitted successfully!');
            setExplorerUrl(result.explorerUrl ?? null);
            // Refresh agent data
            const refreshResponse = await fetch(`/api/score/${address}`);
            if (refreshResponse.ok) {
                setAgent(await refreshResponse.json());
            }
        } else {
            setSubmitMessage(result.error || 'Failed to submit rating');
        }
    }

    if (isLoading) {
        return (
            <>
            <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">
                <div className="flex items-center justify-center py-40">
                    <div className="label-terminal !text-[#4b6a8a] animate-pulse">
                        Loading agent data...
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 bg-gradient-to-b from-[#0a1628] to-[#00ffff]/10" />
            </div>
            <Footer />
            </>
        );
    }

    if (!agent) {
        return (
            <>
            <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">
                <div className="flex flex-col items-center justify-center py-32 px-8">
                    <p className="font-sans text-3xl font-bold text-white mb-3">Agent not found.</p>
                    <p className="text-[#4b6a8a] font-sans text-sm mb-8">This agent hasn&apos;t been indexed yet.</p>
                    <Link
                        href="/agents"
                        className="btn-angular bg-[#00ffff] text-[#0a1628] px-8 py-4 font-sans font-semibold text-sm uppercase tracking-[0.08em] hover:bg-white transition-all duration-300"
                    >
                        Back to Explorer
                    </Link>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 bg-gradient-to-b from-[#0a1628] to-[#00ffff]/10" />
            </div>
            <Footer />
            </>
        );
    }

    return (
        <>
        <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

            {/* ========== HEADER ========== */}
            <section className="border-b border-[#1e3a5a]">
                <div className="px-8 md:px-12 pt-12 pb-8">
                    {/* Back link */}
                    <Link
                        href="/agents"
                        className="inline-flex items-center gap-2 font-sans font-medium text-[0.65rem] tracking-[0.15em] uppercase text-[#4b6a8a] hover:text-[#00ffff] transition-colors duration-300 mb-8"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Explorer
                    </Link>

                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="border border-[#1e3a5a] text-[#00d4ff] font-sans font-medium text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1">
                                    {registryLabels[agent.registry] || agent.registry}
                                </span>
                                <span className="h-px flex-1 bg-[#1e3a5a]" />
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.05] mb-4 uppercase" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                                {agent.name || 'Unnamed Agent'}
                            </h1>

                            <p className="text-body text-[#a0a0a0] max-w-lg mb-6">
                                {agent.description || 'No description available'}
                            </p>

                            {/* Address */}
                            <div className="flex items-center gap-3 bg-[#050d18] border border-[#1e3a5a] px-4 py-3 max-w-full">
                                <span className="font-sans font-medium text-[0.65rem] text-[#4b6a8a] tracking-[0.15em] break-all">{agent.address}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(agent.address);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="text-[#2a4a6a] hover:text-[#00d4ff] transition-colors shrink-0"
                                    title="Copy address"
                                >
                                    {copied ? (
                                        <svg className="w-4 h-4 text-[#00ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        <TrustBadge score={agent.trust_score} size="lg" />
                    </div>
                </div>
            </section>

            {/* ========== STATS STRIP ========== */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#1e3a5a]">
                <div className="px-6 md:px-8 py-5 border-r border-[#1e3a5a]">
                    <span className="label-terminal !text-[#4b6a8a] block mb-1">Trust Score</span>
                    <p className="font-sans text-2xl font-bold text-white">{agent.trust_score.toFixed(1)}</p>
                </div>
                <div className="px-6 md:px-8 py-5 md:border-r border-[#1e3a5a]">
                    <span className="label-terminal !text-[#4b6a8a] block mb-1">Total Ratings</span>
                    <p className="font-sans text-2xl font-bold text-white">{agent.total_ratings}</p>
                </div>
                <div className="px-6 md:px-8 py-5 border-r border-[#1e3a5a] border-t md:border-t-0">
                    <span className="label-terminal !text-[#4b6a8a] block mb-1">Registry</span>
                    <p className="font-sans text-2xl font-bold text-white">{registryLabels[agent.registry] || agent.registry}</p>
                </div>
                <div className="px-6 md:px-8 py-5 border-t md:border-t-0">
                    <span className="label-terminal !text-[#4b6a8a] block mb-1">Indexed</span>
                    <p className="font-sans text-2xl font-bold text-white">
                        {new Date(agent.indexed_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* ========== RATING SECTION ========== */}
            <div className="section-gradient">
                <div className="px-8 md:px-12 pt-10 pb-10">
                    <span className="label-terminal text-[#00ffff] block mb-3">Submit Rating</span>
                    <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-8">
                        Rate this agent.
                    </h2>

                    {connected ? (
                        <div className="card-hover p-8 max-w-2xl">
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

                                    <div className="flex items-center justify-between gap-4 mt-6">
                                        <span className="font-sans font-medium text-[0.6rem] tracking-[0.15em] text-[#2a4a6a] uppercase">
                                            Weight: {(displayBalance ?? 0).toLocaleString()} {voteToken === 'SOL' ? 'SOL' : '$AVLM'}
                                        </span>
                                        <button
                                            onClick={handleSubmitRating}
                                            disabled={isSubmitting}
                                            className="btn-angular btn-interactive bg-[#00ffff] text-[#0a1628] px-8 py-3 font-sans font-semibold text-sm uppercase tracking-[0.08em] hover:bg-white disabled:opacity-50 shrink-0"
                                        >
                                            {isSubmitting ? 'Signing...' : 'Submit Rating'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {submitMessage && (
                                <p className={`font-sans text-xs font-medium mt-4 ${submitMessage.includes('successfully') ? 'text-[#00ffff]' : 'text-[#ff6b6b]'}`}>
                                    {submitMessage}
                                </p>
                            )}

                            {explorerUrl && (
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-sans text-xs font-medium text-[#00d4ff] hover:text-[#00ffff] transition-colors inline-block mt-2"
                                >
                                    View on Solana Explorer &rarr;
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="card-hover p-8 max-w-2xl text-center">
                            <p className="text-[#4b6a8a] font-sans text-sm mb-4">Connect your wallet to rate this agent.</p>
                            <p className="font-sans font-medium text-[0.6rem] tracking-[0.15em] text-[#2a4a6a] uppercase mb-6">
                                You need at least 10,000 $AVLM or 0.01 SOL to submit ratings
                            </p>
                            <button
                                onClick={() => setVisible(true)}
                                className="btn-angular btn-interactive bg-[#00ffff] text-[#0a1628] px-8 py-3 font-sans font-semibold text-sm uppercase tracking-[0.08em] hover:bg-white cursor-pointer"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== API ACCESS ========== */}
            <div className="gradient-separator" />
            <div className="px-8 md:px-12 py-10">
                <span className="label-terminal !text-[#4b6a8a] block mb-3">Developer</span>
                <h2 className="font-sans text-2xl font-bold text-white leading-snug mb-6">
                    API Access
                </h2>
                <p className="text-[#4b6a8a] font-sans text-sm mb-4">
                    Query this agent&apos;s trust score programmatically:
                </p>
                <div className="bg-[#050d18] border border-[#1e3a5a] px-5 py-4 font-sans text-sm font-medium text-[#a0a0a0] overflow-x-auto">
                    <span className="text-[#00ffff]">GET</span> /api/score/{agent.address}
                </div>
            </div>

        </div>

        {/* ========== FOOTER TRANSITION ========== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 bg-gradient-to-b from-[#0a1628] to-[#00ffff]/10" />
        </div>
        <Footer />
        </>
    );
}
