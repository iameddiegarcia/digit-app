'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TraitRadar } from '@/components/dashboard/TraitRadar'
import { CharacterRadar } from '@/components/dashboard/CharacterRadar'
import { TraitTrendCard } from '@/components/dashboard/TraitTrendCard'
import { SessionSummaryCard } from '@/components/dashboard/SessionSummaryCard'
import { ParentObservationForm } from '@/components/dashboard/ParentObservationForm'
import { CharacterObservationForm } from '@/components/dashboard/CharacterObservationForm'
import { CharacterTimeline } from '@/components/dashboard/CharacterTimeline'
import type { Trait } from '@/lib/types'

interface TraitProfile {
  trait: Trait
  current_level: number
  confidence: number
  trend: 'improving' | 'stable' | 'declining'
}

interface CharacterProfile {
  trait: string
  current_level: number
  observations_count: number
}

interface SessionData {
  id: string
  started_at: string
  ended_at: string | null
  platform: string
  summary: string | null
  activity_count: number
}

const CHILD_META: Record<string, { name: string; color: string }> = {
  '00000000-0000-0000-0000-000000000010': { name: 'Santi', color: '#60A5FA' },
  '00000000-0000-0000-0000-000000000020': { name: 'Emily', color: '#F9A8D4' },
  '00000000-0000-0000-0000-000000000030': { name: 'Kylie', color: '#4ADE80' },
}

export default function ChildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.childId as string
  const meta = CHILD_META[childId] ?? { name: 'Child', color: '#60A5FA' }

  const [traits, setTraits] = useState<TraitProfile[]>([])
  const [characterTraits, setCharacterTraits] = useState<CharacterProfile[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [childId])

  async function loadData() {
    setLoading(true)
    const [traitRes, sessionRes, charRes] = await Promise.all([
      fetch(`/api/dashboard/traits?childId=${childId}`),
      fetch(`/api/dashboard/sessions?childId=${childId}&limit=10`),
      fetch(`/api/dashboard/character-traits?childId=${childId}`),
    ])

    if (traitRes.ok) {
      const data = await traitRes.json()
      setTraits(data.traits ?? [])
    }
    if (sessionRes.ok) {
      const data = await sessionRes.json()
      setSessions(data.sessions ?? [])
    }
    if (charRes.ok) {
      const data = await charRes.json()
      setCharacterTraits(data.traits ?? [])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading...</div>
  }

  const radarTraits = traits.map((t) => ({ trait: t.trait, level: t.current_level, trend: t.trend }))

  return (
    <div>
      <button onClick={() => router.push('/dashboard')} className="text-xs text-slate-500 hover:text-white mb-4 inline-block">
        &larr; Back to Overview
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: meta.color + '30', color: meta.color }}>
          {meta.name[0]}
        </div>
        <h2 className="text-xl font-bold text-white">{meta.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="lg:col-span-1 flex justify-center">
          <TraitRadar traits={radarTraits} color={meta.color} size={240} />
        </div>

        {/* Trait Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {traits.map((t) => (
            <TraitTrendCard
              key={t.trait}
              trait={t.trait}
              level={t.current_level}
              trend={t.trend}
              confidence={t.confidence}
            />
          ))}
        </div>
      </div>

      {/* Character Formation — Fruit of the Spirit */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-amber-400 mb-1">Character Formation</h3>
        <p className="text-[10px] text-slate-500 mb-3">Fruit of the Spirit — Galatians 5:22-23</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex justify-center">
            <CharacterRadar traits={characterTraits} color={meta.color} size={220} />
          </div>
          <CharacterObservationForm childId={childId} onSubmit={() => { loadData(); setRefreshKey((k) => k + 1) }} />
        </div>
        <CharacterTimeline childId={childId} color={meta.color} refreshKey={refreshKey} />
      </div>

      {/* Sessions */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-xs text-slate-600">No sessions yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessions.map((s) => (
              <SessionSummaryCard
                key={s.id}
                startedAt={s.started_at}
                endedAt={s.ended_at}
                summary={s.summary}
                activityCount={s.activity_count}
                platform={s.platform}
              />
            ))}
          </div>
        )}
      </div>

      {/* Weekly Goals */}
      <div className="mt-8">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <h3 className="text-xs font-semibold text-slate-600 mb-1">Weekly Goals</h3>
          <p className="text-[11px] text-slate-700">Goal tracking coming soon -- Digit will suggest focus areas based on trait trends.</p>
        </div>
      </div>

      {/* Parent Observation */}
      <div className="mt-8">
        <ParentObservationForm childId={childId} />
      </div>
    </div>
  )
}
