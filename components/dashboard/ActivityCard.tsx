'use client'

import { motion } from 'framer-motion'

interface ActivityCardProps {
  activity: {
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
  onPin: (id: string) => void
  onDismiss: (id: string) => void
}

const TRAIT_COLORS: Record<string, string> = {
  understanding: 'bg-blue-500/15 text-blue-400',
  organizing: 'bg-purple-500/15 text-purple-400',
  problem_solving: 'bg-orange-500/15 text-orange-400',
  responsibility: 'bg-amber-500/15 text-amber-400',
  real_world: 'bg-emerald-500/15 text-emerald-400',
  adaptability: 'bg-cyan-500/15 text-cyan-400',
}

const COST_BADGE: Record<string, string> = {
  free: 'bg-green-500/15 text-green-400',
  low: 'bg-yellow-500/15 text-yellow-400',
  paid: 'bg-red-500/15 text-red-400',
}

export function ActivityCard({ activity, onPin, onDismiss }: ActivityCardProps) {
  return (
    <motion.div
      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-white leading-tight">{activity.title}</h4>
        {activity.cost && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${COST_BADGE[activity.cost] ?? ''}`}>
            {activity.cost}
          </span>
        )}
      </div>

      {activity.description && (
        <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">{activity.description}</p>
      )}

      <div className="flex gap-2 text-[10px] text-slate-500 mb-3">
        {activity.location && <span>{activity.location}</span>}
        {activity.event_date && (
          <span>{new Date(activity.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
      </div>

      {/* Trait badges */}
      {activity.traits.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {activity.traits.map((t) => (
            <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${TRAIT_COLORS[t] ?? 'bg-slate-800 text-slate-500'}`}>
              {t.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {activity.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {activity.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onPin(activity.id)}
          className={`text-[10px] px-2 py-1 rounded transition-colors ${
            activity.status === 'pinned'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-800 text-slate-500 hover:text-amber-400'
          }`}
        >
          {activity.status === 'pinned' ? 'Pinned' : 'Pin'}
        </button>
        <button
          onClick={() => onDismiss(activity.id)}
          className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
        >
          Dismiss
        </button>
        {activity.url && (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-500 hover:text-white transition-colors ml-auto"
          >
            Open &rarr;
          </a>
        )}
      </div>
    </motion.div>
  )
}
