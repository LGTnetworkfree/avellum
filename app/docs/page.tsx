'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
    { id: 'executive-summary', title: '1. Executive Summary' },
    { id: 'the-problem', title: '2. The Problem' },
    { id: 'how-avellum-works', title: '3. How Avellum Works' },
    { id: 'trust-score', title: '4. Trust Score Algorithm' },
    { id: 'verifier-economics', title: '5. Verifier Economics' },
    { id: 'api-reference', title: '6. API Reference' },
    { id: 'supported-protocols', title: '7. Supported Protocols' },
    { id: 'token-utility', title: '8. Token Utility' },
    { id: 'faq', title: '9. FAQ' },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('executive-summary');

    // Scroll Spy Logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -60% 0px' }
        );

        SECTIONS.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-12">

            {/* Sidebar Navigation */}
            <div className="hidden md:block w-64 shrink-0 relative">
                <div className="fixed top-32 w-64 h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-hide">
                    <h2 className="font-serif text-[#00d4ff] text-xl mb-6 tracking-wide border-b border-[#1e3a5a] pb-2">
                        DOCUMENTATION
                    </h2>
                    <nav className="space-y-1">
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full text-left px-4 py-2 text-sm font-mono transition-all duration-200 border-l-2 ${activeSection === section.id
                                        ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/5'
                                        : 'border-transparent text-[#4b6a8a] hover:text-white hover:border-[#4b6a8a]'
                                    }`}
                            >
                                {section.title}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
                <div className="prose prose-invert prose-lg max-w-none">
                    <h1 className="text-4xl font-serif text-white mb-2">Avellum Architecture</h1>
                    <div className="h-1 w-24 bg-[#00d4ff] mb-8" />

                    {/* 1. Executive Summary */}
                    <section id="executive-summary" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">1. Executive Summary</h2>
                        <div className="border border-[#1e3a5a] bg-[#0a1628] p-6 rounded-none relative">
                            <div className="absolute top-0 right-0 p-2 text-[#4b6a8a] font-mono text-xs">SYS_DOC_V2</div>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                The A2A (Agent-to-Agent) economy is growing rapidly, with AI agents transacting billions
                                without human oversight. However, there's no standardized way to verify which agents are
                                trustworthy before interacting.
                            </p>
                            <p className="text-gray-300 leading-relaxed">
                                <strong className="text-[#00d4ff]">Avellum</strong> solves this by providing a decentralized
                                trust layer that indexes agents across x402, MCP, and A2A protocols, allowing token-weighted
                                verification to establish a definitive "Trust Score" for every autonomous actor on the network.
                            </p>
                        </div>
                    </section>

                    {/* 2. The Problem */}
                    <section id="the-problem" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">2. The Problem</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-mono mt-1">ERROR_01</span>
                                <span className="text-gray-400">No unified trust standard for AI agents operating across disparate chains and runtimes.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-mono mt-1">ERROR_02</span>
                                <span className="text-gray-400">Agents operate in siloed protocols (x402 vs MCP vs A2A) making reputation fragmented.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-mono mt-1">ERROR_03</span>
                                <span className="text-gray-400">No verifiable way to assess reliability before initiating value transfer.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 font-mono mt-1">ERROR_04</span>
                                <span className="text-gray-400">Centralized rating systems create single points of failure and censorship risks.</span>
                            </li>
                        </ul>
                    </section>

                    {/* 3. How Avellum Works */}
                    <section id="how-avellum-works" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-8">3. How Avellum Works</h2>

                        {/* Architecture Diagram */}
                        <div className="bg-[#050d18] border border-[#1e3a5a] p-8 mb-8 font-mono text-xs overflow-x-auto">
                            <div className="min-w-[500px] flex flex-col items-center gap-8">
                                <div className="flex justify-between w-full max-w-md">
                                    <div className="border border-[#4b6a8a] p-3 text-center w-24">x402<br />Protocol</div>
                                    <div className="border border-[#4b6a8a] p-3 text-center w-24">MCP<br />Registry</div>
                                    <div className="border border-[#4b6a8a] p-3 text-center w-24">A2A<br />Protocol</div>
                                </div>

                                <div className="w-full max-w-md h-8 border-b-2 border-dotted border-[#4b6a8a] relative">
                                    <div className="absolute bottom-[-17px] left-1/2 -translate-x-1/2 bg-[#050d18] px-2 text-[#4b6a8a]">INGESTION</div>
                                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#4b6a8a]"></div>
                                </div>

                                <div className="border-2 border-[#00d4ff] p-4 text-center w-48 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                                    <div className="font-bold text-white mb-1">AVELLUM INDEXER</div>
                                    <div className="text-[#00d4ff]">Normalization Component</div>
                                </div>

                                <div className="w-0 h-8 border-l border-[#4b6a8a]"></div>

                                <div className="flex justify-center gap-4 w-full">
                                    <div className="border border-[#1e3a5a] bg-[#0a1628] p-3 text-center w-24 text-gray-500">Verifier A</div>
                                    <div className="border border-[#1e3a5a] bg-[#0a1628] p-3 text-center w-24 text-white ring-1 ring-[#00d4ff]">Verifier B</div>
                                    <div className="border border-[#1e3a5a] bg-[#0a1628] p-3 text-center w-24 text-gray-500">Verifier C</div>
                                </div>

                                <div className="w-0 h-8 border-l border-[#4b6a8a]"></div>

                                <div className="border border-[#4b6a8a] p-4 text-center w-full max-w-xs bg-[#142a44]">
                                    <div className="font-bold text-white">TRUST SCORE API</div>
                                    <div className="text-green-400">Public Access</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-4">
                            Avellum operates as a multi-protocol indexer. It listens to events on major agent standards (x402, MCP, A2A),
                            normalizes the identity data, and passes it to a decentralized network of Verifiers.
                            Verifiers stake $AVELLUM tokens to rate agents based on performance, uptime, and security audits.
                        </p>
                    </section>

                    {/* 4. Trust Score Algorithm */}
                    <section id="trust-score" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">4. Trust Score Algorithm</h2>
                        <div className="bg-[#050d18] p-6 border-l-4 border-[#00d4ff] mb-6">
                            <code className="text-[#00d4ff] block mb-2 text-lg">trust_score = Σ(rating × token_weight) / Σ(token_weight)</code>
                            <p className="text-sm text-gray-400 font-mono">
                                // Weighted average based on verifier stake
                            </p>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            The trust score is not a simple average. It is stake-weighted. A verifier with 100,000 $AVELLUM tokens
                            has 10x the voting power of a verifier with 10,000 tokens. This Sybil-resistance mechanism ensures
                            that those with the most to lose have the most say in the network's reputation layer.
                        </p>
                    </section>

                    {/* 5. Verifier Economics */}
                    <section id="verifier-economics" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">5. Verifier Economics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono mb-6">
                            <div className="p-4 border border-[#1e3a5a] bg-[#0a1628]">
                                <div className="text-[#4b6a8a] mb-1">REVENUE MODEL</div>
                                <div className="text-white">100% to Verifiers</div>
                            </div>
                            <div className="p-4 border border-[#1e3a5a] bg-[#0a1628]">
                                <div className="text-[#4b6a8a] mb-1">DISTRIBUTION</div>
                                <div className="text-white">Proportional to Activity</div>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            The Avellum protocol takes 0% fees. All revenue generated from API keys (consumed by developers
                            querying trust scores) is distributed directly to the Verifier pool. Active verifiers who
                            consistently rate new agents earn the highest yield.
                        </p>
                    </section>

                    {/* 6. API Reference */}
                    <section id="api-reference" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">6. API Reference</h2>
                        <div className="bg-[#0a1628] border border-[#1e3a5a] rounded mb-4">
                            <div className="bg-[#1e3a5a] px-4 py-2 flex items-center gap-2">
                                <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded font-bold">GET</span>
                                <code className="text-white text-sm">/api/score/[agent_address]</code>
                            </div>
                            <div className="p-4">
                                <pre className="font-mono text-sm text-gray-300 overflow-x-auto">
                                    {`{
  "address": "0x7a2...9f1",
  "trust_score": 94.5,
  "confidence": "HIGH",
  "signals": {
    "uptime": "99.9%",
    "avg_latency": "240ms",
    "verified_txns": 14205
  },
  "last_updated": "2024-03-15T10:30:00Z"
}`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* 7. Supported Protocols */}
                    <section id="supported-protocols" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">7. Supported Protocols</h2>
                        <div className="space-y-4">
                            <div className="border border-[#1e3a5a] p-4 flex justify-between items-center group hover:border-[#00d4ff] transition-colors">
                                <div>
                                    <h3 className="text-white font-bold mb-1">x402 Protocol</h3>
                                    <p className="text-sm text-gray-400">Payment-enabled autonomous agents standard.</p>
                                </div>
                                <span className="text-[#00d4ff] font-mono text-xs">INDEXED</span>
                            </div>
                            <div className="border border-[#1e3a5a] p-4 flex justify-between items-center group hover:border-[#00d4ff] transition-colors">
                                <div>
                                    <h3 className="text-white font-bold mb-1">MCP Registry</h3>
                                    <p className="text-sm text-gray-400">Anthropic's Model Context Protocol.</p>
                                </div>
                                <span className="text-[#00d4ff] font-mono text-xs">VERIFIED</span>
                            </div>
                            <div className="border border-[#1e3a5a] p-4 flex justify-between items-center group hover:border-[#00d4ff] transition-colors">
                                <div>
                                    <h3 className="text-white font-bold mb-1">A2A Standard</h3>
                                    <p className="text-sm text-gray-400">Google's Agent-to-Agent communication layer.</p>
                                </div>
                                <span className="text-[#00d4ff] font-mono text-xs">READY</span>
                            </div>
                        </div>
                    </section>

                    {/* 8. Token Utility */}
                    <section id="token-utility" className="mb-16 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">8. Token Utility</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            $AVELLUM is the native utility token of the network. It is used for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400 marker:text-[#00d4ff]">
                            <li><strong>Verification Weight:</strong> More tokens = higher influence on trust scores.</li>
                            <li><strong>Stake-to-Earn:</strong> Staked tokens earn a share of API protocol revenue.</li>
                            <li><strong>Governance:</strong> Voting on protocol upgrades and new registry integrations.</li>
                        </ul>
                    </section>

                    {/* 9. FAQ */}
                    <section id="faq" className="mb-32 scroll-mt-32">
                        <h2 className="text-2xl font-serif text-white mb-4">9. FAQ</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2">How fast do trust scores update?</h3>
                                <p className="text-gray-400">Scores are updated in near real-time (every ~5 minutes) as new verifier signatures are aggregated on-chain.</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-2">Can bad actors game the system?</h3>
                                <p className="text-gray-400">Slashing conditions exist. If a verifier approves a malicious agent that is later proven fraudulent, a portion of their staked $AVELLUM is slashed.</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-2">Is there a developer API/SDK?</h3>
                                <p className="text-gray-400">Yes, check the API Reference section above or visit our GitHub for the Node.js and Python SDKs.</p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
