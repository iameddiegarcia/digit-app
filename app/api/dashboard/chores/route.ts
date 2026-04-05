import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) {
    return NextResponse.json({ error: 'No family' }, { status: 400 })
  }

  // Get all active chores for the family
  const { data: chores, error } = await supabase
    .from('chores')
    .select('*')
    .eq('family_id', profile.family_id)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get today's completions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  const choreIds = (chores ?? []).map((c) => c.id)
  let completions: Array<{
    id: string
    chore_id: string
    child_id: string
    completed_at: string
    approved: boolean
    points_earned: number
    streak_count: number
    photo_url: string | null
  }> = []

  if (choreIds.length > 0) {
    const { data } = await supabase
      .from('chore_completions')
      .select('*')
      .in('chore_id', choreIds)
      .gte('completed_at', todayStr)

    completions = data ?? []
  }

  return NextResponse.json({ chores: chores ?? [], completions })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Parent access required' }, { status: 403 })
  }

  const body = await req.json()
  const { childId, title, description, emoji, points, frequency, characterTrait } = body

  if (!childId || !title) {
    return NextResponse.json({ error: 'childId and title required' }, { status: 400 })
  }

  const { data: chore, error } = await supabase
    .from('chores')
    .insert({
      family_id: profile.family_id,
      child_id: childId,
      title,
      description: description || null,
      emoji: emoji || '✅',
      points: points || 1,
      frequency: frequency || 'daily',
      character_trait: characterTrait || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ chore })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const choreId = req.nextUrl.searchParams.get('id')
  if (!choreId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Soft delete — set active = false
  const { error } = await supabase
    .from('chores')
    .update({ active: false })
    .eq('id', choreId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
