'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import TrustBadge from '@/components/TrustBadge';
import Footer from '@/components/Footer';
import { FadeIn, ScaleIn, StaggerItem, LiveCounter, StatBar, HeroSection, HeroTitle, HeroParagraph, HeroLabel } from '@/components/ScrollAnimations';
import type { Agent } from '@/lib/supabase';

function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getConfidenceLabel(totalRatings: number): string {
    if (totalRatings >= 20) return 'HIGH';
    if (totalRatings >= 5) return 'MEDIUM';
    return 'LOW';
}

export default function DashboardPage() {
    const { connected } = useWallet();
    const { setVisible } = useWalletModal();

    const [topAgents, setTopAgents] = useState<Agent[]>([]);
    const [agentsLoading, setAgentsLoading] = useState(true);
    const [counts, setCounts] = useState({ total: 0, x402scan: 0, mcp: 0, a2a: 0 });

    const fetchData = useCallback(async () => {
        setAgentsLoading(true);
        try {
            // Fetch top 5 agents and total counts in parallel
            const [agentsRes, ...countResults] = await Promise.all([
                fetch('/api/agents?limit=5'),
                ...(['x402scan', 'mcp', 'a2a'] as const).map(r =>
                    fetch(`/api/agents?registry=${r}&limit=1`).then(res => res.json()).then(data => ({ registry: r, count: data.total || 0 }))
                )
            ]);

            const agentsData = await agentsRes.json();
            setTopAgents(agentsData.agents || []);

            const c = { total: 0, x402scan: 0, mcp: 0, a2a: 0 };
            for (const r of countResults) {
                c[r.registry] = r.count;
                c.total += r.count;
            }
            setCounts(c);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setAgentsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const networkStats = [
        { label: 'Agents Indexed', value: counts.total, bar: Math.min(100, counts.total / 20) },
        { label: 'x402', value: counts.x402scan, bar: counts.total > 0 ? (counts.x402scan / counts.total) * 100 : 0 },
        { label: 'MCP', value: counts.mcp, bar: counts.total > 0 ? (counts.mcp / counts.total) * 100 : 0 },
        { label: 'A2A', value: counts.a2a, bar: counts.total > 0 ? (counts.a2a / counts.total) * 100 : 0 },
    ];

    return (
        <>
        <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

            {/* ========== HEADER ========== */}
            <section className="grid grid-cols-1 md:grid-cols-[55%_45%] border-b border-[#1e3a5a]">
                <HeroSection className="px-8 md:px-12 pt-12 pb-8">
                    <HeroTitle
                        lines={['Network']}
                        accent="leaderboard."
                        className="font-sans text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4"
                    />
                    <HeroParagraph delay={0.75} className="text-body text-[#a0a0a0] max-w-lg mb-8">
                        Top performing agents and network statistics in the Avellum ecosystem.
                    </HeroParagraph>

                    <HeroLabel index={0} baseDelay={1.15} className="grid grid-cols-[100px_1fr] gap-4 mb-2 label-terminal">
                        <span>MODULE</span>
                        <span className="text-white">NETWORK DASHBOARD</span>
                    </HeroLabel>
                    <HeroLabel index={1} baseDelay={1.15} className="grid grid-cols-[100px_1fr] gap-4 label-terminal">
                        <span>STATUS</span>
                        <span className="text-white flex items-center gap-2">LIVE <span className="live-dot" /></span>
                    </HeroLabel>
                </HeroSection>
                <ScaleIn className="hidden md:flex items-center justify-center relative border-l border-[#1e3a5a] bg-[#050d18] overflow-hidden">
                    <div className="absolute inset-0" style={{
                        backgroundImage:
                            'linear-gradient(rgba(30,58,90,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,90,0.08) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                    <div className="absolute inset-0" style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.08) 0%, rgba(0, 212, 255, 0.02) 40%, transparent 70%)'
                    }} />
                    <Image
                        src="/logo.svg"
                        alt="Avellum protocol logo"
                        width={360}
                        height={360}
                        className="spin-slow glow-pulse opacity-75 relative z-[1] max-w-[70%] h-auto"
                        priority
                    />
                </ScaleIn>
            </section>

            {/* ========== STATS STRIP ========== */}
            <FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#1e3a5a]">
                    {networkStats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`glass-panel px-6 md:px-8 py-5 ${i < 3 ? 'border-r' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''}`}
                        >
                            <span className="label-terminal !text-[#4b6a8a] block mb-1">{stat.label}</span>
                            <p className="font-sans text-2xl font-bold text-white">
                                <LiveCounter end={stat.value} />
                            </p>
                            <StatBar percent={stat.bar} />
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* ========== TOP AGENTS ========== */}
            <div className="section-gradient">
                <div className="px-8 md:px-12 pt-10 pb-10">
                    <StaggerItem index={0}>
                        <div className="overflow-hidden card-hover max-w-2xl mx-auto">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-[#1e3a5a]/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="label-terminal text-[#00ffff]">Top Agents</span>
                                    <span className="h-px flex-1 bg-[#1e3a5a] min-w-[40px]" />
                                </div>
                                <span className="label-terminal !text-[#2a4a6a]">Trust</span>
                            </div>

                            {/* List */}
                            <div className="divide-y divide-[#1e3a5a]/30">
                                {agentsLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                                            <span className="font-sans text-lg font-bold text-[#1e3a5a] w-6 text-center">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="h-4 bg-[#1e3a5a]/30 rounded w-32" />
                                                <div className="h-3 bg-[#1e3a5a]/20 rounded w-20" />
                                            </div>
                                            <div className="h-8 w-12 bg-[#1e3a5a]/30 rounded" />
                                        </div>
                                    ))
                                ) : topAgents.length > 0 ? (
                                    topAgents.map((agent, i) => (
                                        <Link
                                            key={agent.id}
                                            href={`/agents/${agent.address}`}
                                            className="px-6 py-4 flex items-center gap-4 hover:bg-[#00ffff]/[0.02] transition-colors group/row block"
                                        >
                                            <span className="font-sans text-lg font-bold text-[#1e3a5a] group-hover/row:text-[#00ffff] transition-colors duration-300 w-6 text-center">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-sans text-sm font-medium text-[#00d4ff] mb-1 group-hover/row:text-[#00ffff] transition-colors duration-300 truncate">
                                                    {agent.name || truncateAddress(agent.address)}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="border border-[#1e3a5a] text-[#00d4ff] font-sans font-medium text-[0.6rem] tracking-[0.15em] uppercase px-2 py-0.5 group-hover/row:border-[#00ffff]/40 transition-all duration-300">
                                                        {getConfidenceLabel(agent.total_ratings)}
                                                    </span>
                                                    <span className="font-sans font-medium text-[0.6rem] tracking-[0.15em] uppercase text-[#4b6a8a]">
                                                        {agent.total_ratings} {agent.total_ratings === 1 ? 'rating' : 'ratings'}
                                                    </span>
                                                </div>
                                            </div>
                                            <TrustBadge score={agent.trust_score} size="sm" showLabel={false} />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-[#4b6a8a] font-sans text-sm">No agents with ratings yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-[#1e3a5a]/30 text-center">
                                <Link href="/agents" className="font-sans font-medium text-[0.65rem] tracking-[0.15em] uppercase text-[#4b6a8a] hover:text-[#00ffff] transition-colors duration-300">
                                    View All Agents
                                </Link>
                            </div>
                        </div>
                    </StaggerItem>
                </div>
            </div>

            {/* ========== CTA BANNER (disconnected) ========== */}
            {!connected && (
                <>
                    <div className="gradient-separator" />
                    <FadeIn className="px-8 md:px-12 py-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <span className="label-terminal !text-[#4b6a8a] block mb-3">Get Started</span>
                            <h2 className="font-sans text-3xl md:text-4xl font-bold text-white mb-2">Start verifying.</h2>
                            <p className="text-body text-[#a0a0a0] max-w-sm">
                                Connect your wallet to join the Verifier Network. Rate agents, stake tokens, and earn protocol fees.
                            </p>
                        </div>
                        <button
                            onClick={() => setVisible(true)}
                            className="btn-angular btn-interactive bg-[#00ffff] text-[#0a1628] px-8 py-4 font-sans font-semibold text-sm uppercase tracking-[0.08em] hover:bg-white cursor-pointer shrink-0"
                        >
                            Connect Wallet
                        </button>
                    </FadeIn>
                </>
            )}

        </div>

        {/* ========== FOOTER TRANSITION ========== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 bg-gradient-to-b from-[#0a1628] to-[#00ffff]/10" />
        </div>
        <Footer />
        </>
    );
}
