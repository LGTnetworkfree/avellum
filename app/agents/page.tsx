'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import AgentCard from '@/components/AgentCard';
import type { Agent } from '@/lib/supabase';

type Registry = 'all' | 'x402scan' | 'mcp' | 'a2a';

export default function AgentsPage() {
    const { connected } = useWallet();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState<Registry>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchAgents() {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filter !== 'all') params.set('registry', filter);
                params.set('limit', '50');

                const response = await fetch(`/api/agents?${params}`);
                const data = await response.json();
                setAgents(data.agents || []);
                setTotal(data.total || 0);
            } catch (error) {
                console.error('Error fetching agents:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAgents();
    }, [filter]);

    const filteredAgents = agents.filter(agent =>
        searchQuery === '' ||
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const registryFilters: { value: Registry; label: string; color: string }[] = [
        { value: 'all', label: 'All Registries', color: 'from-gray-700 to-gray-800' },
        { value: 'x402scan', label: 'x402scan', color: 'from-blue-600 to-cyan-600' },
        { value: 'mcp', label: 'MCP Registry', color: 'from-blue-800 to-indigo-900' },
        { value: 'a2a', label: 'A2A Registry', color: 'from-cyan-700 to-blue-800' }
    ];

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">AI Agents</h1>
                    <p className="text-gray-400 text-lg">
                        Browse and rate AI agents from multiple registries.
                        {!connected && <span className="text-[#00d4ff] text-glow"> Connect your wallet to submit ratings.</span>}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search agents by name, address, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#050d18] border border-[#1e3a5a] text-white placeholder-[#4b6a8a] focus:outline-none focus:border-[#00d4ff] font-mono text-sm transition-colors rounded-none"
                        />
                    </div>

                    {/* Registry filter */}
                    <div className="flex gap-2 flex-wrap">
                        {registryFilters.map((reg) => (
                            <button
                                key={reg.value}
                                onClick={() => setFilter(reg.value)}
                                className={`px-4 py-3 text-sm font-mono tracking-wide uppercase transition-all duration-300 rounded-none ${filter === reg.value
                                    ? `bg-gradient-to-r ${reg.color} text-white border border-transparent`
                                    : 'bg-[#050d18] border border-[#1e3a5a] text-[#4b6a8a] hover:text-[#00d4ff] hover:border-[#00d4ff]'
                                    }`}
                            >
                                {reg.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <div className="mb-6 text-gray-400">
                    Showing {filteredAgents.length} of {total} agents
                </div>

                {/* Agents grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse bg-gray-800/50 rounded-2xl h-64" />
                        ))}
                    </div>
                ) : filteredAgents.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map((agent) => (
                            <AgentCard key={agent.id} agent={agent} showRating={true} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-white mb-2">No agents found</h3>
                        <p className="text-gray-400">
                            {searchQuery
                                ? 'Try adjusting your search or filters'
                                : 'No agents have been indexed yet. Run the database schema to seed mock data.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
