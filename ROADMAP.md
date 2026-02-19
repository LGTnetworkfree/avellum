# Avellum Technical Roadmap

> **Decentralized Trust Layer for AI Agents in the A2A Economy**

---

## Current State

Avellum is a functional prototype with core rating infrastructure in place. The system enables token-weighted trust scores for AI agents across multiple registries (x402scan, MCP, A2A).

### What's Working
- Token-weighted voting system (AVLM/SOL)
- On-chain memo verification for ratings
- Agent discovery with search and filtering
- Verifier dashboard with rating history
- Supabase backend with proper RLS
- Rate limiting and input validation
- Anchor smart contract (devnet)

### What's Missing
- Live registry integrations (using mock data)
- Mainnet smart contract deployment
- Revenue distribution mechanism
- Production monitoring and scaling

---

## Roadmap Phases

### Phase 0: Security Hardening
**Status: Complete**

| Task | Status |
|------|--------|
| Input validation library | Done |
| Rate limiting (per-IP, per-endpoint) | Done |
| Production logger (no debug in prod) | Done |
| Supabase RLS enabled | Done |
| Remove debug console.logs | Done |
| Fix server client security | Done |
| Add tx_signature replay protection | Done |
| Testing infrastructure (Vitest) | Done |

---

### Phase 1: Registry Integrations
**Status: Not Started**
**Priority: Critical**

Connect to real agent registries to populate the database with actual AI agents.

| Task | Description | Complexity |
|------|-------------|------------|
| x402scan API integration | Fetch x402-enabled payment agents | Medium |
| MCP Registry integration | Index Model Context Protocol servers | Medium |
| A2A Registry integration | Connect to Agent-to-Agent protocol registry | Medium |
| Periodic sync job | Cron-based agent indexing (hourly/daily) | Low |
| Registry health monitoring | Alert on failed syncs | Low |
| Agent metadata normalization | Standardize data across registries | Medium |

**Dependencies:** Registry API documentation and access credentials

**Deliverables:**
- `/lib/registries/x402scan.ts` - x402scan client
- `/lib/registries/mcp.ts` - MCP registry client
- `/lib/registries/a2a.ts` - A2A registry client
- `/scripts/sync-agents.ts` - Sync script for cron
- Update `/lib/indexer.ts` to use real integrations

---

### Phase 2: Mainnet Deployment
**Status: Not Started**
**Priority: Critical**

Deploy the Anchor smart contract to Solana mainnet-beta.

| Task | Description | Complexity |
|------|-------------|------------|
| Security audit | Review Anchor program for vulnerabilities | High |
| Mainnet deployment script | Automated deployment with verification | Medium |
| Program upgrade authority | Set up multisig for upgrades | Medium |
| Emergency pause mechanism | Add circuit breaker for critical issues | Medium |
| Mainnet program ID update | Update frontend config | Low |
| Devnet/Mainnet environment switching | Clean environment separation | Low |

**Dependencies:** Security audit completion, SOL for deployment

**Deliverables:**
- Audited Anchor program
- Mainnet program ID
- Deployment documentation
- Upgrade governance process

---

### Phase 3: Revenue Distribution
**Status: Not Started**
**Priority: High**

Implement the economic model where 100% of protocol fees go to verifiers.

| Task | Description | Complexity |
|------|-------------|------------|
| Fee collection tracking | Aggregate `api_usage` into periods | Low |
| Distribution calculation | Pro-rata based on rating contribution | Medium |
| Payout mechanism | Transfer fees to verifier wallets | High |
| Distribution dashboard | Show pending/claimed rewards | Medium |
| Period management | Weekly/monthly distribution cycles | Low |
| Revenue analytics | Track protocol revenue over time | Low |

**Database Changes:**
```sql
-- Add to verifiers
ALTER TABLE verifiers ADD COLUMN pending_revenue DECIMAL DEFAULT 0;
ALTER TABLE verifiers ADD COLUMN last_claim_at TIMESTAMP;

-- Distribution tracking
ALTER TABLE revenue_distributions ADD COLUMN distributed_at TIMESTAMP;
ALTER TABLE revenue_distributions ADD COLUMN tx_signature TEXT;
```

**Deliverables:**
- `/app/api/revenue/distribute/route.ts` - Distribution endpoint
- `/app/api/revenue/claim/route.ts` - Claim endpoint
- Distribution calculation function
- Dashboard UI for revenue tracking

---

### Phase 4: Scaling Infrastructure
**Status: Not Started**
**Priority: Medium**

Prepare for production traffic and growth.

| Task | Description | Complexity |
|------|-------------|------------|
| Redis rate limiting | Distributed rate limiting for multi-instance | Medium |
| Agent caching (Redis/Vercel KV) | Cache frequently accessed agents | Medium |
| CDN optimization | Edge caching for public endpoints | Low |
| Database connection pooling | Supabase connection optimization | Low |
| Error monitoring (Sentry) | Track and alert on errors | Low |
| Performance monitoring | Track API latency and throughput | Low |
| Load testing | Verify system handles target load | Medium |

**Target Metrics:**
- API latency: p95 < 200ms
- Uptime: 99.9%
- Concurrent users: 1,000+

**Deliverables:**
- Redis integration for rate limiting
- Caching layer implementation
- Monitoring dashboard
- Load test results and optimization report

---

### Phase 5: Enhanced Features
**Status: Not Started**
**Priority: Medium**

Improve user experience and add advanced functionality.

| Task | Description | Complexity |
|------|-------------|------------|
| Real-time updates | WebSocket for live score changes | Medium |
| Agent comparison | Side-by-side agent comparison view | Low |
| Rating history charts | Visualize score trends over time | Low |
| Notification system | Alert verifiers on distribution events | Medium |
| API documentation (OpenAPI) | Auto-generated API docs | Low |
| Public API keys | Rate-limited access for third parties | Medium |
| Webhook support | Notify external systems on events | Medium |

**Deliverables:**
- WebSocket server for real-time updates
- Enhanced dashboard with charts
- OpenAPI spec at `/api/docs`
- Developer portal for API access

---

### Phase 6: Governance & Ecosystem
**Status: Future**
**Priority: Low**

Decentralize protocol governance and expand ecosystem.

| Task | Description | Complexity |
|------|-------------|------------|
| Governance proposals | On-chain voting for protocol changes | High |
| Multi-sig treasury | Community-controlled protocol funds | Medium |
| Agent verification badges | Verified/trusted agent tiers | Medium |
| Partner integrations | SDK for third-party platforms | High |
| Mobile app | Native iOS/Android experience | High |
| Multi-chain support | Expand beyond Solana | Very High |

---

## Technical Debt

Items to address as capacity allows:

| Item | File(s) | Priority |
|------|---------|----------|
| Fix ESLint warnings | Various components | Low |
| Remove mock agent data | `app/api/agents/route.ts` | After Phase 1 |
| Add E2E tests (Playwright) | New | Medium |
| Improve error messages | All API routes | Low |
| Accessibility audit | All components | Medium |
| Documentation site | `/docs` page | Low |

---

## Architecture Decisions

### Current Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes, Supabase |
| Database | PostgreSQL (Supabase) |
| Blockchain | Solana, Anchor Framework |
| Auth | Solana Wallet Adapter |
| Hosting | Vercel |

### Planned Additions
| Component | Technology | Phase |
|-----------|------------|-------|
| Caching | Vercel KV or Redis | Phase 4 |
| Rate Limiting | Redis | Phase 4 |
| Monitoring | Sentry, Vercel Analytics | Phase 4 |
| Real-time | WebSockets or Supabase Realtime | Phase 5 |

---

## Success Metrics

### Phase 1-2 (Foundation)
- [ ] 100+ real agents indexed from registries
- [ ] Smart contract deployed to mainnet
- [ ] Zero security vulnerabilities (audit passed)

### Phase 3-4 (Growth)
- [ ] $X in fees distributed to verifiers
- [ ] 1,000+ ratings submitted
- [ ] 99.9% API uptime
- [ ] p95 latency < 200ms

### Phase 5-6 (Scale)
- [ ] 10,000+ monthly active users
- [ ] 3+ partner integrations
- [ ] Active governance participation

---

## Timeline Estimates

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Registry Integrations | 2-3 weeks | Registry API access |
| Phase 2: Mainnet Deployment | 2-4 weeks | Security audit |
| Phase 3: Revenue Distribution | 2-3 weeks | Mainnet deployment |
| Phase 4: Scaling | 1-2 weeks | Production traffic |
| Phase 5: Enhanced Features | 3-4 weeks | Core stability |
| Phase 6: Governance | 4-8 weeks | Community growth |

**Total estimated timeline: 3-6 months to full production**

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

---

*Last updated: February 2026*
