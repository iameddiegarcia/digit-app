'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { ProjectGrid } from '@/components/studio/ProjectGrid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Creation {
  id: string
  title: string
  type: 'story' | 'puzzle' | 'activity'
  status: 'draft' | 'review' | 'published'
  primary_trait: string | null
  updated_at: string
}

export default function StudioPage() {
  const { supabase } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>(filterParam || 'all')

  useEffect(() => {
    fetchCreations()
  }, [])

  async function fetchCreations() {
    const res = await fetch('/api/studio/creations')
    if (res.ok) {
      const data = await res.json()
      setCreations(data.creations ?? [])
    }
    setLoading(false)
  }

  const filtered = activeFilter === 'all'
    ? creations
    : activeFilter === 'published'
      ? creations.filter((c) => c.status === 'published')
      : creations.filter((c) => c.type === activeFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">My Projects</h2>
        <button
          onClick={() => router.push('/studio/stories/new')}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-500 text-slate-950 hover:bg-green-400 transition-colors"
        >
          + Create New
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'story', 'puzzle', 'activity', 'published'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              activeFilter === f
                ? 'bg-green-500/15 text-green-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading projects...</div>
      ) : (
        <ProjectGrid
          creations={filtered}
          onSelect={(id) => router.push(`/studio/stories/${id}`)}
        />
      )}
    </div>
  )
}
