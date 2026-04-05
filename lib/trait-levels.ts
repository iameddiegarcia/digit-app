/**
 * Trait Level Definitions (0-5) per trait with behavioral descriptions.
 * Sourced from digit_trait_engine_full.md.
 */

import type { Trait } from './types'

export interface LevelDefinition {
  level: number
  label: string
  description: string
}

export type TraitLevelMap = Record<Trait, LevelDefinition[]>

export const TRAIT_LEVELS: TraitLevelMap = {
  understanding: [
    { level: 0, label: 'Random Reaction', description: 'Responds randomly with no evidence of comprehension.' },
    { level: 1, label: 'Recognition', description: 'Recognizes familiar objects, sounds, or concepts when presented.' },
    { level: 2, label: 'Correct Matching', description: 'Correctly matches related items or concepts with consistency.' },
    { level: 3, label: 'Contextual Understanding', description: 'Understands concepts in context and can answer simple why questions.' },
    { level: 4, label: 'Transfer', description: 'Applies understanding to new and unfamiliar scenarios.' },
    { level: 5, label: 'Teaches Others', description: 'Can explain a concept clearly enough for someone else to learn it.' },
  ],
  organizing: [
    { level: 0, label: 'No Structure', description: 'No attempt to group, sort, or order items.' },
    { level: 1, label: 'Basic Grouping', description: 'Groups items by a single obvious attribute (color, size).' },
    { level: 2, label: 'Single Rule Sorting', description: 'Sorts items consistently by one stated rule.' },
    { level: 3, label: 'Hidden Rule Sorting', description: 'Discovers and applies sorting rules that are not explicitly stated.' },
    { level: 4, label: 'Multi-Step Organization', description: 'Organizes using multiple criteria or sequential steps.' },
    { level: 5, label: 'System Creation', description: 'Creates organizational systems that others can follow.' },
  ],
  problem_solving: [
    { level: 0, label: 'Random / Quits', description: 'Guesses randomly or quits immediately when stuck.' },
    { level: 1, label: 'Solves with Help', description: 'Can reach a solution when given hints or guidance.' },
    { level: 2, label: 'One-Step Solution', description: 'Solves simple one-step problems independently.' },
    { level: 3, label: 'Multi-Step', description: 'Works through problems requiring multiple sequential steps.' },
    { level: 4, label: 'Adapts Strategy', description: 'Recognizes when a strategy is not working and switches approach.' },
    { level: 5, label: 'Creates Problems', description: 'Designs challenges for others and predicts difficulty accurately.' },
  ],
  responsibility: [
    { level: 0, label: 'Avoids', description: 'Avoids tasks or does not engage with responsibilities.' },
    { level: 1, label: 'Needs Reminders', description: 'Completes tasks only when reminded or prompted.' },
    { level: 2, label: 'Completes with Help', description: 'Follows through on responsibilities with some assistance.' },
    { level: 3, label: 'Independent', description: 'Handles responsibilities independently without reminders.' },
    { level: 4, label: 'Proactive', description: 'Anticipates what needs to be done and acts without being asked.' },
    { level: 5, label: 'Leads Others', description: 'Takes ownership and helps others fulfill their responsibilities.' },
  ],
  real_world: [
    { level: 0, label: 'Screen Only', description: 'Engagement is limited to the screen with no real-world connection.' },
    { level: 1, label: 'Recognizes Real World', description: 'Notices connections between activities and the real world.' },
    { level: 2, label: 'Finds Objects/Actions', description: 'Completes simple real-world missions (find, show, bring).' },
    { level: 3, label: 'Connects Concepts', description: 'Links learning concepts to real-world situations independently.' },
    { level: 4, label: 'Applies Learning', description: 'Uses what was learned to solve real-world problems.' },
    { level: 5, label: 'Initiates Learning', description: 'Seeks out real-world learning opportunities without prompting.' },
  ],
  adaptability: [
    { level: 0, label: 'Breaks Down', description: 'Cannot handle changes in rules or expectations.' },
    { level: 1, label: 'Accepts with Help', description: 'Adjusts to changes when given support and encouragement.' },
    { level: 2, label: 'Adjusts with Prompt', description: 'Adapts to rule changes after a brief prompt or reminder.' },
    { level: 3, label: 'Adjusts Independently', description: 'Handles changes in rules or context without assistance.' },
    { level: 4, label: 'Flexible Strategy', description: 'Proactively adjusts strategy when conditions change.' },
    { level: 5, label: 'Anticipates Change', description: 'Predicts when changes might occur and prepares in advance.' },
  ],
}

/**
 * Get the level definition for a trait at a specific level.
 */
export function getLevelDefinition(trait: Trait, level: number): LevelDefinition {
  const levels = TRAIT_LEVELS[trait]
  const clamped = Math.max(0, Math.min(5, level))
  return levels[clamped]
}

/**
 * Get all level definitions for a trait.
 */
export function getLevelsForTrait(trait: Trait): LevelDefinition[] {
  return TRAIT_LEVELS[trait]
}
