import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) return NextResponse.json({ error: 'No family' }, { status: 400 })

  const { data: creations, error } = await supabase
    .from('creations')
    .select('id, title, type, primary_trait, content, created_at')
    .eq('family_id', profile.family_id)
    .eq('status', 'review')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ creations })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { creationId, status, reviewNote } = await request.json()
  if (!creationId || !status) return NextResponse.json({ error: 'creationId and status required' }, { status: 400 })

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (reviewNote) updatePayload.review_note = reviewNote

  const { error } = await supabase
    .from('creations')
    .update(updatePayload)
    .eq('id', creationId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
