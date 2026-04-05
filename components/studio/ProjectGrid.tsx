'use client'

import { motion } from 'framer-motion'

interface Creation {
  id: string
  title: string
  type: 'story' | 'puzzle' | 'activity'
  status: 'draft' | 'review' | 'published'
  primary_trait: string | null
  updated_at: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-700 text-slate-300',
  review: 'bg-amber-500/20 text-amber-400',
  published: 'bg-green-500/20 text-green-400',
}

const TYPE_ICONS: Record<string, string> = {
  story: 'S',
  puzzle: 'P',
  activity: 'A',
}

interface ProjectGridProps {
  creations: Creation[]
  onSelect: (id: string) => void
}

export function ProjectGrid({ creations, onSelect }: ProjectGridProps) {
  if (creations.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm mb-4">No projects yet</p>
        <p className="text-slate-600 text-xs">Create your first story, puzzle, or activity for your siblings!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {creations.map((creation, i) => (
        <motion.button
          key={creation.id}
          onClick={() => onSelect(creation.id)}
          className="text-left p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-green-500/30 hover:bg-slate-900 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center text-xs font-bold">
              {TYPE_ICONS[creation.type] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{creation.title}</h3>
              <p className="text-xs text-slate-500 capitalize">{creation.type}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[creation.status]}`}>
              {creation.status}
            </span>
            <span className="text-[10px] text-slate-600">
              {new Date(creation.updated_at).toLocaleDateString()}
            </span>
          </div>

          {creation.primary_trait && (
            <div className="mt-2">
              <span className="text-[10px] text-slate-500 capitalize">{creation.primary_trait.replace('_', ' ')}</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
