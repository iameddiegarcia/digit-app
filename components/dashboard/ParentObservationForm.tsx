'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Trait } from '@/lib/types'

const TRAITS: Trait[] = ['understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']

const TRAIT_LABELS: Record<string, string> = {
  understanding: 'Understanding',
  organizing: 'Organizing',
  problem_solving: 'Problem Solving',
  responsibility: 'Responsibility',
  real_world: 'Real World',
  adaptability: 'Adaptability',
}

interface Observation {
  id: string
  trait: string | null
  notes: string
  created_at: string
}

interface ParentObservationFormProps {
  childId: string
}

export function ParentObservationForm({ childId }: ParentObservationFormProps) {
  const [notes, setNotes] = useState('')
  const [trait, setTrait] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [observations, setObservations] = useState<Observation[]>([])
  const [loadingObs, setLoadingObs] = useState(true)

  useEffect(() => {
    loadObservations()
  }, [childId])

  async function loadObservations() {
    setLoadingObs(true)
    const res = await fetch(`/api/dashboard/observations?childId=${childId}`)
    if (res.ok) {
      const data = await res.json()
      setObservations(data.observations ?? [])
    }
    setLoadingObs(false)
  }

  async function handleSubmit() {
    if (!notes.trim()) return
    setSaving(true)
    setSaved(false)

    const res = await fetch('/api/dashboard/observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        trait: trait || null,
        notes: notes.trim(),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setObservations((prev) => [data.observation, ...prev])
      setNotes('')
      setTrait('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <h4 className="text-xs font-semibold text-amber-400 mb-3">Add Observation</h4>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you notice today? (e.g., 'Santi sorted his blocks by color without being asked')"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 resize-none outline-none focus:border-amber-500/30 mb-3"
        />

        <div className="flex gap-3 items-center">
          <select
            value={trait}
            onChange={(e) => setTrait(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/30"
          >
            <option value="">Trait (optional)</option>
            {TRAITS.map((t) => (
              <option key={t} value={t}>{TRAIT_LABELS[t]}</option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={saving || !notes.trim()}
            className="px-4 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Observation'}
          </button>

          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-green-400"
            >
              Saved
            </motion.span>
          )}
        </div>
      </div>

      {/* Recent observations */}
      {!loadingObs && observations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 mb-2">Recent Observations</h4>
          <div className="space-y-2">
            {observations.slice(0, 5).map((obs) => (
              <div key={obs.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-slate-600">
                    {new Date(obs.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {obs.trait && (
                    <span className="text-[10px] text-amber-400/60 capitalize">{obs.trait.replace('_', ' ')}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{obs.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
