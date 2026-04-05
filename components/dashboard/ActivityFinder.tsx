'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ActivityCard, type LocalActivity } from './ActivityCard'

interface DiscoveryJob {
  id: string
  status: 'running' | 'completed' | 'failed'
  queries_total: number
  queries_completed: number
  activities_found: number
  error: string | null
}

const TRAITS = [
  { value: 'all', label: 'All Traits' },
  { value: 'understanding', label: 'Understanding' },
  { value: 'organizing', label: 'Organizing' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'responsibility', label: 'Responsibility' },
  { value: 'real_world', label: 'Real World' },
  { value: 'adaptability', label: 'Adaptability' },
]

const COSTS = [
  { value: 'all', label: 'Any Cost' },
  { value: 'free', label: 'Free' },
  { value: 'low', label: 'Low Cost' },
  { value: 'paid', label: 'Paid' },
]

export function ActivityFinder() {
  const [activities, setActivities] = useState<LocalActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [job, setJob] = useState<DiscoveryJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [traitFilter, setTraitFilter] = useState('all')
  const [costFilter, setCostFilter] = useState('all')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (traitFilter !== 'all') params.set('trait', traitFilter)
      if (costFilter !== 'all') params.set('cost', costFilter)

      const res = await fetch(`/api/dashboard/activities?${params}`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities ?? [])
      }
    } catch {
      // Silently fail on load — activities will just be empty
    }
    setLoading(false)
  }, [traitFilter, costFilter])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  async function startDiscovery() {
    setDiscovering(true)
    setError(null)

    try {
      const res = await fetch('/api/dashboard/discover', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to start discovery')
      }
      const { jobId } = await res.json()
      pollJob(jobId)
    } catch (err) {
      setDiscovering(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again later.')
    }
  }

  function pollJob(jobId: string) {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/dashboard/discover?jobId=${jobId}`)
        if (!res.ok) return

        const { job: j } = await res.json()
        setJob(j)

        if (j.status === 'completed' || j.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          setDiscovering(false)

          if (j.status === 'failed') {
            setError(j.error ?? 'Discovery failed. Some results may still have been saved.')
          }

          // Brief delay before refreshing so the progress bar fills visually
          setTimeout(() => {
            setJob(null)
            loadActivities()
          }, 800)
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, 3000)
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await fetch('/api/dashboard/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: id, status }),
      })

      if (status === 'dismissed') {
        setActivities((prev) => prev.filter((a) => a.id !== id))
      } else {
        // Optimistic update for pin/unpin
        setActivities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        )
      }
    } catch {
      // Revert on failure by reloading
      loadActivities()
    }
  }

  const pinnedCount = activities.filter((a) => a.status === 'pinned').length
  const progress = job ? Math.round((job.queries_completed / Math.max(job.queries_total, 1)) * 100) : 0

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Local Activities</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Free and low-cost kids events near Inglewood
            {pinnedCount > 0 && <span className="text-amber-500"> &middot; {pinnedCount} pinned</span>}
          </p>
        </div>
        <button
          onClick={startDiscovery}
          disabled={discovering}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#A78BFA] text-white hover:bg-[#C4B5FD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {discovering ? 'Searching...' : 'Find Activities'}
        </button>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400 text-xs ml-4">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <AnimatePresence>
        {job && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20"
          >
            <div className="flex justify-between text-xs text-[#A78BFA] mb-1.5">
              <span>Searching for activities...</span>
              <span>{job.queries_completed}/{job.queries_total} queries</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#A78BFA] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-[#A78BFA]/60 mt-1.5">{job.activities_found} activities found so far</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {TRAITS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTraitFilter(t.value)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                traitFilter === t.value
                  ? 'bg-[#A78BFA]/15 text-[#A78BFA]'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {COSTS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCostFilter(c.value)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                costFilter === c.value
                  ? 'bg-[#A78BFA]/15 text-[#A78BFA]'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-3xl mb-3">
            <svg className="w-10 h-10 mx-auto text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No activities found yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Click &quot;Find Activities&quot; to discover events near Inglewood
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
