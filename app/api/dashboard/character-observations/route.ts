import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('character_observations')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ observations: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { childId, trait, notes } = body

  if (!childId || !trait) {
    return NextResponse.json({ error: 'childId and trait required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Insert observation
  const { error: obsError } = await supabase
    .from('character_observations')
    .insert({ child_id: childId, observer_id: user.id, trait, notes: notes || null })

  if (obsError) return NextResponse.json({ error: obsError.message }, { status: 500 })

  // Increment observation count and update level based on count
  const { data: profile } = await supabase
    .from('character_trait_profiles')
    .select('observations_count, current_level')
    .eq('child_id', childId)
    .eq('trait', trait)
    .single()

  if (profile) {
    const newCount = profile.observations_count + 1
    // Level up thresholds: 3, 8, 15, 25, 40 observations
    const thresholds = [3, 8, 15, 25, 40]
    let newLevel = 0
    for (const t of thresholds) {
      if (newCount >= t) newLevel++
    }

    await supabase
      .from('character_trait_profiles')
      .update({
        observations_count: newCount,
        current_level: Math.min(newLevel, 5),
        last_observed_at: new Date().toISOString(),
      })
      .eq('child_id', childId)
      .eq('trait', trait)
  }

  return NextResponse.json({ success: true })
}
