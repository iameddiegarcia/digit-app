'use client'

import { useRouter } from 'next/navigation'
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

const QUICK_ACTIONS = [
  { label: 'Build a Story', href: '/studio/stories/new', icon: '📖', color: 'from-green-500/20 to-emerald-500/10 border-green-500/30', description: 'Write a branching story for Santi and Emily' },
  { label: 'Design an Activity', href: '/studio/activities/new', icon: '🎨', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30', description: 'Create a fun learning activity' },
  { label: 'Create a Puzzle', href: '/studio/puzzles/new', icon: '🧩', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30', description: 'Make a matching or sorting puzzle' },
]

interface ProjectGridProps {
  creations: Creation[]
  onSelect: (id: string) => void
}

export function ProjectGrid({ creations, onSelect }: ProjectGridProps) {
  const router = useRouter()

  if (creations.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center mb-8">
          <p className="text-2xl mb-2">🐸</p>
          <p className="text-green-400 text-sm font-medium mb-1">Hey Kylie! What do you want to make for Santi and Emily today?</p>
          <p className="text-slate-500 text-xs">Pick one to get started!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.href}
              onClick={() => router.push(action.href)}
              className={`text-left p-5 rounded-xl bg-gradient-to-br ${action.color} border hover:scale-[1.02] transition-transform`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-2xl">{action.icon}</span>
              <h3 className="text-sm font-semibold text-white mt-2">{action.label}</h3>
              <p className="text-xs text-slate-400 mt-1">{action.description}</p>
            </motion.button>
          ))}
        </div>
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
