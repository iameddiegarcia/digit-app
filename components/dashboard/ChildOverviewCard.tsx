'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { TraitRadar } from './TraitRadar'

interface TraitData {
  trait: string
  level: number
  trend: string
  confidence: number
}

interface ChildOverviewCardProps {
  id: string
  nickname: string
  name: string
  color: string
  traits: TraitData[]
  lastSessionAt?: string | null
  index?: number
}

export function ChildOverviewCard({ id, nickname, name, color, traits, lastSessionAt, index = 0 }: ChildOverviewCardProps) {
  const router = useRouter()

  const radarTraits = traits.map((t) => ({ trait: t.trait, level: t.level, trend: t.trend }))

  const improving = traits.filter((t) => t.trend === 'improving').length
  const declining = traits.filter((t) => t.trend === 'declining').length

  function formatLastSession() {
    if (!lastSessionAt) return null
    const diff = Date.now() - new Date(lastSessionAt).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <motion.button
      onClick={() => router.push(`/dashboard/child/${id}`)}
      className="text-left p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: color + '30', color }}
        >
          {nickname[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{nickname}</h3>
          <p className="text-[10px] text-slate-500">{name}</p>
        </div>
        {lastSessionAt && (
          <span className="text-[10px] text-slate-600">{formatLastSession()}</span>
        )}
      </div>

      <div className="flex justify-center">
        <TraitRadar traits={radarTraits} color={color} size={160} />
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px]">
        {improving > 0 && (
          <span className="text-green-400">{improving} improving</span>
        )}
        {declining > 0 && (
          <span className="text-red-400">{declining} needs attention</span>
        )}
        {improving === 0 && declining === 0 && traits.length > 0 && (
          <span className="text-slate-500">All stable</span>
        )}
      </div>

      <div className="flex gap-1.5 mt-2 flex-wrap">
        {traits.map((t) => (
          <span
            key={t.trait}
            className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              t.trend === 'improving'
                ? 'bg-green-500/10 text-green-400'
                : t.trend === 'declining'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-slate-800 text-slate-600'
            }`}
          >
            {t.trait.replace('_', ' ')}
          </span>
        ))}
      </div>
    </motion.button>
  )
}
