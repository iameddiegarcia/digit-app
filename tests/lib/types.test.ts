import { describe, it, expect } from 'vitest'
import type { Child, Session, Activity, Trait, DigitForm, DigitState } from '@/lib/types'

describe('types', () => {
  it('Trait enum contains all 6 traits', () => {
    const traits: Trait[] = [
      'understanding', 'organizing', 'problem_solving',
      'responsibility', 'real_world', 'adaptability'
    ]
    expect(traits).toHaveLength(6)
  })

  it('Child type has required fields', () => {
    const child: Child = {
      id: '1',
      family_id: '1',
      name: 'Santiago',
      nickname: 'Santi',
      birth_date: '2023-01-15',
      digit_config: {
        base_form: 'round_bot',
        color: '#60A5FA',
      },
    }
    expect(child.nickname).toBe('Santi')
    expect(child.digit_config.base_form).toBe('round_bot')
  })

  it('Activity type maps traits correctly', () => {
    const activity: Activity = {
      id: 'color-explorer',
      title: 'Color Explorer',
      description: 'Match the colors!',
      type: 'built_in',
      target_age_min: 2,
      target_age_max: 4,
      traits: ['understanding', 'organizing'],
      digit_form: 'explorer',
    }
    expect(activity.traits).toContain('understanding')
    expect(activity.traits).toContain('organizing')
  })
})
