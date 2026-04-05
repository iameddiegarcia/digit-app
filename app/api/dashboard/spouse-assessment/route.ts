import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

function getCurrentWeekOf(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Parent role required' }, { status: 403 })
  }

  const weekParam = request.nextUrl.searchParams.get('week')
  const weekOf = weekParam || getCurrentWeekOf()

  // Fetch all assessments for this family + week
  const { data: assessments, error } = await supabase
    .from('spouse_assessments')
    .select('*')
    .eq('family_id', profile.family_id)
    .eq('week_of', weekOf)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mine = assessments?.find((a) => a.assessor_id === user.id) ?? null
  const spouse = assessments?.find((a) => a.assessor_id !== user.id) ?? null
  const bothSubmitted = mine !== null && spouse !== null

  return NextResponse.json({
    weekOf,
    mine: mine ? { ratings: mine.ratings, grateful_for: mine.grateful_for, prayer_request: mine.prayer_request } : null,
    spouseSubmitted: spouse !== null,
    revealed: bothSubmitted,
    spouseRatings: bothSubmitted ? spouse!.ratings : null,
    spouseGrateful: bothSubmitted ? spouse!.grateful_for : null,
    spousePrayer: bothSubmitted ? spouse!.prayer_request : null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Parent role required' }, { status: 403 })
  }

  const body = await request.json()
  const { ratings, grateful_for, prayer_request } = body as {
    ratings: Record<string, number>
    grateful_for?: string
    prayer_request?: string
  }

  if (!ratings || typeof ratings !== 'object') {
    return NextResponse.json({ error: 'Ratings required' }, { status: 400 })
  }

  const weekOf = getCurrentWeekOf()

  const { data, error } = await supabase
    .from('spouse_assessments')
    .upsert(
      {
        family_id: profile.family_id,
        assessor_id: user.id,
        week_of: weekOf,
        ratings,
        grateful_for: grateful_for ?? null,
        prayer_request: prayer_request ?? null,
      },
      { onConflict: 'assessor_id,week_of' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ assessment: data })
}
