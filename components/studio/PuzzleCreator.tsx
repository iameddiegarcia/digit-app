'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DigitChat } from './DigitChat'
import type { Trait } from '@/lib/types'

const SIBLINGS = [
  { id: '00000000-0000-0000-0000-000000000010', name: 'Santi', age: 3, color: '#60A5FA', emoji: '🦕' },
  { id: '00000000-0000-0000-0000-000000000020', name: 'Emily', age: 2, color: '#F9A8D4', emoji: '🐱' },
]

const TRAITS: { key: Trait; label: string; emoji: string }[] = [
  { key: 'understanding', label: 'Understanding', emoji: '🧠' },
  { key: 'organizing', label: 'Organizing', emoji: '📦' },
  { key: 'problem_solving', label: 'Problem Solving', emoji: '🔧' },
  { key: 'responsibility', label: 'Responsibility', emoji: '⭐' },
  { key: 'real_world', label: 'Real World', emoji: '🌍' },
  { key: 'adaptability', label: 'Adaptability', emoji: '🦎' },
]

type PuzzleType = 'match' | 'sort' | 'pattern'

const PUZZLE_TYPES: { key: PuzzleType; label: string; description: string; emoji: string }[] = [
  { key: 'match', label: 'Match the Pairs', description: 'Find items that go together', emoji: '🔗' },
  { key: 'sort', label: 'Sort into Groups', description: 'Put items in the right group', emoji: '📂' },
  { key: 'pattern', label: 'Find the Pattern', description: 'Figure out what comes next', emoji: '🔮' },
]

interface PuzzleItem {
  text: string
  emoji: string
  group: string
}

export function PuzzleCreator() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [targetSiblings, setTargetSiblings] = useState<string[]>([])
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null)
  const [puzzleType, setPuzzleType] = useState<PuzzleType | null>(null)
  const [items, setItems] = useState<PuzzleItem[]>([
    { text: '', emoji: '', group: 'A' },
    { text: '', emoji: '', group: 'A' },
    { text: '', emoji: '', group: 'B' },
    { text: '', emoji: '', group: 'B' },
  ])
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)

  function toggleSibling(id: string) {
    setTargetSiblings((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function updateItem(index: number, field: keyof PuzzleItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { text: '', emoji: '', group: 'A' }])
  }

  function removeItem(index: number) {
    if (items.length <= 2) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function getAgeRange() {
    const selected = SIBLINGS.filter((s) => targetSiblings.includes(s.id))
    if (selected.length === 0) return { min: 2, max: 5 }
    return {
      min: Math.min(...selected.map((s) => s.age)),
      max: Math.max(...selected.map((s) => s.age)) + 1,
    }
  }

  async function save(submitForReview = false) {
    if (!title.trim() || !puzzleType) return
    setSaving(true)
    const ageRange = getAgeRange()
    const content = {
      version: 1,
      puzzleType,
      targetSiblings,
      items: items.filter((item) => item.text.trim()),
    }

    try {
      const res = await fetch('/api/studio/creations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: 'puzzle',
          content,
          primary_trait: selectedTrait,
          target_age_min: ageRange.min,
          target_age_max: ageRange.max,
        }),
      })

      if (res.ok) {
        const { creation } = await res.json()
        if (submitForReview && creation?.id) {
          await fetch(`/api/studio/creations/${creation.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'review' }),
          })
        }
        router.push('/studio')
      }
    } catch {
      // handled silently
    }
    setSaving(false)
  }

  const groups = [...new Set(items.map((i) => i.group))]

  const chatContext = {
    type: 'puzzle',
    title,
    puzzleType,
    targetSiblings: targetSiblings.map((id) => SIBLINGS.find((s) => s.id === id)?.name).filter(Boolean),
    selectedTrait,
    itemCount: items.filter((i) => i.text.trim()).length,
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-1">Create a Puzzle</h2>
      <p className="text-xs text-slate-500 mb-6">Make a puzzle your siblings will love solving!</p>

      {/* Title */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Puzzle Name</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your puzzle called?"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-green-500/50"
        />
      </div>

      {/* Who is this for? */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 mb-2 block">Who is this for?</label>
        <div className="flex gap-3">
          {SIBLINGS.map((sibling) => (
            <motion.button
              key={sibling.id}
              onClick={() => toggleSibling(sibling.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                targetSiblings.includes(sibling.id)
                  ? 'border-green-500/50 bg-green-500/10 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-lg">{sibling.emoji}</span>
              <span>{sibling.name}</span>
              <span className="text-[10px] text-slate-500">(age {sibling.age})</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trait picker */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 mb-2 block">What will they learn?</label>
        <div className="flex flex-wrap gap-2">
          {TRAITS.map((trait) => (
            <button
              key={trait.key}
              onClick={() => setSelectedTrait(selectedTrait === trait.key ? null : trait.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedTrait === trait.key
                  ? 'border-green-500/50 bg-green-500/15 text-green-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {trait.emoji} {trait.label}
            </button>
          ))}
        </div>
      </div>

      {/* Puzzle Type */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 mb-2 block">Puzzle Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PUZZLE_TYPES.map((pt) => (
            <button
              key={pt.key}
              onClick={() => setPuzzleType(pt.key)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                puzzleType === pt.key
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <span className="text-lg">{pt.emoji}</span>
              <h4 className="text-xs font-semibold text-white mt-1">{pt.label}</h4>
              <p className="text-[10px] text-slate-500">{pt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Items Editor */}
      {puzzleType && (
        <div className="mb-6">
          <label className="text-xs font-medium text-slate-400 mb-2 block">
            Puzzle Items — Add items and assign them to groups
          </label>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={item.emoji}
                  onChange={(e) => updateItem(i, 'emoji', e.target.value)}
                  placeholder="🐶"
                  className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-center text-white placeholder:text-slate-600 outline-none"
                />
                <input
                  value={item.text}
                  onChange={(e) => updateItem(i, 'text', e.target.value)}
                  placeholder="Item name"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-green-500/50"
                />
                <select
                  value={item.group}
                  onChange={(e) => updateItem(i, 'group', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white outline-none"
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="C">Group C</option>
                </select>
                {items.length > 2 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addItem}
              className="text-xs text-green-400 hover:text-green-300 transition-colors text-left"
            >
              + Add item
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {puzzleType && items.some((i) => i.text.trim()) && (
        <div className="mb-6">
          <button
            onClick={() => setPreviewing(!previewing)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors mb-2"
          >
            {previewing ? 'Hide Preview' : 'Preview Puzzle'}
          </button>
          {previewing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800"
            >
              <h4 className="text-sm font-semibold text-white mb-3">{title || 'Untitled Puzzle'}</h4>
              {groups.map((group) => {
                const groupItems = items.filter((i) => i.group === group && i.text.trim())
                if (groupItems.length === 0) return null
                return (
                  <div key={group} className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Group {group}</p>
                    <div className="flex flex-wrap gap-2">
                      {groupItems.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-white">
                          {item.emoji} {item.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => save(false)}
          disabled={saving || !title.trim() || !puzzleType}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || !title.trim() || !puzzleType || items.filter((i) => i.text.trim()).length < 2}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-green-500 text-slate-950 hover:bg-green-400 transition-colors disabled:opacity-50"
        >
          Submit for Review
        </button>
      </div>

      <DigitChat context={chatContext} />
    </div>
  )
}
