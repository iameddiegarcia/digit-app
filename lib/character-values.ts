/**
 * NT Christian Values — Character Formation Dimension
 *
 * Separate from the 6 developmental traits.
 * Based on the teachings of Christ in the New Testament.
 * Tracks spiritual/character formation for all family members.
 */

// ---------------------------------------------------------------------------
// 1. Character Trait Definitions
// ---------------------------------------------------------------------------

export type CharacterTrait =
  | 'love'
  | 'joy'
  | 'peace'
  | 'patience'
  | 'kindness'
  | 'goodness'
  | 'faithfulness'
  | 'gentleness'
  | 'self_control'

export const CHARACTER_TRAIT_LABELS: Record<CharacterTrait, string> = {
  love: 'Love',
  joy: 'Joy',
  peace: 'Peace',
  patience: 'Patience',
  kindness: 'Kindness',
  goodness: 'Goodness',
  faithfulness: 'Faithfulness',
  gentleness: 'Gentleness',
  self_control: 'Self-Control',
}

export const ALL_CHARACTER_TRAITS: CharacterTrait[] = [
  'love', 'joy', 'peace', 'patience', 'kindness',
  'goodness', 'faithfulness', 'gentleness', 'self_control',
]

// ---------------------------------------------------------------------------
// 2. Scriptural Foundations — Fruit of the Spirit (Galatians 5:22-23)
// ---------------------------------------------------------------------------

export interface CharacterFoundation {
  trait: CharacterTrait
  scripture: string
  reference: string
  meaning: string
  childFriendly: string // age-appropriate explanation
}

export const CHARACTER_FOUNDATIONS: CharacterFoundation[] = [
  {
    trait: 'love',
    scripture: 'Love is patient, love is kind. It does not envy, it does not boast.',
    reference: '1 Corinthians 13:4',
    meaning: 'Choosing others above yourself — the foundation of all virtues.',
    childFriendly: 'Caring about others and showing it.',
  },
  {
    trait: 'joy',
    scripture: 'Rejoice in the Lord always. I will say it again: Rejoice!',
    reference: 'Philippians 4:4',
    meaning: 'Deep gladness rooted in faith, not circumstances.',
    childFriendly: 'Being happy even when things are hard.',
  },
  {
    trait: 'peace',
    scripture: 'Blessed are the peacemakers, for they will be called children of God.',
    reference: 'Matthew 5:9',
    meaning: 'Choosing calm over conflict, trust over worry.',
    childFriendly: 'Helping people get along and staying calm.',
  },
  {
    trait: 'patience',
    scripture: 'Be still before the Lord and wait patiently for him.',
    reference: 'Psalm 37:7',
    meaning: 'Enduring difficulty without losing heart.',
    childFriendly: 'Waiting without getting upset.',
  },
  {
    trait: 'kindness',
    scripture: 'Be kind and compassionate to one another.',
    reference: 'Ephesians 4:32',
    meaning: 'Active generosity of spirit toward others.',
    childFriendly: 'Being nice and helpful to everyone.',
  },
  {
    trait: 'goodness',
    scripture: 'Let your light shine before others, that they may see your good deeds.',
    reference: 'Matthew 5:16',
    meaning: 'Doing what is right because it is right.',
    childFriendly: 'Doing the right thing even when nobody is watching.',
  },
  {
    trait: 'faithfulness',
    scripture: 'Well done, good and faithful servant!',
    reference: 'Matthew 25:21',
    meaning: 'Being reliable and keeping your word.',
    childFriendly: 'Doing what you said you would do.',
  },
  {
    trait: 'gentleness',
    scripture: 'A gentle answer turns away wrath.',
    reference: 'Proverbs 15:1',
    meaning: 'Strength under control — responding with grace.',
    childFriendly: 'Being soft and careful with your words and hands.',
  },
  {
    trait: 'self_control',
    scripture: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    reference: '2 Timothy 1:7',
    meaning: 'Mastery over impulse — choosing wisely.',
    childFriendly: 'Stopping and thinking before you act.',
  },
]

export function characterFoundation(trait: CharacterTrait): CharacterFoundation {
  return CHARACTER_FOUNDATIONS.find((f) => f.trait === trait)!
}

// ---------------------------------------------------------------------------
// 3. Character Observation Categories
// ---------------------------------------------------------------------------

/**
 * Parents observe these in daily life — not scored by activities,
 * but by real-world observation. This is formation, not performance.
 */
export type ObservationContext =
  | 'showed_love'       // acted selflessly
  | 'expressed_joy'     // found joy in difficulty
  | 'made_peace'        // resolved conflict
  | 'showed_patience'   // waited without complaint
  | 'was_kind'          // acted generously
  | 'did_good'          // chose right over easy
  | 'kept_promise'      // followed through
  | 'was_gentle'        // controlled strength
  | 'showed_control'    // resisted impulse

export const OBSERVATION_TO_TRAIT: Record<ObservationContext, CharacterTrait> = {
  showed_love: 'love',
  expressed_joy: 'joy',
  made_peace: 'peace',
  showed_patience: 'patience',
  was_kind: 'kindness',
  did_good: 'goodness',
  kept_promise: 'faithfulness',
  was_gentle: 'gentleness',
  showed_control: 'self_control',
}

// ---------------------------------------------------------------------------
// 4. Character Encouragement (age-aware)
// ---------------------------------------------------------------------------

export interface CharacterEncouragement {
  trait: CharacterTrait
  young: string[]  // 2-4
  older: string[]  // 8-12
}

export const CHARACTER_ENCOURAGEMENTS: CharacterEncouragement[] = [
  {
    trait: 'love',
    young: ['You shared with love!', 'You made someone feel so special.'],
    older: ['That was selfless — real love puts others first.', 'You showed love through your actions, not just words.'],
  },
  {
    trait: 'joy',
    young: ['Your smile lights up the room!', 'You found something happy even in a tough moment.'],
    older: ['Choosing joy when things are hard takes real strength.', 'Your joy comes from something deeper than circumstances.'],
  },
  {
    trait: 'peace',
    young: ['You helped everyone be friends again!', 'You stayed calm — that was so grown up.'],
    older: ['Being a peacemaker takes courage.', 'You chose peace over being right. That\'s wisdom.'],
  },
  {
    trait: 'patience',
    young: ['You waited so well!', 'Being patient is really hard, and you did it!'],
    older: ['Patience is strength — you showed that today.', 'Waiting without complaining shows real maturity.'],
  },
  {
    trait: 'kindness',
    young: ['That was so kind!', 'You made someone\'s day better.'],
    older: ['Kindness changes the world around you.', 'You noticed what someone needed and acted on it.'],
  },
  {
    trait: 'goodness',
    young: ['You did the right thing!', 'That was really good of you.'],
    older: ['Doing right when no one\'s watching — that\'s integrity.', 'You chose goodness over convenience.'],
  },
  {
    trait: 'faithfulness',
    young: ['You kept your promise!', 'People can count on you!'],
    older: ['Being faithful in small things prepares you for big ones.', 'Your word means something. That matters.'],
  },
  {
    trait: 'gentleness',
    young: ['You were so gentle!', 'Soft hands and soft words — that\'s strength.'],
    older: ['Gentleness isn\'t weakness — it\'s power under control.', 'You responded with grace. That takes character.'],
  },
  {
    trait: 'self_control',
    young: ['You stopped and thought first!', 'You controlled your body — great job!'],
    older: ['Self-control is the root of all discipline.', 'You chose wisely instead of reacting. That\'s growth.'],
  },
]

export function getCharacterEncouragement(trait: CharacterTrait, childAge: number): string {
  const entry = CHARACTER_ENCOURAGEMENTS.find((e) => e.trait === trait)
  if (!entry) return 'You showed great character today!'
  const pool = childAge <= 5 ? entry.young : entry.older
  return pool[Math.floor(Math.random() * pool.length)]
}

// ---------------------------------------------------------------------------
// 5. Character Profile Type
// ---------------------------------------------------------------------------

export interface CharacterTraitProfile {
  id: string
  child_id: string
  trait: CharacterTrait
  current_level: number  // 0-5
  observations_count: number
  last_observed_at: string | null
}
