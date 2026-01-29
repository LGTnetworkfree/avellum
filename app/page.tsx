'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import AgentCard from '@/components/AgentCard';
import type { Agent } from '@/lib/supabase';

export default function HomePage() {
  const { connected } = useWallet();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalAgents: 0, totalVerifiers: 0, avgScore: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/agents?limit=6');
        const data = await response.json();
        setAgents(data.agents || []);
        setStats({
          totalAgents: data.total || 0,
          totalVerifiers: 42, // Mock for now
          avgScore: data.agents?.length ?
            Math.round(data.agents.reduce((sum: number, a: Agent) => sum + a.trust_score, 0) / data.agents.length) : 0
        });
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32 terminal-grid border-b border-[#1e3a5a]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-3 px-3 py-1 border border-[#00d4ff] bg-[#00d4ff]/10 mb-8">
            <span className="w-2 h-2 bg-[#00d4ff] animate-pulse" />
            <span className="text-xs font-mono text-[#00d4ff] tracking-widest uppercase">System Online // Mainnet-Beta</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold mb-6 tracking-tight font-serif text-white">
            THE TRUST LAYER<br />
            <span className="text-[#00d4ff] text-glow">FOR THE A2A ECONOMY</span>
          </h1>

          <p className="text-lg md:text-xl text-[#4b6a8a] max-w-3xl mx-auto mb-12 font-mono leading-relaxed">
            [INITIATING PROTOCOL] Avellum provides decentralized trust scores for AI agents.
            Deploy $AVELLUM tokens to rate agents. Earn revenue. Secure the ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link
              href="/agents"
              className="px-8 py-4 bg-[#00d4ff]/10 border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all duration-300 text-lg font-mono font-bold tracking-widest uppercase"
            >
              [ EXPLORE_AGENTS ]
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-[#4b6a8a] text-[#4b6a8a] hover:border-white hover:text-white transition-all duration-300 text-lg font-mono font-bold tracking-widest uppercase"
            >
              // HOW_IT_WORKS
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-y border-[#1e3a5a] max-w-4xl mx-auto divide-y sm:divide-y-0 sm:divide-x divide-[#1e3a5a] bg-[#0a1628]">
            <div className="p-8">
              <div className="text-4xl font-bold text-white mb-2 font-mono">{stats.totalAgents.toString().padStart(3, '0')}</div>
              <div className="text-[#4b6a8a] text-xs tracking-[0.2em] uppercase">Indexed_Agents</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-white mb-2 font-mono">{stats.totalVerifiers.toString().padStart(3, '0')}</div>
              <div className="text-[#4b6a8a] text-xs tracking-[0.2em] uppercase">Active_Verifiers</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-[#00d4ff] mb-2 font-mono text-glow">{stats.avgScore.toFixed(1)}</div>
              <div className="text-[#4b6a8a] text-xs tracking-[0.2em] uppercase">Avg_Trust_Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 border-b border-[#1e3a5a] bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16 border-b border-[#1e3a5a] pb-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">
              SYSTEM_ARCHITECTURE
            </h2>
            <div className="text-[#00d4ff] font-mono text-sm hidden sm:block">
              // v1.0.4
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'INDEX',
                description: 'Automatic ingestion from x402scan, MCP Registry, and A2A Registry.'
              },
              {
                step: '02',
                title: 'VERIFY',
                description: 'Wallet connection required. Token holdings determine voting weight.'
              },
              {
                step: '03',
                title: 'RATE',
                description: 'Submit 0-100 trust scores. Immutable on-chain verification.'
              },
              {
                step: '04',
                title: 'EARN',
                description: '100% of API fees distributed to active verifiers.'
              }
            ].map((item) => (
              <div key={item.step} className="terminal-border p-6 hover:border-[#00d4ff] transition-colors group h-full">
                <div className="text-[#4b6a8a] font-mono text-xs mb-4 group-hover:text-[#00d4ff]">
                  :: STEP_{item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif tracking-wide">{item.title}</h3>
                <p className="text-[#4b6a8a] font-mono text-sm leading-relaxed border-t border-[#1e3a5a] pt-4 mt-4">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-24 border-b border-[#1e3a5a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 font-serif">
                FEATURED_NODES
              </h2>
              <p className="text-[#4b6a8a] font-mono text-sm">
                &gt; Querying top rated agents from decentralized registries...
              </p>
            </div>
            <Link
              href="/agents"
              className="hidden sm:inline-flex px-6 py-3 border border-[#4b6a8a] text-[#4b6a8a] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all duration-300 font-mono text-sm tracking-widest uppercase"
            >
              [ VIEW_ALL_NODES ]
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#0a1628] border border-[#1e3a5a] h-64 animate-pulse" />
              ))}
            </div>
          ) : agents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} showRating={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-[#1e3a5a]">
              <p className="text-[#4b6a8a] font-mono mb-4">&gt; NO_NODES_FOUND</p>
              <Link
                href="/agents"
                className="text-[#00d4ff] hover:underline font-mono"
              >
                EXECUTE_SEED_SCRIPT
              </Link>
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/agents"
              className="inline-flex px-6 py-3 border border-[#4b6a8a] text-[#4b6a8a] font-mono text-sm"
            >
              [ VIEW_ALL_NODES ]
            </Link>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-24 border-b border-[#1e3a5a] bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-serif">
                PUBLIC TRUST API
              </h2>
              <p className="text-[#4b6a8a] font-mono mb-8 leading-relaxed">
                Integrate Avellum trust scores into your application.
                Query any agent address to get their community-verified trust score.
              </p>
              <ul className="space-y-4 mb-8 font-mono text-sm">
                {[
                  'RESTful endpoints (JSON)',
                  'Query by Agent Address',
                  'Real-time consensus',
                  '100% verifier revenue share'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white">
                    <span className="text-[#00d4ff]">&gt;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="terminal-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e3a5a] bg-[#0f1f38]">
                <span className="text-xs text-[#00d4ff] font-mono">api_example.sh</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#1e3a5a]" />
                  <div className="w-2 h-2 bg-[#1e3a5a]" />
                </div>
              </div>
              <div className="p-6 bg-[#0a1628]">
                <pre className="font-mono text-sm overflow-x-auto text-[#4b6a8a]">
                  <code>
                    <span className="text-[#00d4ff]">GET</span> /api/score/{`{agent_address}`}
                    <br /><br />
                    {`{
  "address": "AGT5a2a...",
  "name": "TradingAgent Alpha",
  "registry": "a2a",
  "trust_score": 85.5,
  "total_ratings": 42,
  "updated_at": "2025-01-28T..."
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 terminal-grid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
            BEGIN VERIFICATION
          </h2>
          <p className="text-[#4b6a8a] font-mono mb-10 max-w-2xl mx-auto">
            Connect your wallet. Acquire $AVELLUM. Secure the network.
          </p>
          <Link
            href="/agents"
            className="inline-flex px-12 py-5 bg-[#00d4ff] text-[#0a1628] font-bold font-mono text-lg hover:bg-white transition-all duration-300 tracking-widest uppercase border border-[#00d4ff] hover:border-white shadow-[0_0_20px_#00d4ff] hover:shadow-[0_0_30px_white]"
          >
            [ START_RATING ]
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1e3a5a] bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#4b6a8a] flex items-center justify-center">
                <span className="text-[#4b6a8a] font-serif font-bold">A</span>
              </div>
              <span className="text-lg font-bold text-[#4b6a8a] font-serif tracking-widest">AVELLUM</span>
            </div>
            <p className="text-[#1e3a5a] text-xs font-mono uppercase tracking-widest">
              © 2025 Avellum_Protocol // System_Secure
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
