'use client'

import { useState, useEffect, useCallback } from 'react'
import { ActivityCard } from './ActivityCard'

interface Activity {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string | null
  cost: 'free' | 'low' | 'paid' | null
  primary_trait: string | null
  traits: string[]
  tags: string[]
  url: string | null
  status: string
}

interface DiscoveryJob {
  id: string
  status: 'running' | 'completed' | 'failed'
  queries_total: number
  queries_completed: number
  activities_found: number
}

const TRAITS = ['all', 'understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']
const COSTS = ['all', 'free', 'low', 'paid']

export function ActivityFinder() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [job, setJob] = useState<DiscoveryJob | null>(null)
  const [traitFilter, setTraitFilter] = useState('all')
  const [costFilter, setCostFilter] = useState('all')

  const loadActivities = useCallback(async () => {
    const params = new URLSearchParams()
    if (traitFilter !== 'all') params.set('trait', traitFilter)
    if (costFilter !== 'all') params.set('cost', costFilter)

    const res = await fetch(`/api/dashboard/activities?${params}`)
    if (res.ok) {
      const data = await res.json()
      setActivities(data.activities ?? [])
    }
    setLoading(false)
  }, [traitFilter, costFilter])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  async function startDiscovery() {
    setDiscovering(true)
    const res = await fetch('/api/dashboard/discover', { method: 'POST' })
    if (res.ok) {
      const { jobId } = await res.json()
      pollJob(jobId)
    } else {
      setDiscovering(false)
    }
  }

  async function pollJob(jobId: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/dashboard/discover?jobId=${jobId}`)
      if (res.ok) {
        const { job: j } = await res.json()
        setJob(j)
        if (j.status === 'completed' || j.status === 'failed') {
          clearInterval(interval)
          setDiscovering(false)
          setJob(null)
          loadActivities()
        }
      }
    }, 3000)
  }

  async function handlePin(id: string) {
    await fetch('/api/dashboard/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId: id, status: 'pinned' }),
    })
    loadActivities()
  }

  async function handleDismiss(id: string) {
    await fetch('/api/dashboard/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId: id, status: 'dismissed' }),
    })
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Local Activities</h3>
        <button
          onClick={startDiscovery}
          disabled={discovering}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {discovering ? 'Searching...' : 'Find Activities'}
        </button>
      </div>

      {/* Progress */}
      {job && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex justify-between text-xs text-amber-400 mb-1">
            <span>Searching for activities...</span>
            <span>{job.queries_completed}/{job.queries_total} queries</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(job.queries_completed / job.queries_total) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-amber-500/60 mt-1">{job.activities_found} activities found so far</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex gap-1">
          {TRAITS.map((t) => (
            <button
              key={t}
              onClick={() => setTraitFilter(t)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors capitalize ${
                traitFilter === t ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Traits' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {COSTS.map((c) => (
            <button
              key={c}
              onClick={() => setCostFilter(c)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors capitalize ${
                costFilter === c ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              {c === 'all' ? 'Any Cost' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-xs text-slate-600">Loading activities...</p>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">No activities found yet</p>
          <p className="text-slate-600 text-xs mt-1">Click &quot;Find Activities&quot; to discover events near Inglewood</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} onPin={handlePin} onDismiss={handleDismiss} />
          ))}
        </div>
      )}
    </div>
  )
}
