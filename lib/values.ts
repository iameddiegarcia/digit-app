/**
 * Soul Layer — Values Foundation
 *
 * Maps Eddie's 12 Principles to Digit's 6 traits.
 * Defines Christ-centered encouragement templates.
 * Includes service-oriented real-world mission prompts.
 */

import type { Trait } from './types'

// ---------------------------------------------------------------------------
// 1. Eddie's 12 Principles
// ---------------------------------------------------------------------------

export type Principle =
  | 'initiative'
  | 'completed_staff_work'
  | 'responsibility'
  | 'accountability'
  | 'ownership'
  | 'adaptability'
  | 'communication'
  | 'collaboration'
  | 'responsiveness'
  | 'innovation'
  | 'integrity'
  | 'continuous_learning'

export const PRINCIPLE_LABELS: Record<Principle, string> = {
  initiative: 'Initiative',
  completed_staff_work: 'Completed Staff Work',
  responsibility: 'Responsibility',
  accountability: 'Accountability',
  ownership: 'Ownership',
  adaptability: 'Adaptability',
  communication: 'Communication',
  collaboration: 'Collaboration',
  responsiveness: 'Responsiveness',
  innovation: 'Innovation',
  integrity: 'Integrity',
  continuous_learning: 'Continuous Learning',
}

// ---------------------------------------------------------------------------
// 2. Principle-to-Trait Mapping
// ---------------------------------------------------------------------------

export const PRINCIPLE_TRAIT_MAP: Record<Principle, Trait[]> = {
  initiative: ['problem_solving', 'adaptability'],
  completed_staff_work: ['responsibility', 'organizing'],
  responsibility: ['responsibility'],
  accountability: ['responsibility'],
  ownership: ['responsibility', 'real_world'],
  adaptability: ['adaptability'],
  communication: ['understanding'],
  collaboration: ['real_world', 'adaptability'],
  responsiveness: ['adaptability'],
  innovation: ['problem_solving'],
  integrity: ['responsibility', 'real_world'],
  continuous_learning: ['understanding', 'adaptability'],
}

/** Reverse lookup: which principles feed a given trait */
export function principlesForTrait(trait: Trait): Principle[] {
  return (Object.entries(PRINCIPLE_TRAIT_MAP) as [Principle, Trait[]][])
    .filter(([, traits]) => traits.includes(trait))
    .map(([p]) => p)
}

// ---------------------------------------------------------------------------
// 3. Scriptural Foundations
// ---------------------------------------------------------------------------

export interface TraitFoundation {
  trait: Trait
  scripture: string
  reference: string
  meaning: string
}

export const TRAIT_FOUNDATIONS: TraitFoundation[] = [
  {
    trait: 'understanding',
    scripture: 'The fear of the Lord is the beginning of wisdom.',
    reference: 'Proverbs 9:10',
    meaning: 'Curiosity and learning are acts of worship.',
  },
  {
    trait: 'organizing',
    scripture: 'For God is not a God of disorder but of peace.',
    reference: '1 Corinthians 14:33',
    meaning: 'Structure reflects divine order.',
  },
  {
    trait: 'problem_solving',
    scripture: 'I can do all things through Christ who strengthens me.',
    reference: 'Philippians 4:13',
    meaning: 'Persistence comes from knowing you are not alone.',
  },
  {
    trait: 'responsibility',
    scripture: 'Whatever you do, work at it with all your heart, as working for the Lord.',
    reference: 'Colossians 3:23',
    meaning: 'Ownership is stewardship.',
  },
  {
    trait: 'real_world',
    scripture: 'Faith without works is dead.',
    reference: 'James 2:26',
    meaning: 'Learning means nothing without action.',
  },
  {
    trait: 'adaptability',
    scripture: 'Be transformed by the renewing of your mind.',
    reference: 'Romans 12:2',
    meaning: 'Growth requires change.',
  },
]

export function foundationForTrait(trait: Trait): TraitFoundation {
  return TRAIT_FOUNDATIONS.find((f) => f.trait === trait)!
}

// ---------------------------------------------------------------------------
// 4. Encouragement Templates (character-focused, NOT preachy)
// ---------------------------------------------------------------------------

export type EncouragementContext =
  | 'persisted'       // child retried after failure
  | 'completed'       // child finished an activity
  | 'improved'        // score went up
  | 'struggled'       // child had a hard time
  | 'helped_sibling'  // collaborative act
  | 'tried_new'       // tried something outside comfort zone
  | 'showed_care'     // demonstrated empathy or service

export interface EncouragementTemplate {
  context: EncouragementContext
  young: string[]   // ages 2-4 (Santi, Emily)
  older: string[]   // ages 8-12 (Kylie)
}

export const ENCOURAGEMENT_TEMPLATES: EncouragementTemplate[] = [
  {
    context: 'persisted',
    young: [
      'You kept trying! That was so brave.',
      'You didn\'t give up. That takes real courage.',
      'Wow, you tried again and again. That\'s amazing!',
    ],
    older: [
      'You kept trying even when it was hard. That takes real courage.',
      'Sticking with something difficult shows perseverance. That\'s Completed Staff Work.',
      'You didn\'t walk away from the challenge. That\'s what resilience looks like.',
    ],
  },
  {
    context: 'completed',
    young: [
      'You finished it! You should be so proud.',
      'All done! You worked so hard on that.',
      'Look at that -- you did the whole thing!',
    ],
    older: [
      'You saw it through to the end. That\'s ownership.',
      'Finishing what you start is a real strength. Nice work.',
      'You took responsibility and completed the whole thing.',
    ],
  },
  {
    context: 'improved',
    young: [
      'You\'re getting better! I can see it!',
      'Look how much you\'ve grown!',
      'You learned something new today!',
    ],
    older: [
      'You thought about that carefully. That\'s what wisdom looks like.',
      'Your growth is showing. You\'re stronger than you were yesterday.',
      'That improvement came from your effort -- no one else did that for you.',
    ],
  },
  {
    context: 'struggled',
    young: [
      'That was tricky, huh? It\'s okay. We can try again.',
      'Hard things help us grow. You\'re doing great.',
      'Even when it\'s tough, you\'re learning so much.',
    ],
    older: [
      'Struggling with something means you\'re growing. That\'s how it works.',
      'The hard parts are where the real learning happens.',
      'It\'s okay to find this difficult. What matters is you\'re here trying.',
    ],
  },
  {
    context: 'helped_sibling',
    young: [
      'You helped! That was so kind.',
      'Being a helper makes everyone\'s day better.',
      'You shared what you know. That\'s love.',
    ],
    older: [
      'Building something for your sibling is an act of service and love.',
      'Teaching others is one of the highest forms of understanding.',
      'When you help your family, you\'re living out what collaboration really means.',
    ],
  },
  {
    context: 'tried_new',
    young: [
      'You tried something new! How brave!',
      'Whoa, you\'re an explorer today!',
      'New things can be scary, but you did it!',
    ],
    older: [
      'Trying something outside your comfort zone shows real initiative.',
      'Adaptability means being willing to grow. You just showed that.',
      'Stepping into the unknown takes courage. That\'s leadership.',
    ],
  },
  {
    context: 'showed_care',
    young: [
      'You were so thoughtful. That made someone happy.',
      'Being kind is a superpower.',
      'You noticed someone needed help. That\'s special.',
    ],
    older: [
      'Caring about others shows integrity.',
      'Noticing what someone else needs -- that\'s real-world awareness.',
      'Empathy is a strength. You showed that today.',
    ],
  },
]

/**
 * Pick a random encouragement for the given context and age.
 */
export function getEncouragement(
  context: EncouragementContext,
  childAge: number,
): string {
  const template = ENCOURAGEMENT_TEMPLATES.find((t) => t.context === context)
  if (!template) return 'Great work today!'
  const pool = childAge <= 5 ? template.young : template.older
  return pool[Math.floor(Math.random() * pool.length)]
}

// ---------------------------------------------------------------------------
// 5. Service-Oriented Real-World Missions
// ---------------------------------------------------------------------------

export interface ServiceMission {
  trait: Trait
  young: string[]
  older: string[]
}

export const SERVICE_MISSIONS: ServiceMission[] = [
  {
    trait: 'understanding',
    young: [
      'Ask someone in your family about their favorite animal.',
      'Find a book and look at the pictures together with someone.',
    ],
    older: [
      'Teach a younger sibling one thing you learned today.',
      'Ask a family member to explain something they know well, then tell it back.',
    ],
  },
  {
    trait: 'organizing',
    young: [
      'Help put your toys back where they belong.',
      'Sort your crayons by color.',
    ],
    older: [
      'Help organize a shelf or drawer for someone in your family.',
      'Plan tomorrow\'s morning routine and write it down.',
    ],
  },
  {
    trait: 'problem_solving',
    young: [
      'Build something with blocks and show your family.',
      'Find two things that fit together like a puzzle.',
    ],
    older: [
      'Find a problem at home and come up with a solution to share.',
      'Help a sibling figure something out without giving them the answer.',
    ],
  },
  {
    trait: 'responsibility',
    young: [
      'Help set the table for dinner.',
      'Put your shoes away without being asked.',
    ],
    older: [
      'Do one chore today without being asked.',
      'Check on a family member and ask if they need help with anything.',
    ],
  },
  {
    trait: 'real_world',
    young: [
      'Go outside and find something you learned about today.',
      'Help someone in your family with a task.',
    ],
    older: [
      'Take what you practiced today and use it to help someone.',
      'Find a way to apply what you learned outside of the screen.',
    ],
  },
  {
    trait: 'adaptability',
    young: [
      'Try eating something new at your next meal.',
      'Play a game a different way than usual.',
    ],
    older: [
      'When plans change today, notice how you handle it.',
      'Try doing a familiar task in a completely new way.',
    ],
  },
]

/**
 * Get a service mission for a trait and age.
 */
export function getServiceMission(trait: Trait, childAge: number): string {
  const mission = SERVICE_MISSIONS.find((m) => m.trait === trait)
  if (!mission) return 'Help someone in your family today.'
  const pool = childAge <= 5 ? mission.young : mission.older
  return pool[Math.floor(Math.random() * pool.length)]
}
