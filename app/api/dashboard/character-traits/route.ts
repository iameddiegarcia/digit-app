import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('character_trait_profiles')
    .select('*')
    .eq('child_id', childId)
    .order('trait')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ traits: data })
}
