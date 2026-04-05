import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: creations, error } = await supabase
    .from('creations')
    .select('id, title, type, status, primary_trait, updated_at')
    .eq('creator_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ creations })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get family_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) return NextResponse.json({ error: 'No family found' }, { status: 400 })

  const body = await request.json()
  const { title, type, content, primary_trait, target_age_min, target_age_max } = body

  const { data: creation, error } = await supabase
    .from('creations')
    .insert({
      family_id: profile.family_id,
      creator_id: user.id,
      title: title || 'Untitled',
      type: type || 'story',
      content: content || {},
      primary_trait: primary_trait || null,
      target_age_min: target_age_min ?? 2,
      target_age_max: target_age_max ?? 5,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ creation }, { status: 201 })
}
