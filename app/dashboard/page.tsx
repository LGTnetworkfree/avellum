'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useState } from 'react';
import TrustBadge from '@/components/TrustBadge';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const TOP_VERIFIERS = [
    { rank: 1, address: '0x7a3...f2d', score: '2,450', ratings: 127, stake: '50K', badge: '🥇' },
    { rank: 2, address: '0x9b2...e1c', score: '2,180', ratings: 98, stake: '42K', badge: '🥈' },
    { rank: 3, address: '0x4f8...a9b', score: '1,920', ratings: 85, stake: '38K', badge: '🥉' },
    { rank: 4, address: '0x1c9...33a', score: '1,540', ratings: 62, stake: '25K', badge: null },
    { rank: 5, address: '0x8d4...k99', score: '1,210', ratings: 45, stake: '10K', badge: null },
];

const TOP_AGENTS = [
    { rank: 1, name: 'PaymentBot_x402', trust: 94.2, txns: '45K', source: 'x402', badge: '🥇' },
    { rank: 2, name: 'MCPServer_Alpha', trust: 91.8, txns: '32K', source: 'MCP', badge: '🥈' },
    { rank: 3, name: 'A2A_Router_Prime', trust: 89.5, txns: '28K', source: 'A2A', badge: '🥉' },
    { rank: 4, name: 'DeFi_Sniper_v2', trust: 85.0, txns: '12K', source: 'x402', badge: null },
    { rank: 5, name: 'DataOracle_X', trust: 82.3, txns: '8K', source: 'A2A', badge: null },
];

export default function DashboardPage() {
    const { connected } = useWallet();
    const { setVisible } = useWalletModal();
    const [selectedVerifier, setSelectedVerifier] = useState<typeof TOP_VERIFIERS[0] | null>(null);

    return (
        <div className="min-h-screen pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Page Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
                        <span className="text-[#00d4ff] font-mono text-xs tracking-widest uppercase">Live Network Stats</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">NETWORK LEADERBOARD</h1>
                    <p className="text-[#4b6a8a] max-w-md">
                        Top performing verifiers and highest trust agents in the Avellum ecosystem.
                    </p>
                </div>
                {!connected && (
                    <div className="hidden md:block">
                        <button
                            onClick={() => setVisible(true)}
                            className="bg-[#00d4ff]/10 border border-[#00d4ff] text-[#00d4ff] px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all duration-300"
                        >
                            Connect Wallet to Participate
                        </button>
                    </div>
                )}
            </div>

            {/* Dual Leaderboards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">

                {/* LEFT: Top Verifiers */}
                <div className="bg-[#0a1628] border border-[#1e3a5a] relative overflow-hidden group">
                    {/* Header */}
                    <div className="p-6 border-b border-[#1e3a5a] bg-[#0d1e33] flex justify-between items-center">
                        <h2 className="font-serif text-xl text-white tracking-wide">TOP VERIFIERS</h2>
                        <span className="text-[0.6rem] font-mono text-[#4b6a8a] uppercase tracking-widest">Global Rank</span>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-[#1e3a5a]">
                        {TOP_VERIFIERS.map((verifier) => (
                            <div
                                key={verifier.rank}
                                onClick={() => setSelectedVerifier(verifier)}
                                className="p-4 flex items-center gap-4 hover:bg-[#142a44] transition-colors cursor-pointer group/row"
                            >
                                <div className="w-8 text-center font-mono font-bold text-[#4b6a8a] group-hover/row:text-white">
                                    {verifier.badge || verifier.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="font-mono text-sm text-[#00d4ff] mb-1">{verifier.address}</div>
                                    <div className="flex gap-3 text-[0.65rem] text-[#4b6a8a] uppercase tracking-wider">
                                        <span>Ratings: <span className="text-white">{verifier.ratings}</span></span>
                                        <span>Stake: <span className="text-white">{verifier.stake}</span></span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-serif text-lg text-white font-bold">{verifier.score}</div>
                                    <div className="text-[0.6rem] text-[#4b6a8a] font-mono uppercase">PTS</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[#1e3a5a] bg-[#0a1628] text-center">
                        <button className="text-[#00d4ff] text-xs font-mono uppercase tracking-widest hover:text-white transition-colors">
                            View All Verifiers →
                        </button>
                    </div>
                </div>

                {/* RIGHT: Top Agents */}
                <div className="bg-[#0a1628] border border-[#1e3a5a] relative overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-[#1e3a5a] bg-[#0d1e33] flex justify-between items-center">
                        <h2 className="font-serif text-xl text-white tracking-wide">TOP AGENTS</h2>
                        <span className="text-[0.6rem] font-mono text-[#4b6a8a] uppercase tracking-widest">Trust Score</span>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-[#1e3a5a]">
                        {TOP_AGENTS.map((agent) => (
                            <Link
                                key={agent.rank}
                                href={`/agents`}
                                className="p-4 flex items-center gap-4 hover:bg-[#142a44] transition-colors group/row block"
                            >
                                <div className="w-8 text-center font-mono font-bold text-[#4b6a8a] group-hover/row:text-white">
                                    {agent.badge || agent.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="font-serif text-sm text-white mb-1 tracking-wide">{agent.name}</div>
                                    <div className="flex gap-2 items-center">
                                        <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase ${agent.source === 'x402' ? 'bg-blue-900/50 text-blue-400' :
                                                agent.source === 'MCP' ? 'bg-purple-900/50 text-purple-400' :
                                                    'bg-teal-900/50 text-teal-400'
                                            }`}>
                                            {agent.source}
                                        </span>
                                        <span className="text-[0.65rem] text-[#4b6a8a] uppercase tracking-wider">
                                            Txns: <span className="text-white">{agent.txns}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <TrustBadge score={agent.trust} size="sm" showLabel={false} />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[#1e3a5a] bg-[#0a1628] text-center">
                        <Link href="/agents">
                            <button className="text-[#00d4ff] text-xs font-mono uppercase tracking-widest hover:text-white transition-colors">
                                View Agent Registry →
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Banner */}
            {!connected && (
                <div className="border border-[#1e3a5a] bg-gradient-to-r from-[#0d1e33] to-[#0a1628] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#00d4ff]/5 to-transparent skew-x-12" />

                    <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-xl font-serif text-white mb-2">Start Verifying & Earning</h3>
                        <p className="text-[#4b6a8a] text-sm max-w-lg">
                            Connect your wallet to join the Verifier Network. Rate agents, stake tokens, and earn a share of protocol fees.
                        </p>
                    </div>
                    <button
                        onClick={() => setVisible(true)}
                        className="relative z-10 bg-[#00d4ff] text-[#0a1628] px-8 py-3 font-mono text-sm uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300"
                    >
                        CONNECT WALLET
                    </button>
                </div>
            )}

            {/* Verifier Modal */}
            <AnimatePresence>
                {selectedVerifier && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVerifier(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-md bg-[#0a1628] border border-[#00d4ff] shadow-[0_0_50px_rgba(0,212,255,0.1)] pointer-events-auto p-6 relative"
                            >
                                <button
                                    onClick={() => setSelectedVerifier(null)}
                                    className="absolute top-4 right-4 text-[#4b6a8a] hover:text-white"
                                >
                                    ✕
                                </button>

                                <div className="mb-6 border-b border-[#1e3a5a] pb-4">
                                    <div className="text-[0.65rem] text-[#00d4ff] font-mono mb-1">VERIFIER PROFILE</div>
                                    <h3 className="text-2xl font-mono text-white">{selectedVerifier.address}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#050d18] p-3 border border-[#1e3a5a]">
                                        <div className="text-[0.6rem] text-[#4b6a8a] uppercase mb-1">Total Score</div>
                                        <div className="text-xl text-white font-bold">{selectedVerifier.score}</div>
                                    </div>
                                    <div className="bg-[#050d18] p-3 border border-[#1e3a5a]">
                                        <div className="text-[0.6rem] text-[#4b6a8a] uppercase mb-1">Rank</div>
                                        <div className="text-xl text-white font-bold">#{selectedVerifier.rank}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm py-2 border-b border-[#1e3a5a]/50">
                                        <span className="text-[#8b9bb4]">Total Ratings</span>
                                        <span className="text-white font-mono">{selectedVerifier.ratings}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-[#1e3a5a]/50">
                                        <span className="text-[#8b9bb4]">Staked Amount</span>
                                        <span className="text-white font-mono">{selectedVerifier.stake} AVL</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-[#1e3a5a]/50">
                                        <span className="text-[#8b9bb4]">Network Status</span>
                                        <span className="text-[#00d4ff] font-mono">ONLINE</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
