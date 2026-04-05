import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get latest score per principle (most recent week)
  const { data, error } = await supabase
    .from('workplace_principle_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('week_of', { ascending: false })
    .limit(12) // one per principle for latest week

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by principle, take latest
  const latest: Record<string, { score: number; week_of: string; reflection: string | null }> = {}
  for (const row of data ?? []) {
    if (!latest[row.principle]) {
      latest[row.principle] = { score: row.score, week_of: row.week_of, reflection: row.reflection }
    }
  }

  // Get historical scores for trends (last 4 weeks per principle)
  const { data: history } = await supabase
    .from('workplace_principle_scores')
    .select('principle, score, week_of')
    .eq('user_id', user.id)
    .order('week_of', { ascending: true })
    .limit(48) // 12 principles x 4 weeks

  const historyByPrinciple: Record<string, number[]> = {}
  for (const row of history ?? []) {
    if (!historyByPrinciple[row.principle]) historyByPrinciple[row.principle] = []
    historyByPrinciple[row.principle].push(row.score)
  }

  return NextResponse.json({ latest, history: historyByPrinciple })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { scores } = body as { scores: { principle: string; score: number; reflection?: string }[] }

  if (!scores || !Array.isArray(scores)) {
    return NextResponse.json({ error: 'scores array required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Current week Monday
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const weekOf = monday.toISOString().split('T')[0]

  const rows = scores.map((s) => ({
    user_id: user.id,
    principle: s.principle,
    score: Math.min(5, Math.max(1, s.score)),
    reflection: s.reflection || null,
    week_of: weekOf,
  }))

  const { error } = await supabase
    .from('workplace_principle_scores')
    .upsert(rows, { onConflict: 'user_id,principle,week_of' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, weekOf })
}
