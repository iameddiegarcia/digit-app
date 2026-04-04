import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { child_id, activity_id, traits, engagement } = body

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

    await supabase.from('session_activities').insert({
      session_id: session.id,
      activity_id,
      traits_exercised: traits,
      engagement_level: engagement,
    })

    for (const trait of traits) {
      await supabase.rpc('increment_trait_score', {
        p_child_id: child_id,
        p_trait: trait,
        p_amount: engagement,
      })
    }

    return NextResponse.json({ success: true, session_id: session.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
