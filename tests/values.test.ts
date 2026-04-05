import { describe, it, expect } from 'vitest'
import {
  PRINCIPLE_TRAIT_MAP,
  TRAIT_FOUNDATIONS,
  ENCOURAGEMENT_TEMPLATES,
  SERVICE_MISSIONS,
  principlesForTrait,
  foundationForTrait,
  getEncouragement,
  getServiceMission,
} from '@/lib/values'
import type { Trait } from '@/lib/types'

const ALL_TRAITS: Trait[] = [
  'understanding',
  'organizing',
  'problem_solving',
  'responsibility',
  'real_world',
  'adaptability',
]

describe('PRINCIPLE_TRAIT_MAP', () => {
  it('has all 12 principles', () => {
    expect(Object.keys(PRINCIPLE_TRAIT_MAP)).toHaveLength(12)
  })

  it('every mapped trait is a valid trait', () => {
    for (const traits of Object.values(PRINCIPLE_TRAIT_MAP)) {
      for (const t of traits) {
        expect(ALL_TRAITS).toContain(t)
      }
    }
  })

  it('every trait is covered by at least one principle', () => {
    const covered = new Set(Object.values(PRINCIPLE_TRAIT_MAP).flat())
    for (const t of ALL_TRAITS) {
      expect(covered).toContain(t)
    }
  })
})

describe('principlesForTrait', () => {
  it('returns principles for responsibility', () => {
    const principles = principlesForTrait('responsibility')
    expect(principles.length).toBeGreaterThanOrEqual(3) // responsibility, accountability, ownership, etc.
    expect(principles).toContain('responsibility')
  })
})

describe('TRAIT_FOUNDATIONS', () => {
  it('has a foundation for every trait', () => {
    for (const t of ALL_TRAITS) {
      const found = foundationForTrait(t)
      expect(found).toBeDefined()
      expect(found.scripture).toBeTruthy()
      expect(found.reference).toBeTruthy()
      expect(found.meaning).toBeTruthy()
    }
  })
})

describe('ENCOURAGEMENT_TEMPLATES', () => {
  it('has templates for all contexts', () => {
    const contexts = [
      'persisted', 'completed', 'improved', 'struggled',
      'helped_sibling', 'tried_new', 'showed_care',
    ]
    for (const ctx of contexts) {
      const template = ENCOURAGEMENT_TEMPLATES.find((t) => t.context === ctx)
      expect(template).toBeDefined()
      expect(template!.young.length).toBeGreaterThan(0)
      expect(template!.older.length).toBeGreaterThan(0)
    }
  })

  it('no template says "Good job" (character-focused, not generic)', () => {
    for (const template of ENCOURAGEMENT_TEMPLATES) {
      for (const msg of [...template.young, ...template.older]) {
        expect(msg.toLowerCase()).not.toContain('good job')
      }
    }
  })
})

describe('getEncouragement', () => {
  it('returns a young-age string for age 3', () => {
    const msg = getEncouragement('persisted', 3)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('returns an older string for age 10', () => {
    const msg = getEncouragement('completed', 10)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('returns fallback for unknown context', () => {
    const msg = getEncouragement('nonexistent' as never, 5)
    expect(msg).toBe('Great work today!')
  })
})

describe('SERVICE_MISSIONS', () => {
  it('has missions for every trait', () => {
    for (const t of ALL_TRAITS) {
      const mission = SERVICE_MISSIONS.find((m) => m.trait === t)
      expect(mission).toBeDefined()
      expect(mission!.young.length).toBeGreaterThan(0)
      expect(mission!.older.length).toBeGreaterThan(0)
    }
  })
})

describe('getServiceMission', () => {
  it('returns a string for young children', () => {
    const msg = getServiceMission('understanding', 3)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('returns a string for older children', () => {
    const msg = getServiceMission('problem_solving', 10)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })
})
