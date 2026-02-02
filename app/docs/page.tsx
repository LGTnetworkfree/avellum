'use client';

import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import TerminalCode from '@/components/TerminalCode';
import { FadeIn, ScaleIn, StaggerItem, HeroSection, HeroTitle, HeroParagraph, HeroLabel } from '@/components/ScrollAnimations';

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
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
        <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

            {/* ========== HEADER ========== */}
            <section className="grid grid-cols-1 md:grid-cols-[45%_55%] border-b border-[#1e3a5a]">
                <ScaleIn className="hidden md:flex border-r border-[#1e3a5a] overflow-hidden">
                    <TerminalCode />
                </ScaleIn>
                <HeroSection className="px-8 md:px-12 pt-12 pb-8">
                    <HeroTitle
                        lines={['Protocol']}
                        accent="documentation."
                        className="font-sans text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4"
                    />
                    <HeroParagraph delay={0.75} className="text-body text-[#a0a0a0] max-w-lg mb-8">
                        Technical overview of the Avellum trust layer, verifier economics, and API reference.
                    </HeroParagraph>

                    <HeroLabel index={0} baseDelay={1.15} className="grid grid-cols-[100px_1fr] gap-4 mb-2 label-terminal">
                        <span>MODULE</span>
                        <span className="text-white">DOCUMENTATION</span>
                    </HeroLabel>
                    <HeroLabel index={1} baseDelay={1.15} className="grid grid-cols-[100px_1fr] gap-4 label-terminal">
                        <span>VERSION</span>
                        <span className="text-white">V2.0</span>
                    </HeroLabel>
                </HeroSection>
            </section>

            {/* ========== SIDEBAR + CONTENT ========== */}
            <div className="flex relative">

                {/* Sidebar Navigation */}
                <div className="hidden lg:block w-64 shrink-0 border-r border-[rgba(0,229,255,0.1)]">
                    <div className="sticky top-[100px] py-8 pr-4 max-h-[calc(100vh-110px)] overflow-y-auto">
                        <nav className="space-y-0.5 pl-6" style={{ background: 'rgba(0, 229, 255, 0.02)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '0', padding: '0.75rem 0' }}>
                            {SECTIONS.map((section, i) => (
                                <StaggerItem key={section.id} index={i}>
                                    <button
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-4 py-2.5 font-sans text-xs font-medium tracking-[0.1em] transition-all duration-200 border-l-2 ${
                                            activeSection === section.id
                                                ? 'border-[#00ffff] text-[#00ffff]'
                                                : 'border-[#1e3a5a]/50 text-[#4b6a8a] hover:text-white hover:border-[#4b6a8a]'
                                        }`}
                                        style={activeSection === section.id ? { background: 'rgba(0, 229, 255, 0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: 'rgba(0, 229, 255, 0.5)' } : undefined}
                                    >
                                        {section.title}
                                    </button>
                                </StaggerItem>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-4 sm:px-8 md:px-12 py-10 max-w-3xl">

                    {/* 1. Executive Summary */}
                    <FadeIn>
                        <section id="executive-summary" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">1. Executive Summary</h2>
                            <div className="border border-[#1e3a5a] bg-[#0d1e33]/40 p-6 relative">
                                <div className="absolute top-0 right-0 p-3 font-sans font-medium text-[0.6rem] tracking-[0.15em] uppercase text-[#2a4a6a]">SYS_DOC_V2</div>
                                <p className="text-[#a0a0a0] leading-relaxed mb-4 font-sans text-sm">
                                    The A2A (Agent-to-Agent) economy is growing rapidly, with AI agents transacting billions
                                    without human oversight. However, there&apos;s no standardized way to verify which agents are
                                    trustworthy before interacting.
                                </p>
                                <p className="text-[#a0a0a0] leading-relaxed font-sans text-sm">
                                    <strong className="text-[#00d4ff]">Avellum</strong> solves this by providing a decentralized
                                    trust layer that indexes agents across x402, MCP, and A2A protocols, allowing token-weighted
                                    verification to establish a definitive &ldquo;Trust Score&rdquo; for every autonomous actor on the network.
                                </p>
                            </div>
                        </section>
                    </FadeIn>

                    {/* 2. The Problem */}
                    <FadeIn>
                        <section id="the-problem" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">2. The Problem</h2>
                            <div className="space-y-4">
                                {[
                                    { code: '01', text: 'No unified trust standard for AI agents operating across disparate chains and runtimes.' },
                                    { code: '02', text: 'Agents operate in siloed protocols (x402 vs MCP vs A2A) making reputation fragmented.' },
                                    { code: '03', text: 'No verifiable way to assess reliability before initiating value transfer.' },
                                    { code: '04', text: 'Centralized rating systems create single points of failure and censorship risks.' },
                                ].map((item, i) => (
                                    <StaggerItem key={item.code} index={i}>
                                        <div className="flex items-start gap-4 card-hover p-5">
                                            <span className="font-sans font-medium text-[0.65rem] tracking-[0.15em] uppercase text-[#00d4ff] shrink-0 pt-0.5">ERR_{item.code}</span>
                                            <span className="text-[#4b6a8a] font-sans text-sm leading-relaxed">{item.text}</span>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </div>
                        </section>
                    </FadeIn>

                    {/* 3. How Avellum Works */}
                    <FadeIn>
                        <section id="how-avellum-works" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">3. How Avellum Works</h2>

                            {/* Architecture Diagram */}
                            <div className="bg-[#050d18] border border-[#1e3a5a] p-4 md:p-8 mb-8 font-sans text-xs font-medium overflow-x-auto relative">
                                <div className="absolute inset-0" style={{
                                    backgroundImage:
                                        'linear-gradient(rgba(30,58,90,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,90,0.08) 1px, transparent 1px)',
                                    backgroundSize: '32px 32px'
                                }} />
                                <div className="absolute inset-0" style={{
                                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.06) 0%, rgba(0, 212, 255, 0.02) 40%, transparent 70%)'
                                }} />
                                <div className="flex flex-col items-center gap-6 md:gap-8 relative z-[1]">
                                    <div className="flex flex-wrap justify-center gap-3 md:gap-0 md:justify-between w-full max-w-md">
                                        <div className="border border-[#1e3a5a] p-2 md:p-3 text-center w-20 md:w-24 text-[#4b6a8a]">x402<br />Protocol</div>
                                        <div className="border border-[#1e3a5a] p-2 md:p-3 text-center w-20 md:w-24 text-[#4b6a8a]">MCP<br />Registry</div>
                                        <div className="border border-[#1e3a5a] p-2 md:p-3 text-center w-20 md:w-24 text-[#4b6a8a]">A2A<br />Protocol</div>
                                    </div>

                                    <div className="w-full max-w-xs md:max-w-md h-8 border-b-2 border-dotted border-[#1e3a5a] relative">
                                        <div className="absolute bottom-[-17px] left-1/2 -translate-x-1/2 bg-[#050d18] px-2 text-[#4b6a8a]">INGESTION</div>
                                        <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1e3a5a]"></div>
                                    </div>

                                    <div className="border border-[#00ffff]/40 p-3 md:p-4 text-center w-40 md:w-48 bg-[#00ffff]/5">
                                        <div className="font-medium text-white mb-1 text-[0.65rem] md:text-xs">AVELLUM INDEXER</div>
                                        <div className="text-[#00d4ff] text-[0.6rem] md:text-xs">Normalization</div>
                                    </div>

                                    <div className="w-0 h-6 md:h-8 border-l border-[#1e3a5a]"></div>

                                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full">
                                        <div className="border border-[#1e3a5a] bg-[#0d1e33]/40 p-2 md:p-3 text-center w-20 md:w-24 text-[#4b6a8a]">Verifier A</div>
                                        <div className="border border-[#00ffff]/40 bg-[#00ffff]/5 p-2 md:p-3 text-center w-20 md:w-24 text-white">Verifier B</div>
                                        <div className="border border-[#1e3a5a] bg-[#0d1e33]/40 p-2 md:p-3 text-center w-20 md:w-24 text-[#4b6a8a]">Verifier C</div>
                                    </div>

                                    <div className="w-0 h-6 md:h-8 border-l border-[#1e3a5a]"></div>

                                    <div className="border border-[#1e3a5a] p-3 md:p-4 text-center w-full max-w-[200px] md:max-w-xs bg-[#0d1e33]/40">
                                        <div className="font-medium text-white">TRUST SCORE API</div>
                                        <div className="text-[#00ffff]">Public Access</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[#a0a0a0] mb-4 font-sans text-sm leading-relaxed">
                                Avellum operates as a multi-protocol indexer. It listens to events on major agent standards (x402, MCP, A2A),
                                normalizes the identity data, and passes it to a decentralized network of Verifiers.
                                Verifiers stake $AVLM tokens to rate agents based on performance, uptime, and security audits.
                            </p>
                        </section>
                    </FadeIn>

                    {/* 4. Trust Score Algorithm */}
                    <FadeIn>
                        <section id="trust-score" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">4. Trust Score Algorithm</h2>
                            <div className="bg-[#050d18] p-6 border-l-2 border-[#00ffff] mb-6">
                                <code className="text-[#00ffff] block mb-2 text-lg font-sans font-medium">trust_score = &Sigma;(rating &times; token_weight) / &Sigma;(token_weight)</code>
                                <p className="text-sm text-[#4b6a8a] font-sans font-medium">
                                    // Weighted average based on verifier stake
                                </p>
                            </div>
                            <p className="text-[#a0a0a0] leading-relaxed mb-4 font-sans text-sm">
                                The trust score is not a simple average. It is stake-weighted. A verifier with 100,000 $AVLM tokens
                                has 10x the voting power of a verifier with 10,000 tokens. This Sybil-resistance mechanism ensures
                                that those with the most to lose have the most say in the network&apos;s reputation layer.
                            </p>
                        </section>
                    </FadeIn>

                    {/* 5. Verifier Economics */}
                    <FadeIn>
                        <section id="verifier-economics" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">5. Verifier Economics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-sm font-medium mb-6">
                                <div className="card-hover p-5">
                                    <span className="label-terminal !text-[#4b6a8a] block mb-2">Revenue Model</span>
                                    <p className="font-sans text-xl font-bold text-white">100% to Verifiers</p>
                                </div>
                                <div className="card-hover p-5">
                                    <span className="label-terminal !text-[#4b6a8a] block mb-2">Distribution</span>
                                    <p className="font-sans text-xl font-bold text-white">Proportional to Activity</p>
                                </div>
                            </div>
                            <p className="text-[#a0a0a0] font-sans text-sm leading-relaxed">
                                The Avellum protocol takes 0% fees. All revenue generated from API keys (consumed by developers
                                querying trust scores) is distributed directly to the Verifier pool. Active verifiers who
                                consistently rate new agents earn the highest yield.
                            </p>
                        </section>
                    </FadeIn>

                    {/* 6. API Reference */}
                    <FadeIn>
                        <section id="api-reference" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">6. API Reference</h2>
                            <div className="border border-[#1e3a5a] mb-4 overflow-hidden">
                                <div className="bg-[#0d1e33]/60 px-5 py-3 flex items-center gap-3 border-b border-[#1e3a5a]/50">
                                    <span className="border border-[#00ffff]/40 text-[#00ffff] font-sans font-medium text-[0.6rem] tracking-[0.15em] uppercase px-2.5 py-1">GET</span>
                                    <code className="text-white text-sm font-sans font-medium">/api/score/[agent_address]</code>
                                </div>
                                <div className="p-5 bg-[#050d18]">
                                    <pre className="font-sans text-sm font-medium text-[#a0a0a0] overflow-x-auto">
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
                    </FadeIn>

                    {/* 7. Supported Protocols */}
                    <FadeIn>
                        <section id="supported-protocols" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">7. Supported Protocols</h2>
                            <div className="space-y-3">
                                {[
                                    { name: 'x402 Protocol', desc: 'Payment-enabled autonomous agents standard.', badge: 'x402' },
                                    { name: 'MCP Registry', desc: 'Anthropic\'s Model Context Protocol.', badge: 'MCP' },
                                    { name: 'A2A Standard', desc: 'Google\'s Agent-to-Agent communication layer.', badge: 'A2A' },
                                ].map((proto, i) => (
                                    <StaggerItem key={proto.name} index={i}>
                                        <div className="card-hover p-5 flex justify-between items-center gap-4">
                                            <div>
                                                <h3 className="font-sans text-white text-base font-semibold mb-1">{proto.name}</h3>
                                                <p className="text-[#4b6a8a] font-sans text-sm">{proto.desc}</p>
                                            </div>
                                            <span className="border border-[#1e3a5a] text-[#00d4ff] font-sans text-sm font-medium tracking-[0.15em] px-4 py-2 shrink-0">
                                                {proto.badge}
                                            </span>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </div>
                        </section>
                    </FadeIn>

                    {/* 8. Token Utility */}
                    <FadeIn>
                        <section id="token-utility" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">8. Token Utility</h2>
                            <p className="text-[#a0a0a0] leading-relaxed mb-6 font-sans text-sm">
                                $AVLM is the native utility token of the network. It is used for:
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Verification Weight', desc: 'More tokens = higher influence on trust scores.' },
                                    { label: 'Stake-to-Earn', desc: 'Staked tokens earn a share of API protocol revenue.' },
                                    { label: 'Governance', desc: 'Voting on protocol upgrades and new registry integrations.' },
                                ].map((item, i) => (
                                    <StaggerItem key={item.label} index={i}>
                                        <div className="flex items-start gap-4 card-hover p-5">
                                            <span className="font-sans text-lg font-bold text-[#1e3a5a] shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                            <div>
                                                <h4 className="text-white font-sans text-base font-semibold mb-1">{item.label}</h4>
                                                <p className="text-[#4b6a8a] font-sans text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </div>
                        </section>
                    </FadeIn>

                    {/* 9. FAQ */}
                    <FadeIn>
                        <section id="faq" className="mb-16 scroll-mt-[100px]">
                            <h2 className="font-sans text-2xl md:text-3xl font-bold text-white leading-snug mb-6">9. FAQ</h2>
                            <div className="space-y-0 border border-[#1e3a5a] divide-y divide-[#1e3a5a]/50">
                                {[
                                    { q: 'How fast do trust scores update?', a: 'Scores are updated in near real-time (every ~5 minutes) as new verifier signatures are aggregated on-chain.' },
                                    { q: 'Can bad actors game the system?', a: 'Slashing conditions exist. If a verifier approves a malicious agent that is later proven fraudulent, a portion of their staked $AVLM is slashed.' },
                                    { q: 'Is there a developer API/SDK?', a: 'Yes, check the API Reference section above or visit our GitHub for the Node.js and Python SDKs.' },
                                ].map((item) => (
                                    <div key={item.q} className="p-5">
                                        <h3 className="text-white font-sans text-base font-semibold mb-2">{item.q}</h3>
                                        <p className="text-[#4b6a8a] font-sans text-sm leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </FadeIn>

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
