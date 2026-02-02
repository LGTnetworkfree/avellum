'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import AgentCard from '@/components/AgentCard';
import GridField from '@/components/GridField';
import FlowField from '@/components/FlowField';
import Footer from '@/components/Footer';
import { FadeIn, ScaleIn, StaggerItem, CountUp, HeroSection, HeroTitle, HeroParagraph, HeroLabel } from '@/components/ScrollAnimations';
import type { Agent } from '@/lib/supabase';

type Registry = 'all' | 'x402scan' | 'mcp' | 'a2a';

const registryFilters: { value: Registry; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'x402scan', label: 'x402' },
    { value: 'mcp', label: 'MCP' },
    { value: 'a2a', label: 'A2A' }
];

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

    const registryCounts = {
        x402scan: agents.filter(a => a.registry === 'x402scan').length,
        mcp: agents.filter(a => a.registry === 'mcp').length,
        a2a: agents.filter(a => a.registry === 'a2a').length,
    };

    return (
        <>
        <div className="noise-texture min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-l border-r border-[#1e3a5a] relative z-10 bg-[#0a1628]">

            {/* ========== HEADER ========== */}
            <section className="grid grid-cols-1 md:grid-cols-[45%_55%] border-b border-[#1e3a5a]">
                <ScaleIn className="hidden md:flex items-center justify-center relative border-r border-[#1e3a5a] bg-[#050d18] overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0" style={{
                        backgroundImage:
                            'linear-gradient(rgba(30,58,90,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,90,0.08) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                    {/* Radial glow */}
                    <div className="absolute inset-0" style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.08) 0%, rgba(0, 212, 255, 0.02) 40%, transparent 70%)'
                    }} />
                    {/* Flow field animation */}
                    <FlowField />
                    {/* Edge fades */}
                    <div className="absolute inset-y-0 left-0 w-16 z-[2] pointer-events-none" style={{ background: 'linear-gradient(to right, #050d18, transparent)' }} />
                    <div className="absolute inset-y-0 right-0 w-16 z-[2] pointer-events-none" style={{ background: 'linear-gradient(to left, #050d18, transparent)' }} />
                </ScaleIn>
                <HeroSection className="px-8 md:px-12 pt-12 pb-8">
                    <HeroTitle
                        lines={['Discover verified']}
                        accent="agents."
                        className="font-serif text-4xl md:text-5xl font-normal text-white leading-[1.1] mb-4"
                    />
                    <HeroParagraph delay={0.9} className="text-body text-[#a0a0a0] max-w-lg mb-8">
                        Browse, search, and rate AI agents indexed from x402, MCP, and A2A registries.
                        {!connected && <span className="text-[#00d4ff]"> Connect your wallet to submit ratings.</span>}
                    </HeroParagraph>

                    <HeroLabel index={0} baseDelay={1.3} className="grid grid-cols-[100px_1fr] gap-4 mb-2 label-terminal">
                        <span>MODULE</span>
                        <span className="text-white">AGENT EXPLORER</span>
                    </HeroLabel>
                    <HeroLabel index={1} baseDelay={1.3} className="grid grid-cols-[100px_1fr] gap-4 label-terminal">
                        <span>STATUS</span>
                        <span className="text-white">{isLoading ? 'SYNCING' : 'LIVE'}</span>
                    </HeroLabel>
                </HeroSection>
            </section>

            {/* ========== STATS STRIP ========== */}
            <FadeIn>
                <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#1e3a5a]">
                    {[
                        { label: 'Total Agents', value: total, accent: '#00ffff' },
                        { label: 'x402', value: registryCounts.x402scan, accent: '#00d4ff' },
                        { label: 'MCP', value: registryCounts.mcp, accent: '#00d4ff' },
                        { label: 'A2A', value: registryCounts.a2a, accent: '#00d4ff' },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`glass-panel relative px-6 md:px-8 py-6 group hover:bg-[rgba(0,229,255,0.06)] transition-colors duration-300 ${
                                i < 3 ? 'border-r' : ''
                            } ${i >= 2 ? 'border-t md:border-t-0' : ''}`}
                        >
                            <div
                                className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `linear-gradient(90deg, ${stat.accent}, transparent)` }}
                            />
                            <span className="label-terminal !text-[#4b6a8a] block mb-2">{stat.label}</span>
                            <div className="flex items-end gap-3">
                                <p className="font-serif text-3xl text-white group-hover:text-[#00ffff] transition-colors duration-300">
                                    <CountUp end={stat.value} />
                                </p>
                                {i > 0 && total > 0 && (
                                    <div className="flex-1 mb-2">
                                        <div className="h-[3px] bg-[#1e3a5a]/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${(stat.value / total) * 100}%`,
                                                    background: `linear-gradient(90deg, ${stat.accent}, transparent)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* ========== SEARCH + FILTERS ========== */}
            <FadeIn>
                <div className="px-8 md:px-12 py-6 border-b border-[#1e3a5a]">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b6a8a]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, address, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-white placeholder-[#2a4a6a] focus:outline-none font-mono text-sm input-glow"
                            />
                        </div>

                        {/* Registry filter tabs */}
                        <div className="flex gap-0">
                            {registryFilters.map((reg) => (
                                <button
                                    key={reg.value}
                                    onClick={() => setFilter(reg.value)}
                                    className={`px-4 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-all duration-300 border ${
                                        filter === reg.value
                                            ? 'bg-[#00ffff]/10 border-[#00ffff]/40 text-[#00ffff]'
                                            : 'bg-[#050d18] border-[#1e3a5a] text-[#4b6a8a] hover:text-[#00d4ff] hover:border-[#00ffff]/30'
                                    } ${reg.value !== 'all' ? '-ml-px' : ''}`}
                                >
                                    {reg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 label-terminal !text-[#2a4a6a]">
                        Showing <span className="mono-data text-[#4b6a8a]">{filteredAgents.length}</span> of <span className="mono-data text-[#4b6a8a]">{total}</span> indexed agents
                    </div>
                </div>
            </FadeIn>

            {/* ========== AGENT GRID ========== */}
            <div className="section-gradient relative">
                <GridField />

                <div className="px-8 md:px-12 py-10 relative z-[1]">
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-[#0d1e33]/40 border border-transparent h-56 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredAgents.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAgents.map((agent, i) => (
                                <StaggerItem key={agent.id} index={i % 6}>
                                    <AgentCard agent={agent} showRating={true} />
                                </StaggerItem>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="font-serif text-2xl text-white mb-3">
                                No agents found.
                            </p>
                            <p className="text-[#4b6a8a] font-sans text-sm max-w-sm mx-auto">
                                {searchQuery
                                    ? 'Try adjusting your search query or registry filter.'
                                    : 'No agents have been indexed yet. Check back once the indexer has synced.'}
                            </p>
                        </div>
                    )}
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
