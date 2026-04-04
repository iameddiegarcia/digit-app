import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getDigitSystemPrompt } from '@/lib/digit-personality'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { childName, childAge, message, context } = await request.json()

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250315',
      max_tokens: 100,
      system: getDigitSystemPrompt(childName, childAge),
      messages: [
        ...(context ?? []),
        { role: 'user', content: message },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ message: text })
  } catch (error) {
    return NextResponse.json({
      message: "Wow, great job! Let's keep going!",
    })
  }
}
