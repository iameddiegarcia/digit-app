'use client'

import { motion } from 'framer-motion'
import { getLevelDefinition } from '@/lib/trait-levels'
import type { Trait } from '@/lib/types'

interface TraitData {
  trait: string
  level: number
  trend: string
  confidence?: number
}

const TRAIT_LABELS: Record<string, string> = {
  understanding: 'Understanding',
  organizing: 'Organizing',
  problem_solving: 'Problem Solving',
  responsibility: 'Responsibility',
  real_world: 'Real World',
  adaptability: 'Adaptability',
}

const TRAIT_EMOJI: Record<string, string> = {
  understanding: '🧠',
  organizing: '📦',
  problem_solving: '🧩',
  responsibility: '⭐',
  real_world: '🌍',
  adaptability: '🔄',
}

const TREND_ICON: Record<string, { icon: string; color: string }> = {
  improving: { icon: '↑', color: '#4ade80' },
  stable: { icon: '→', color: '#94a3b8' },
  declining: { icon: '↓', color: '#ef4444' },
}

const ORDERED_TRAITS = ['understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']

export function TraitProgressBars({ traits, color }: { traits: TraitData[]; color: string }) {
  return (
    <div className="space-y-3">
      {ORDERED_TRAITS.map((traitKey, i) => {
        const data = traits.find((t) => t.trait === traitKey)
        const level = data?.level ?? 0
        const trend = data?.trend ?? 'stable'
        const trendInfo = TREND_ICON[trend] ?? TREND_ICON.stable
        const levelDef = getLevelDefinition(traitKey as Trait, level)

        return (
          <motion.div
            key={traitKey}
            className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{TRAIT_EMOJI[traitKey]}</span>
                <span className="text-[12px] font-medium text-white">
                  {TRAIT_LABELS[traitKey]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium" style={{ color: trendInfo.color }}>
                  {trendInfo.icon}
                </span>
                <span className="text-[10px] text-slate-500">
                  Lv {level}
                </span>
              </div>
            </div>

            {/* Segmented bar */}
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((seg) => (
                <motion.div
                  key={seg}
                  className="h-2.5 flex-1 rounded-sm"
                  style={{
                    backgroundColor: seg <= level ? color : 'rgba(148,163,184,0.08)',
                    opacity: seg <= level ? (0.5 + (seg / 5) * 0.5) : 1,
                  }}
                  initial={seg <= level ? { scaleX: 0 } : undefined}
                  animate={seg <= level ? { scaleX: 1 } : undefined}
                  transition={{ delay: i * 0.06 + seg * 0.08, duration: 0.3 }}
                />
              ))}
            </div>

            {/* Level label */}
            <p className="text-[10px] text-slate-500">
              {levelDef.label}
              {level > 0 && (
                <span className="text-slate-600"> — {levelDef.description}</span>
              )}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
