'use client';

import Link from 'next/link';
import OrbitalNetwork from '@/components/OrbitalNetwork';
import GridField from '@/components/GridField';
import DataFlowLines from '@/components/DataFlowLines';
import Footer from '@/components/Footer';
import ConnectWallet from '@/components/ConnectWallet';
import { FadeIn, ScaleIn, StaggerItem, HeroSection, HeroTitle, HeroParagraph, HeroLabel } from '@/components/ScrollAnimations';

export default function HomePage() {
  return (
    <>
    <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

      {/* ========== 1. HERO ========== */}
      <section className="grid grid-cols-1 md:grid-cols-[60%_40%] min-h-[60vh] border-b border-[#1e3a5a]">
        <HeroSection className="p-8 md:p-16 flex flex-col justify-between relative order-2 md:order-1">
          <div>
            <HeroTitle
              lines={['Trust autonomy', 'for the A2A']}
              accent="economy."
              className="h1-terminal hero"
            />

            <HeroParagraph delay={1.35} className="text-body mb-8 text-[#a0a0a0]">
              Avellum is the trust layer for autonomous agent-to-agent interactions,
              providing the infrastructure for verifiable, secure, and decentralized
              intelligence on Solana and beyond.
            </HeroParagraph>

            <HeroLabel index={0} baseDelay={1.75} className="grid grid-cols-[100px_1fr] gap-4 mb-2 label-terminal">
              <span>PROTOCOL</span>
              <span className="text-white">TRUST VERIFICATION</span>
            </HeroLabel>
            <HeroLabel index={1} baseDelay={1.75} className="grid grid-cols-[100px_1fr] gap-4 mb-8 label-terminal">
              <span>NETWORK</span>
              <span className="text-white">SOLANA MAINNET</span>
            </HeroLabel>
          </div>

          <HeroLabel index={0} baseDelay={2.05}>
            <Link href="/agents">
              <button className="btn-interactive border border-[#1e3a5a] text-[#4b6a8a] px-6 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase hover:border-[#00ffff]/40 hover:text-[#00ffff] hover:bg-[#00ffff]/5 cursor-pointer">
                Explore Agents
              </button>
            </Link>
          </HeroLabel>
        </HeroSection>

        <ScaleIn className="relative border-l border-[#1e3a5a] bg-[#050d18] order-1 md:order-2 h-[300px] md:h-auto overflow-hidden">
          <div className="absolute top-4 left-4 text-[#00d4ff] text-[0.6rem] font-mono z-10 pointer-events-none space-y-1">
            <div>PROTOCOL: ACTIVE</div>
            <div>STAT: SYNCED</div>
          </div>
          <OrbitalNetwork />
        </ScaleIn>
      </section>

      {/* ========== 2. PROTOCOL SUPPORT ========== */}
      <FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] border-b border-[#1e3a5a]">
          {/* Left — Supported Protocols */}
          <div className="px-8 md:px-12 py-8">
            <span className="label-terminal !text-[#4b6a8a] block mb-4">Indexing Agents From</span>
            <div className="flex items-center gap-3">
              <span className="border border-[#1e3a5a] text-[#00d4ff] font-mono text-sm tracking-[0.15em] px-4 py-2 hover:bg-[#00ffff]/5 hover:border-[#00ffff]/40 transition-all duration-300">x402</span>
              <span className="border border-[#1e3a5a] text-[#00d4ff] font-mono text-sm tracking-[0.15em] px-4 py-2 hover:bg-[#00ffff]/5 hover:border-[#00ffff]/40 transition-all duration-300">MCP</span>
              <span className="border border-[#1e3a5a] text-[#00d4ff] font-mono text-sm tracking-[0.15em] px-4 py-2 hover:bg-[#00ffff]/5 hover:border-[#00ffff]/40 transition-all duration-300">A2A</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-[#1e3a5a]" />

          {/* Right — Revenue Model */}
          <div className="px-8 md:px-12 py-8 border-t md:border-t-0 border-[#1e3a5a]">
            <span className="label-terminal !text-[#4b6a8a] block mb-4">Verifier Revenue</span>
            <p className="font-serif text-2xl text-white leading-snug">
              100% <span className="text-[#4b6a8a] text-2xl">of protocol fees go to verifiers.</span>
            </p>
          </div>
        </div>
      </FadeIn>

      {/* ========== 3. THE PROBLEM ========== */}
      <div className="section-gradient relative">
        <GridField />
        <FadeIn className="px-8 md:px-12 pt-12 pb-8 relative z-[1]">
          <span className="label-terminal text-[#00ffff] block mb-3">THE PROBLEM</span>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-white leading-snug">
            AI agents are powerful. <span className="italic text-[#4b6a8a]">But who do you trust?</span>
          </h2>
        </FadeIn>

        <div className="px-8 md:px-12 pb-12 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-[1]">
          {[
            { num: '01', stat: '87%', text: 'AI agent success rate exploiting vulnerabilities autonomously' },
            { num: '02', stat: '$8.80', text: 'Average cost of a successful AI-powered attack' },
            { num: '03', stat: '5 min', text: 'Frequency of deepfake attacks detected in 2024' },
          ].map((card, i) => (
            <StaggerItem key={card.num} index={i}>
              <div className="card-hover p-6 group cursor-default h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="label-terminal !text-[#4b6a8a] group-hover:!text-[#00ffff] transition-colors duration-300">{card.num}</span>
                  <span className="w-8 h-px bg-[#1e3a5a] group-hover:bg-[#00ffff] group-hover:w-12 transition-all duration-300" />
                </div>
                <p className="font-serif text-5xl text-white mb-4 group-hover:text-[#00ffff] transition-colors duration-300">{card.stat}</p>
                <p className="text-[#4b6a8a] font-sans text-sm leading-relaxed group-hover:text-[#a0a0a0] transition-colors duration-300">
                  {card.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>

      {/* ========== 4. MANIFESTO BRIDGE ========== */}
      <div className="gradient-separator" />
      <FadeIn className="px-8 md:px-12 py-14 text-center relative">
        <DataFlowLines />
        <p className="font-serif text-3xl md:text-4xl font-normal text-white leading-snug max-w-3xl mx-auto relative z-[1]">
          Trust is the foundation.{' '}
          <span className="text-[#4b6a8a]">We built Avellum to verify which agents deserve yours.</span>
        </p>
      </FadeIn>
      <div className="gradient-separator" />

      {/* ========== 5. HOW IT WORKS ========== */}
      <div className="section-gradient relative">
        <GridField />
        <FadeIn className="px-8 md:px-12 pt-12 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative z-[1]" delay={0}>
          <div id="solution-heading" style={{ scrollMarginTop: '100px' }}>
            <span className="label-terminal text-[#00ffff] block mb-3">THE SOLUTION</span>
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-white leading-snug">
              Four steps to verifiable trust.
            </h2>
          </div>
          <span className="label-terminal !text-[#4b6a8a] shrink-0">Protocol v1.0</span>
        </FadeIn>

        <div className="px-8 md:px-12 pb-12 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[1]">
          {[
            { id: 'step-index', num: '01', title: 'Index', desc: 'Discover and catalog AI agents from x402, MCP, and A2A registries into a unified on-chain directory.' },
            { id: 'step-verify', num: '02', title: 'Verify', desc: 'Decentralized verifiers stake tokens to audit agent behavior, capabilities, and safety through structured challenges.' },
            { id: 'step-score', num: '03', title: 'Score', desc: 'Token-weighted trust scores are computed from verifier consensus. Verifiers earn protocol revenue for accurate ratings.' },
            { id: 'step-query', num: '04', title: 'Query', desc: 'Any app or agent can query trust scores via a public API before interacting — instant, permissionless, on-chain.' },
          ].map((step, i) => (
            <StaggerItem key={step.id} index={i}>
              <div id={step.id} className="card-hover p-8 group cursor-default scroll-mt-[130px] h-full">
                <div className="flex items-center gap-4 mb-5">
                  <span className="font-serif text-3xl text-[#1e3a5a] group-hover:text-[#00ffff] transition-colors duration-300">{step.num}</span>
                  <span className="h-px flex-1 bg-[#1e3a5a] group-hover:bg-[#00ffff]/30 transition-colors duration-300" />
                </div>
                <h3 className="font-sans text-white text-base font-semibold uppercase tracking-wider mb-2 group-hover:text-[#00ffff] transition-colors duration-300">{step.title}</h3>
                <p className="text-[#4b6a8a] font-sans text-sm leading-relaxed group-hover:text-[#a0a0a0] transition-colors duration-300">
                  {step.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>

      {/* ========== 6. CTA ========== */}
      <div className="gradient-separator" />
      <FadeIn className="px-8 md:px-12 py-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <span className="label-terminal !text-[#4b6a8a] block mb-3">GET STARTED</span>
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-white mb-2">Ready to verify?</h2>
          <p className="text-body text-[#a0a0a0] max-w-sm">
            Start rating agents and earning revenue.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/docs">
            <button className="btn-interactive border border-[#1e3a5a] text-[#4b6a8a] px-6 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase hover:border-[#00ffff]/40 hover:text-[#00ffff] hover:bg-[#00ffff]/5 cursor-pointer">
              View Docs
            </button>
          </Link>
          <ConnectWallet showBalance={false} />
        </div>
      </FadeIn>

    </div>

    {/* ========== 7. FOOTER TRANSITION ========== */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-16 bg-gradient-to-b from-[#0a1628] to-[#00ffff]/10" />
    </div>
    <Footer />
    </>
  );
}
