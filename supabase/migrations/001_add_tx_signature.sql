-- Migration: Add tx_signature column to ratings table
-- Purpose: Enable transaction replay protection
-- Run this in your Supabase SQL Editor (Project: Avellum)

-- Add tx_signature column if it doesn't exist
-- This stores the Solana transaction signature used for the rating
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS tx_signature TEXT UNIQUE;

-- Create index for faster lookups during replay protection checks
CREATE INDEX IF NOT EXISTS idx_ratings_tx_signature ON ratings(tx_signature);

-- Add comment for documentation
COMMENT ON COLUMN ratings.tx_signature IS 'Solana transaction signature used for this rating (replay protection)';
