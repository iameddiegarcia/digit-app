import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const childId = request.nextUrl.searchParams.get('childId')
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  let traits, error
  try {
    const result = await supabase
      .from('child_trait_profiles')
      .select('trait, current_level, confidence, trend')
      .eq('child_id', childId)
    traits = result.data
    error = result.error
  } catch (e) {
    console.error('Traits query exception:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  if (error) {
    console.error('Traits query error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message, code: error.code, details: error.details, hint: error.hint }, { status: 500 })
  }

  return NextResponse.json({
    traits: (traits ?? []).map((t) => ({
      trait: t.trait,
      level: t.current_level,
      confidence: Number(t.confidence),
      trend: t.trend,
    })),
  })
}
