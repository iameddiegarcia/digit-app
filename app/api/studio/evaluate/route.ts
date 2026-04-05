import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { concept, explanation } = body as {
    concept: string
    explanation: string
  }

  if (!concept || !explanation) {
    return NextResponse.json({ error: 'concept and explanation required' }, { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: `You are Digit, a friendly learning companion for a 10-year-old girl named Kylie. She is practicing teaching concepts clearly. Score her explanation and give encouraging feedback.

Respond ONLY with valid JSON in this exact format:
{"clarity": <1-5>, "simplicity": <1-5>, "feedback": "<one encouraging sentence>", "tip": "<one short suggestion to improve>"}`,
    messages: [
      {
        role: 'user',
        content: `Concept to explain: "${concept}"\n\nKylie's explanation: "${explanation}"`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({
      clarity: 3,
      simplicity: 3,
      feedback: 'Good effort! Keep explaining things in your own words.',
      tip: 'Try using an example to make it clearer.',
    })
  }
}
