import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) return NextResponse.json({ error: 'No family' }, { status: 400 })

  let query = supabase
    .from('local_activities')
    .select('*')
    .eq('family_id', profile.family_id)
    .order('discovered_at', { ascending: false })

  const trait = request.nextUrl.searchParams.get('trait')
  const cost = request.nextUrl.searchParams.get('cost')
  const status = request.nextUrl.searchParams.get('status')

  if (trait) query = query.eq('primary_trait', trait)
  if (cost) query = query.eq('cost', cost)
  if (status) query = query.eq('status', status)
  else query = query.in('status', ['new', 'pinned'])

  const { data: activities, error } = await query.limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ activities })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { activityId, status } = await request.json()
  if (!activityId || !status) return NextResponse.json({ error: 'activityId and status required' }, { status: 400 })

  const { error } = await supabase
    .from('local_activities')
    .update({ status })
    .eq('id', activityId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
