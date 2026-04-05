/**
 * Eddie's 12 Workplace Principles — Self-Assessment Dimension
 *
 * Same radar chart + levels pattern as kids' traits,
 * but for Eddie's own professional development.
 * Uses the existing Principle type from values.ts.
 */

import type { Principle } from './values'
import { PRINCIPLE_LABELS } from './values'

// Re-export for convenience
export { PRINCIPLE_LABELS }
export type { Principle }

export const ALL_PRINCIPLES: Principle[] = [
  'initiative', 'completed_staff_work', 'responsibility',
  'accountability', 'ownership', 'adaptability',
  'communication', 'collaboration', 'responsiveness',
  'innovation', 'integrity', 'continuous_learning',
]

// ---------------------------------------------------------------------------
// 1. Principle Descriptions & Self-Reflection Prompts
// ---------------------------------------------------------------------------

export interface PrincipleDefinition {
  principle: Principle
  description: string
  selfReflection: string // prompt Eddie sees when scoring himself
  scripture: string
  reference: string
}

export const PRINCIPLE_DEFINITIONS: PrincipleDefinition[] = [
  {
    principle: 'initiative',
    description: 'Taking action without being asked. Seeing what needs to be done and doing it.',
    selfReflection: 'Did I step forward without being asked this week?',
    scripture: 'Whatever your hand finds to do, do it with all your might.',
    reference: 'Ecclesiastes 9:10',
  },
  {
    principle: 'completed_staff_work',
    description: 'Delivering finished work — not drafts, not half-done. The answer, not more questions.',
    selfReflection: 'Did I deliver complete, ready-to-act solutions?',
    scripture: 'I have finished the work you gave me to do.',
    reference: 'John 17:4',
  },
  {
    principle: 'responsibility',
    description: 'Owning your duties. Following through on commitments.',
    selfReflection: 'Did I follow through on every commitment I made?',
    scripture: 'Whatever you do, work at it with all your heart.',
    reference: 'Colossians 3:23',
  },
  {
    principle: 'accountability',
    description: 'Answering for your actions. No excuses, no deflection.',
    selfReflection: 'Did I own my mistakes and outcomes honestly?',
    scripture: 'Each of us will give an account of ourselves to God.',
    reference: 'Romans 14:12',
  },
  {
    principle: 'ownership',
    description: 'Treating work as your own. Not passing the buck.',
    selfReflection: 'Did I treat this work as if my name was on it?',
    scripture: 'The faithful man will abound with blessings.',
    reference: 'Proverbs 28:20',
  },
  {
    principle: 'adaptability',
    description: 'Adjusting to change. Staying effective when plans shift.',
    selfReflection: 'Did I adapt well when things changed unexpectedly?',
    scripture: 'Be transformed by the renewing of your mind.',
    reference: 'Romans 12:2',
  },
  {
    principle: 'communication',
    description: 'Clear, timely, honest communication. No ambiguity.',
    selfReflection: 'Was I clear and proactive in my communication?',
    scripture: 'Let your yes be yes and your no be no.',
    reference: 'Matthew 5:37',
  },
  {
    principle: 'collaboration',
    description: 'Working with others to achieve more than you could alone.',
    selfReflection: 'Did I lift others up and work well as a team?',
    scripture: 'Two are better than one, because they have a good return for their labor.',
    reference: 'Ecclesiastes 4:9',
  },
  {
    principle: 'responsiveness',
    description: 'Timely action and replies. Not leaving people waiting.',
    selfReflection: 'Did I respond promptly and keep people informed?',
    scripture: 'Do not withhold good from those to whom it is due, when it is in your power to act.',
    reference: 'Proverbs 3:27',
  },
  {
    principle: 'innovation',
    description: 'Finding better ways. Questioning the status quo with purpose.',
    selfReflection: 'Did I look for a better way, or just the familiar way?',
    scripture: 'See, I am doing a new thing!',
    reference: 'Isaiah 43:19',
  },
  {
    principle: 'integrity',
    description: 'Doing right when no one is watching. Character over reputation.',
    selfReflection: 'Did my private actions match my public commitments?',
    scripture: 'The integrity of the upright guides them.',
    reference: 'Proverbs 11:3',
  },
  {
    principle: 'continuous_learning',
    description: 'Always growing. Never settling for what you already know.',
    selfReflection: 'Did I learn something new and apply it this week?',
    scripture: 'Get wisdom, get understanding; do not forget my words.',
    reference: 'Proverbs 4:5',
  },
]

export function principleDefinition(p: Principle): PrincipleDefinition {
  return PRINCIPLE_DEFINITIONS.find((d) => d.principle === p)!
}

// ---------------------------------------------------------------------------
// 2. Scoring — Weekly Self-Assessment
// ---------------------------------------------------------------------------

export interface WeeklyPrincipleScore {
  id: string
  user_id: string  // Eddie's auth ID
  principle: Principle
  score: number  // 1-5 self-rating
  reflection: string | null  // optional note
  week_of: string  // ISO date of Monday
  created_at: string
}

export interface PrincipleProfile {
  principle: Principle
  current_level: number  // latest score (1-5)
  trend: 'improving' | 'stable' | 'declining'
  weeks_scored: number
}

// ---------------------------------------------------------------------------
// 3. Aggregate helpers
// ---------------------------------------------------------------------------

/**
 * Calculate trend from last 4 weeks of scores.
 */
export function calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable'
  const recent = scores.slice(-2)
  const earlier = scores.slice(0, -2)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const earlierAvg = earlier.length > 0
    ? earlier.reduce((a, b) => a + b, 0) / earlier.length
    : recentAvg
  const diff = recentAvg - earlierAvg
  if (diff > 0.3) return 'improving'
  if (diff < -0.3) return 'declining'
  return 'stable'
}
