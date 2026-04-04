import type { Activity } from './types'

export const ACTIVITIES: Activity[] = [
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
]

export function getActivitiesForAge(age: number): Activity[] {
  return ACTIVITIES.filter(
    (a) => age >= a.target_age_min && age <= a.target_age_max
  )
}
