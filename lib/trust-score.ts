import { supabase, type Agent, type Rating } from './supabase';

/**
 * Calculate trust score for an agent
 * Formula: trust_score = Σ(rating × token_weight) / Σ(token_weight)
 */
export function calculateTrustScore(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const rating of ratings) {
        weightedSum += rating.score * rating.token_weight;
        totalWeight += rating.token_weight;
    }

    if (totalWeight === 0) return 0;

    return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Get trust score for an agent by address
 */
export async function getAgentTrustScore(agentAddress: string): Promise<{
    agent: Agent | null;
    trustScore: number;
    totalRatings: number;
    error?: string;
}> {
    try {
        const { data: agent, error } = await supabase
            .from('agents')
            .select('*')
            .eq('address', agentAddress)
            .single();

        if (error || !agent) {
            return {
                agent: null,
                trustScore: 0,
                totalRatings: 0,
                error: 'Agent not found'
            };
        }

        return {
            agent: agent as Agent,
            trustScore: agent.trust_score,
            totalRatings: agent.total_ratings
        };
    } catch (error) {
        return {
            agent: null,
            trustScore: 0,
            totalRatings: 0,
            error: 'Failed to fetch agent data'
        };
    }
}

/**
 * Submit or update a rating for an agent
 */
export async function submitRating(
    verifierId: string,
    agentId: string,
    score: number,
    tokenWeight: number
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate score
        if (score < 0 || score > 100) {
            return { success: false, error: 'Score must be between 0 and 100' };
        }

        // Upsert the rating (insert or update if exists)
        const { error } = await supabase
            .from('ratings')
            .upsert(
                {
                    verifier_id: verifierId,
                    agent_id: agentId,
                    score,
                    token_weight: tokenWeight,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: 'verifier_id,agent_id'
                }
            );

        if (error) {
            console.error('Rating submission error:', error);
            return { success: false, error: error.message };
        }

        // Update verifier's rating count
        await supabase.rpc('increment_verifier_ratings', { verifier_uuid: verifierId });

        return { success: true };
    } catch (error) {
        console.error('Rating submission error:', error);
        return { success: false, error: 'Failed to submit rating' };
    }
}

/**
 * Get all ratings for an agent
 */
export async function getAgentRatings(agentId: string): Promise<Rating[]> {
    const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching ratings:', error);
        return [];
    }

    return data as Rating[];
}

/**
 * Get rating given by a verifier to an agent
 */
export async function getVerifierRating(
    verifierId: string,
    agentId: string
): Promise<Rating | null> {
    const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('verifier_id', verifierId)
        .eq('agent_id', agentId)
        .single();

    if (error) {
        return null;
    }

    return data as Rating;
}

/**
 * Get trust score color based on score value
 */
export function getTrustScoreColor(score: number): string {
    if (score >= 80) return '#22c55e'; // Green - Excellent
    if (score >= 60) return '#84cc16'; // Lime - Good
    if (score >= 40) return '#eab308'; // Yellow - Average
    if (score >= 20) return '#f97316'; // Orange - Poor
    return '#ef4444'; // Red - Very Poor
}

/**
 * Get trust level label based on score
 */
export function getTrustLevel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Poor';
    return 'Unverified';
}
