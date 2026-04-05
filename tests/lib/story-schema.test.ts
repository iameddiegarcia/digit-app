import { describe, it, expect } from 'vitest'
import {
  createEmptyStory,
  generateNodeId,
  addNode,
  updateNodeText,
  updateNodeEmoji,
  toggleEnding,
  removeNode,
  validateStory,
  type StoryDocument,
} from '@/lib/story-schema'

describe('generateNodeId', () => {
  it('returns unique IDs', () => {
    const a = generateNodeId()
    const b = generateNodeId()
    expect(a).not.toBe(b)
  })

  it('returns strings starting with node_', () => {
    expect(generateNodeId()).toMatch(/^node_/)
  })
})

describe('createEmptyStory', () => {
  it('creates a story with one start node', () => {
    const story = createEmptyStory()
    expect(story.version).toBe(1)
    expect(story.nodes).toHaveLength(1)
    expect(story.nodes[0].id).toBe(story.startNodeId)
    expect(story.nodes[0].text).toBe('')
    expect(story.nodes[0].choices).toHaveLength(0)
    expect(story.nodes[0].isEnding).toBe(false)
  })
})

describe('addNode', () => {
  it('adds a child node with a choice', () => {
    const story = createEmptyStory()
    const updated = addNode(story, story.startNodeId, 'Go left')
    expect(updated.nodes).toHaveLength(2)
    const start = updated.nodes.find((n) => n.id === updated.startNodeId)!
    expect(start.choices).toHaveLength(1)
    expect(start.choices[0].label).toBe('Go left')
    const child = updated.nodes.find((n) => n.id === start.choices[0].nextNodeId)!
    expect(child.text).toBe('')
    expect(child.choices).toHaveLength(0)
  })

  it('unsets isEnding on parent when adding a choice', () => {
    let story = createEmptyStory()
    story = toggleEnding(story, story.startNodeId) // mark as ending
    expect(story.nodes[0].isEnding).toBe(true)
    const updated = addNode(story, story.startNodeId, 'Continue')
    const start = updated.nodes.find((n) => n.id === updated.startNodeId)!
    expect(start.isEnding).toBe(false)
  })

  it('does nothing for a nonexistent parent', () => {
    const story = createEmptyStory()
    const updated = addNode(story, 'fake_id', 'Go left')
    expect(updated.nodes).toHaveLength(1)
  })
})

describe('updateNodeText', () => {
  it('updates text on the target node', () => {
    const story = createEmptyStory()
    const updated = updateNodeText(story, story.startNodeId, 'Once upon a time')
    expect(updated.nodes[0].text).toBe('Once upon a time')
  })

  it('leaves other nodes unchanged', () => {
    let story = createEmptyStory()
    story = addNode(story, story.startNodeId, 'Go')
    const childId = story.nodes[1].id
    const updated = updateNodeText(story, story.startNodeId, 'Hello')
    expect(updated.nodes.find((n) => n.id === childId)!.text).toBe('')
  })
})

describe('updateNodeEmoji', () => {
  it('sets emoji on the target node', () => {
    const story = createEmptyStory()
    const updated = updateNodeEmoji(story, story.startNodeId, '')
    expect(updated.nodes[0].emoji).toBe('')
  })
})

describe('toggleEnding', () => {
  it('toggles isEnding on and off', () => {
    const story = createEmptyStory()
    const toggled = toggleEnding(story, story.startNodeId)
    expect(toggled.nodes[0].isEnding).toBe(true)
    const toggledBack = toggleEnding(toggled, story.startNodeId)
    expect(toggledBack.nodes[0].isEnding).toBe(false)
  })
})

describe('removeNode', () => {
  it('cannot remove the start node', () => {
    const story = createEmptyStory()
    const result = removeNode(story, story.startNodeId)
    expect(result.nodes).toHaveLength(1)
  })

  it('removes a child node and the choice pointing to it', () => {
    let story = createEmptyStory()
    story = addNode(story, story.startNodeId, 'Go')
    const childId = story.nodes[1].id
    const result = removeNode(story, childId)
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0].choices).toHaveLength(0)
  })

  it('removes descendants recursively', () => {
    let story = createEmptyStory()
    story = addNode(story, story.startNodeId, 'Go')
    const childId = story.nodes[1].id
    story = addNode(story, childId, 'Keep going')
    expect(story.nodes).toHaveLength(3)
    const result = removeNode(story, childId)
    expect(result.nodes).toHaveLength(1)
  })
})

describe('validateStory', () => {
  it('returns errors for empty story text', () => {
    const story = createEmptyStory()
    const errors = validateStory(story)
    expect(errors.some((e) => e.includes('has no text'))).toBe(true)
  })

  it('flags non-ending nodes without choices', () => {
    const story = createEmptyStory()
    const errors = validateStory(story)
    expect(errors.some((e) => e.includes('is not an ending but has no choices'))).toBe(true)
  })

  it('passes for a valid minimal story', () => {
    let story = createEmptyStory()
    story = updateNodeText(story, story.startNodeId, 'You see a frog.')
    story = toggleEnding(story, story.startNodeId)
    const errors = validateStory(story)
    expect(errors).toHaveLength(0)
  })

  it('passes for a branching story with endings', () => {
    let story = createEmptyStory()
    story = updateNodeText(story, story.startNodeId, 'A fork in the road.')
    story = addNode(story, story.startNodeId, 'Go left')
    story = addNode(story, story.startNodeId, 'Go right')
    const leftId = story.nodes[1].id
    const rightId = story.nodes[2].id
    story = updateNodeText(story, leftId, 'You found a pond!')
    story = updateNodeText(story, rightId, 'You found a tree!')
    story = toggleEnding(story, leftId)
    story = toggleEnding(story, rightId)
    const errors = validateStory(story)
    expect(errors).toHaveLength(0)
  })

  it('detects unreachable nodes', () => {
    const orphan = generateNodeId()
    const story: StoryDocument = {
      version: 1,
      startNodeId: 'start',
      nodes: [
        { id: 'start', text: 'Begin', emoji: '', choices: [], isEnding: true },
        { id: orphan, text: 'Orphan', emoji: '', choices: [], isEnding: true },
      ],
    }
    const errors = validateStory(story)
    expect(errors.some((e) => e.includes('unreachable'))).toBe(true)
  })

  it('detects choices pointing to missing nodes', () => {
    const story: StoryDocument = {
      version: 1,
      startNodeId: 'start',
      nodes: [
        { id: 'start', text: 'Begin', emoji: '', choices: [{ label: 'Go', nextNodeId: 'missing' }], isEnding: false },
      ],
    }
    const errors = validateStory(story)
    expect(errors.some((e) => e.includes('missing node'))).toBe(true)
  })
})
