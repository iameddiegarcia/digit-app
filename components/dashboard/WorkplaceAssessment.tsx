'use client'

import { useState } from 'react'
import { ALL_PRINCIPLES, PRINCIPLE_LABELS, principleDefinition, type Principle } from '@/lib/workplace-principles'
import { WorkplaceRadar } from './WorkplaceRadar'

interface PrincipleData {
  score: number
  week_of: string
  reflection: string | null
}

interface WorkplaceAssessmentProps {
  initialScores: Record<string, PrincipleData>
}

export function WorkplaceAssessment({ initialScores }: WorkplaceAssessmentProps) {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const p of ALL_PRINCIPLES) {
      init[p] = initialScores[p]?.score ?? 0
    }
    return init
  })
  const [activePrinciple, setActivePrinciple] = useState<Principle | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const def = activePrinciple ? principleDefinition(activePrinciple) : null
  const hasScores = Object.values(scores).some((s) => s > 0)

  async function handleSave() {
    setSaving(true)
    const payload = ALL_PRINCIPLES
      .filter((p) => scores[p] > 0)
      .map((p) => ({ principle: p, score: scores[p] }))

    try {
      await fetch('/api/dashboard/workplace-principles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: payload }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      /* ignore */
    }
    setSaving(false)
  }

  // Build radar data from current scores
  const radarScores: Record<string, PrincipleData> = {}
  for (const p of ALL_PRINCIPLES) {
    if (scores[p] > 0) {
      radarScores[p] = { score: scores[p], week_of: '', reflection: null }
    }
  }

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
      <h3 className="text-sm font-semibold text-amber-400 mb-1">Weekly Self-Assessment</h3>
      <p className="text-[10px] text-slate-500 mb-4">Rate each principle 1-5 for this week.</p>

      <div className="flex justify-center mb-4">
        <WorkplaceRadar scores={radarScores} size={220} />
      </div>

      <div className="space-y-1.5">
        {ALL_PRINCIPLES.map((p) => (
          <div
            key={p}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              activePrinciple === p ? 'bg-slate-800' : 'hover:bg-slate-800/50'
            }`}
            onClick={() => setActivePrinciple(activePrinciple === p ? null : p)}
          >
            <span className="text-[10px] text-slate-400 flex-1">{PRINCIPLE_LABELS[p as Principle]}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={(e) => {
                    e.stopPropagation()
                    setScores((s) => ({ ...s, [p]: n }))
                  }}
                  className={`w-5 h-5 rounded-full text-[9px] font-bold transition-colors ${
                    scores[p] >= n
                      ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                      : 'bg-slate-800 text-slate-600 border border-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel for active principle */}
      {def && (
        <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-[11px] text-white font-medium">{PRINCIPLE_LABELS[activePrinciple!]}</p>
          <p className="text-[10px] text-slate-400 mt-1">{def.description}</p>
          <p className="text-[10px] text-amber-400/80 mt-1 italic">{def.selfReflection}</p>
          <p className="text-[9px] text-slate-600 mt-1">&ldquo;{def.scripture}&rdquo; — {def.reference}</p>
        </div>
      )}

      {hasScores && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full text-xs py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved for this week!' : 'Save Weekly Assessment'}
        </button>
      )}

      {saved && (
        <p className="text-[10px] text-green-400 mt-1 text-center">Assessment saved. Keep growing, Eddie.</p>
      )}
    </div>
  )
}
