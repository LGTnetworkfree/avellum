import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from './logger';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const AVLM_TOKEN_MINT = process.env.NEXT_PUBLIC_AVLM_TOKEN_MINT || 'D6zGvr8zNKgqpcjNr4Hin8ELVuGEcySyRn5ugHcusQh9';
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';

// Get Helius RPC endpoint
function getHeliusRpcUrl(): string {
    if (HELIUS_API_KEY) {
        // Helius uses 'mainnet' and 'devnet', not 'mainnet-beta'
        const heliusNetwork = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet' : SOLANA_NETWORK;
        return `https://${heliusNetwork}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    }
    // Fallback to public RPC
    return `https://api.${SOLANA_NETWORK}.solana.com`;
}

// Create Solana connection
export function getConnection(): Connection {
    return new Connection(getHeliusRpcUrl(), 'confirmed');
}

/**
 * Get $AVLM token balance for a wallet address using Solana RPC.
 * Uses the network-aware connection so it works
 * regardless of which cluster the token was minted on.
 */
export async function getAvellumBalance(walletAddress: string): Promise<number> {
    try {
        const connection = getConnection();
        const owner = new PublicKey(walletAddress);
        const mint = new PublicKey(AVLM_TOKEN_MINT);

        const res = await connection.getParsedTokenAccountsByOwner(owner, { mint });
        const amount = res.value[0]?.account.data.parsed.info.tokenAmount.uiAmount ?? 0;
        return amount;
    } catch (error) {
        logger.debug('Error fetching AVLM balance:', error);
        return 0;
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
        logger.debug('Error fetching SOL balance:', error);
        return 0;
    }
}
