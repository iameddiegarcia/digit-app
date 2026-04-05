'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ALL_CHARACTER_TRAITS, CHARACTER_TRAIT_LABELS, CHARACTER_FOUNDATIONS, type CharacterTrait } from '@/lib/character-values'

interface SpouseRevealProps {
  myRatings: Record<string, number>
  spouseRatings: Record<string, number>
  myGrateful?: string | null
  spouseGrateful?: string | null
  myPrayer?: string | null
  spousePrayer?: string | null
  myName: string
  spouseName: string
}

const CONVERSATION_PROMPTS: Record<CharacterTrait, string> = {
  love: 'What does love look like in our home right now? Where can we love more intentionally?',
  joy: 'What brought us joy this week? Where did we struggle to find it?',
  peace: 'Were there moments of conflict we could have handled with more peace?',
  patience: 'When was patience hardest this week? How can we support each other?',
  kindness: 'Did we notice each other being kind? Where could we be kinder?',
  goodness: 'Where did we choose what was right over what was easy?',
  faithfulness: 'Did we keep our commitments to each other and to God this week?',
  gentleness: 'Were there moments where we could have responded more gently?',
  self_control: 'Where did we show self-control? Where did we struggle with it?',
}

// SVG Dual Radar Chart
function DualRadar({
  myRatings,
  spouseRatings,
  myName,
  spouseName,
}: {
  myRatings: Record<string, number>
  spouseRatings: Record<string, number>
  myName: string
  spouseName: string
}) {
  const size = 320
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size * 0.34
  const labelRadius = size * 0.46
  const numAxes = 9
  const maxLevel = 5

  function polarToCartesian(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  const angleStep = 360 / numAxes

  // Grid rings
  const rings = [1, 2, 3, 4, 5].map((level) => {
    const r = (level / maxLevel) * maxRadius
    const points = Array.from({ length: numAxes }, (_, i) => {
      const p = polarToCartesian(i * angleStep, r)
      return `${p.x},${p.y}`
    }).join(' ')
    return <polygon key={level} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
  })

  // Axis lines
  const axes = ALL_CHARACTER_TRAITS.map((_, i) => {
    const end = polarToCartesian(i * angleStep, maxRadius)
    return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
  })

  // Labels
  const labels = ALL_CHARACTER_TRAITS.map((trait, i) => {
    const p = polarToCartesian(i * angleStep, labelRadius)
    return (
      <text key={trait} x={p.x} y={p.y} fill="#94a3b8" fontSize={10} textAnchor="middle" dominantBaseline="middle">
        {CHARACTER_TRAIT_LABELS[trait]}
      </text>
    )
  })

  function buildPolygon(ratings: Record<string, number>) {
    return ALL_CHARACTER_TRAITS.map((trait, i) => {
      const val = Math.max(0, Math.min(maxLevel, ratings[trait] ?? 0))
      const r = (val / maxLevel) * maxRadius
      const p = polarToCartesian(i * angleStep, r)
      return `${p.x},${p.y}`
    }).join(' ')
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {rings}
      {axes}
      {/* My polygon — amber */}
      <motion.polygon
        points={buildPolygon(myRatings)}
        fill="rgba(245, 158, 11, 0.12)"
        stroke="#f59e0b"
        strokeWidth={2}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      {/* Spouse polygon — rose */}
      <motion.polygon
        points={buildPolygon(spouseRatings)}
        fill="rgba(251, 113, 133, 0.12)"
        stroke="#fb7185"
        strokeWidth={2}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      {/* Data points — mine */}
      {ALL_CHARACTER_TRAITS.map((trait, i) => {
        const val = myRatings[trait] ?? 0
        const r = (val / maxLevel) * maxRadius
        const p = polarToCartesian(i * angleStep, r)
        return <circle key={`my-${trait}`} cx={p.x} cy={p.y} r={3} fill="#f59e0b" />
      })}
      {/* Data points — spouse */}
      {ALL_CHARACTER_TRAITS.map((trait, i) => {
        const val = spouseRatings[trait] ?? 0
        const r = (val / maxLevel) * maxRadius
        const p = polarToCartesian(i * angleStep, r)
        return <circle key={`sp-${trait}`} cx={p.x} cy={p.y} r={3} fill="#fb7185" />
      })}
      {labels}
    </svg>
  )
}

export function SpouseReveal({
  myRatings,
  spouseRatings,
  myGrateful,
  spouseGrateful,
  myPrayer,
  spousePrayer,
  myName,
  spouseName,
}: SpouseRevealProps) {
  const divergences = useMemo(() =>
    ALL_CHARACTER_TRAITS
      .map((trait) => ({
        trait,
        gap: Math.abs((myRatings[trait] ?? 0) - (spouseRatings[trait] ?? 0)),
        myScore: myRatings[trait] ?? 0,
        spouseScore: spouseRatings[trait] ?? 0,
      }))
      .filter((d) => d.gap >= 2)
      .sort((a, b) => b.gap - a.gap),
    [myRatings, spouseRatings]
  )

  const alignments = useMemo(() =>
    ALL_CHARACTER_TRAITS.filter(
      (trait) => myRatings[trait] === spouseRatings[trait] && (myRatings[trait] ?? 0) >= 4
    ),
    [myRatings, spouseRatings]
  )

  const foundation = (trait: CharacterTrait) =>
    CHARACTER_FOUNDATIONS.find((f) => f.trait === trait)

  return (
    <div className="space-y-6">
      {/* Overlapping Radar Chart */}
      <motion.div
        className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h4 className="text-sm font-semibold text-white mb-1 text-center">
          Family Values This Week
        </h4>
        <p className="text-[10px] text-slate-500 text-center mb-4">
          Where you see each other — and where you can grow together
        </p>
        <DualRadar
          myRatings={myRatings}
          spouseRatings={spouseRatings}
          myName={myName}
          spouseName={spouseName}
        />
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] text-slate-400">{myName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="text-[10px] text-slate-400">{spouseName}</span>
          </div>
        </div>
      </motion.div>

      {/* Strengths — Where You Align */}
      {alignments.length > 0 && (
        <motion.div
          className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/[0.15]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-xs font-semibold text-emerald-400 mb-2">
            Where You&apos;re Aligned
          </h4>
          <div className="flex flex-wrap gap-2">
            {alignments.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                {CHARACTER_TRAIT_LABELS[trait]} — {myRatings[trait]}/5
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            You both see the same strengths. Celebrate these together!
          </p>
        </motion.div>
      )}

      {/* Conversation Starters — Where You Diverge */}
      {divergences.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-xs font-semibold text-amber-400">
            Conversation Starters
          </h4>
          <p className="text-[10px] text-slate-500">
            You rated these differently — that&apos;s not bad, it&apos;s an opportunity to understand each other better.
          </p>
          {divergences.map((d) => {
            const f = foundation(d.trait)
            return (
              <div
                key={d.trait}
                className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.12]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">
                    {CHARACTER_TRAIT_LABELS[d.trait]}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400">{myName}: {d.myScore}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-rose-400">{spouseName}: {d.spouseScore}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic">
                  {CONVERSATION_PROMPTS[d.trait]}
                </p>
                {f && (
                  <p className="text-[10px] text-violet-400/50 mt-1.5">
                    {f.scripture} — {f.reference}
                  </p>
                )}
              </div>
            )
          })}
        </motion.div>
      )}

      {/* Gratitude + Prayer */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.1]">
          <h4 className="text-xs font-semibold text-amber-400 mb-2">Grateful For</h4>
          {myGrateful && (
            <div className="mb-2">
              <span className="text-[10px] text-slate-500">{myName}:</span>
              <p className="text-xs text-slate-300">{myGrateful}</p>
            </div>
          )}
          {spouseGrateful && (
            <div>
              <span className="text-[10px] text-slate-500">{spouseName}:</span>
              <p className="text-xs text-slate-300">{spouseGrateful}</p>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/[0.1]">
          <h4 className="text-xs font-semibold text-violet-400 mb-2">Prayer Requests</h4>
          {myPrayer && (
            <div className="mb-2">
              <span className="text-[10px] text-slate-500">{myName}:</span>
              <p className="text-xs text-slate-300">{myPrayer}</p>
            </div>
          )}
          {spousePrayer && (
            <div>
              <span className="text-[10px] text-slate-500">{spouseName}:</span>
              <p className="text-xs text-slate-300">{spousePrayer}</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="text-center py-2">
        <p className="text-[10px] text-slate-500 italic">
          &ldquo;Two are better than one, because they have a good return for their labor.&rdquo; — Ecclesiastes 4:9
        </p>
      </div>
    </div>
  )
}
