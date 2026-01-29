'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import NeuralNoise from '@/components/NeuralNoise';
import MetricBar from '@/components/MetricBar';
import StampGrid from '@/components/StampGrid';

export default function HomePage() {
  const { connected } = useWallet();

  const metrics = [
    { label: 'Agent Indexing', sub: 'x402, MCP, A2A Registries', value: '0.04s', perc: 98, status: 'NOMINAL', color: 'text-[#00d4ff]' },
    { label: 'Trust Scoring', sub: 'Token-weighted ratings', value: '1.20s', perc: 85, status: 'ACTIVE', color: 'text-[#4b6a8a]' },
    { label: 'Verifier Network', sub: 'Decentralized verification', value: '0.89s', perc: 92, status: 'STABLE', color: 'text-[#00d4ff]' },
    { label: 'API Access', sub: 'Public trust score queries', value: 'INSTANT', perc: 100, status: 'READY', color: 'text-[#4b6a8a]' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

      {/* Hero Section - Split Grid */}
      <section className="grid grid-cols-1 md:grid-cols-[60%_40%] min-h-[60vh] border-b border-[#1e3a5a]">
        <div className="p-8 md:p-16 flex flex-col justify-between relative order-2 md:order-1">
          <div>
            <div className="grid grid-cols-[100px_1fr] gap-4 mb-2 text-[0.7rem] font-mono">
              <span className="text-[#00d4ff] tracking-widest">PROTOCOL</span>
              <span className="text-white tracking-widest">TRUST VERIFICATION</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4 mb-12 text-[0.7rem] font-mono">
              <span className="text-[#00d4ff] tracking-widest">NETWORK</span>
              <span className="text-white tracking-widest">SOLANA MAINNET</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif text-white leading-[0.9] tracking-tight mb-8">
              TRUST AUTONOMY<br />
              FOR THE A2A<br />
              <span className="italic text-[#00d4ff]">ECONOMY.</span>
            </h1>
          </div>

          <div className="mt-8">
            <p className="max-w-md text-[#4b6a8a] font-mono text-sm leading-relaxed mb-8">
              Eliminate human error variance. Avellum ingests agent performance data and outputs immutable trust scores with 99.99% accuracy.
            </p>
            <Link href="/agents">
              <button className="bg-transparent border border-[#00d4ff] text-[#00d4ff] px-8 py-4 font-mono text-sm uppercase tracking-widest hover:bg-[#00d4ff] hover:text-[#0a1628] hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all duration-200 cursor-pointer">
                EXPLORE AGENTS
              </button>
            </Link>
          </div>
        </div>

        {/* Visual Container - Noise */}
        <div className="relative border-l border-[#1e3a5a] bg-[#050d18] order-1 md:order-2 h-[300px] md:h-auto overflow-hidden">
          <div className="absolute top-4 left-4 text-[#00d4ff] text-[0.6rem] font-mono z-10 pointer-events-none space-y-1">
            <div>X: 42.9001</div>
            <div>Y: 88.1023</div>
            <div>STAT: SYNCED</div>
          </div>
          <NeuralNoise />
        </div>
      </section >

      {/* System Metrics Header */}
      < div className="border-b border-[#1e3a5a] p-2 bg-[#0d1e33] text-[#00d4ff] text-[0.7rem] uppercase font-mono tracking-widest" >
        System Metrics & Capabilities // Medical Grade Computation
      </div >

      {/* Metrics Table */}
      < div className="border-b border-[#1e3a5a]" >
        {/* Header Row */}
        < div className="grid grid-cols-[1.5fr_1.5fr_1fr] md:grid-cols-[2fr_1fr_1fr] border-b border-[#1e3a5a] text-xs md:text-sm bg-[#0d1e33] text-[#00d4ff] font-serif italic" >
          <div className="p-3 border-r border-[#1e3a5a]">MODULE TYPE</div>
          <div className="p-3 border-r border-[#1e3a5a]">EFFICIENCY</div>
          <div className="p-3">LOAD</div>
        </div >

        {/* Data Rows */}
        {
          metrics.map((m, i) => (
            <MetricBar
              key={i}
              label={m.label}
              subLabel={m.sub}
              value={m.value}
              percentage={m.perc}
              status={m.status}
              statusColor={m.color}
              delay={i * 200}
            />
          ))
        }
      </div >

      {/* Manifesto */}
      < div className="p-16 border-b border-[#1e3a5a]" >
        <h2 className="font-serif text-2xl md:text-3xl leading-relaxed max-w-3xl text-[#4b6a8a]">
          <span className="text-white">TRUST IS THE FOUNDATION.</span><br />
          In the A2A economy, agents transact billions without human oversight. We built Avellum to verify which agents deserve your trust.
        </h2>
      </div >

      {/* Certifications / Stamps */}
      < StampGrid />

      {/* CTA Footer */}
      < div className="p-16 flex flex-col md:flex-row justify-between items-end gap-8" >
        <div>
          <h2 className="font-serif text-3xl text-[#00d4ff] mb-4">READY TO VERIFY?</h2>
          <p className="text-[#4b6a8a] font-mono text-sm max-w-xs">
            Start rating agents and earning revenue.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-transparent border border-[#4b6a8a] text-[#4b6a8a] px-8 py-4 font-mono text-sm uppercase tracking-widest hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all duration-200">
            VIEW API DOCS
          </button>
          <button className="bg-transparent border border-[#00d4ff] text-[#00d4ff] px-8 py-4 font-mono text-sm uppercase tracking-widest hover:bg-[#00d4ff] hover:text-[#0a1628] hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all duration-200 cursor-pointer">
            CONNECT WALLET
          </button>
        </div>
      </div >

      {/* Footer Ref */}
      < div className="border-t border-[#1e3a5a] p-4 flex justify-between text-[0.6rem] font-mono text-[#4b6a8a] tracking-widest" >
        <div>REF: IMG_STEEL_BLUE_SYS_01</div>
        <div>©2026 AVELLUM SYSTEMS INC.</div>
      </div >

    </div >
  );
}
