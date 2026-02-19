<p align="center">
  <img src="public/avellum-banner.svg" alt="Avellum" width="600" />
</p>

<h3 align="center">Decentralized Trust Layer for AI Agents</h3>

<p align="center">
  Token-weighted reputation scores for the Agent-to-Agent economy
</p>

<p align="center">
  <a href="https://avellum.xyz">Website</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api">API</a> •
  <a href="ROADMAP.md">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Solana-1.98-purple?logo=solana" alt="Solana" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## What is Avellum?

Avellum is a **decentralized trust infrastructure** for AI agents operating in the Agent-to-Agent (A2A) economy. As autonomous agents increasingly interact with each other—processing payments, executing tasks, and making decisions—there's a critical need for a reliable way to assess which agents can be trusted.

Avellum solves this by enabling **token-weighted reputation scores**:

- **Verifiers** stake AVLM tokens (or SOL) to rate agents
- **Ratings** are weighted by stake amount (more stake = more influence)
- **Trust scores** are calculated as weighted averages across all ratings
- **On-chain verification** ensures ratings are tamper-proof

## Features

- **Multi-Registry Support** — Index agents from x402scan, MCP, and A2A registries
- **Token-Weighted Voting** — Sybil-resistant ratings backed by economic stake
- **On-Chain Verification** — Memo-based proof links ratings to Solana transactions
- **Public API** — Query trust scores programmatically for your applications
- **Real-Time Dashboard** — Browse agents, submit ratings, track your contributions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| Blockchain | Solana, Anchor Framework |
| Auth | Solana Wallet Adapter |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/LGTnetworkfree/avellum.git
cd avellum

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Helius credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key (server-side) | Yes |
| `HELIUS_API_KEY` | Helius RPC API key | Yes |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Network (mainnet-beta, devnet) | Yes |

## API

### Get Agent Trust Score

```bash
GET /api/score/{address}
```

**Response:**
```json
{
  "address": "AGT1x402scan...",
  "name": "PaymentBot Pro",
  "trust_score": 87.5,
  "total_ratings": 24,
  "registry": "x402scan"
}
```

### List Agents

```bash
GET /api/agents?registry=mcp&minScore=50&limit=20
```

### Submit Rating

```bash
POST /api/rate
Content-Type: application/json

{
  "walletAddress": "your-wallet-address",
  "agentAddress": "agent-address",
  "score": 85,
  "timestamp": 1708300000000,
  "txSignature": "solana-tx-signature"
}
```

## Project Structure

```
avellum/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── agents/            # Agent pages
│   └── dashboard/         # Verifier dashboard
├── components/            # React components
├── lib/                   # Utilities & helpers
│   ├── validation.ts      # Input validation
│   ├── rate-limit.ts      # Rate limiting
│   └── supabase.ts        # Database client
├── anchor/                # Solana smart contract
├── supabase/              # Database migrations
└── __tests__/             # Test files
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All API inputs are validated and sanitized
- Rate limiting protects against abuse
- Row-Level Security (RLS) enabled on database
- Service role key never exposed to client

For security concerns, please email [contact@avellum.xyz](mailto:contact@avellum.xyz).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Website](https://avellum.xyz)
- [Documentation](https://avellum.xyz/docs)
- [Twitter](https://x.com/Avellumxyz)

---

<p align="center">
  Built with 🩵 for the Agent-to-Agent economy
</p>
