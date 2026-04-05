'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ReviewCreation {
  id: string
  title: string
  type: string
  primary_trait: string | null
  content: Record<string, unknown>
  created_at: string
}

export default function ReviewPage() {
  const [creations, setCreations] = useState<ReviewCreation[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  useEffect(() => {
    loadReview()
  }, [])

  async function loadReview() {
    const res = await fetch('/api/dashboard/review')
    if (res.ok) {
      const data = await res.json()
      setCreations(data.creations ?? [])
    }
    setLoading(false)
  }

  async function handleAction(creationId: string, status: 'published' | 'draft') {
    setActioningId(creationId)
    await fetch('/api/dashboard/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creationId, status }),
    })
    setCreations((prev) => prev.filter((c) => c.id !== creationId))
    setActioningId(null)
  }

  if (loading) return <div className="text-slate-500 text-sm">Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Review Kylie&apos;s Creations</h2>

      {creations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">Nothing to review right now</p>
          <p className="text-slate-600 text-xs mt-1">Kylie&apos;s submissions will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {creations.map((creation, i) => (
            <motion.div
              key={creation.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{creation.title}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 capitalize">{creation.type}</span>
                    {creation.primary_trait && (
                      <span className="text-[10px] text-green-400 capitalize">{creation.primary_trait.replace('_', ' ')}</span>
                    )}
                    <span className="text-[10px] text-slate-600">
                      {new Date(creation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content preview */}
              {creation.content && (
                <div className="bg-slate-800/50 rounded-lg p-3 mb-3 max-h-32 overflow-auto">
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                    {JSON.stringify(creation.content, null, 2).slice(0, 500)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(creation.id, 'published')}
                  disabled={actioningId === creation.id}
                  className="px-4 py-1.5 bg-green-500 text-slate-950 rounded-lg text-xs font-semibold hover:bg-green-400 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(creation.id, 'draft')}
                  disabled={actioningId === creation.id}
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 disabled:opacity-50"
                >
                  Request Changes
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
