'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import TrustBadge from '@/components/TrustBadge';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScaleIn, StaggerItem, LiveCounter, StatBar, HeroSection, HeroTitle, HeroParagraph, HeroLabel } from '@/components/ScrollAnimations';
import { useAgents } from '@/hooks/useAgents';

// --- MOCK FALLBACKS ---
const TOP_VERIFIERS = [
    { rank: 1, address: '0x7a3...f2d', score: '2,450', ratings: 127, stake: '50K' },
    { rank: 2, address: '0x9b2...e1c', score: '2,180', ratings: 98, stake: '42K' },
    { rank: 3, address: '0x4f8...a9b', score: '1,920', ratings: 85, stake: '38K' },
    { rank: 4, address: '0x1c9...33a', score: '1,540', ratings: 62, stake: '25K' },
    { rank: 5, address: '0x8d4...k99', score: '1,210', ratings: 45, stake: '10K' },
];

const MOCK_AGENTS = [
    { rank: 1, name: 'PaymentBot_x402', trust: 94.2, ratingCount: 127, confidence: 2 },
    { rank: 2, name: 'MCPServer_Alpha', trust: 91.8, ratingCount: 98, confidence: 2 },
    { rank: 3, name: 'A2A_Router_Prime', trust: 89.5, ratingCount: 85, confidence: 1 },
    { rank: 4, name: 'DeFi_Sniper_v2', trust: 85.0, ratingCount: 62, confidence: 1 },
    { rank: 5, name: 'DataOracle_X', trust: 82.3, ratingCount: 45, confidence: 0 },
];

const MOCK_STATS = [
    { label: 'Verifiers', value: 342, bar: 68 },
    { label: 'Agents Indexed', value: 1247, bar: 62 },
    { label: 'Ratings Given', value: 18600, suffix: '', bar: 74 },
    { label: 'Protocol Fees', value: 42100, prefix: '$', bar: 70 },
];

const CONFIDENCE_LABELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

function truncateAddress(addr: string): string {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function DashboardPage() {
    const { connected } = useWallet();
    const { setVisible } = useWalletModal();
    const [selectedVerifier, setSelectedVerifier] = useState<typeof TOP_VERIFIERS[0] | null>(null);
    const { agents: onChainAgents, protocolState, loading: agentsLoading } = useAgents();

    const displayAgents = useMemo(() => {
        if (onChainAgents.length > 0) {
            return onChainAgents.slice(0, 5).map((a, i) => ({
                rank: i + 1,
                name: truncateAddress(a.account.address.toBase58()),
                trust: a.account.trustScore.toNumber(),
                ratingCount: a.account.ratingCount,
                confidence: a.account.confidence,
            }));
        }
        return MOCK_AGENTS;
    }, [onChainAgents]);

    const networkStats = useMemo(() => {
        if (protocolState) {
            return [
                { label: 'Verifiers', value: MOCK_STATS[0].value, bar: 68 },
                { label: 'Agents Indexed', value: protocolState.totalAgents, bar: Math.min(100, protocolState.totalAgents / 20) },
                { label: 'Ratings Given', value: protocolState.totalRatings.toNumber(), suffix: '', bar: Math.min(100, protocolState.totalRatings.toNumber() / 250) },
                { label: 'Protocol Fees', value: 42100, prefix: '$', bar: 70 },
            ];
        }
        return MOCK_STATS;
    }, [protocolState]);

    return (
        <>
        <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

            {/* ========== HEADER ========== */}
            <section className="grid grid-cols-1 md:grid-cols-[55%_45%] border-b border-[#1e3a5a]">
                <HeroSection className="px-8 md:px-12 pt-12 pb-8">
                    <HeroTitle
                        lines={['Network']}
                        accent="leaderboard."
                        className="font-serif text-4xl md:text-5xl font-normal text-white leading-[1.1] mb-4"
                    />
                    <HeroParagraph delay={0.75} className="text-body text-[#a0a0a0] max-w-lg mb-8">
                        Top performing verifiers and highest trust agents in the Avellum ecosystem.
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
                        alt=""
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
                            <p className="font-serif text-2xl text-white">
                                <LiveCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                            </p>
                            <StatBar percent={stat.bar} />
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* ========== LEADERBOARDS ========== */}
            <div className="section-gradient">
                <div className="px-8 md:px-12 pt-10 pb-10">
                    <div className="grid md:grid-cols-2 gap-4">

                        {/* LEFT: Top Verifiers */}
                        <StaggerItem index={0}>
                            <div className="overflow-hidden card-hover">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-[#1e3a5a]/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="label-terminal text-[#00ffff]">Top Verifiers</span>
                                        <span className="h-px flex-1 bg-[#1e3a5a] min-w-[40px]" />
                                    </div>
                                    <span className="label-terminal !text-[#2a4a6a]">Score</span>
                                </div>

                                {/* List */}
                                <div className="divide-y divide-[#1e3a5a]/30">
                                    {TOP_VERIFIERS.map((verifier) => (
                                        <div
                                            key={verifier.rank}
                                            onClick={() => setSelectedVerifier(verifier)}
                                            className="px-6 py-4 flex items-center gap-4 hover:bg-[#00ffff]/[0.02] transition-colors cursor-pointer group/row"
                                        >
                                            <span className="font-serif text-lg text-[#1e3a5a] group-hover/row:text-[#00ffff] transition-colors duration-300 w-6 text-center">
                                                {String(verifier.rank).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-sm text-[#00d4ff] mb-1 group-hover/row:text-[#00ffff] transition-colors duration-300">{verifier.address}</div>
                                                <div className="flex gap-3 font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#4b6a8a]">
                                                    <span>{verifier.ratings} ratings</span>
                                                    <span>{verifier.stake} staked</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-lg text-white font-medium">{verifier.score}</div>
                                                <div className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#2a4a6a]">PTS</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-[#1e3a5a]/30 text-center">
                                    <Link href="/agents" className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#4b6a8a] hover:text-[#00ffff] transition-colors duration-300">
                                        View All Verifiers
                                    </Link>
                                </div>
                            </div>
                        </StaggerItem>

                        {/* RIGHT: Top Agents */}
                        <StaggerItem index={1}>
                            <div className="overflow-hidden card-hover">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-[#1e3a5a]/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="label-terminal text-[#00ffff]">Top Agents</span>
                                        <span className="h-px flex-1 bg-[#1e3a5a] min-w-[40px]" />
                                        {onChainAgents.length > 0 && (
                                            <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#00ffff]/50">ON-CHAIN</span>
                                        )}
                                    </div>
                                    <span className="label-terminal !text-[#2a4a6a]">Trust</span>
                                </div>

                                {/* List */}
                                <div className="divide-y divide-[#1e3a5a]/30">
                                    {agentsLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                                                <span className="font-serif text-lg text-[#1e3a5a] w-6 text-center">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="h-4 bg-[#1e3a5a]/30 rounded w-32" />
                                                    <div className="h-3 bg-[#1e3a5a]/20 rounded w-20" />
                                                </div>
                                                <div className="h-8 w-12 bg-[#1e3a5a]/30 rounded" />
                                            </div>
                                        ))
                                    ) : (
                                        displayAgents.map((agent) => (
                                            <Link
                                                key={agent.rank}
                                                href="/agents"
                                                className="px-6 py-4 flex items-center gap-4 hover:bg-[#00ffff]/[0.02] transition-colors group/row block"
                                            >
                                                <span className="font-serif text-lg text-[#1e3a5a] group-hover/row:text-[#00ffff] transition-colors duration-300 w-6 text-center">
                                                    {String(agent.rank).padStart(2, '0')}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-mono text-sm text-[#00d4ff] mb-1 group-hover/row:text-[#00ffff] transition-colors duration-300">{agent.name}</div>
                                                    <div className="flex gap-2 items-center">
                                                        <span className="border border-[#1e3a5a] text-[#00d4ff] font-mono text-[0.6rem] tracking-[0.15em] uppercase px-2 py-0.5 group-hover/row:border-[#00ffff]/40 transition-all duration-300">
                                                            {CONFIDENCE_LABELS[agent.confidence] ?? 'N/A'}
                                                        </span>
                                                        <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#4b6a8a]">
                                                            {agent.ratingCount} ratings
                                                        </span>
                                                    </div>
                                                </div>
                                                <TrustBadge score={agent.trust} size="sm" showLabel={false} />
                                            </Link>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-[#1e3a5a]/30 text-center">
                                    <Link href="/agents" className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#4b6a8a] hover:text-[#00ffff] transition-colors duration-300">
                                        View Agent Registry
                                    </Link>
                                </div>
                            </div>
                        </StaggerItem>

                    </div>
                </div>
            </div>

            {/* ========== CTA BANNER (disconnected) ========== */}
            {!connected && (
                <>
                    <div className="gradient-separator" />
                    <FadeIn className="px-8 md:px-12 py-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <span className="label-terminal !text-[#4b6a8a] block mb-3">Get Started</span>
                            <h2 className="font-serif text-3xl md:text-4xl font-normal text-white mb-2">Start verifying.</h2>
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

        {/* ========== VERIFIER MODAL ========== */}
        <AnimatePresence>
            {selectedVerifier && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedVerifier(null)}
                        className="fixed inset-0 bg-[#0a1628]/90 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0a1628] border border-[#1e3a5a] shadow-[0_0_60px_rgba(0,212,255,0.08)] pointer-events-auto relative"
                        >
                            <button
                                onClick={() => setSelectedVerifier(null)}
                                className="absolute top-5 right-5 text-[#4b6a8a] hover:text-[#00ffff] transition-colors font-mono text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Modal header */}
                            <div className="px-6 pt-6 pb-4 border-b border-[#1e3a5a]/50">
                                <span className="label-terminal text-[#00ffff] block mb-2">Verifier Profile</span>
                                <h3 className="font-mono text-xl text-white">{selectedVerifier.address}</h3>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 border-b border-[#1e3a5a]/50">
                                <div className="px-6 py-4 border-r border-[#1e3a5a]/50">
                                    <span className="label-terminal !text-[#4b6a8a] block mb-1">Total Score</span>
                                    <p className="font-serif text-2xl text-white">{selectedVerifier.score}</p>
                                </div>
                                <div className="px-6 py-4">
                                    <span className="label-terminal !text-[#4b6a8a] block mb-1">Rank</span>
                                    <p className="font-serif text-2xl text-white">#{selectedVerifier.rank}</p>
                                </div>
                            </div>

                            {/* Detail rows */}
                            <div className="px-6 py-4 space-y-0">
                                <div className="flex justify-between py-3 border-b border-[#1e3a5a]/30">
                                    <span className="label-terminal !text-[#4b6a8a]">Total Ratings</span>
                                    <span className="font-mono text-sm text-white">{selectedVerifier.ratings}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-[#1e3a5a]/30">
                                    <span className="label-terminal !text-[#4b6a8a]">Staked Amount</span>
                                    <span className="font-mono text-sm text-white">{selectedVerifier.stake} AVL</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="label-terminal !text-[#4b6a8a]">Network Status</span>
                                    <span className="font-mono text-sm text-[#00ffff]">ONLINE</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
        </>
    );
}
