import type { Activity } from './types'

export const ACTIVITIES: Activity[] = [
  // Ages 2-4: Original activities
  {
    id: 'color-explorer',
    title: 'Color Explorer',
    description: 'Find and match the colors with Digit!',
    type: 'built_in',
    target_age_min: 2,
    target_age_max: 4,
    traits: ['understanding', 'organizing'],
    digit_form: 'explorer',
  },
  {
    id: 'shape-builder',
    title: 'Shape Builder',
    description: 'Drag shapes to build a picture!',
    type: 'built_in',
    target_age_min: 2,
    target_age_max: 4,
    traits: ['problem_solving', 'organizing'],
    digit_form: 'builder',
  },
  {
    id: 'story-tap',
    title: 'Story Tap',
    description: 'Tap to make the story come alive!',
    type: 'built_in',
    target_age_min: 2,
    target_age_max: 4,
    traits: ['understanding', 'adaptability'],
    digit_form: 'story',
  },

  // Emily (age 2) — Phase 2
  {
    id: 'tap-the-sound',
    title: 'Tap the Sound',
    description: 'Hear a sound and find the right animal!',
    type: 'built_in',
    target_age_min: 1,
    target_age_max: 3,
    traits: ['understanding'],
    digit_form: 'explorer',
  },
  {
    id: 'opposite-game',
    title: 'Opposite Game',
    description: 'Tap big things, then switch to small!',
    type: 'built_in',
    target_age_min: 1,
    target_age_max: 3,
    traits: ['adaptability'],
    digit_form: 'explorer',
  },

  // Santi (age 3) — Phase 2
  {
    id: 'pattern-breaker',
    title: 'Pattern Breaker',
    description: 'Figure out what comes next in the pattern!',
    type: 'built_in',
    target_age_min: 3,
    target_age_max: 5,
    traits: ['problem_solving'],
    digit_form: 'scientist',
  },
  {
    id: 'sort-it',
    title: 'Sort It',
    description: 'Put each item in the right box!',
    type: 'built_in',
    target_age_min: 2,
    target_age_max: 4,
    traits: ['organizing'],
    digit_form: 'builder',
  },

  // Kylie (age 10) — Phase 2
  {
    id: 'teach-digit',
    title: 'Teach Digit',
    description: 'Explain a concept and Digit will score how clear you are!',
    type: 'built_in',
    target_age_min: 8,
    target_age_max: 12,
    traits: ['understanding'],
    digit_form: 'story',
  },
  {
    id: 'build-puzzle',
    title: 'Build Puzzle',
    description: 'Create patterns and predict how hard they are!',
    type: 'built_in',
    target_age_min: 8,
    target_age_max: 12,
    traits: ['problem_solving'],
    digit_form: 'builder',
  },
]

export function getActivitiesForAge(age: number): Activity[] {
  return ACTIVITIES.filter(
    (a) => age >= a.target_age_min && age <= a.target_age_max
  )
}
