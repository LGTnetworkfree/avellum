import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock agent data
const MOCK_AGENTS: Record<string, {
    address: string;
    name: string;
    description: string;
    registry: string;
    trust_score: number;
    total_ratings: number;
    indexed_at: string;
    updated_at: string;
}> = {
    'AGT1x402scanAgent123456789abcdef': {
        address: 'AGT1x402scanAgent123456789abcdef',
        name: 'PaymentBot Pro',
        description: 'Automated payment processing agent for seamless crypto transactions',
        registry: 'x402scan',
        trust_score: 87.5,
        total_ratings: 24,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT2x402scanAgent987654321fedcba': {
        address: 'AGT2x402scanAgent987654321fedcba',
        name: 'DataOracle X',
        description: 'Real-time data feeds for DeFi protocols',
        registry: 'x402scan',
        trust_score: 72.3,
        total_ratings: 18,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT3mcpRegistryAgent111222333aaa': {
        address: 'AGT3mcpRegistryAgent111222333aaa',
        name: 'CodeAssist AI',
        description: 'AI-powered code review and suggestion agent',
        registry: 'mcp',
        trust_score: 94.2,
        total_ratings: 56,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT4mcpRegistryAgent444555666bbb': {
        address: 'AGT4mcpRegistryAgent444555666bbb',
        name: 'SecurityAudit Bot',
        description: 'Smart contract security auditing agent',
        registry: 'mcp',
        trust_score: 89.1,
        total_ratings: 31,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT5a2aRegistryAgent777888999ccc': {
        address: 'AGT5a2aRegistryAgent777888999ccc',
        name: 'TradingAgent Alpha',
        description: 'Autonomous trading agent with ML strategies',
        registry: 'a2a',
        trust_score: 78.6,
        total_ratings: 42,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT6a2aRegistryAgentaaabbbcccddd': {
        address: 'AGT6a2aRegistryAgentaaabbbcccddd',
        name: 'ContentGen Pro',
        description: 'Multi-modal content generation agent',
        registry: 'a2a',
        trust_score: 65.4,
        total_ratings: 15,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT7x402scanAgenteeefffggghhh': {
        address: 'AGT7x402scanAgenteeefffggghhh',
        name: 'BridgeBot',
        description: 'Cross-chain asset bridging agent',
        registry: 'x402scan',
        trust_score: 82.0,
        total_ratings: 27,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    'AGT8mcpRegistryAgentiiijjjkkklll': {
        address: 'AGT8mcpRegistryAgentiiijjjkkklll',
        name: 'DocuSign AI',
        description: 'Document verification and signing agent',
        registry: 'mcp',
        trust_score: 91.3,
        total_ratings: 38,
        indexed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
};

interface RouteParams {
    params: Promise<{ address: string }>;
}

/**
 * GET /api/score/[address]
 * Public API endpoint to get trust score for an agent
 */
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { address } = await params;

        if (!address) {
            return NextResponse.json(
                { error: 'Agent address is required' },
                { status: 400 }
            );
        }

        // Try to fetch from Supabase first
        const { data: agent, error } = await supabase
            .from('agents')
            .select('*')
            .eq('address', address)
            .single();

        // If database error or no data, check mock data
        if (error || !agent) {
            const mockAgent = MOCK_AGENTS[address];

            if (mockAgent) {
                return NextResponse.json({
                    ...mockAgent,
                    source: 'mock'
                });
            }

            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }

        // Log API usage for revenue tracking (non-blocking)
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        supabase.from('api_usage').insert({
            endpoint: `/api/score/${address}`,
            agent_address: address,
            fee_amount: 0.001,
            caller_ip: clientIp
        }).then(() => { }, () => { });

        // Return trust score response
        return NextResponse.json({
            address: agent.address,
            name: agent.name,
            description: agent.description,
            registry: agent.registry,
            trust_score: parseFloat(agent.trust_score) || 0,
            total_ratings: agent.total_ratings || 0,
            indexed_at: agent.indexed_at,
            updated_at: agent.updated_at,
            source: 'database'
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
