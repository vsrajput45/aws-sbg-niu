-- =========================================================================
-- AWS Student Builder Group at Noida International University
-- Supabase Cloud Persistence Schema (Single-click setup)
-- =========================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor:

CREATE TABLE IF NOT EXISTS public.app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Allow public read access (visitors can view site settings and events)
DROP POLICY IF EXISTS "Public read app_state" ON public.app_state;
CREATE POLICY "Public read app_state" ON public.app_state
  FOR SELECT USING (true);

-- Allow full access for serverless API routes
DROP POLICY IF EXISTS "Service role full access app_state" ON public.app_state;
CREATE POLICY "Service role full access app_state" ON public.app_state
  FOR ALL USING (true) WITH CHECK (true);
