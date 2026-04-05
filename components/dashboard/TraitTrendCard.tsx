'use client'

import { getLevelDefinition } from '@/lib/trait-levels'
import type { Trait } from '@/lib/types'

interface TraitTrendCardProps {
  trait: Trait
  level: number
  trend: 'improving' | 'stable' | 'declining'
  confidence: number
}

const TREND_DISPLAY = {
  improving: { arrow: '\u2191', color: 'text-green-400', label: 'Improving' },
  stable: { arrow: '\u2192', color: 'text-slate-400', label: 'Stable' },
  declining: { arrow: '\u2193', color: 'text-red-400', label: 'Declining' },
}

const TRAIT_LABELS: Record<string, string> = {
  understanding: 'Understanding',
  organizing: 'Organizing',
  problem_solving: 'Problem Solving',
  responsibility: 'Responsibility',
  real_world: 'Real World',
  adaptability: 'Adaptability',
}

export function TraitTrendCard({ trait, level, trend, confidence }: TraitTrendCardProps) {
  const levelDef = getLevelDefinition(trait, level)
  const trendInfo = TREND_DISPLAY[trend]

  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white">{TRAIT_LABELS[trait]}</span>
        <span className={`text-sm font-bold ${trendInfo.color}`}>{trendInfo.arrow}</span>
      </div>

      <div className="text-xs text-slate-400 mb-2">
        Level {level}: <span className="text-white">{levelDef.label}</span>
      </div>

      <div className="text-[10px] text-slate-600 mb-1.5">{levelDef.description}</div>

      {/* Confidence bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500/60 rounded-full transition-all"
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-600">{Math.round(confidence * 100)}%</span>
      </div>
    </div>
  )
}
