/**
 * Activity Finder — Firecrawl-powered local event discovery
 * Searches for free/low-cost kids' activities near Inglewood, CA (45mi radius)
 * and classifies them using Claude Haiku into Digit's trait system.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Trait } from './types'

// ---------------------------------------------------------------------------
// Discovery Queries (15 searches covering Inglewood + 45mi radius)
// ---------------------------------------------------------------------------

export const DISCOVERY_QUERIES = [
  'free kids activities Inglewood CA this week',
  'STEM workshops children Los Angeles 2026',
  'library storytime Inglewood Hawthorne Lennox',
  'Columbia Memorial Space Center events Downey',
  'parks and recreation kids programs Inglewood',
  'free museum days Los Angeles kids',
  'California Science Center free kids programs',
  'outdoor nature activities kids LA South Bay',
  'arts and crafts workshops kids Inglewood Torrance',
  'music classes toddlers Los Angeles free',
  'Eventbrite free kids events Inglewood LA',
  'reading programs kids library LA County',
  'sports programs toddlers Inglewood Hawthorne',
  'Inglewood public library kids events',
  'Kenneth Hahn State Recreation Area kids activities',
] as const

// ---------------------------------------------------------------------------
// Classification Types
// ---------------------------------------------------------------------------

export interface ClassifiedActivity {
  primary_trait: Trait
  traits: Trait[]
  tags: string[]
  age_min: number
  age_max: number
  cost: 'free' | 'low' | 'paid'
  location: string | null
  event_date: string | null
}

// ---------------------------------------------------------------------------
// Haiku Classification
// ---------------------------------------------------------------------------

const CLASSIFICATION_PROMPT = `You are classifying a kids' activity for a parent development dashboard.
This system tracks 6 developmental traits: understanding, organizing, problem_solving, responsibility, real_world, adaptability.

Given the activity title and description, return ONLY valid JSON (no markdown fencing):
{
  "primary_trait": "problem_solving",
  "traits": ["problem_solving", "understanding"],
  "tags": ["#STEM", "#Workshop", "#FreeEvent"],
  "age_min": 3,
  "age_max": 10,
  "cost": "free",
  "location": "Name, City",
  "event_date": "2026-04-12"
}

Be conservative — only include traits the activity genuinely develops.
"primary_trait" is the single trait this activity most directly builds.
Use null for event_date if ongoing or unknown.
Cost must be "free", "low", or "paid".
Tags should include practical tags like #STEM, #Arts, #Music, #Reading, #Science, #Math, #Workshop, #Class, #Camp, #DropIn, #Festival, #Museum, #Library, #Park, #FreeEvent, #LowCost, #Indoor, #Outdoor, #OneTime, #Weekly, #Monthly, #Ongoing.`

export async function classifyActivity(
  title: string,
  description: string,
): Promise<ClassifiedActivity | null> {
  try {
    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}`,
        },
      ],
      system: CLASSIFICATION_PROMPT,
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    return parsed as ClassifiedActivity
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Firecrawl Search
// ---------------------------------------------------------------------------

export interface FirecrawlResult {
  title: string
  description: string
  url: string
}

export async function searchFirecrawl(query: string): Promise<FirecrawlResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    })

    if (!res.ok) return []
    const data = await res.json()
    return (data.data ?? []).map((r: { title?: string; description?: string; url?: string }) => ({
      title: r.title ?? '',
      description: r.description ?? '',
      url: r.url ?? '',
    }))
  } catch {
    return []
  }
}
