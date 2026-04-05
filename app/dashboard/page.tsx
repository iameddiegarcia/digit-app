'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChildOverviewCard } from '@/components/dashboard/ChildOverviewCard'
import { ActivityFinder } from '@/components/dashboard/ActivityFinder'

interface ChildData {
  id: string
  name: string
  nickname: string
  color: string
  traits: { trait: string; level: number; trend: string; confidence: number }[]
  lastSessionAt?: string | null
}

interface ReviewCreation {
  id: string
  title: string
  type: string
  created_at: string
}

const CHILD_COLORS: Record<string, string> = {
  '00000000-0000-0000-0000-000000000010': '#60A5FA',
  '00000000-0000-0000-0000-000000000020': '#F9A8D4',
  '00000000-0000-0000-0000-000000000030': '#4ADE80',
}

export default function DashboardOverview() {
  const router = useRouter()
  const [children, setChildren] = useState<ChildData[]>([])
  const [reviewQueue, setReviewQueue] = useState<ReviewCreation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [childRes, reviewRes] = await Promise.all([
        fetch('/api/dashboard/children'),
        fetch('/api/dashboard/review'),
      ])

      if (childRes.ok) {
        const { children: kids } = await childRes.json()

        const withTraits = await Promise.all(
          (kids ?? []).map(async (child: { id: string; name: string; nickname: string; digit_config: { color?: string } }) => {
            const [traitRes, sessionRes] = await Promise.all([
              fetch(`/api/dashboard/traits?childId=${child.id}`),
              fetch(`/api/dashboard/sessions?childId=${child.id}&limit=1`),
            ])
            const traitData = traitRes.ok ? await traitRes.json() : { traits: [] }
            const sessionData = sessionRes.ok ? await sessionRes.json() : { sessions: [] }
            return {
              id: child.id,
              name: child.name,
              nickname: child.nickname,
              color: child.digit_config?.color || CHILD_COLORS[child.id] || '#60A5FA',
              traits: traitData.traits ?? [],
              lastSessionAt: sessionData.sessions?.[0]?.started_at ?? null,
            }
          })
        )
        setChildren(withTraits)
      }

      if (reviewRes.ok) {
        const data = await reviewRes.json()
        setReviewQueue(data.creations ?? [])
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Greeting */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white">Hey Eddie</h2>
        <p className="text-sm text-slate-500 mt-1">{today}</p>
      </motion.div>

      {/* Review Queue Banner */}
      {reviewQueue.length > 0 && (
        <motion.button
          onClick={() => router.push('/dashboard/review')}
          className="w-full mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-500/30 transition-colors text-left"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-green-400">Review Queue</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {reviewQueue.length} creation{reviewQueue.length !== 1 ? 's' : ''} from Kylie waiting for review
              </p>
            </div>
            <span className="text-green-400 text-lg">&rarr;</span>
          </div>
        </motion.button>
      )}

      {/* Child Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {children.map((child, i) => (
          <ChildOverviewCard
            key={child.id}
            id={child.id}
            nickname={child.nickname}
            name={child.name}
            color={child.color}
            traits={child.traits}
            lastSessionAt={child.lastSessionAt}
            index={i}
          />
        ))}
      </div>

      {/* Activity Finder */}
      <ActivityFinder />
    </div>
  )
}
