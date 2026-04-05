import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') {
    return NextResponse.json({ error: 'Parent access required' }, { status: 403 })
  }

  const { completionId } = await req.json()
  if (!completionId) {
    return NextResponse.json({ error: 'completionId required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('chore_completions')
    .update({ approved: true, approved_by: user.id })
    .eq('id', completionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
