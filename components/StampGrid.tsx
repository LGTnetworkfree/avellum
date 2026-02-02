'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StampData {
    id: string;
    line1: string;
    line2: string;
    line3: string;
    fullTitle: string;
    stats: string;
    description: string;
    diagramType: 'x402' | 'mcp' | 'a2a' | 'fees';
}

const stamps: StampData[] = [
    {
        id: 'x402',
        line1: 'x402',
        line2: 'INDEXED',
        line3: '*****',
        fullTitle: 'x402 PAYMENT PROTOCOL',
        stats: '6.1M+ transactions indexed',
        description: 'We index all x402 payment agents in real-time, verifying transaction proofs on Solana.',
        diagramType: 'x402'
    },
    {
        id: 'mcp',
        line1: 'MCP',
        line2: 'VERIFIED',
        line3: 'Auth',
        fullTitle: 'MODEL CONTEXT PROTOCOL',
        stats: '500+ MCP servers tracked',
        description: "Anthropic's Model Context Protocol agents verified for secure context handoffs.",
        diagramType: 'mcp'
    },
    {
        id: 'a2a',
        line1: 'A2A',
        line2: 'READY',
        line3: 'Secure',
        fullTitle: 'AGENT-TO-AGENT STANDARD',
        stats: "Google's agent-to-agent standard supported",
        description: 'Full compatibility with A2A agent ecosystem for autonomous negotiation.',
        diagramType: 'a2a'
    },
    {
        id: 'fees',
        line1: '100%',
        line2: 'TO',
        line3: 'Verifiers',
        fullTitle: 'REVENUE DISTRIBUTION',
        stats: '0% protocol fees',
        description: 'All API revenue is automatically distributed to token-holding verifiers.',
        diagramType: 'fees'
    },
];

export default function StampGrid() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="relative z-10">
            {/* Main Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 border-b border-[#1e3a5a]">
                {stamps.map((stamp) => (
                    <div key={stamp.id} className="flex justify-center relative">
                        <motion.div
                            layoutId={`card-${stamp.id}`}
                            onClick={() => setSelectedId(stamp.id)}
                            whileHover={{ scale: 1.05, rotate: 0, textShadow: "0 0 8px rgb(0, 212, 255)" }}
                            className="group relative w-24 h-24 flex items-center justify-center text-center text-[0.6rem] uppercase font-bold text-[#00d4ff] border border-[#4b6a8a] rounded-full -rotate-12 bg-[#0a1628] hover:border-[#00d4ff] hover:bg-[#142a44] transition-colors duration-300 cursor-pointer z-10"
                        >
                            {/* Inner ring */}
                            <div className="absolute inset-[3px] border border-[#1e3a5a] rounded-full" />

                            <motion.div
                                layoutId={`content-${stamp.id}`}
                                className="z-10 leading-relaxed font-sans font-bold tracking-widest pointer-events-none"
                            >
                                {stamp.line1}<br />
                                {stamp.line2}<br />
                                {stamp.line3}
                            </motion.div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Expanded Modal */}
            <AnimatePresence>
                {selectedId && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Modal Card */}
                        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                            <motion.div
                                layoutId={`card-${selectedId}`}
                                className="w-full max-w-lg bg-[#0a1628] border border-[#00d4ff] overflow-hidden shadow-[0_0_50px_rgba(0,212,255,0.2)] pointer-events-auto relative"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(null);
                                    }}
                                    className="absolute top-4 right-4 text-[#4b6a8a] hover:text-white transition-colors z-20"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Header with Layout Transition */}
                                <div className="p-8 pb-4 border-b border-[#1e3a5a] bg-gradient-to-r from-[#0d1e33] to-[#0a1628]">
                                    <h3 className="text-[#00d4ff] font-sans text-2xl font-bold tracking-wide mb-1">
                                        {stamps.find(s => s.id === selectedId)?.fullTitle}
                                    </h3>
                                    <motion.div
                                        layoutId={`content-${selectedId}`}
                                        className="text-[#4b6a8a] font-sans text-xs font-medium uppercase tracking-widest"
                                    >
                                        STATUS: ACTIVE // VERIFIED
                                    </motion.div>
                                </div>

                                {/* Body Content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-8"
                                >
                                    {/* Mini Diagram */}
                                    <div className="mb-8 p-6 bg-[#050d18] border border-[#1e3a5a] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(30,58,90,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,90,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                        <Diagram type={stamps.find(s => s.id === selectedId)?.diagramType || 'x402'} />
                                    </div>

                                    {/* Stats & Description */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[0.65rem] text-[#4b6a8a] font-sans font-medium uppercase tracking-widest mb-1">LIVE METRICS</div>
                                            <div className="text-xl text-white font-sans font-bold">{stamps.find(s => s.id === selectedId)?.stats}</div>
                                        </div>

                                        <p className="text-[#8b9bb4] leading-relaxed text-sm">
                                            {stamps.find(s => s.id === selectedId)?.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Simple Schematic Diagrams
function Diagram({ type }: { type: string }) {
    if (type === 'x402') {
        return (
            <div className="flex items-center justify-between text-[0.6rem] font-sans font-medium text-[#00d4ff] relative z-10 px-2">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border border-[#4b6a8a] flex items-center justify-center bg-[#0a1628]">x402</div>
                    <span className="text-[#4b6a8a]">SCAN</span>
                </div>
                <div className="h-[1px] flex-1 bg-[#4b6a8a] mx-2 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t border-r border-[#4b6a8a] rotate-45" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-2 border-[#00d4ff] flex items-center justify-center bg-[#0d1e33] shadow-[0_0_15px_rgba(0,212,255,0.2)]">AVELLUM</div>
                    <span className="text-white">INDEXER</span>
                </div>
                <div className="h-[1px] flex-1 bg-[#4b6a8a] mx-2 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t border-r border-[#4b6a8a] rotate-45" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border border-[#4b6a8a] flex items-center justify-center bg-[#0a1628]">DB</div>
                    <span className="text-[#4b6a8a]">LEDGER</span>
                </div>
            </div>
        );
    }

    if (type === 'mcp') {
        return (
            <div className="flex items-center justify-between text-[0.6rem] font-sans font-medium text-[#00d4ff] relative z-10 px-2">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border border-[#4b6a8a] flex items-center justify-center bg-[#0a1628]">MCP</div>
                    <span className="text-[#4b6a8a]">REGISTRY</span>
                </div>
                <div className="h-[1px] flex-1 bg-[#4b6a8a] mx-2 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t border-r border-[#4b6a8a] rotate-45" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-2 border-[#00d4ff] flex items-center justify-center bg-[#0d1e33]">VERIFY</div>
                    <span className="text-white">TRUST SCORE</span>
                </div>
            </div>
        );
    }

    if (type === 'a2a') {
        return (
            <div className="flex items-center justify-center gap-8 text-[0.6rem] font-sans font-medium text-[#00d4ff] relative z-10">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border border-[#4b6a8a] rounded-full flex items-center justify-center bg-[#0a1628]">AG1</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-full h-[1px] bg-[#00d4ff] mb-1 relative w-16">
                        <div className="absolute right-0 -top-1 w-2 h-2 border-t border-r border-[#00d4ff] rotate-45" />
                        <div className="absolute left-0 -top-1 w-2 h-2 border-b border-l border-[#00d4ff] rotate-45" />
                    </div>
                    <span className="text-[0.5rem] text-white bg-[#0a1628] px-1 relative -top-3">A2A PROTOCOL</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border border-[#4b6a8a] rounded-full flex items-center justify-center bg-[#0a1628]">AG2</div>
                </div>
            </div>
        );
    }

    if (type === 'fees') {
        return (
            <div className="flex items-center justify-between text-[0.6rem] font-sans font-medium text-[#00d4ff] relative z-10 px-4">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[#4b6a8a]">API FEES</span>
                    <div className="w-1 h-8 bg-gradient-to-b from-[#4b6a8a] to-[#00d4ff]" />
                </div>
                <div className="flex-1 border-t border-dashed border-[#4b6a8a] mx-4" />
                <div className="flex flex-col items-center gap-2">
                    <span className="text-white">VERIFIERS</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse" />
                        <div className="w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse delay-75" />
                        <div className="w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse delay-150" />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
