-- Migration: Enable Row Level Security (RLS) on all tables
-- Purpose: Prevent direct database access via anon key while allowing service role access
-- Run this in your Supabase SQL Editor (Project: Avellum)
--
-- IMPORTANT: This migration enables RLS and creates service_role bypass policies.
-- After running this, only requests using the service role key can access data.
-- The anon key will be blocked from all operations.

-- ============================================================================
-- Step 1: Enable RLS on all tables
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_distributions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 2: Create service role bypass policies
-- These allow the backend (using service role key) to perform all operations
-- ============================================================================

-- Agents table
CREATE POLICY "Service role full access" ON agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verifiers table
CREATE POLICY "Service role full access" ON verifiers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Ratings table
CREATE POLICY "Service role full access" ON ratings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- API Usage table
CREATE POLICY "Service role full access" ON api_usage
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Revenue Distributions table
CREATE POLICY "Service role full access" ON revenue_distributions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- Verification queries (run these after the migration to verify)
-- ============================================================================

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist:
-- SELECT tablename, policyname, roles FROM pg_policies WHERE schemaname = 'public';

-- ============================================================================
-- Rollback (if needed)
-- ============================================================================
-- To disable RLS and remove policies, run:
--
-- DROP POLICY IF EXISTS "Service role full access" ON agents;
-- DROP POLICY IF EXISTS "Service role full access" ON verifiers;
-- DROP POLICY IF EXISTS "Service role full access" ON ratings;
-- DROP POLICY IF EXISTS "Service role full access" ON api_usage;
-- DROP POLICY IF EXISTS "Service role full access" ON revenue_distributions;
--
-- ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE verifiers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE api_usage DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE revenue_distributions DISABLE ROW LEVEL SECURITY;
