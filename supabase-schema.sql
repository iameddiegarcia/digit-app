-- Digit Learning Companion — Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

CREATE TYPE trait_type AS ENUM (
  'understanding', 'organizing', 'problem_solving',
  'responsibility', 'real_world', 'adaptability'
);

CREATE TYPE platform_type AS ENUM (
  'ipad', 'creator_studio', 'alexa', 'loona'
);

CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  birth_date DATE NOT NULL,
  digit_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  platform platform_type NOT NULL DEFAULT 'ipad',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  summary TEXT
);

CREATE TABLE session_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  traits_exercised trait_type[] NOT NULL DEFAULT '{}',
  engagement_level INTEGER CHECK (engagement_level BETWEEN 1 AND 5),
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trait_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  trait trait_type NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (child_id, trait)
);

-- Seed the Garcia family
INSERT INTO families (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Garcia');

INSERT INTO children (id, family_id, name, nickname, birth_date, digit_config) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Santiago', 'Santi', '2023-01-15', '{"base_form": "round_bot", "color": "#60A5FA"}'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Emily Valentina', 'Emily', '2024-04-01', '{"base_form": "light_pink_kitty", "color": "#F9A8D4"}'),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Kylie', 'Kylie', '2016-06-15', '{"base_form": "froggy_designer", "color": "#4ADE80"}');

-- Seed initial trait scores (all start at 0)
INSERT INTO trait_scores (child_id, trait, score)
SELECT c.id, t.trait, 0
FROM children c
CROSS JOIN (
  VALUES ('understanding'::trait_type), ('organizing'), ('problem_solving'),
         ('responsibility'), ('real_world'), ('adaptability')
) AS t(trait);

-- Function to increment trait scores (upsert) — LEGACY, kept for Phase 1 compat
CREATE OR REPLACE FUNCTION increment_trait_score(
  p_child_id UUID,
  p_trait trait_type,
  p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
  INSERT INTO trait_scores (child_id, trait, score, updated_at)
  VALUES (p_child_id, p_trait, p_amount, NOW())
  ON CONFLICT (child_id, trait)
  DO UPDATE SET
    score = trait_scores.score + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRAIT INTELLIGENCE ENGINE — Phase 2 Tables
-- ============================================================================

-- Child trait profiles: replaces simple trait_scores with levels + confidence
CREATE TABLE child_trait_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  trait trait_type NOT NULL,
  current_level INTEGER DEFAULT 0 CHECK (current_level BETWEEN 0 AND 5),
  confidence NUMERIC DEFAULT 0.0,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
  last_evidence_at TIMESTAMPTZ,
  UNIQUE (child_id, trait)
);

-- Activity attempts: detailed per-attempt signal tracking
CREATE TABLE activity_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  primary_trait trait_type NOT NULL,
  level_target INTEGER DEFAULT 1,
  attempts INTEGER DEFAULT 0,
  hints INTEGER DEFAULT 0,
  completion_time_seconds INTEGER,
  accuracy NUMERIC,
  independence NUMERIC,
  persistence NUMERIC,
  flexibility NUMERIC,
  abandoned BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence events: every scored observation logged
CREATE TABLE trait_evidence_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  trait trait_type NOT NULL,
  evidence_score NUMERIC NOT NULL,
  level_observed INTEGER NOT NULL CHECK (level_observed BETWEEN 0 AND 5),
  activity_attempt_id UUID REFERENCES activity_attempts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent observations: manual notes from Eddie
CREATE TABLE parent_observations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  trait trait_type,
  notes TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Self-improvement loop: learning patterns per child
CREATE TABLE child_learning_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  trait trait_type,
  observation TEXT NOT NULL,
  hypothesis TEXT,
  adaptation_applied TEXT,
  evidence_before NUMERIC,
  evidence_after NUMERIC,
  confidence NUMERIC DEFAULT 0.0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session reflections: Haiku post-session analysis
CREATE TABLE session_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  observations JSONB NOT NULL,
  hypotheses JSONB,
  adaptations_recommended JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed child_trait_profiles for all Garcia kids (all start at level 0)
INSERT INTO child_trait_profiles (child_id, trait, current_level, confidence, trend)
SELECT c.id, t.trait, 0, 0.0, 'stable'
FROM children c
CROSS JOIN (
  VALUES ('understanding'::trait_type), ('organizing'), ('problem_solving'),
         ('responsibility'), ('real_world'), ('adaptability')
) AS t(trait)
ON CONFLICT (child_id, trait) DO NOTHING;

-- ============================================================================
-- AUTH PROFILES — Phase 2+3
-- ============================================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  role TEXT CHECK (role IN ('parent', 'creator', 'child')) NOT NULL,
  child_id UUID REFERENCES children(id),  -- null for parent
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read family profiles"
  ON profiles FOR SELECT
  USING (family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  ));

-- ============================================================================
-- CREATIONS — Kylie's Creator Studio (L2a)
-- ============================================================================

CREATE TABLE creations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('story', 'puzzle', 'activity')) NOT NULL DEFAULT 'story',
  content JSONB NOT NULL DEFAULT '{}',
  primary_trait trait_type,
  target_age_min INTEGER DEFAULT 2,
  target_age_max INTEGER DEFAULT 5,
  status TEXT CHECK (status IN ('draft', 'review', 'published')) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can manage own creations"
  ON creations FOR ALL
  USING (creator_id = auth.uid());

CREATE POLICY "Family members can read published creations"
  ON creations FOR SELECT
  USING (
    status = 'published' AND
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Parents can read all family creations"
  ON creations FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Parents can update family creations"
  ON creations FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- ============================================================================
-- ACTIVITY FINDER — Local Event Discovery (L3)
-- ============================================================================

CREATE TABLE local_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  url_hash TEXT UNIQUE,
  source TEXT,
  location TEXT,
  cost TEXT CHECK (cost IN ('free', 'low', 'paid')),
  cost_amount NUMERIC,
  age_min INTEGER,
  age_max INTEGER,
  primary_trait trait_type,
  traits trait_type[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  event_date DATE,
  event_end_date DATE,
  status TEXT CHECK (status IN ('new', 'pinned', 'dismissed', 'archived')) DEFAULT 'new',
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  classified_at TIMESTAMPTZ,
  raw_snippet TEXT
);

CREATE TABLE discovery_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
  queries_total INTEGER DEFAULT 0,
  queries_completed INTEGER DEFAULT 0,
  activities_found INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT
);
