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

interface Step {
  text: string
}

export function ActivityDesigner() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [targetSiblings, setTargetSiblings] = useState<string[]>([])
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null)
  const [steps, setSteps] = useState<Step[]>([{ text: '' }])
  const [saving, setSaving] = useState(false)

  function toggleSibling(id: string) {
    setTargetSiblings((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function updateStep(index: number, text: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { text } : s)))
  }

  function addStep() {
    setSteps((prev) => [...prev, { text: '' }])
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  // Compute age range from selected siblings
  function getAgeRange() {
    const selected = SIBLINGS.filter((s) => targetSiblings.includes(s.id))
    if (selected.length === 0) return { min: 2, max: 5 }
    return {
      min: Math.min(...selected.map((s) => s.age)),
      max: Math.max(...selected.map((s) => s.age)) + 1,
    }
  }

  async function save(submitForReview = false) {
    if (!title.trim()) return
    setSaving(true)
    const ageRange = getAgeRange()
    const content = {
      version: 1,
      targetSiblings,
      steps: steps.filter((s) => s.text.trim()),
    }

    try {
      const res = await fetch('/api/studio/creations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: 'activity',
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

  const chatContext = {
    type: 'activity',
    title,
    targetSiblings: targetSiblings.map((id) => SIBLINGS.find((s) => s.id === id)?.name).filter(Boolean),
    selectedTrait,
    stepCount: steps.filter((s) => s.text.trim()).length,
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-1">Design an Activity</h2>
      <p className="text-xs text-slate-500 mb-6">Create something fun for your siblings to do!</p>

      {/* Title */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Activity Name</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this activity called?"
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

      {/* What will they learn? */}
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

      {/* Instructions */}
      <div className="mb-6">
        <label className="text-xs font-medium text-slate-400 mb-2 block">
          Instructions — Step by step, what do they do?
        </label>
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-8 flex items-center justify-center text-xs text-slate-500 font-bold shrink-0">
                {i + 1}.
              </span>
              <input
                value={step.text}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={i === 0 ? 'First, they...' : 'Then...'}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-green-500/50"
              />
              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(i)}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStep}
            className="text-xs text-green-400 hover:text-green-300 transition-colors text-left pl-8"
          >
            + Add step
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => save(false)}
          disabled={saving || !title.trim()}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || !title.trim() || steps.filter((s) => s.text.trim()).length === 0}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-green-500 text-slate-950 hover:bg-green-400 transition-colors disabled:opacity-50"
        >
          Submit for Review
        </button>
      </div>

      <DigitChat context={chatContext} />
    </div>
  )
}
