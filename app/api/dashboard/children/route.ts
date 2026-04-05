import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get family_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) return NextResponse.json({ error: 'No family' }, { status: 400 })

  const { data: children, error } = await supabase
    .from('children')
    .select('id, name, nickname, birth_date, digit_config, available')
    .eq('family_id', profile.family_id)
    .eq('available', true)
    .order('birth_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ children })
}
