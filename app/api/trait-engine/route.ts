import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import {
  calculateEvidenceScore,
  getAdaptation,
  updateTraitProfile,
  type ActivityAttemptSignals,
} from '@/lib/trait-engine'
import type { Trait } from '@/lib/types'

/**
 * POST /api/trait-engine
 *
 * Receive activity attempt signals, calculate evidence score,
 * update trait profile, return adaptation recommendation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sessionId,
      childId,
      activityId,
      primaryTrait,
      levelTarget,
      accuracy,
      hints,
      attempts,
      abandoned,
      flexibility,
      completionTimeSeconds,
    } = body as {
      sessionId: string
      childId: string
      activityId: string
      primaryTrait: Trait
      levelTarget: number
      accuracy: number
      hints: number
      attempts: number
      abandoned: boolean
      flexibility?: number
      completionTimeSeconds?: number
    }

    // 1. Calculate evidence score
    const signals: ActivityAttemptSignals = {
      accuracy,
      hints,
      attempts,
      abandoned,
      flexibility,
    }
    const { evidenceScore, components } = calculateEvidenceScore(signals)

    // 2. Insert activity attempt
    const supabase = getSupabase()
    const { data: attemptRow } = await supabase
      .from('activity_attempts')
      .insert({
        session_id: sessionId,
        child_id: childId,
        activity_id: activityId,
        primary_trait: primaryTrait,
        level_target: levelTarget,
        attempts,
        hints,
        completion_time_seconds: completionTimeSeconds ?? null,
        accuracy,
        independence: components.independence,
        persistence: components.persistence,
        flexibility: components.flexibility,
        abandoned,
      })
      .select('id')
      .single()

    // 3. Update trait profile
    const { newLevel, trend, adaptation } = await updateTraitProfile(
      childId,
      primaryTrait,
      evidenceScore,
      levelTarget,
      attemptRow?.id,
    )

    return NextResponse.json({
      evidenceScore,
      components,
      newLevel,
      trend,
      adaptation,
    })
  } catch (error) {
    console.error('Trait engine error:', error)
    return NextResponse.json(
      { error: 'Failed to process activity attempt' },
      { status: 500 },
    )
  }
}
