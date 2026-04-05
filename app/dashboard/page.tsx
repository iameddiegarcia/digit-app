'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChildOverviewCard } from '@/components/dashboard/ChildOverviewCard'
import { ActivityFinder } from '@/components/dashboard/ActivityFinder'
import { WorkplaceAssessment } from '@/components/dashboard/WorkplaceAssessment'
import { SpouseAssessment } from '@/components/dashboard/SpouseAssessment'
import { SpouseReveal } from '@/components/dashboard/SpouseReveal'

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

interface PrincipleData {
  score: number
  week_of: string
  reflection: string | null
}

interface SpouseData {
  weekOf: string
  mine: { ratings: Record<string, number>; grateful_for: string | null; prayer_request: string | null } | null
  spouseSubmitted: boolean
  revealed: boolean
  spouseRatings: Record<string, number> | null
  spouseGrateful: string | null
  spousePrayer: string | null
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
  const [workplaceScores, setWorkplaceScores] = useState<Record<string, PrincipleData>>({})
  const [spouseData, setSpouseData] = useState<SpouseData | null>(null)
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

      // Load Eddie's workplace principles
      try {
        const wpRes = await fetch('/api/dashboard/workplace-principles')
        if (wpRes.ok) {
          const data = await wpRes.json()
          setWorkplaceScores(data.latest ?? {})
        }
      } catch {
        /* ignore */
      }

      // Load spouse assessment
      try {
        const saRes = await fetch('/api/dashboard/spouse-assessment')
        if (saRes.ok) {
          const data = await saRes.json()
          setSpouseData(data)
        }
      } catch {
        /* ignore */
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

      {/* Week in Review */}
      <motion.button
        onClick={() => router.push('/dashboard/weekly-report')}
        className="w-full mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/30 transition-colors text-left"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-violet-400">Week in Review</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              See your family&apos;s progress, trait highlights, and AI summaries
            </p>
          </div>
          <span className="text-violet-400 text-lg">&rarr;</span>
        </div>
      </motion.button>

      {/* Eddie's 12 Principles */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-amber-400 mb-1">Eddie&apos;s 12 Principles</h3>
        <p className="text-[10px] text-slate-500 mb-3">Weekly self-assessment — lead by example.</p>
        <WorkplaceAssessment initialScores={workplaceScores} />
      </div>

      {/* Family Values Check-In */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-rose-400 mb-1">Family Values Check-In</h3>
        <p className="text-[10px] text-slate-500 mb-3">
          Weekly Fruit of the Spirit reflection — rate together, reveal together.
        </p>
        {spouseData?.revealed && spouseData.mine && spouseData.spouseRatings ? (
          <SpouseReveal
            myRatings={spouseData.mine.ratings}
            spouseRatings={spouseData.spouseRatings}
            myGrateful={spouseData.mine.grateful_for}
            spouseGrateful={spouseData.spouseGrateful}
            myPrayer={spouseData.mine.prayer_request}
            spousePrayer={spouseData.spousePrayer}
            myName="Eddie"
            spouseName="Jazmin"
          />
        ) : (
          <SpouseAssessment
            existingRatings={spouseData?.mine?.ratings}
            existingGrateful={spouseData?.mine?.grateful_for}
            existingPrayer={spouseData?.mine?.prayer_request}
            onSubmit={async (data) => {
              const res = await fetch('/api/dashboard/spouse-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
              if (res.ok) {
                const saRes = await fetch('/api/dashboard/spouse-assessment')
                if (saRes.ok) setSpouseData(await saRes.json())
              }
            }}
          />
        )}
      </div>

      {/* Activity Finder */}
      <ActivityFinder />
    </div>
  )
}
