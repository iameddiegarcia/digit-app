// Story document manipulation helpers for the branching choice narrative system.

export interface StoryChoice {
  label: string
  nextNodeId: string
}

export interface StoryNode {
  id: string
  text: string
  emoji: string
  choices: StoryChoice[]
  isEnding: boolean
}

export interface StoryDocument {
  version: 1
  nodes: StoryNode[]
  startNodeId: string
}

let _counter = 0

export function generateNodeId(): string {
  _counter++
  return `node_${Date.now().toString(36)}_${_counter.toString(36)}`
}

export function createEmptyStory(): StoryDocument {
  const startId = generateNodeId()
  return {
    version: 1,
    startNodeId: startId,
    nodes: [
      {
        id: startId,
        text: '',
        emoji: '',
        choices: [],
        isEnding: false,
      },
    ],
  }
}

function findNode(story: StoryDocument, nodeId: string): StoryNode | undefined {
  return story.nodes.find((n) => n.id === nodeId)
}

export function addNode(
  story: StoryDocument,
  parentNodeId: string,
  choiceLabel: string
): StoryDocument {
  const parent = findNode(story, parentNodeId)
  if (!parent) return story

  const newId = generateNodeId()
  const newNode: StoryNode = {
    id: newId,
    text: '',
    emoji: '',
    choices: [],
    isEnding: false,
  }

  const updatedParent: StoryNode = {
    ...parent,
    isEnding: false,
    choices: [...parent.choices, { label: choiceLabel, nextNodeId: newId }],
  }

  return {
    ...story,
    nodes: story.nodes.map((n) => (n.id === parentNodeId ? updatedParent : n)).concat(newNode),
  }
}

export function updateNodeText(
  story: StoryDocument,
  nodeId: string,
  text: string
): StoryDocument {
  return {
    ...story,
    nodes: story.nodes.map((n) => (n.id === nodeId ? { ...n, text } : n)),
  }
}

export function updateNodeEmoji(
  story: StoryDocument,
  nodeId: string,
  emoji: string
): StoryDocument {
  return {
    ...story,
    nodes: story.nodes.map((n) => (n.id === nodeId ? { ...n, emoji } : n)),
  }
}

export function toggleEnding(story: StoryDocument, nodeId: string): StoryDocument {
  return {
    ...story,
    nodes: story.nodes.map((n) =>
      n.id === nodeId ? { ...n, isEnding: !n.isEnding } : n
    ),
  }
}

export function removeNode(story: StoryDocument, nodeId: string): StoryDocument {
  // Cannot remove the start node
  if (nodeId === story.startNodeId) return story

  // Collect all descendant node IDs to remove
  const toRemove = new Set<string>()
  function collectDescendants(id: string) {
    toRemove.add(id)
    const node = findNode(story, id)
    if (node) {
      for (const choice of node.choices) {
        if (!toRemove.has(choice.nextNodeId)) {
          collectDescendants(choice.nextNodeId)
        }
      }
    }
  }
  collectDescendants(nodeId)

  // Remove the node and all descendants, strip choices that pointed to removed nodes
  return {
    ...story,
    nodes: story.nodes
      .filter((n) => !toRemove.has(n.id))
      .map((n) => ({
        ...n,
        choices: n.choices.filter((c) => !toRemove.has(c.nextNodeId)),
      })),
  }
}

export function validateStory(story: StoryDocument): string[] {
  const errors: string[] = []

  if (story.nodes.length === 0) {
    errors.push('Story has no nodes')
    return errors
  }

  const startNode = findNode(story, story.startNodeId)
  if (!startNode) {
    errors.push('Start node not found')
  }

  const nodeIds = new Set(story.nodes.map((n) => n.id))

  for (const node of story.nodes) {
    if (!node.text.trim()) {
      errors.push(`Node "${node.id}" has no text`)
    }

    if (!node.isEnding && node.choices.length === 0) {
      errors.push(`Node "${node.id}" is not an ending but has no choices`)
    }

    for (const choice of node.choices) {
      if (!choice.label.trim()) {
        errors.push(`A choice in node "${node.id}" has no label`)
      }
      if (!nodeIds.has(choice.nextNodeId)) {
        errors.push(`Choice in node "${node.id}" points to missing node "${choice.nextNodeId}"`)
      }
    }
  }

  // Check for unreachable nodes (except start)
  const reachable = new Set<string>()
  function walk(id: string) {
    if (reachable.has(id)) return
    reachable.add(id)
    const node = findNode(story, id)
    if (node) {
      for (const c of node.choices) walk(c.nextNodeId)
    }
  }
  walk(story.startNodeId)

  for (const node of story.nodes) {
    if (!reachable.has(node.id)) {
      errors.push(`Node "${node.id}" is unreachable from the start`)
    }
  }

  return errors
}
