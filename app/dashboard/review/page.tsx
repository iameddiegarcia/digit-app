'use client'

import { useEffect, useState } from 'react'
import { CreationReviewCard } from '@/components/dashboard/CreationReviewCard'

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

  async function handleAction(creationId: string, action: 'approve' | 'reject', note?: string) {
    const status = action === 'approve' ? 'approved' : 'rejected'
    await fetch('/api/dashboard/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creationId, status, reviewNote: note }),
    })
    setCreations((prev) => prev.filter((c) => c.id !== creationId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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
            <CreationReviewCard
              key={creation.id}
              id={creation.id}
              title={creation.title}
              type={creation.type}
              primaryTrait={creation.primary_trait}
              content={creation.content}
              createdAt={creation.created_at}
              index={i}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
