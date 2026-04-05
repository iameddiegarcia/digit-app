import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'

const anthropic = new Anthropic()

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

  // Auto-generate review summary when submitted for review
  if (body.status === 'review' && creation) {
    generateReviewNotes(supabase, creation).catch(() => {})
  }

  return NextResponse.json({ creation })
}

async function generateReviewNotes(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  creation: Record<string, unknown>
) {
  const prompt = `You are reviewing a creation made by Kylie (age 10) for her younger siblings in the Digit family development system.

Creation type: ${creation.type}
Title: ${creation.title}
Primary trait: ${creation.primary_trait || 'none selected'}
Target ages: ${creation.target_age_min}-${creation.target_age_max}
Content: ${JSON.stringify(creation.content)}

Provide a brief review for Eddie (the parent) covering:
1. **Trait Assessment** — Which developmental trait(s) does this exercise? How well?
2. **Age Appropriateness** — Is this suitable for the target age? Any concerns?
3. **Suggested Improvements** — 1-2 specific things that could make it better

Keep it concise (3-5 sentences total). Be encouraging — Kylie is 10 and learning.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const reviewNotes = response.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('')

    await supabase
      .from('creations')
      .update({ review_notes: reviewNotes })
      .eq('id', creation.id)
  } catch {
    // Review note generation is best-effort
  }
}
