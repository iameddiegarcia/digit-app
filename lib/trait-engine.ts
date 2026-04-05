/**
 * Core Trait Intelligence Engine
 *
 * Scoring: (accuracy * 0.35) + (independence * 0.25) + (persistence * 0.20) + (flexibility * 0.20)
 * Level up at 0.85+, level down at < 0.3.
 */

import type { Trait } from './types'
import type { AdaptationAction } from './activity-schema'
import { getSupabase } from './supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivityAttemptSignals {
  accuracy: number       // 0.0-1.0
  hints: number          // number of hints used
  attempts: number       // number of attempts made
  abandoned: boolean     // did the child give up?
  flexibility?: number   // 0.0-1.0 (strategy switching); defaults to 0.5
  expectedAttempts?: number // baseline for persistence calc; defaults to 3
}

export interface EvidenceResult {
  evidenceScore: number
  components: {
    accuracy: number
    independence: number
    persistence: number
    flexibility: number
  }
}

export interface LevelResult {
  previousLevel: number
  newLevel: number
  changed: boolean
}

// ---------------------------------------------------------------------------
// Scoring Weights (canonical from trait engine spec)
// ---------------------------------------------------------------------------

export const WEIGHTS = {
  accuracy: 0.35,
  independence: 0.25,
  persistence: 0.20,
  flexibility: 0.20,
} as const

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Calculate the weighted evidence score from raw attempt signals.
 */
export function calculateEvidenceScore(attempt: ActivityAttemptSignals): EvidenceResult {
  const accuracy = Math.max(0, Math.min(1, attempt.accuracy ?? 0))

  const maxAttempts = Math.max(attempt.attempts, 1)
  const independence = Math.max(0, Math.min(1, 1 - attempt.hints / maxAttempts))

  const expected = attempt.expectedAttempts ?? 3
  const persistence = attempt.abandoned
    ? 0
    : Math.max(0, Math.min(1, attempt.attempts / expected))

  const flexibility = Math.max(0, Math.min(1, attempt.flexibility ?? 0.5))

  const evidenceScore =
    accuracy * WEIGHTS.accuracy +
    independence * WEIGHTS.independence +
    persistence * WEIGHTS.persistence +
    flexibility * WEIGHTS.flexibility

  return {
    evidenceScore: Math.round(evidenceScore * 1000) / 1000,
    components: { accuracy, independence, persistence, flexibility },
  }
}

/**
 * Determine the new level given a score and the current level.
 * Level up at >= 0.85, level down at < 0.3.
 */
export function determineLevel(score: number, currentLevel: number): LevelResult {
  let newLevel = currentLevel

  if (score >= 0.85 && currentLevel < 5) {
    newLevel = currentLevel + 1
  } else if (score < 0.3 && currentLevel > 0) {
    newLevel = currentLevel - 1
  }

  return {
    previousLevel: currentLevel,
    newLevel,
    changed: newLevel !== currentLevel,
  }
}

/**
 * Get the adaptation action based on evidence score.
 */
export function getAdaptation(score: number): AdaptationAction {
  if (score >= 0.8) return 'increase_complexity'
  if (score < 0.4) return 'reduce_choices'
  return 'maintain'
}

/**
 * Compute trend from recent evidence scores.
 */
export function computeTrend(
  recentScores: number[],
): 'improving' | 'stable' | 'declining' {
  if (recentScores.length < 2) return 'stable'

  const half = Math.floor(recentScores.length / 2)
  const firstHalf = recentScores.slice(0, half)
  const secondHalf = recentScores.slice(half)

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const diff = avg(secondHalf) - avg(firstHalf)

  if (diff > 0.1) return 'improving'
  if (diff < -0.1) return 'declining'
  return 'stable'
}

// ---------------------------------------------------------------------------
// Supabase Integration
// ---------------------------------------------------------------------------

/**
 * Update a child's trait profile in Supabase after an activity attempt.
 * 1. Insert activity_attempt record
 * 2. Insert trait_evidence_event
 * 3. Fetch recent evidence to compute trend
 * 4. Update child_trait_profiles with new level + trend + confidence
 */
export async function updateTraitProfile(
  childId: string,
  trait: Trait,
  evidenceScore: number,
  levelObserved: number,
  attemptId?: string,
): Promise<{ newLevel: number; trend: string; adaptation: AdaptationAction }> {
  const supabase = getSupabase()

  // 1. Insert evidence event
  await supabase.from('trait_evidence_events').insert({
    child_id: childId,
    trait,
    evidence_score: evidenceScore,
    level_observed: levelObserved,
    activity_attempt_id: attemptId ?? null,
  })

  // 2. Get current profile
  const { data: profile } = await supabase
    .from('child_trait_profiles')
    .select('*')
    .eq('child_id', childId)
    .eq('trait', trait)
    .single()

  const currentLevel = profile?.current_level ?? 0

  // 3. Determine new level
  const { newLevel } = determineLevel(evidenceScore, currentLevel)

  // 4. Fetch recent evidence scores for trend
  const { data: recentEvents } = await supabase
    .from('trait_evidence_events')
    .select('evidence_score')
    .eq('child_id', childId)
    .eq('trait', trait)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentScores = (recentEvents ?? []).map((e) => Number(e.evidence_score))
  const trend = computeTrend(recentScores)

  // 5. Calculate confidence (more evidence = higher confidence, capped at 1.0)
  const totalEvents = recentScores.length
  const confidence = Math.min(1.0, totalEvents / 10)

  // 6. Upsert profile
  await supabase.from('child_trait_profiles').upsert(
    {
      child_id: childId,
      trait,
      current_level: newLevel,
      confidence,
      trend,
      last_evidence_at: new Date().toISOString(),
    },
    { onConflict: 'child_id,trait' },
  )

  const adaptation = getAdaptation(evidenceScore)

  return { newLevel, trend, adaptation }
}
