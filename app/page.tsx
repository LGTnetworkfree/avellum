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
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-purple-300">Live on Solana Mainnet</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">The Trust Layer for</span>
            <br />
            <span className="gradient-text">the A2A Economy</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Avellum provides decentralized trust scores for AI agents.
            Hold $AVELLUM tokens to rate agents, earn revenue from API usage,
            and build a trustworthy AI ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/agents"
              className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              Explore Agents
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl text-lg font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-300"
            >
              How it Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50">
              <div className="text-4xl font-bold text-white mb-1">{stats.totalAgents}</div>
              <div className="text-gray-400">Indexed Agents</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50">
              <div className="text-4xl font-bold text-white mb-1">{stats.totalVerifiers}</div>
              <div className="text-gray-400">Active Verifiers</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50">
              <div className="text-4xl font-bold text-white mb-1">{stats.avgScore}</div>
              <div className="text-gray-400">Avg Trust Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            How Avellum Works
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
            A decentralized system for establishing trust in the AI agent economy
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Index',
                description: 'Agents are automatically indexed from x402scan, MCP Registry, and A2A Registry',
                icon: '🔍'
              },
              {
                step: '02',
                title: 'Verify',
                description: 'Connect your wallet. If you hold $AVELLUM tokens, you become a verifier',
                icon: '🔐'
              },
              {
                step: '03',
                title: 'Rate',
                description: 'Rate agents 0-100. Your rating weight equals your token holdings',
                icon: '⭐'
              },
              {
                step: '04',
                title: 'Earn',
                description: '100% of API fees are distributed to verifiers based on their activity',
                icon: '💰'
              }
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-purple-400 text-sm font-semibold mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-20 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Featured Agents
              </h2>
              <p className="text-gray-400">
                Discover and rate AI agents across multiple registries
              </p>
            </div>
            <Link
              href="/agents"
              className="hidden sm:inline-flex px-6 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-300"
            >
              View All Agents →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-800/50 rounded-2xl h-64" />
              ))}
            </div>
          ) : agents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} showRating={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No agents indexed yet. Run the schema to seed mock data.</p>
              <Link
                href="/agents"
                className="text-purple-400 hover:text-purple-300"
              >
                Go to Agents →
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/agents"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-300"
            >
              View All Agents →
            </Link>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Public Trust Score API
              </h2>
              <p className="text-gray-400 mb-6">
                Integrate Avellum trust scores into your application.
                Query any agent address to get their community-verified trust score.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'RESTful API with JSON responses',
                  'Query by agent address',
                  'Real-time trust scores',
                  '100% of fees go to verifiers'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-gray-400 font-mono">API Example</span>
              </div>
              <pre className="p-6 text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`GET /api/score/{agent_address}

{
  "address": "AGT5a2aRegistry...",
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
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Verifying?
          </h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet, hold $AVELLUM tokens, and start earning by verifying AI agents.
          </p>
          <Link
            href="/agents"
            className="inline-flex px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            Start Rating Agents
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-lg font-bold text-white">Avellum</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Avellum. The trust layer for the A2A economy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
