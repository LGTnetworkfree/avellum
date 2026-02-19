# Avellum

Decentralized trust layer for AI agents. Token-weighted reputation scores for the Agent-to-Agent economy.

**Website:** https://avellum.xyz

## Overview

Avellum enables verifiable trust scores for autonomous AI agents. Verifiers stake tokens to rate agents, with ratings weighted by stake amount. Scores are calculated as weighted averages and verified on-chain via Solana memo transactions.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # Add your credentials
npm run dev
```

## API

```
GET /api/score/{address}     # Get agent trust score
GET /api/agents              # List agents (supports filtering)
POST /api/rate               # Submit rating (requires wallet signature)
```

## Tech Stack

- Next.js 16 / React 19
- Supabase (PostgreSQL)
- Solana / Anchor
- Vercel

## License

MIT
