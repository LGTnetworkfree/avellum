import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock agents data for when database is not set up
const MOCK_AGENTS = [
    {
        id: '1',
        address: 'AGT1x402scanAgent123456789abcdef',
        name: 'PaymentBot Pro',
        description: 'Automated payment processing agent for seamless crypto transactions',
        registry: 'x402scan',
        metadata: { version: '2.1', capabilities: ['payments', 'swaps'] },
        trust_score: 87.5,
        total_ratings: 24,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        address: 'AGT2x402scanAgent987654321fedcba',
        name: 'DataOracle X',
        description: 'Real-time data feeds for DeFi protocols',
        registry: 'x402scan',
        metadata: { version: '1.5', capabilities: ['oracles', 'feeds'] },
        trust_score: 72.3,
        total_ratings: 18,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        address: 'AGT3mcpRegistryAgent111222333aaa',
        name: 'CodeAssist AI',
        description: 'AI-powered code review and suggestion agent',
        registry: 'mcp',
        metadata: { version: '3.0', capabilities: ['code-review', 'suggestions'] },
        trust_score: 94.2,
        total_ratings: 56,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        address: 'AGT4mcpRegistryAgent444555666bbb',
        name: 'SecurityAudit Bot',
        description: 'Smart contract security auditing agent',
        registry: 'mcp',
        metadata: { version: '2.0', capabilities: ['auditing', 'vulnerability-scan'] },
        trust_score: 89.1,
        total_ratings: 31,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '5',
        address: 'AGT5a2aRegistryAgent777888999ccc',
        name: 'TradingAgent Alpha',
        description: 'Autonomous trading agent with ML strategies',
        registry: 'a2a',
        metadata: { version: '4.0', capabilities: ['trading', 'analysis'] },
        trust_score: 78.6,
        total_ratings: 42,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '6',
        address: 'AGT6a2aRegistryAgentaaabbbcccddd',
        name: 'ContentGen Pro',
        description: 'Multi-modal content generation agent',
        registry: 'a2a',
        metadata: { version: '1.8', capabilities: ['text', 'images', 'video'] },
        trust_score: 65.4,
        total_ratings: 15,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '7',
        address: 'AGT7x402scanAgenteeefffggghhh',
        name: 'BridgeBot',
        description: 'Cross-chain asset bridging agent',
        registry: 'x402scan',
        metadata: { version: '2.3', capabilities: ['bridges', 'swaps'] },
        trust_score: 82.0,
        total_ratings: 27,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '8',
        address: 'AGT8mcpRegistryAgentiiijjjkkklll',
        name: 'DocuSign AI',
        description: 'Document verification and signing agent',
        registry: 'mcp',
        metadata: { version: '1.2', capabilities: ['documents', 'verification'] },
        trust_score: 91.3,
        total_ratings: 38,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

/**
 * GET /api/agents
 * List all indexed agents with optional filters
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const registry = searchParams.get('registry') as 'x402scan' | 'mcp' | 'a2a' | null;
        const minScore = searchParams.get('minScore');
        const maxScore = searchParams.get('maxScore');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Try to fetch from Supabase
        let query = supabase.from('agents').select('*', { count: 'exact' });

        if (registry) {
            query = query.eq('registry', registry);
        }

        if (minScore) {
            query = query.gte('trust_score', parseFloat(minScore));
        }

        if (maxScore) {
            query = query.lte('trust_score', parseFloat(maxScore));
        }

        query = query.order('trust_score', { ascending: false });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        // If database error or no data, use mock data
        if (error || !data || data.length === 0) {
            console.log('Using mock agents data');

            let filteredAgents = [...MOCK_AGENTS];

            if (registry) {
                filteredAgents = filteredAgents.filter(a => a.registry === registry);
            }

            if (minScore) {
                filteredAgents = filteredAgents.filter(a => a.trust_score >= parseFloat(minScore));
            }

            if (maxScore) {
                filteredAgents = filteredAgents.filter(a => a.trust_score <= parseFloat(maxScore));
            }

            // Sort by trust score
            filteredAgents.sort((a, b) => b.trust_score - a.trust_score);

            // Apply pagination
            const paginatedAgents = filteredAgents.slice(offset, offset + limit);

            return NextResponse.json({
                agents: paginatedAgents,
                total: filteredAgents.length,
                limit,
                offset,
                source: 'mock'
            });
        }

        return NextResponse.json({
            agents: data,
            total: count || 0,
            limit,
            offset,
            source: 'database'
        });
    } catch (error) {
        console.error('API error:', error);

        // Return mock data on any error
        return NextResponse.json({
            agents: MOCK_AGENTS,
            total: MOCK_AGENTS.length,
            limit: 20,
            offset: 0,
            source: 'mock'
        });
    }
}
