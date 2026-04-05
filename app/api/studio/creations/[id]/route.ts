import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: creation, error } = await supabase
    .from('creations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ creation })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.title !== undefined) updates.title = body.title
  if (body.content !== undefined) updates.content = body.content
  if (body.primary_trait !== undefined) updates.primary_trait = body.primary_trait
  if (body.target_age_min !== undefined) updates.target_age_min = body.target_age_min
  if (body.target_age_max !== undefined) updates.target_age_max = body.target_age_max
  if (body.status !== undefined) updates.status = body.status

  const { data: creation, error } = await supabase
    .from('creations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ creation })
}
