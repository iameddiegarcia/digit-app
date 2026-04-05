'use client'

import { useState } from 'react'
import type { Trait } from '@/lib/types'

const TRAITS: (Trait | '')[] = ['', 'understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']

interface ParentObservationProps {
  childId: string
  onSaved?: () => void
}

export function ParentObservation({ childId, onSaved }: ParentObservationProps) {
  const [notes, setNotes] = useState('')
  const [trait, setTrait] = useState<string>('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!notes.trim()) return
    setSaving(true)

    await fetch('/api/dashboard/observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        trait: trait || null,
        notes: notes.trim(),
      }),
    })

    setNotes('')
    setTrait('')
    setSaving(false)
    onSaved?.()
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
      <h4 className="text-xs font-semibold text-amber-400 mb-3">Add Observation</h4>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What did you notice about your child today?"
        rows={3}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 resize-none outline-none focus:border-amber-500/30 mb-3"
      />
      <div className="flex gap-3 items-center">
        <select
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
        >
          <option value="">Trait (optional)</option>
          {TRAITS.filter(Boolean).map((t) => (
            <option key={t} value={t}>{(t as string).replace('_', ' ')}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving || !notes.trim()}
          className="px-4 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
