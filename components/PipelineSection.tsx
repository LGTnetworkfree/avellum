'use client';

import { motion } from 'framer-motion';

export default function PipelineSection() {
    const steps = [
        {
            id: '01',
            title: 'INDEX',
            description: 'Automatic ingestion from x402scan, MCP Registry, and A2A Registry.',
            align: 'justify-start',
        },
        {
            id: '02',
            title: 'VERIFY',
            description: 'Wallet connection required. Token holdings determine voting weight.',
            align: 'justify-center', // Slightly offset
        },
        {
            id: '03',
            title: 'RATE',
            description: 'Submit 0-100 trust scores. Immutable on-chain verification.',
            align: 'justify-center',
        },
        {
            id: '04',
            title: 'EARN',
            description: '100% of API fees distributed to active verifiers.',
            align: 'justify-end',
        },
    ];

    return (
        <section id="how-it-works" className="py-32 bg-[#0a1628] border-b border-[#1e3a5a] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 terminal-grid opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-end justify-between mb-24 border-b border-[#1e3a5a] pb-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-serif tracking-tight">
                        SYSTEM_ARCHITECTURE
                    </h2>
                    <div className="text-[#00d4ff] font-mono text-sm hidden sm:block">
            // v2.1.0_PIPELINE
                    </div>
                </div>

                <div className="relative">
                    {/* Connecting Lines (Desktop Only) */}
                    <div className="absolute inset-0 hidden md:block pointer-events-none">
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            {/* Path 1 -> 2 */}
                            <motion.path
                                d="M 20% 120 Q 50% 120 50% 250"
                                fill="none"
                                stroke="#1e3a5a"
                                strokeWidth="2"
                            />
                            <motion.path
                                d="M 20% 120 Q 50% 120 50% 250"
                                fill="none"
                                stroke="#00d4ff"
                                strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />

                            {/* Path 2 -> 3 */}
                            <motion.path
                                d="M 50% 320 Q 50% 450 80% 450" // Adjusted for zig zag
                                fill="none"
                                stroke="#1e3a5a"
                                strokeWidth="2"
                            />
                            <motion.path
                                d="M 50% 320 Q 50% 450 80% 450"
                                fill="none"
                                stroke="#00d4ff"
                                strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, delay: 1.0 }}
                            />

                            {/* Connector Pulses */}
                            <circle r="4" fill="#00d4ff" className="animate-pulse">
                                <animateMotion
                                    dur="3s"
                                    repeatCount="indefinite"
                                    path="M 20% 120 Q 50% 120 50% 250"
                                />
                            </circle>
                            <circle r="4" fill="#00d4ff" className="animate-pulse">
                                <animateMotion
                                    dur="3s"
                                    begin="1.5s"
                                    repeatCount="indefinite"
                                    path="M 50% 320 Q 50% 450 80% 450"
                                />
                            </circle>

                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-0 relative">
                        {/* Step 1: Top Left */}
                        <motion.div
                            className="md:col-span-4 md:col-start-1 relative"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <PipelineCard step={steps[0]} />
                        </motion.div>

                        {/* Step 2: Middle Center-Left */}
                        <motion.div
                            className="md:col-span-4 md:col-start-4 md:mt-32 relative"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <PipelineCard step={steps[1]} />
                        </motion.div>

                        {/* Step 3: Middle Center-Right */}
                        <motion.div
                            className="md:col-span-4 md:col-start-6 md:mt-64 relative"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <PipelineCard step={steps[2]} />
                        </motion.div>

                        {/* Step 4: Bottom Right */}
                        <motion.div
                            className="md:col-span-4 md:col-start-9 md:mt-96 relative"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <PipelineCard step={steps[3]} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PipelineCard({ step }: { step: any }) {
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-[#00d4ff] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-lg" />
            <div className="relative p-8 bg-[#0a1628]/80 backdrop-blur-md border border-[#1e3a5a] group-hover:border-[#00d4ff] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                <div className="flex items-center justify-between mb-6 border-b border-[#1e3a5a] group-hover:border-[#00d4ff]/30 pb-4 transition-colors">
                    <div className="text-[#4b6a8a] font-mono text-xs group-hover:text-[#00d4ff] tracking-widest">
                        :: NODE_{step.id}
                    </div>
                    <div className="w-2 h-2 bg-[#1e3a5a] group-hover:bg-[#00d4ff] transition-colors rounded-full animate-pulse" />
                </div>

                <h3 className="text-3xl font-bold text-white mb-4 font-serif tracking-wide group-hover:text-[#00d4ff] transition-colors">
                    {step.title}
                </h3>

                <p className="text-[#4b6a8a] font-mono text-sm leading-relaxed group-hover:text-[#a0c0e0] transition-colors">
                    &gt; {step.description}
                </p>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}
