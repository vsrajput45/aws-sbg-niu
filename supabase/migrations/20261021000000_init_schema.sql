-- Supabase / PostgreSQL Schema Migration for AWS SBG at Noida International University
-- Version 3.0.0

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles table (admin allowlist linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')) DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description_md TEXT NOT NULL,
  banner_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Workshop',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  event_date TEXT NOT NULL, -- Format: YYYY-MM-DD
  start_time TEXT NOT NULL, -- e.g. "10:00 AM"
  end_time TEXT NOT NULL,   -- e.g. "04:00 PM"
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  mode TEXT NOT NULL CHECK (mode IN ('offline', 'online', 'hybrid')),
  venue_name TEXT,
  venue_address TEXT,
  maps_url TEXT,
  join_link TEXT, -- PRIVATE: Shown only to confirmed registrants
  platform TEXT,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('site', 'meetup', 'both')) DEFAULT 'site',
  meetup_event_url TEXT,
  capacity INTEGER, -- NULL = unlimited
  waitlist_enabled BOOLEAN NOT NULL DEFAULT true,
  registration_opens_at TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  registration_manual_state TEXT NOT NULL CHECK (registration_manual_state IN ('auto', 'open', 'closed')) DEFAULT 'auto',
  fee_type TEXT NOT NULL CHECK (fee_type IN ('free', 'paid')) DEFAULT 'free',
  fee_note TEXT,
  payment_link TEXT,
  prerequisites TEXT,
  what_to_bring TEXT,
  certificate BOOLEAN NOT NULL DEFAULT true,
  contact_email TEXT NOT NULL,
  custom_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Event Speakers table
CREATE TABLE IF NOT EXISTS public.event_speakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  bio TEXT NOT NULL,
  linkedin_url TEXT,
  x_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 5. Event Agenda Items table
CREATE TABLE IF NOT EXISTS public.event_agenda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  start_label TEXT NOT NULL,
  end_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  speaker_id UUID REFERENCES public.event_speakers(id) ON DELETE SET NULL,
  tag TEXT NOT NULL DEFAULT 'Session',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 6. Registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  course_year TEXT NOT NULL,
  college_id TEXT,
  hear_about TEXT NOT NULL,
  custom_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')) DEFAULT 'confirmed',
  payment_utr TEXT,
  payment_status TEXT CHECK (payment_status IN ('unpaid', 'pending', 'verified')) DEFAULT 'verified',
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_registration_email UNIQUE (event_id, email)
);

-- Indexes for performance & seat counting
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON public.registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_code ON public.registrations(registration_code);
CREATE INDEX IF NOT EXISTS idx_speakers_event ON public.event_speakers(event_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_agenda_event ON public.event_agenda_items(event_id, sort_order);

-- 7. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Public read policies for published events only
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (status = 'published' OR is_admin_or_editor());

CREATE POLICY "Public can view published event speakers"
  ON public.event_speakers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_speakers.event_id
      AND (events.status = 'published' OR is_admin_or_editor())
    )
  );

CREATE POLICY "Public can view published event agenda"
  ON public.event_agenda_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_agenda_items.event_id
      AND (events.status = 'published' OR is_admin_or_editor())
    )
  );

-- Admin full access policies
CREATE POLICY "Admins have full access to events"
  ON public.events FOR ALL
  TO authenticated
  USING (is_admin_or_editor())
  WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins have full access to speakers"
  ON public.event_speakers FOR ALL
  TO authenticated
  USING (is_admin_or_editor())
  WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins have full access to agenda"
  ON public.event_agenda_items FOR ALL
  TO authenticated
  USING (is_admin_or_editor())
  WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins have full access to registrations"
  ON public.registrations FOR ALL
  TO authenticated
  USING (is_admin_or_editor())
  WITH CHECK (is_admin_or_editor());

-- Storage bucket configuration for 'event-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read event-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-assets');

CREATE POLICY "Admin write event-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-assets' AND public.is_admin_or_editor());
