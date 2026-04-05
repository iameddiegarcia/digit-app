'use client'

import { motion } from 'framer-motion'
import { getActivitiesForAge, ACTIVITIES } from '@/lib/activities'
import type { Activity } from '@/lib/types'

interface ActivityPickerProps {
  childName: string
  childColor: string
  childAge?: number
  onSelect: (activity: Activity) => void
}

const ACTIVITY_ICONS: Record<string, string> = {
  'color-explorer': '🌈',
  'shape-builder': '🔷',
  'story-tap': '📖',
  'tap-the-sound': '🔊',
  'opposite-game': '🔄',
  'pattern-breaker': '🧩',
  'sort-it': '📦',
  'teach-digit': '🎓',
  'build-puzzle': '🏗️',
}

export function ActivityPicker({ childName, childColor, childAge, onSelect }: ActivityPickerProps) {
  const activities = childAge != null ? getActivitiesForAge(childAge) : ACTIVITIES

  return (
    <div className="flex flex-col items-center gap-10 px-8 py-12 min-h-screen">
      <motion.h1
        className="text-3xl font-bold text-white/90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        What should we play,{' '}
        <span style={{ color: childColor }}>{childName}</span>?
      </motion.h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {activities.map((activity, index) => (
          <motion.button
            key={activity.id}
            onClick={() => onSelect(activity)}
            className="flex flex-col items-center gap-2 p-5 sm:p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            whileTap={{ scale: 0.93 }}
          >
            <span className="text-5xl" role="img" aria-label={activity.title}>
              {ACTIVITY_ICONS[activity.id] ?? '🎮'}
            </span>
            <span
              className="text-xl font-semibold"
              style={{ color: childColor }}
            >
              {activity.title}
            </span>
            <span className="text-sm text-white/60 text-center">
              {activity.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
