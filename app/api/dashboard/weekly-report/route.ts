import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

function getWeekBounds(dateStr?: string | null) {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    weekOf: monday.toISOString().split('T')[0],
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0] + 'T23:59:59',
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weekParam = req.nextUrl.searchParams.get('week')
  const { weekOf, start, end } = getWeekBounds(weekParam)

  // Get all children for this family
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) {
    return NextResponse.json({ error: 'No family' }, { status: 400 })
  }

  const { data: children } = await supabase
    .from('profiles')
    .select('id, name, nickname, digit_config')
    .eq('family_id', profile.family_id)
    .in('role', ['child', 'creator'])

  // Per-child aggregation
  const childReports = await Promise.all(
    (children ?? []).map(async (child) => {
      // Sessions this week
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, started_at, summary')
        .eq('child_id', child.id)
        .gte('started_at', start)
        .lte('started_at', end)
        .order('started_at', { ascending: true })

      // Character observations this week
      const { data: observations } = await supabase
        .from('character_observations')
        .select('trait, notes, created_at')
        .eq('child_id', child.id)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true })

      // Trait evidence events this week
      const { data: traitEvents } = await supabase
        .from('trait_evidence_events')
        .select('trait, evidence_type, created_at')
        .eq('child_id', child.id)
        .gte('created_at', start)
        .lte('created_at', end)

      // Current character trait levels
      const { data: traitProfiles } = await supabase
        .from('character_trait_profiles')
        .select('trait, current_level, observations_count')
        .eq('child_id', child.id)

      // Group observations by trait
      const traitCounts: Record<string, number> = {}
      for (const obs of observations ?? []) {
        traitCounts[obs.trait] = (traitCounts[obs.trait] ?? 0) + 1
      }

      // Highlights: recent observations with notes
      const highlights = (observations ?? [])
        .filter((o) => o.notes)
        .slice(-3)
        .map((o) => ({
          trait: o.trait,
          notes: o.notes,
          date: o.created_at,
        }))

      return {
        childId: child.id,
        name: child.nickname || child.name,
        color: child.digit_config?.color || '#60A5FA',
        sessionsCount: sessions?.length ?? 0,
        observationsCount: observations?.length ?? 0,
        traitEventsCount: traitEvents?.length ?? 0,
        traitCounts,
        traitLevels: (traitProfiles ?? []).reduce(
          (acc, t) => ({ ...acc, [t.trait]: { level: t.current_level, count: t.observations_count } }),
          {} as Record<string, { level: number; count: number }>
        ),
        highlights,
      }
    })
  )

  // Spouse assessment for this week
  const { data: spouseAssessments } = await supabase
    .from('spouse_assessments')
    .select('assessor_id, ratings, grateful_for')
    .eq('family_id', profile.family_id)
    .eq('week_of', weekOf)

  const spouseCompleted = (spouseAssessments?.length ?? 0) >= 2

  // Family pulse: total sessions + observations + (spouse bonus)
  const totalSessions = childReports.reduce((s, c) => s + c.sessionsCount, 0)
  const totalObservations = childReports.reduce((s, c) => s + c.observationsCount, 0)
  const totalTraitEvents = childReports.reduce((s, c) => s + c.traitEventsCount, 0)
  const spouseBonus = spouseCompleted ? 10 : 0
  // Pulse: 0-100 scale based on engagement
  const rawPulse = Math.min(100, totalSessions * 8 + totalObservations * 5 + totalTraitEvents * 3 + spouseBonus)

  return NextResponse.json({
    weekOf,
    children: childReports,
    familyPulse: rawPulse,
    spouseCompleted,
    totalSessions,
    totalObservations,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekOf, childId } = await req.json()
  if (!weekOf || !childId) {
    return NextResponse.json({ error: 'weekOf and childId required' }, { status: 400 })
  }

  // Get child report data for AI narrative
  const { start, end } = getWeekBounds(weekOf)

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, nickname')
    .eq('id', childId)
    .single()

  const [{ data: observations }, { data: sessions }] = await Promise.all([
    supabase
      .from('character_observations')
      .select('trait, notes, created_at')
      .eq('child_id', childId)
      .gte('created_at', start)
      .lte('created_at', end),
    supabase
      .from('sessions')
      .select('summary, started_at')
      .eq('child_id', childId)
      .gte('started_at', start)
      .lte('started_at', end),
  ])

  const childName = profile?.nickname || profile?.name || 'your child'

  const anthropic = new Anthropic()
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Write a warm, encouraging 2-3 sentence narrative about ${childName}'s week in a Christ-centered family development system.

Data:
- ${sessions?.length ?? 0} learning sessions
- ${observations?.length ?? 0} character observations: ${observations?.map(o => `${o.trait}${o.notes ? ': ' + o.notes : ''}`).join('; ') || 'none'}

Write in second person ("Your child..."). Be specific about traits observed. Keep it warm and Scripture-grounded. If no data, write an encouraging note to keep observing.`,
    }],
  })

  const narrative = msg.content[0].type === 'text' ? msg.content[0].text : ''

  return NextResponse.json({ narrative, childName })
}
