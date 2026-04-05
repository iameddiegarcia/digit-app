'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CreationReviewCardProps {
  id: string
  title: string
  type: string
  primaryTrait: string | null
  content: Record<string, unknown> | null
  createdAt: string
  index?: number
  onAction: (creationId: string, action: 'approve' | 'reject', note?: string) => Promise<void>
}

export function CreationReviewCard({
  id,
  title,
  type,
  primaryTrait,
  content,
  createdAt,
  index = 0,
  onAction,
}: CreationReviewCardProps) {
  const [actioning, setActioning] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')

  async function handleApprove() {
    setActioning(true)
    await onAction(id, 'approve')
    setActioning(false)
  }

  async function handleReject() {
    if (!showNote) {
      setShowNote(true)
      return
    }
    setActioning(true)
    await onAction(id, 'reject', note.trim() || undefined)
    setActioning(false)
  }

  return (
    <motion.div
      className="p-5 rounded-xl bg-slate-900/60 border border-slate-800"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <div className="flex gap-3 mt-1">
            <span className="text-[10px] text-slate-500 capitalize">{type.replace('_', ' ')}</span>
            {primaryTrait && (
              <span className="text-[10px] text-green-400 capitalize">
                {primaryTrait.replace('_', ' ')}
              </span>
            )}
            <span className="text-[10px] text-slate-600">
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {content && (
        <div className="bg-slate-800/50 rounded-lg p-3 mb-3 max-h-32 overflow-auto">
          <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-mono">
            {JSON.stringify(content, null, 2).slice(0, 500)}
          </pre>
        </div>
      )}

      {showNote && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Feedback for Kylie (optional)..."
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder:text-slate-600 resize-none outline-none focus:border-red-500/30"
          />
        </motion.div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={actioning}
          className="px-4 py-1.5 bg-green-500 text-slate-950 rounded-lg text-xs font-semibold hover:bg-green-400 disabled:opacity-50 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={actioning}
          className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {showNote ? 'Send Feedback' : 'Reject'}
        </button>
        {showNote && (
          <button
            onClick={() => { setShowNote(false); setNote('') }}
            className="text-[10px] text-slate-600 hover:text-slate-400"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  )
}
