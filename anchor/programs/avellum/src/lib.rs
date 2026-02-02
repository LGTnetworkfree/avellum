use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("9qc5m8Q1WvQgF2Z1ohXPQVGfC5pRxU92ZajEvGTpwyw7");

#[program]
pub mod avellum {
    use super::*;

    /// Initialize the protocol state. Called once by the admin.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.protocol_state;
        state.authority = ctx.accounts.authority.key();
        state.total_agents = 0;
        state.total_ratings = 0;
        state.bump = ctx.bumps.protocol_state;
        Ok(())
    }

    /// Register a new AI agent on-chain.
    pub fn register_agent(ctx: Context<RegisterAgent>, address: Pubkey) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        agent.address = address;
        agent.trust_score = 0;
        agent.total_weight = 0;
        agent.rating_count = 0;
        agent.confidence = 0;
        agent.bump = ctx.bumps.agent;

        let state = &mut ctx.accounts.protocol_state;
        state.total_agents = state.total_agents.checked_add(1).unwrap();

        Ok(())
    }

    /// Create a new verifier account and stake SOL.
    /// Called once per wallet — use stake_add() for subsequent deposits.
    pub fn stake_init(ctx: Context<StakeInit>, amount: u64) -> Result<()> {
        require!(amount > 0, AvellumError::InvalidStakeAmount);

        // Transfer SOL to verifier PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.verifier.to_account_info(),
                },
            ),
            amount,
        )?;

        let verifier = &mut ctx.accounts.verifier;
        verifier.authority = ctx.accounts.authority.key();
        verifier.staked_amount = amount;
        verifier.bump = ctx.bumps.verifier;

        Ok(())
    }

    /// Add SOL to an existing verifier account.
    pub fn stake_add(ctx: Context<StakeAdd>, amount: u64) -> Result<()> {
        require!(amount > 0, AvellumError::InvalidStakeAmount);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.verifier.to_account_info(),
                },
            ),
            amount,
        )?;

        let verifier = &mut ctx.accounts.verifier;
        verifier.staked_amount = verifier.staked_amount.checked_add(amount).unwrap();

        Ok(())
    }

    /// Rate an AI agent. The trust score is a weighted average where
    /// weight = verifier's staked amount.
    pub fn rate_agent(ctx: Context<RateAgent>, score: u8) -> Result<()> {
        require!(score <= 100, AvellumError::InvalidScore);

        let verifier = &ctx.accounts.verifier;
        require!(verifier.staked_amount > 0, AvellumError::NoStake);

        let agent = &mut ctx.accounts.agent;

        // Weighted trust score using u128 to prevent overflow
        let new_total_weight = (agent.total_weight as u128)
            .checked_add(verifier.staked_amount as u128)
            .unwrap();

        let weighted_sum = (agent.trust_score as u128)
            .checked_mul(agent.total_weight as u128)
            .unwrap()
            .checked_add(
                (score as u128)
                    .checked_mul(verifier.staked_amount as u128)
                    .unwrap(),
            )
            .unwrap();

        agent.trust_score = (weighted_sum / new_total_weight) as u64;
        agent.total_weight = new_total_weight as u64;
        agent.rating_count = agent.rating_count.checked_add(1).unwrap();

        // Update confidence level
        agent.confidence = if agent.rating_count > 20 {
            2
        } else if agent.rating_count >= 5 {
            1
        } else {
            0
        };

        // Save the individual rating
        let rating = &mut ctx.accounts.rating;
        rating.authority = ctx.accounts.authority.key();
        rating.agent = agent.key();
        rating.score = score;
        rating.staked_weight = verifier.staked_amount;
        rating.timestamp = Clock::get()?.unix_timestamp;
        rating.bump = ctx.bumps.rating;

        // Update protocol totals
        let state = &mut ctx.accounts.protocol_state;
        state.total_ratings = state.total_ratings.checked_add(1).unwrap();

        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProtocolState::INIT_SPACE,
        seeds = [b"protocol"],
        bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(address: Pubkey)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Agent::INIT_SPACE,
        seeds = [b"agent", address.as_ref()],
        bump
    )]
    pub agent: Account<'info, Agent>,

    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeInit<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Verifier::INIT_SPACE,
        seeds = [b"verifier", authority.key().as_ref()],
        bump
    )]
    pub verifier: Account<'info, Verifier>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeAdd<'info> {
    #[account(
        mut,
        seeds = [b"verifier", authority.key().as_ref()],
        bump = verifier.bump
    )]
    pub verifier: Account<'info, Verifier>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RateAgent<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Rating::INIT_SPACE,
        seeds = [b"rating", authority.key().as_ref(), agent.key().as_ref()],
        bump
    )]
    pub rating: Account<'info, Rating>,

    #[account(
        mut,
        seeds = [b"agent", agent.address.as_ref()],
        bump = agent.bump
    )]
    pub agent: Account<'info, Agent>,

    #[account(
        seeds = [b"verifier", authority.key().as_ref()],
        bump = verifier.bump
    )]
    pub verifier: Account<'info, Verifier>,

    #[account(
        mut,
        seeds = [b"protocol"],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct ProtocolState {
    pub authority: Pubkey,    // 32
    pub total_agents: u32,    // 4
    pub total_ratings: u64,   // 8
    pub bump: u8,             // 1
}

#[account]
#[derive(InitSpace)]
pub struct Agent {
    pub address: Pubkey,      // 32
    pub trust_score: u64,     // 8
    pub total_weight: u64,    // 8
    pub rating_count: u32,    // 4
    pub confidence: u8,       // 1
    pub bump: u8,             // 1
}

#[account]
#[derive(InitSpace)]
pub struct Verifier {
    pub authority: Pubkey,    // 32
    pub staked_amount: u64,   // 8
    pub bump: u8,             // 1
}

#[account]
#[derive(InitSpace)]
pub struct Rating {
    pub authority: Pubkey,    // 32
    pub agent: Pubkey,        // 32
    pub score: u8,            // 1
    pub staked_weight: u64,   // 8
    pub timestamp: i64,       // 8
    pub bump: u8,             // 1
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum AvellumError {
    #[msg("Score must be between 0 and 100")]
    InvalidScore,
    #[msg("Stake amount must be greater than 0")]
    InvalidStakeAmount,
    #[msg("Verifier must stake before rating")]
    NoStake,
}
