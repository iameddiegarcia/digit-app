import { describe, it, expect } from 'vitest'
import { TRAIT_LEVELS, getLevelDefinition, getLevelsForTrait } from '@/lib/trait-levels'
import type { Trait } from '@/lib/types'

const ALL_TRAITS: Trait[] = [
  'understanding',
  'organizing',
  'problem_solving',
  'responsibility',
  'real_world',
  'adaptability',
]

describe('TRAIT_LEVELS', () => {
  it('defines all 6 traits', () => {
    for (const t of ALL_TRAITS) {
      expect(TRAIT_LEVELS[t]).toBeDefined()
    }
  })

  it('each trait has exactly 6 levels (0-5)', () => {
    for (const t of ALL_TRAITS) {
      const levels = TRAIT_LEVELS[t]
      expect(levels).toHaveLength(6)
      for (let i = 0; i <= 5; i++) {
        expect(levels[i].level).toBe(i)
      }
    }
  })

  it('each level has a label and description', () => {
    for (const t of ALL_TRAITS) {
      for (const ld of TRAIT_LEVELS[t]) {
        expect(ld.label).toBeTruthy()
        expect(ld.description).toBeTruthy()
      }
    }
  })
})

describe('getLevelDefinition', () => {
  it('returns the correct level for a trait', () => {
    const def = getLevelDefinition('problem_solving', 3)
    expect(def.level).toBe(3)
    expect(def.label).toBe('Multi-Step')
  })

  it('clamps out-of-range levels', () => {
    const high = getLevelDefinition('understanding', 10)
    expect(high.level).toBe(5)

    const low = getLevelDefinition('understanding', -1)
    expect(low.level).toBe(0)
  })
})

describe('getLevelsForTrait', () => {
  it('returns all 6 levels', () => {
    const levels = getLevelsForTrait('adaptability')
    expect(levels).toHaveLength(6)
  })
})
