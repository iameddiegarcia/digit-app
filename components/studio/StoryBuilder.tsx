'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Trait } from '@/lib/types'
import {
  createEmptyStory,
  addNode,
  updateNodeText,
  updateNodeEmoji,
  toggleEnding,
  removeNode,
  validateStory,
  type StoryDocument,
  type StoryNode,
} from '@/lib/story-schema'

const TRAITS: Trait[] = ['understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']
const EMOJI_PICKS = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

interface StoryBuilderProps {
  creationId: string | null
}

type ViewMode = 'edit' | 'preview'

export function StoryBuilder({ creationId }: StoryBuilderProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [story, setStory] = useState<StoryDocument>(createEmptyStory)
  const [primaryTrait, setPrimaryTrait] = useState<Trait>('understanding')
  const [ageMin, setAgeMin] = useState(2)
  const [ageMax, setAgeMax] = useState(5)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'draft' | 'review'>('draft')
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [newChoiceLabel, setNewChoiceLabel] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const isNew = !creationId
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedRef = useRef(false)

  // Select the start node by default
  useEffect(() => {
    if (!selectedNodeId && story.nodes.length > 0) {
      setSelectedNodeId(story.startNodeId)
    }
  }, [story.startNodeId])

  // Load existing creation
  useEffect(() => {
    if (!isNew && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadCreation()
    }
  }, [creationId])

  async function loadCreation() {
    const res = await fetch(`/api/studio/creations/${creationId}`)
    if (res.ok) {
      const { creation } = await res.json()
      setTitle(creation.title)
      setPrimaryTrait(creation.primary_trait || 'understanding')
      setAgeMin(creation.target_age_min)
      setAgeMax(creation.target_age_max)
      setStatus(creation.status)
      if (creation.content?.version === 1 && creation.content?.nodes) {
        setStory(creation.content as StoryDocument)
        setSelectedNodeId(creation.content.startNodeId)
      }
    }
  }

  // Auto-save drafts every 15 seconds of inactivity
  const scheduleAutoSave = useCallback(() => {
    if (status === 'review') return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (!isNew) handleSave(false, true)
    }, 15000)
  }, [isNew, status])

  useEffect(() => {
    scheduleAutoSave()
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [story, title, primaryTrait, ageMin, ageMax])

  async function handleSave(submitForReview = false, silent = false) {
    if (!silent) setSaving(true)
    const body = {
      title: title || 'Untitled Story',
      type: 'story',
      content: story,
      primary_trait: primaryTrait,
      target_age_min: ageMin,
      target_age_max: ageMax,
      ...(submitForReview ? { status: 'review' } : {}),
    }

    const url = isNew ? '/api/studio/creations' : `/api/studio/creations/${creationId}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      const data = await res.json()
      if (isNew && data.creation?.id) {
        router.replace(`/studio/stories/${data.creation.id}`)
      }
      if (submitForReview) setStatus('review')
      setLastSaved(new Date())
    }
    if (!silent) setSaving(false)
  }

  const selectedNode = story.nodes.find((n) => n.id === selectedNodeId) ?? null
  const validationErrors = validateStory(story)

  // --- Story manipulation wrappers ---
  function handleUpdateText(text: string) {
    if (!selectedNodeId) return
    setStory(updateNodeText(story, selectedNodeId, text))
  }

  function handleUpdateEmoji(emoji: string) {
    if (!selectedNodeId) return
    setStory(updateNodeEmoji(story, selectedNodeId, emoji))
    setShowEmojiPicker(false)
  }

  function handleToggleEnding() {
    if (!selectedNodeId) return
    setStory(toggleEnding(story, selectedNodeId))
  }

  function handleAddChoice() {
    if (!selectedNodeId || !newChoiceLabel.trim()) return
    setStory(addNode(story, selectedNodeId, newChoiceLabel.trim()))
    setNewChoiceLabel('')
  }

  function handleRemoveNode(nodeId: string) {
    if (nodeId === story.startNodeId) return
    setStory(removeNode(story, nodeId))
    if (selectedNodeId === nodeId) setSelectedNodeId(story.startNodeId)
  }

  // --- Node tree rendering ---
  function renderNodeTree(nodeId: string, depth = 0, visited = new Set<string>()): React.ReactNode {
    if (visited.has(nodeId)) return null
    visited.add(nodeId)
    const node = story.nodes.find((n) => n.id === nodeId)
    if (!node) return null

    const isSelected = selectedNodeId === nodeId
    const isStart = nodeId === story.startNodeId
    const hasText = node.text.trim().length > 0

    return (
      <div key={nodeId} style={{ marginLeft: depth * 20 }} className="mb-1">
        <button
          onClick={() => setSelectedNodeId(nodeId)}
          className={`flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors group ${
            isSelected
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <span className="text-sm">{node.emoji || (node.isEnding ? '' : isStart ? '' : '')}</span>
          <span className={`truncate flex-1 ${hasText ? '' : 'italic text-slate-600'}`}>
            {node.text.slice(0, 40) || (isStart ? 'Start' : 'Empty node')}
            {node.text.length > 40 ? '...' : ''}
          </span>
          {node.isEnding && <span className="text-[9px] bg-green-500/10 text-green-500 px-1.5 rounded">END</span>}
          {!isStart && (
            <span
              onClick={(e) => { e.stopPropagation(); handleRemoveNode(nodeId) }}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity cursor-pointer"
            >
              x
            </span>
          )}
        </button>
        {node.choices.map((choice) => (
          <div key={choice.nextNodeId} className="ml-3 mt-0.5">
            <div className="text-[10px] text-slate-600 px-2 py-0.5 flex items-center gap-1">
              <span className="text-slate-700">|</span>
              <span className="text-green-600">{choice.label}</span>
            </div>
            {renderNodeTree(choice.nextNodeId, depth + 1, visited)}
          </div>
        ))}
      </div>
    )
  }

  // --- Preview mode ---
  function renderPreview() {
    const currentId = previewNodeId || story.startNodeId
    const node = story.nodes.find((n) => n.id === currentId)
    if (!node) return <p className="text-slate-500 text-sm">Node not found</p>

    return (
      <motion.div
        key={currentId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 max-w-md mx-auto pt-12"
      >
        {node.emoji && <span className="text-5xl">{node.emoji}</span>}
        <p className="text-lg text-white text-center leading-relaxed whitespace-pre-wrap">
          {node.text || <span className="text-slate-600 italic">No text yet</span>}
        </p>
        {node.isEnding ? (
          <div className="flex flex-col items-center gap-3 mt-4">
            <span className="text-2xl">The End</span>
            <button
              onClick={() => setPreviewNodeId(null)}
              className="px-4 py-2 rounded-lg bg-green-500/15 text-green-400 text-sm hover:bg-green-500/25 transition-colors"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full mt-4">
            {node.choices.map((choice) => (
              <motion.button
                key={choice.nextNodeId}
                onClick={() => setPreviewNodeId(choice.nextNodeId)}
                className="w-full px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors text-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {choice.label}
              </motion.button>
            ))}
            {node.choices.length === 0 && !node.isEnding && (
              <p className="text-slate-600 text-xs text-center italic">No choices added yet</p>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  // --- Main render ---
  return (
    <div className="flex gap-4 h-[calc(100vh-3rem)]">
      {/* Left: Node Tree */}
      <div className="w-56 shrink-0 flex flex-col gap-3 overflow-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nodes</p>
          <span className="text-[10px] text-slate-600">{story.nodes.length} total</span>
        </div>
        <div className="flex-1 overflow-auto">
          {renderNodeTree(story.startNodeId)}
          {/* Show orphaned nodes */}
          {story.nodes
            .filter((n) => {
              const reachable = new Set<string>()
              function walk(id: string) { if (reachable.has(id)) return; reachable.add(id); const nd = story.nodes.find(x => x.id === id); nd?.choices.forEach(c => walk(c.nextNodeId)) }
              walk(story.startNodeId)
              return !reachable.has(n.id)
            })
            .map((n) => renderNodeTree(n.id, 0, new Set()))}
        </div>
      </div>

      {/* Center: Editor or Preview */}
      <div className="flex-1 flex flex-col gap-3 overflow-auto">
        {/* Title + Mode Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Story Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none text-white placeholder:text-slate-600 flex-1"
          />
          <div className="flex bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={() => { setViewMode('edit'); setPreviewNodeId(null) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'edit' ? 'bg-green-500/15 text-green-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => { setViewMode('preview'); setPreviewNodeId(null) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-green-500/15 text-green-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {viewMode === 'preview' ? (
          <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-6 overflow-auto">
            {renderPreview()}
          </div>
        ) : (
          <>
            {/* Settings Bar */}
            <div className="flex gap-3 items-center flex-wrap">
              <select
                value={primaryTrait}
                onChange={(e) => setPrimaryTrait(e.target.value as Trait)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                {TRAITS.map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Ages</span>
                <input
                  type="number" min={1} max={12} value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                />
                <span>-</span>
                <input
                  type="number" min={1} max={12} value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                />
              </div>
              {lastSaved && (
                <span className="text-[10px] text-slate-600 ml-auto">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Node Editor */}
            {selectedNode ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-lg hover:border-green-500/30 transition-colors"
                    >
                      {selectedNode.emoji || '+'}
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute top-12 left-0 z-20 bg-slate-900 border border-slate-700 rounded-xl p-2 grid grid-cols-5 gap-1 shadow-xl"
                        >
                          {EMOJI_PICKS.map((e) => (
                            <button
                              key={e}
                              onClick={() => handleUpdateEmoji(e)}
                              className="w-8 h-8 rounded hover:bg-slate-800 flex items-center justify-center text-lg"
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">
                      {selectedNodeId === story.startNodeId ? 'Start node' : 'Story node'}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNode.isEnding}
                      onChange={handleToggleEnding}
                      className="accent-green-500"
                    />
                    Ending
                  </label>
                </div>

                <textarea
                  value={selectedNode.text}
                  onChange={(e) => handleUpdateText(e.target.value)}
                  placeholder="Write what happens at this point in the story..."
                  className="flex-1 min-h-[180px] bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 resize-none outline-none focus:border-green-500/30 transition-colors"
                />

                {/* Choices */}
                {!selectedNode.isEnding && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-slate-500 font-medium">Choices (branches)</p>
                    {selectedNode.choices.map((choice) => {
                      const targetNode = story.nodes.find((n) => n.id === choice.nextNodeId)
                      return (
                        <div key={choice.nextNodeId} className="flex gap-2 items-center">
                          <span className="text-green-500 text-xs">&rarr;</span>
                          <span className="text-xs text-green-400 flex-1">{choice.label}</span>
                          <button
                            onClick={() => setSelectedNodeId(choice.nextNodeId)}
                            className="text-[10px] text-slate-500 hover:text-white transition-colors"
                          >
                            {targetNode?.text?.slice(0, 20) || 'Edit node'} &rarr;
                          </button>
                        </div>
                      )
                    })}
                    <div className="flex gap-2">
                      <input
                        value={newChoiceLabel}
                        onChange={(e) => setNewChoiceLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddChoice() }}
                        placeholder="New choice label..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none"
                      />
                      <button
                        onClick={handleAddChoice}
                        disabled={!newChoiceLabel.trim()}
                        className="px-3 py-2 bg-green-500/15 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-30"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                Select a node from the tree
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 pb-4 items-center">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              {status !== 'review' && (
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !title.trim() || validationErrors.length > 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-slate-950 hover:bg-green-400 transition-colors disabled:opacity-50"
                  title={validationErrors.length > 0 ? validationErrors.join('\n') : undefined}
                >
                  Submit for Review
                </button>
              )}
              {status === 'review' && (
                <span className="px-4 py-2 text-sm text-amber-400">Waiting for Dad&apos;s review</span>
              )}
              {validationErrors.length > 0 && status !== 'review' && (
                <span className="text-[10px] text-amber-500 ml-2">
                  {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''} to fix before submitting
                </span>
              )}
              <button
                onClick={() => router.push('/studio')}
                className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-white transition-colors ml-auto"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
