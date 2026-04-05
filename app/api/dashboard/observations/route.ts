import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = request.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const { data: observations, error } = await supabase
    .from('parent_observations')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ observations })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId, trait, notes } = await request.json()
  if (!childId || !notes) return NextResponse.json({ error: 'childId and notes required' }, { status: 400 })

  const { data, error } = await supabase
    .from('parent_observations')
    .insert({ child_id: childId, trait: trait || null, notes })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ observation: data }, { status: 201 })
}
