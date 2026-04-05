/**
 * Engine-aware activity format.
 * Every activity targets ONE primary trait, specifies what to measure,
 * how to adapt, and includes a real-world extension.
 */

import type { Trait, DigitForm } from './types'

export type AdaptationAction =
  | 'increase_complexity'
  | 'new_scenario'
  | 'reduce_choices'
  | 'add_hints'
  | 'maintain'

export interface AdaptationRules {
  if_success: 'increase_complexity' | 'new_scenario'
  if_struggle: 'reduce_choices' | 'add_hints'
}

export interface EngineActivity {
  id: string
  title: string
  description: string
  type: 'built_in' | 'kylie_created'
  primary_trait: Trait
  level_target: number
  observable_signals: string[]
  adaptation_rules: AdaptationRules
  real_world_extension: string
  digit_form: DigitForm
  target_age_min: number
  target_age_max: number
}

/**
 * Observable signal names used across activities.
 */
export const OBSERVABLE_SIGNALS = [
  'accuracy',
  'attempt_count',
  'hint_count',
  'completion_time_seconds',
  'correct_placements',
  'reaction_time',
  'switch_success',
  'recovery_time',
  'clarity',
  'simplicity',
  'sibling_success_rate',
  'prediction_accuracy',
  'strategy_shift',
] as const

export type ObservableSignal = (typeof OBSERVABLE_SIGNALS)[number]
