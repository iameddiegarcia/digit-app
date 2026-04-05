'use client'

import { useEffect, useState } from 'react'
import { CHARACTER_TRAIT_LABELS, characterFoundation, type CharacterTrait } from '@/lib/character-values'

interface Observation {
  id: string
  trait: string
  notes: string | null
  created_at: string
}

interface CharacterTimelineProps {
  childId: string
  color: string
  refreshKey?: number
}

const TRAIT_EMOJI: Record<string, string> = {
  love: '\u2764\uFE0F',
  joy: '\u2728',
  peace: '\u2618\uFE0F',
  patience: '\u23F3',
  kindness: '\uD83E\uDDE1',
  goodness: '\u2B50',
  faithfulness: '\uD83E\uDD1D',
  gentleness: '\uD83E\uDD4A',
  self_control: '\uD83E\uDDD8',
}

export function CharacterTimeline({ childId, color, refreshKey }: CharacterTimelineProps) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadObservations()
  }, [childId, refreshKey])

  async function loadObservations() {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/character-observations?childId=${childId}`)
      if (res.ok) {
        const data = await res.json()
        setObservations(data.observations ?? [])
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-[10px] text-slate-600 py-4">Loading timeline...</div>
  }

  if (observations.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
        <p className="text-[11px] text-slate-600">No character observations yet. Use the form above to log when you see a fruit of the Spirit in action.</p>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, Observation[]> = {}
  for (const obs of observations) {
    const date = new Date(obs.created_at).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(obs)
  }

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-slate-400 mb-3">Character Timeline</h4>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px" style={{ backgroundColor: color + '30' }} />

        <div className="space-y-4">
          {Object.entries(grouped).map(([date, obs]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-2 mb-2 ml-1">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 bg-slate-950" style={{ borderColor: color }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{date}</span>
              </div>

              {/* Observations for this date */}
              <div className="ml-10 space-y-1.5">
                {obs.map((o) => {
                  const trait = o.trait as CharacterTrait
                  const foundation = characterFoundation(trait)
                  const emoji = TRAIT_EMOJI[trait] ?? ''
                  const time = new Date(o.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })

                  return (
                    <div
                      key={o.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{emoji}</span>
                        <span className="text-[11px] font-medium" style={{ color }}>
                          {CHARACTER_TRAIT_LABELS[trait]}
                        </span>
                        <span className="text-[9px] text-slate-600 ml-auto">{time}</span>
                      </div>
                      {o.notes && (
                        <p className="text-[10px] text-slate-400 mt-1 ml-6">{o.notes}</p>
                      )}
                      <p className="text-[9px] text-slate-600 mt-1 ml-6 italic">
                        {foundation.childFriendly}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
