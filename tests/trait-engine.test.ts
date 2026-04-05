import { describe, it, expect } from 'vitest'
import {
  calculateEvidenceScore,
  determineLevel,
  getAdaptation,
  computeTrend,
  WEIGHTS,
} from '@/lib/trait-engine'

describe('calculateEvidenceScore', () => {
  it('returns perfect score for perfect signals', () => {
    const result = calculateEvidenceScore({
      accuracy: 1.0,
      hints: 0,
      attempts: 3,
      abandoned: false,
      flexibility: 1.0,
      expectedAttempts: 3,
    })
    expect(result.evidenceScore).toBe(1.0)
    expect(result.components.accuracy).toBe(1.0)
    expect(result.components.independence).toBe(1.0)
    expect(result.components.persistence).toBe(1.0)
    expect(result.components.flexibility).toBe(1.0)
  })

  it('returns 0 for abandoned attempt with 0 accuracy', () => {
    const result = calculateEvidenceScore({
      accuracy: 0,
      hints: 3,
      attempts: 3,
      abandoned: true,
      flexibility: 0,
    })
    expect(result.evidenceScore).toBe(0)
  })

  it('penalizes hints via independence', () => {
    const noHints = calculateEvidenceScore({
      accuracy: 0.8,
      hints: 0,
      attempts: 4,
      abandoned: false,
    })
    const withHints = calculateEvidenceScore({
      accuracy: 0.8,
      hints: 2,
      attempts: 4,
      abandoned: false,
    })
    expect(noHints.evidenceScore).toBeGreaterThan(withHints.evidenceScore)
    expect(noHints.components.independence).toBe(1.0)
    expect(withHints.components.independence).toBe(0.5)
  })

  it('sets persistence to 0 when abandoned', () => {
    const result = calculateEvidenceScore({
      accuracy: 0.9,
      hints: 0,
      attempts: 2,
      abandoned: true,
    })
    expect(result.components.persistence).toBe(0)
  })

  it('defaults flexibility to 0.5 when not provided', () => {
    const result = calculateEvidenceScore({
      accuracy: 0.5,
      hints: 0,
      attempts: 3,
      abandoned: false,
    })
    expect(result.components.flexibility).toBe(0.5)
  })

  it('clamps values to 0-1 range', () => {
    const result = calculateEvidenceScore({
      accuracy: 1.5,
      hints: -1,
      attempts: 10,
      abandoned: false,
      flexibility: 2.0,
      expectedAttempts: 3,
    })
    expect(result.components.accuracy).toBe(1.0)
    expect(result.components.flexibility).toBe(1.0)
    expect(result.components.persistence).toBeLessThanOrEqual(1.0)
  })

  it('uses canonical weights (0.35/0.25/0.20/0.20)', () => {
    expect(WEIGHTS.accuracy).toBe(0.35)
    expect(WEIGHTS.independence).toBe(0.25)
    expect(WEIGHTS.persistence).toBe(0.20)
    expect(WEIGHTS.flexibility).toBe(0.20)
    expect(
      WEIGHTS.accuracy + WEIGHTS.independence + WEIGHTS.persistence + WEIGHTS.flexibility,
    ).toBe(1.0)
  })
})

describe('determineLevel', () => {
  it('levels up at 0.85+', () => {
    const result = determineLevel(0.85, 2)
    expect(result.newLevel).toBe(3)
    expect(result.changed).toBe(true)
  })

  it('levels down below 0.3', () => {
    const result = determineLevel(0.29, 3)
    expect(result.newLevel).toBe(2)
    expect(result.changed).toBe(true)
  })

  it('stays the same in the middle range', () => {
    const result = determineLevel(0.6, 3)
    expect(result.newLevel).toBe(3)
    expect(result.changed).toBe(false)
  })

  it('does not exceed level 5', () => {
    const result = determineLevel(0.95, 5)
    expect(result.newLevel).toBe(5)
    expect(result.changed).toBe(false)
  })

  it('does not go below level 0', () => {
    const result = determineLevel(0.1, 0)
    expect(result.newLevel).toBe(0)
    expect(result.changed).toBe(false)
  })

  it('at exactly 0.3 does not level down', () => {
    const result = determineLevel(0.3, 2)
    expect(result.newLevel).toBe(2)
  })
})

describe('getAdaptation', () => {
  it('returns increase_complexity for high scores', () => {
    expect(getAdaptation(0.9)).toBe('increase_complexity')
    expect(getAdaptation(0.8)).toBe('increase_complexity')
  })

  it('returns reduce_choices for low scores', () => {
    expect(getAdaptation(0.2)).toBe('reduce_choices')
    expect(getAdaptation(0.39)).toBe('reduce_choices')
  })

  it('returns maintain for mid-range scores', () => {
    expect(getAdaptation(0.5)).toBe('maintain')
    expect(getAdaptation(0.7)).toBe('maintain')
    expect(getAdaptation(0.4)).toBe('maintain')
  })
})

describe('computeTrend', () => {
  it('returns stable for insufficient data', () => {
    expect(computeTrend([])).toBe('stable')
    expect(computeTrend([0.5])).toBe('stable')
  })

  it('returns improving when second half is higher', () => {
    expect(computeTrend([0.3, 0.4, 0.6, 0.7])).toBe('improving')
  })

  it('returns declining when second half is lower', () => {
    expect(computeTrend([0.7, 0.8, 0.4, 0.3])).toBe('declining')
  })

  it('returns stable when difference is small', () => {
    expect(computeTrend([0.5, 0.5, 0.55, 0.55])).toBe('stable')
  })
})
