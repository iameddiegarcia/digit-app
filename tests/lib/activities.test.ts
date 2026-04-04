import { describe, it, expect } from 'vitest'
import { ACTIVITIES, getActivitiesForAge } from '@/lib/activities'

describe('activities', () => {
  it('has exactly 3 built-in activities', () => {
    expect(ACTIVITIES).toHaveLength(3)
  })

  it('Color Explorer targets understanding and organizing', () => {
    const colorExplorer = ACTIVITIES.find(a => a.id === 'color-explorer')!
    expect(colorExplorer.traits).toEqual(['understanding', 'organizing'])
    expect(colorExplorer.digit_form).toBe('explorer')
  })

  it('Shape Builder targets problem_solving and organizing', () => {
    const shapeBuilder = ACTIVITIES.find(a => a.id === 'shape-builder')!
    expect(shapeBuilder.traits).toEqual(['problem_solving', 'organizing'])
    expect(shapeBuilder.digit_form).toBe('builder')
  })

  it('Story Tap targets understanding and adaptability', () => {
    const storyTap = ACTIVITIES.find(a => a.id === 'story-tap')!
    expect(storyTap.traits).toEqual(['understanding', 'adaptability'])
    expect(storyTap.digit_form).toBe('story')
  })

  it('getActivitiesForAge returns all 3 for age 3', () => {
    const result = getActivitiesForAge(3)
    expect(result).toHaveLength(3)
  })

  it('getActivitiesForAge returns all 3 for age 2', () => {
    const result = getActivitiesForAge(2)
    expect(result).toHaveLength(3)
  })
})
