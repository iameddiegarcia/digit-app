import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = request.nextUrl.searchParams.get('childId')
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '10')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, started_at, ended_at, platform, summary')
    .eq('child_id', childId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get activity counts per session
  const sessionsWithCounts = await Promise.all(
    (sessions ?? []).map(async (s) => {
      const { count } = await supabase
        .from('session_activities')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', s.id)
      return { ...s, activity_count: count ?? 0 }
    })
  )

  return NextResponse.json({ sessions: sessionsWithCounts })
}
