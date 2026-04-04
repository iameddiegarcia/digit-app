# Stage 2: Build

## Purpose

The source code. This is where the Next.js app lives.

## Contents

- `app/` — Next.js app directory (pages, API routes, layouts)
- `components/` — React components (Digit character, activities, UI)
- `lib/` — Utilities, Supabase client, Claude API helpers
- `public/` — Static assets

## Tech Stack

- Next.js 15 + React 19
- Tailwind CSS
- Framer Motion (animations)
- Supabase JS client
- Anthropic SDK (Claude API)

## Build Order

1. Phase 1: iPad experience (Digit character + 3 activities + session logging)
2. Phase 2: Creator Studio (Kylie's tools)
3. Phase 3: Parent Dashboard
