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

-- Function to increment trait scores (upsert)
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
