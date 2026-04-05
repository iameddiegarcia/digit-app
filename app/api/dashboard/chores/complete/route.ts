import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { choreId, childId } = await req.json()
  if (!choreId || !childId) {
    return NextResponse.json({ error: 'choreId and childId required' }, { status: 400 })
  }

  // Get chore details
  const { data: chore } = await supabase
    .from('chores')
    .select('points')
    .eq('id', choreId)
    .single()

  if (!chore) return NextResponse.json({ error: 'Chore not found' }, { status: 404 })

  // Calculate streak: count consecutive days this chore was completed
  const { data: recentCompletions } = await supabase
    .from('chore_completions')
    .select('completed_at')
    .eq('chore_id', choreId)
    .eq('child_id', childId)
    .order('completed_at', { ascending: false })
    .limit(30)

  let streak = 1
  if (recentCompletions && recentCompletions.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - 1) // start checking from yesterday

    for (const comp of recentCompletions) {
      const compDate = new Date(comp.completed_at)
      compDate.setHours(0, 0, 0, 0)
      if (compDate.getTime() === checkDate.getTime()) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  const { data: completion, error } = await supabase
    .from('chore_completions')
    .insert({
      chore_id: choreId,
      child_id: childId,
      points_earned: chore.points,
      streak_count: streak,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ completion, streak })
}
