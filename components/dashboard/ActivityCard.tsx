'use client'

import { motion } from 'framer-motion'

export interface LocalActivity {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string | null
  event_end_date: string | null
  cost: 'free' | 'low' | 'paid' | null
  cost_amount: number | null
  age_min: number | null
  age_max: number | null
  primary_trait: string | null
  traits: string[]
  tags: string[]
  url: string | null
  status: string
  discovered_at: string
}

interface ActivityCardProps {
  activity: LocalActivity
  onUpdateStatus: (id: string, status: string) => void
}

const TRAIT_COLORS: Record<string, string> = {
  understanding: 'bg-blue-500/15 text-blue-400',
  organizing: 'bg-purple-500/15 text-purple-400',
  problem_solving: 'bg-orange-500/15 text-orange-400',
  responsibility: 'bg-amber-500/15 text-amber-400',
  real_world: 'bg-emerald-500/15 text-emerald-400',
  adaptability: 'bg-cyan-500/15 text-cyan-400',
}

const TRAIT_LABELS: Record<string, string> = {
  understanding: 'Understanding',
  organizing: 'Organizing',
  problem_solving: 'Problem Solving',
  responsibility: 'Responsibility',
  real_world: 'Real World',
  adaptability: 'Adaptability',
}

const COST_BADGE: Record<string, { cls: string; label: string }> = {
  free: { cls: 'bg-green-500/15 text-green-400', label: 'Free' },
  low: { cls: 'bg-yellow-500/15 text-yellow-400', label: 'Low Cost' },
  paid: { cls: 'bg-red-500/15 text-red-400', label: 'Paid' },
}

function formatEventDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActivityCard({ activity, onUpdateStatus }: ActivityCardProps) {
  const isPinned = activity.status === 'pinned'
  const cost = activity.cost ? COST_BADGE[activity.cost] : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-xl border transition-colors ${
        isPinned
          ? 'bg-amber-500/5 border-amber-500/30'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
      whileHover={{ y: -2 }}
    >
      {/* Title + Cost badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-white leading-tight line-clamp-2">{activity.title}</h4>
        {cost && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${cost.cls}`}>
            {cost.label}
          </span>
        )}
      </div>

      {/* Description */}
      {activity.description && (
        <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">{activity.description}</p>
      )}

      {/* Location, date, ages */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mb-3">
        {activity.location && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {activity.location}
          </span>
        )}
        {activity.event_date && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEventDate(activity.event_date)}
            {activity.event_end_date && ` - ${formatEventDate(activity.event_end_date)}`}
          </span>
        )}
        {activity.age_min != null && (
          <span>Ages {activity.age_min}{activity.age_max != null ? `-${activity.age_max}` : '+'}</span>
        )}
      </div>

      {/* Trait badges */}
      {activity.traits.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {activity.traits.map((t) => (
            <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded ${TRAIT_COLORS[t] ?? 'bg-slate-800 text-slate-500'}`}>
              {TRAIT_LABELS[t] ?? t.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {activity.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {activity.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-800/50">
        <button
          onClick={() => onUpdateStatus(activity.id, isPinned ? 'new' : 'pinned')}
          className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
            isPinned
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-500 hover:text-amber-400'
          }`}
        >
          {isPinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          onClick={() => onUpdateStatus(activity.id, 'dismissed')}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
        >
          Dismiss
        </button>
        {activity.url && (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-[#A78BFA] hover:text-[#C4B5FD] transition-colors ml-auto"
          >
            Open &rarr;
          </a>
        )}
      </div>
    </motion.div>
  )
}
