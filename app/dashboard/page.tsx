'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TraitRadar } from '@/components/dashboard/TraitRadar'
import { ActivityFinder } from '@/components/dashboard/ActivityFinder'

interface ChildData {
  id: string
  name: string
  nickname: string
  color: string
  traits: { trait: string; level: number; trend: string; confidence: number }[]
}

const CHILD_COLORS: Record<string, string> = {
  '00000000-0000-0000-0000-000000000010': '#60A5FA',
  '00000000-0000-0000-0000-000000000020': '#F9A8D4',
  '00000000-0000-0000-0000-000000000030': '#4ADE80',
}

export default function DashboardOverview() {
  const router = useRouter()
  const [children, setChildren] = useState<ChildData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const childRes = await fetch('/api/dashboard/children')
      if (!childRes.ok) { setLoading(false); return }
      const { children: kids } = await childRes.json()

      const withTraits = await Promise.all(
        (kids ?? []).map(async (child: { id: string; name: string; nickname: string; digit_config: { color?: string } }) => {
          const traitRes = await fetch(`/api/dashboard/traits?childId=${child.id}`)
          const traitData = traitRes.ok ? await traitRes.json() : { traits: [] }
          return {
            id: child.id,
            name: child.name,
            nickname: child.nickname,
            color: child.digit_config?.color || CHILD_COLORS[child.id] || '#60A5FA',
            traits: traitData.traits ?? [],
          }
        })
      )

      setChildren(withTraits)
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading dashboard...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Family Overview</h2>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/review')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
          >
            Review Creations
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {children.map((child, i) => (
          <motion.button
            key={child.id}
            onClick={() => router.push(`/dashboard/child/${child.id}`)}
            className="text-left p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: child.color + '30', color: child.color }}>
                {child.nickname[0]}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{child.nickname}</h3>
                <p className="text-[10px] text-slate-500">{child.name}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <TraitRadar traits={child.traits} color={child.color} size={160} />
            </div>

            {/* Trend summary */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {child.traits.map((t) => (
                <span
                  key={t.trait}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    t.trend === 'improving' ? 'bg-green-500/10 text-green-400' :
                    t.trend === 'declining' ? 'bg-red-500/10 text-red-400' :
                    'bg-slate-800 text-slate-500'
                  }`}
                >
                  {t.trait.replace('_', ' ')} {t.trend === 'improving' ? '\u2191' : t.trend === 'declining' ? '\u2193' : '\u2192'}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Activity Finder */}
      <ActivityFinder />
    </div>
  )
}
