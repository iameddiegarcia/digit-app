/**
 * Self-Improvement Loop (Autoresearch-Inspired)
 *
 * After every session, Digit:
 * 1. Observes — What signals did this session produce?
 * 2. Hypothesizes — What does this reveal about how the child learns?
 * 3. Tests — Next session adapts based on the hypothesis.
 * 4. Evaluates — Did the adaptation improve the evidence score?
 * 5. Records — Store what worked as a child-specific learning pattern.
 */

import Anthropic from '@anthropic-ai/sdk'
import { getSupabase } from './supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionReflection {
  observations: string[]
  hypotheses: string[]
  adaptations: string[]
}

export interface LearningPattern {
  pattern_type: 'strength' | 'struggle' | 'preference' | 'adaptation'
  trait: string | null
  observation: string
  hypothesis: string | null
  adaptation_applied: string | null
  evidence_before: number | null
  evidence_after: number | null
  confidence: number
  verified: boolean
}

// ---------------------------------------------------------------------------
// Post-Session Analysis
// ---------------------------------------------------------------------------

/**
 * Analyze a completed session by gathering all attempts, sending them to
 * Haiku for reflection, and storing the result.
 */
export async function analyzeSession(
  sessionId: string,
  childId: string,
): Promise<SessionReflection> {
  const supabase = getSupabase()

  // 1. Get child info
  const { data: child } = await supabase
    .from('children')
    .select('name, birth_date')
    .eq('id', childId)
    .single()

  const childAge = child
    ? Math.floor(
        (Date.now() - new Date(child.birth_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : 3

  // 2. Get trait profiles
  const { data: profiles } = await supabase
    .from('child_trait_profiles')
    .select('trait, current_level')
    .eq('child_id', childId)

  // 3. Get known patterns
  const { data: patterns } = await supabase
    .from('child_learning_patterns')
    .select('*')
    .eq('child_id', childId)
    .eq('verified', true)
    .limit(10)

  // 4. Get session attempts
  const { data: attempts } = await supabase
    .from('activity_attempts')
    .select('*')
    .eq('session_id', sessionId)
    .order('completed_at', { ascending: true })

  if (!attempts || attempts.length === 0) {
    const empty: SessionReflection = {
      observations: ['No activity attempts in this session.'],
      hypotheses: [],
      adaptations: [],
    }

    await supabase.from('session_reflections').insert({
      session_id: sessionId,
      child_id: childId,
      observations: empty.observations,
      hypotheses: empty.hypotheses,
      adaptations_recommended: empty.adaptations,
    })

    return empty
  }

  // 5. Build Haiku prompt
  const profileSummary = (profiles ?? [])
    .map((p) => `${p.trait}: level ${p.current_level}`)
    .join(', ')

  const patternSummary = (patterns ?? [])
    .map((p) => `- ${p.observation}`)
    .join('\n')

  const attemptSummary = attempts
    .map(
      (a) =>
        `Activity: ${a.activity_id} | Trait: ${a.primary_trait} | Accuracy: ${a.accuracy} | Hints: ${a.hints} | Attempts: ${a.attempts} | Abandoned: ${a.abandoned}`,
    )
    .join('\n')

  const prompt = `You are analyzing a learning session for a child development system.

Child: ${child?.name ?? 'Unknown'}, age ${childAge}
Trait profile: ${profileSummary || 'No data yet'}
Known patterns:
${patternSummary || 'None yet'}

Session data:
${attemptSummary}

Analyze:
1. What behavioral patterns do you observe in this session?
2. Where did the child struggle? Where did they excel?
3. What hypothesis would you form about how this child learns best?
4. What specific adaptation would you recommend for the next session?

Return JSON only:
{
  "observations": ["..."],
  "hypotheses": ["..."],
  "adaptations": ["..."]
}`

  // 6. Call Haiku
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  let reflection: SessionReflection
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250315',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '{}'
    reflection = JSON.parse(text) as SessionReflection
  } catch {
    reflection = {
      observations: ['Analysis unavailable.'],
      hypotheses: [],
      adaptations: [],
    }
  }

  // 7. Store reflection
  await supabase.from('session_reflections').insert({
    session_id: sessionId,
    child_id: childId,
    observations: reflection.observations,
    hypotheses: reflection.hypotheses,
    adaptations_recommended: reflection.adaptations,
  })

  return reflection
}

// ---------------------------------------------------------------------------
// Pattern Promotion
// ---------------------------------------------------------------------------

/**
 * If a hypothesis has been tested 3+ times with consistent results,
 * promote it to a verified learning pattern.
 */
export async function promotePatterns(childId: string): Promise<number> {
  const supabase = getSupabase()

  // Get unverified patterns with 3+ data points
  const { data: candidates } = await supabase
    .from('child_learning_patterns')
    .select('*')
    .eq('child_id', childId)
    .eq('verified', false)
    .not('evidence_before', 'is', null)
    .not('evidence_after', 'is', null)

  let promoted = 0

  for (const pattern of candidates ?? []) {
    // Check if evidence_after is consistently better than evidence_before
    // (simple heuristic: if after > before, the adaptation worked)
    if (
      pattern.evidence_after != null &&
      pattern.evidence_before != null &&
      pattern.evidence_after > pattern.evidence_before &&
      pattern.confidence >= 0.6
    ) {
      await supabase
        .from('child_learning_patterns')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', pattern.id)

      promoted++
    }
  }

  return promoted
}
