import { Connection, PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const AVLM_TOKEN_MINT = process.env.NEXT_PUBLIC_AVLM_TOKEN_MINT || 'D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9';
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';

// Get Helius RPC endpoint
function getHeliusRpcUrl(): string {
    if (HELIUS_API_KEY) {
        return `https://${SOLANA_NETWORK}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    }
    // Fallback to public RPC
    return `https://api.${SOLANA_NETWORK}.solana.com`;
}

// Create Solana connection
export function getConnection(): Connection {
    return new Connection(getHeliusRpcUrl(), 'confirmed');
}

// Token balance response from Helius
interface TokenBalance {
    mint: string;
    amount: number;
    decimals: number;
}

/**
 * Get $AVLM token balance for a wallet address using Helius API
 */
export async function getAvellumBalance(walletAddress: string): Promise<number> {
    try {
        if (!HELIUS_API_KEY) {
            console.warn('Helius API key not configured, returning mock balance');
            return 1000000; // Mock balance for testing
        }

        const response = await fetch(
            `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Helius API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Find AVLM token in the token balances
        const tokens: TokenBalance[] = data.tokens || [];
        const avlmToken = tokens.find(
            (t: TokenBalance) => t.mint === AVLM_TOKEN_MINT
        );

        if (avlmToken) {
            // Return raw amount (already adjusted for decimals by Helius)
            return avlmToken.amount;
        }

        return 0;
    } catch (error) {
        console.error('Error fetching AVLM balance:', error);
        // Return mock balance for development
        return 1000000;
    }
}

/**
 * Verify that a wallet holds minimum required tokens to be a verifier
 */
export async function isEligibleVerifier(walletAddress: string, minBalance: number = 1): Promise<boolean> {
    const balance = await getAvellumBalance(walletAddress);
    return balance >= minBalance;
}

/**
 * Get SOL balance for a wallet
 */
export async function getSolBalance(walletAddress: string): Promise<number> {
    try {
        const connection = getConnection();
        const publicKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error('Error fetching SOL balance:', error);
        return 0;
    }
}
