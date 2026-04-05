import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  calculateEvidenceScore,
  updateTraitProfile,
  type ActivityAttemptSignals,
} from '@/lib/trait-engine'
import type { Trait } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { child_id, activity_id, traits, engagement } = body

    // 1. Create session record
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        child_id,
        platform: 'ipad',
        ended_at: new Date().toISOString(),
        summary: `Completed ${activity_id}`,
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // 2. Record session activity
    await supabase.from('session_activities').insert({
      session_id: session.id,
      activity_id,
      traits_exercised: traits,
      engagement_level: engagement,
    })

    // 3. Legacy trait score increment
    for (const trait of traits) {
      await supabase.rpc('increment_trait_score', {
        p_child_id: child_id,
        p_trait: trait,
        p_amount: engagement,
      })
    }

    // 4. Feed the trait intelligence engine
    // Derive signals from the engagement score (1-5):
    //   accuracy = engagement / 5 (maps 1-5 → 0.2-1.0)
    //   hints = 0 (not tracked yet at component level)
    //   attempts = 1 (completed the activity)
    //   abandoned = false (they finished)
    const accuracy = engagement / 5
    const signals: ActivityAttemptSignals = {
      accuracy,
      hints: 0,
      attempts: 1,
      abandoned: false,
      flexibility: 0.5,
    }
    const { evidenceScore, components } = calculateEvidenceScore(signals)

    // Process each trait through the engine
    const primaryTrait = (traits[0] as Trait) ?? null
    if (primaryTrait) {
      // Get child's current level for this trait
      const { data: profile } = await supabase
        .from('child_trait_profiles')
        .select('current_level')
        .eq('child_id', child_id)
        .eq('trait', primaryTrait)
        .single()

      const levelTarget = profile?.current_level ?? 0

      // Insert activity attempt record
      const { data: attemptRow } = await supabase
        .from('activity_attempts')
        .insert({
          session_id: session.id,
          child_id,
          activity_id,
          primary_trait: primaryTrait,
          level_target: levelTarget,
          attempts: 1,
          hints: 0,
          completion_time_seconds: null,
          accuracy,
          independence: components.independence,
          persistence: components.persistence,
          flexibility: components.flexibility,
          abandoned: false,
        })
        .select('id')
        .single()

      // Update trait profile with evidence
      await updateTraitProfile(
        child_id,
        primaryTrait,
        evidenceScore,
        levelTarget,
        attemptRow?.id,
      )
    }

    return NextResponse.json({ success: true, session_id: session.id })
  } catch (error) {
    console.error('Session recording error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
