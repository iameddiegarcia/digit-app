'use client'

import { useState } from 'react'
import { ALL_CHARACTER_TRAITS, CHARACTER_TRAIT_LABELS, characterFoundation, type CharacterTrait } from '@/lib/character-values'

interface CharacterObservationFormProps {
  childId: string
  onSubmit?: () => void
}

export function CharacterObservationForm({ childId, onSubmit }: CharacterObservationFormProps) {
  const [selectedTrait, setSelectedTrait] = useState<CharacterTrait | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit() {
    if (!selectedTrait) return
    setSaving(true)
    try {
      await fetch('/api/dashboard/character-observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, trait: selectedTrait, notes }),
      })
      setSaved(true)
      setSelectedTrait(null)
      setNotes('')
      onSubmit?.()
      setTimeout(() => setSaved(false), 2000)
    } catch {
      /* ignore */
    }
    setSaving(false)
  }

  const foundation = selectedTrait ? characterFoundation(selectedTrait) : null

  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
      <h3 className="text-xs font-semibold text-amber-400 mb-3">Log Character Observation</h3>
      <p className="text-[10px] text-slate-500 mb-3">Tap a fruit of the Spirit you saw in action today.</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {ALL_CHARACTER_TRAITS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTrait(t)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
              selectedTrait === t
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            {CHARACTER_TRAIT_LABELS[t]}
          </button>
        ))}
      </div>

      {foundation && (
        <div className="mb-3 p-2 rounded-lg bg-slate-800/50">
          <p className="text-[10px] text-slate-400 italic">&ldquo;{foundation.scripture}&rdquo;</p>
          <p className="text-[9px] text-slate-600 mt-0.5">{foundation.reference}</p>
          <p className="text-[10px] text-slate-500 mt-1">{foundation.childFriendly}</p>
        </div>
      )}

      {selectedTrait && (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you see? (optional)"
            className="w-full text-xs p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-600 resize-none"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-2 text-[10px] px-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Log Observation'}
          </button>
        </>
      )}

      {saved && (
        <p className="text-[10px] text-green-400 mt-1">Observation logged! Character profile updated.</p>
      )}
    </div>
  )
}
