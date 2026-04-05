import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = request.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const { data: traits, error } = await supabase
    .rpc('get_child_traits', { p_child_id: childId })

  if (error) {
    console.error('Traits RPC error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    traits: (traits ?? []).map((t: { trait: string; current_level: number; confidence: string; trend: string }) => ({
      trait: t.trait,
      level: t.current_level,
      confidence: Number(t.confidence),
      trend: t.trend,
    })),
  })
}
