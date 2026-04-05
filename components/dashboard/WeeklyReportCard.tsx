'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CHARACTER_TRAIT_LABELS, type CharacterTrait } from '@/lib/character-values'

interface ChildReport {
  childId: string
  name: string
  color: string
  sessionsCount: number
  observationsCount: number
  traitEventsCount: number
  traitCounts: Record<string, number>
  traitLevels: Record<string, { level: number; count: number }>
  highlights: { trait: string; notes: string; date: string }[]
}

interface WeeklyReportData {
  weekOf: string
  children: ChildReport[]
  familyPulse: number
  spouseCompleted: boolean
  totalSessions: number
  totalObservations: number
}

// SVG progress ring
function ProgressRing({
  value,
  max,
  color,
  size = 56,
  label,
}: {
  value: number
  max: number
  color: string
  size?: number
  label: string
}) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = max > 0 ? Math.min(value / max, 1) : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="text-[11px] font-bold text-white">{value}</span>
      <span className="text-[9px] text-slate-500">{label}</span>
    </div>
  )
}

// Family pulse meter
function PulseMeter({ pulse }: { pulse: number }) {
  const color =
    pulse >= 70 ? '#4ade80' : pulse >= 40 ? '#f59e0b' : '#ef4444'
  const label =
    pulse >= 70 ? 'Thriving' : pulse >= 40 ? 'Growing' : 'Getting Started'

  return (
    <div className="flex items-center gap-3">
      <ProgressRing value={pulse} max={100} color={color} size={64} label="Pulse" />
      <div>
        <p className="text-sm font-semibold" style={{ color }}>
          {label}
        </p>
        <p className="text-[10px] text-slate-500">Family engagement this week</p>
      </div>
    </div>
  )
}

// Per-child card
function ChildReportCard({
  child,
  index,
  onGenerateNarrative,
}: {
  child: ChildReport
  index: number
  onGenerateNarrative: (childId: string) => void
}) {
  const topTraits = Object.entries(child.traitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <motion.div
      className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: child.color + '33', borderColor: child.color, borderWidth: 1 }}
        >
          {child.name[0]}
        </div>
        <h4 className="text-sm font-semibold text-white">{child.name}</h4>
      </div>

      {/* Progress Rings */}
      <div className="flex justify-around mb-4">
        <ProgressRing
          value={child.sessionsCount}
          max={7}
          color={child.color}
          label="Sessions"
        />
        <ProgressRing
          value={child.observationsCount}
          max={10}
          color="#f59e0b"
          label="Observations"
        />
        <ProgressRing
          value={child.traitEventsCount}
          max={15}
          color="#a78bfa"
          label="Traits"
        />
      </div>

      {/* Top traits observed */}
      {topTraits.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 mb-1.5">Top Traits This Week</p>
          <div className="flex flex-wrap gap-1.5">
            {topTraits.map(([trait, count]) => (
              <span
                key={trait}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: child.color + '15',
                  color: child.color,
                  border: `1px solid ${child.color}30`,
                }}
              >
                {CHARACTER_TRAIT_LABELS[trait as CharacterTrait] ?? trait} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights timeline */}
      {child.highlights.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 mb-1.5">Highlights</p>
          <div className="space-y-2">
            {child.highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className="w-2 h-2 rounded-full mt-1"
                    style={{ backgroundColor: child.color }}
                  />
                  {i < child.highlights.length - 1 && (
                    <div className="w-px flex-1 bg-white/[0.06]" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-[10px] text-slate-400">
                    <span className="font-medium text-slate-300">
                      {CHARACTER_TRAIT_LABELS[h.trait as CharacterTrait] ?? h.trait}
                    </span>
                    {' — '}
                    {new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{h.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate narrative button */}
      <button
        onClick={() => onGenerateNarrative(child.childId)}
        className="w-full mt-1 py-2 rounded-lg text-[11px] font-medium transition-colors"
        style={{
          backgroundColor: child.color + '10',
          color: child.color,
          border: `1px solid ${child.color}20`,
        }}
      >
        Generate AI Summary
      </button>
    </motion.div>
  )
}

// AI narrative display
function NarrativeCard({
  childName,
  narrative,
  color,
}: {
  childName: string
  narrative: string
  color: string
}) {
  return (
    <motion.div
      className="rounded-xl p-4"
      style={{
        backgroundColor: color + '08',
        border: `1px solid ${color}20`,
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="text-[10px] font-semibold mb-1" style={{ color }}>
        {childName}&apos;s Week
      </p>
      <p className="text-[12px] text-slate-300 leading-relaxed">{narrative}</p>
    </motion.div>
  )
}

export default function WeeklyReportCard({ data }: { data: WeeklyReportData }) {
  const [narratives, setNarratives] = useState<Record<string, { name: string; text: string; color: string }>>({})
  const [generating, setGenerating] = useState<string | null>(null)

  async function generateNarrative(childId: string) {
    setGenerating(childId)
    try {
      const res = await fetch('/api/dashboard/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekOf: data.weekOf, childId }),
      })
      if (res.ok) {
        const { narrative, childName } = await res.json()
        const child = data.children.find((c) => c.childId === childId)
        setNarratives((prev) => ({
          ...prev,
          [childId]: { name: childName, text: narrative, color: child?.color ?? '#60A5FA' },
        }))
      }
    } catch {
      /* ignore */
    }
    setGenerating(null)
  }

  const weekDate = new Date(data.weekOf + 'T12:00:00')
  const weekEnd = new Date(weekDate)
  weekEnd.setDate(weekDate.getDate() + 6)
  const weekLabel = `${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <div className="space-y-6">
      {/* Header with Pulse */}
      <motion.div
        className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Week in Review</h3>
            <p className="text-[11px] text-slate-500">{weekLabel}</p>
          </div>
          {data.spouseCompleted && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Values Check-In Complete
            </span>
          )}
        </div>
        <PulseMeter pulse={data.familyPulse} />
        <div className="flex gap-6 mt-4 pt-3 border-t border-white/[0.04]">
          <div>
            <p className="text-lg font-bold text-white">{data.totalSessions}</p>
            <p className="text-[9px] text-slate-500">Sessions</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{data.totalObservations}</p>
            <p className="text-[9px] text-slate-500">Observations</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{data.children.length}</p>
            <p className="text-[9px] text-slate-500">Kids Active</p>
          </div>
        </div>
      </motion.div>

      {/* Per-child cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.children.map((child, i) => (
          <ChildReportCard
            key={child.childId}
            child={child}
            index={i}
            onGenerateNarrative={(id) => {
              if (generating !== id) generateNarrative(id)
            }}
          />
        ))}
      </div>

      {/* AI narratives */}
      {Object.keys(narratives).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-amber-400">AI Narratives</h4>
          {Object.entries(narratives).map(([id, n]) => (
            <NarrativeCard key={id} childName={n.name} narrative={n.text} color={n.color} />
          ))}
        </div>
      )}

      {/* Generating indicator */}
      {generating && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <div className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
          Generating narrative...
        </div>
      )}

      {/* Scripture footer */}
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-[11px] text-slate-500 italic">
          &ldquo;Train up a child in the way he should go; even when he is old he will not depart from it.&rdquo;
        </p>
        <p className="text-[9px] text-slate-600 mt-1">Proverbs 22:6</p>
      </motion.div>
    </div>
  )
}
