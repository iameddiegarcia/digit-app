import { NextRequest, NextResponse } from 'next/server'
import { analyzeSession, promotePatterns } from '@/lib/self-improvement'

/**
 * POST /api/session-reflection
 *
 * Trigger Haiku analysis after a session ends.
 * Stores observations, hypotheses, and recommended adaptations.
 * Also promotes any learning patterns that have enough evidence.
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, childId } = await request.json()

    if (!sessionId || !childId) {
      return NextResponse.json(
        { error: 'sessionId and childId are required' },
        { status: 400 },
      )
    }

    // 1. Analyze the session with Haiku
    const reflection = await analyzeSession(sessionId, childId)

    // 2. Promote any patterns that have enough evidence
    const promoted = await promotePatterns(childId)

    return NextResponse.json({
      reflection,
      patternsPromoted: promoted,
    })
  } catch (error) {
    console.error('Session reflection error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze session' },
      { status: 500 },
    )
  }
}
