-- Avellum Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENTS TABLE: Indexed from registries
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  name TEXT,
  description TEXT,
  registry TEXT NOT NULL CHECK (registry IN ('x402scan', 'mcp', 'a2a')),
  metadata JSONB DEFAULT '{}',
  trust_score DECIMAL(5,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  indexed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VERIFIERS TABLE: Wallet holders
-- ============================================
CREATE TABLE IF NOT EXISTS verifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  token_balance BIGINT DEFAULT 0,
  last_balance_check TIMESTAMPTZ,
  total_ratings_given INTEGER DEFAULT 0,
  total_revenue_earned DECIMAL(18,9) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RATINGS TABLE: Verifier -> Agent ratings
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verifier_id UUID REFERENCES verifiers(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  token_weight BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(verifier_id, agent_id)
);

-- ============================================
-- API USAGE TABLE: For revenue tracking
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  agent_address TEXT,
  fee_amount DECIMAL(18,9) DEFAULT 0,
  caller_ip TEXT,
  called_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVENUE DISTRIBUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verifier_id UUID REFERENCES verifiers(id),
  amount DECIMAL(18,9) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agents_address ON agents(address);
CREATE INDEX IF NOT EXISTS idx_agents_registry ON agents(registry);
CREATE INDEX IF NOT EXISTS idx_agents_trust_score ON agents(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_verifiers_wallet ON verifiers(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ratings_agent ON ratings(agent_id);
CREATE INDEX IF NOT EXISTS idx_ratings_verifier ON ratings(verifier_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_called_at ON api_usage(called_at);

-- ============================================
-- FUNCTION: Recalculate trust score for an agent
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_trust_score(agent_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  new_score DECIMAL(5,2);
  total_weight BIGINT;
  weighted_sum DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(score * token_weight), 0),
    COALESCE(SUM(token_weight), 0)
  INTO weighted_sum, total_weight
  FROM ratings
  WHERE agent_id = agent_uuid;
  
  IF total_weight > 0 THEN
    new_score := weighted_sum / total_weight;
  ELSE
    new_score := 0;
  END IF;
  
  UPDATE agents 
  SET 
    trust_score = new_score,
    total_ratings = (SELECT COUNT(*) FROM ratings WHERE agent_id = agent_uuid),
    updated_at = NOW()
  WHERE id = agent_uuid;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-recalculate on rating change
-- ============================================
CREATE OR REPLACE FUNCTION trigger_recalculate_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_trust_score(OLD.agent_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_trust_score(NEW.agent_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_rating_change ON ratings;
CREATE TRIGGER on_rating_change
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_trust_score();

-- ============================================
-- SEED DATA: Mock agents for testing
-- ============================================
INSERT INTO agents (address, name, description, registry, metadata) VALUES
  ('AGT1x402scanAgent123456789abcdef', 'PaymentBot Pro', 'Automated payment processing agent for seamless crypto transactions', 'x402scan', '{"version": "2.1", "capabilities": ["payments", "swaps"]}'),
  ('AGT2x402scanAgent987654321fedcba', 'DataOracle X', 'Real-time data feeds for DeFi protocols', 'x402scan', '{"version": "1.5", "capabilities": ["oracles", "feeds"]}'),
  ('AGT3mcpRegistryAgent111222333aaa', 'CodeAssist AI', 'AI-powered code review and suggestion agent', 'mcp', '{"version": "3.0", "capabilities": ["code-review", "suggestions"]}'),
  ('AGT4mcpRegistryAgent444555666bbb', 'SecurityAudit Bot', 'Smart contract security auditing agent', 'mcp', '{"version": "2.0", "capabilities": ["auditing", "vulnerability-scan"]}'),
  ('AGT5a2aRegistryAgent777888999ccc', 'TradingAgent Alpha', 'Autonomous trading agent with ML strategies', 'a2a', '{"version": "4.0", "capabilities": ["trading", "analysis"]}'),
  ('AGT6a2aRegistryAgentaaabbbcccddd', 'ContentGen Pro', 'Multi-modal content generation agent', 'a2a', '{"version": "1.8", "capabilities": ["text", "images", "video"]}'),
  ('AGT7x402scanAgenteeefffggghhh', 'BridgeBot', 'Cross-chain asset bridging agent', 'x402scan', '{"version": "2.3", "capabilities": ["bridges", "swaps"]}'),
  ('AGT8mcpRegistryAgentiiijjjkkklll', 'DocuSign AI', 'Document verification and signing agent', 'mcp', '{"version": "1.2", "capabilities": ["documents", "verification"]}')
ON CONFLICT (address) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Optional - Enable later)
-- ============================================
-- ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE verifiers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
