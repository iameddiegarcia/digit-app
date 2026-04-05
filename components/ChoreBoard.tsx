'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Chore {
  id: string
  title: string
  emoji: string
  points: number
  frequency: string
  character_trait: string | null
}

interface Completion {
  id: string
  chore_id: string
  streak_count: number
}

export default function ChoreBoard({ childId, color }: { childId: string; color: string }) {
  const [chores, setChores] = useState<Chore[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    loadChores()
  }, [childId])

  async function loadChores() {
    try {
      const res = await fetch('/api/dashboard/chores')
      if (res.ok) {
        const data = await res.json()
        setChores((data.chores ?? []).filter((c: Chore & { child_id: string }) => c.child_id === childId))
        const childCompletions = (data.completions ?? []).filter((c: Completion & { child_id: string }) => c.child_id === childId)
        setCompletions(childCompletions)
        setTotalPoints(childCompletions.reduce((s: number, c: { points_earned: number }) => s + c.points_earned, 0))
      }
    } catch { /* ignore */ }
  }

  async function completeChore(choreId: string) {
    const res = await fetch('/api/dashboard/chores/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choreId, childId }),
    })
    if (res.ok) {
      const { streak } = await res.json()
      setCelebrating(choreId)
      setTimeout(() => setCelebrating(null), 2000)
      loadChores()
    }
  }

  const completedIds = new Set(completions.map((c) => c.chore_id))

  if (chores.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">My Chores</h3>
        {totalPoints > 0 && (
          <span className="text-[11px] font-medium text-amber-400">⭐ {totalPoints} points today</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {chores.map((chore) => {
          const done = completedIds.has(chore.id)
          const isCelebrating = celebrating === chore.id

          return (
            <motion.button
              key={chore.id}
              onClick={() => !done && completeChore(chore.id)}
              disabled={done}
              className="relative rounded-xl p-4 text-left transition-all"
              style={{
                backgroundColor: done ? color + '10' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${done ? color + '30' : 'rgba(255,255,255,0.06)'}`,
                opacity: done ? 0.7 : 1,
              }}
              whileTap={!done ? { scale: 0.96 } : undefined}
            >
              <div className="text-2xl mb-2">{chore.emoji}</div>
              <p className={`text-[12px] font-medium ${done ? 'line-through text-slate-500' : 'text-white'}`}>
                {chore.title}
              </p>
              <p className="text-[9px] text-amber-500 mt-1">{chore.points} pt{chore.points !== 1 ? 's' : ''}</p>

              {done && (
                <motion.div
                  className="absolute top-2 right-2 text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  ✓
                </motion.div>
              )}

              <AnimatePresence>
                {isCelebrating && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center rounded-xl"
                    style={{ backgroundColor: color + '20' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                  >
                    <span className="text-3xl">🎉</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
