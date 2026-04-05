'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OppositeGameProps {
  childColor: string
  onComplete: (engagement: number) => void
}

interface GameItem {
  emoji: string
  name: string
  size: 'big' | 'small'
}

const ITEM_SETS: GameItem[][] = [
  [
    { emoji: '🐘', name: 'Elephant', size: 'big' },
    { emoji: '🐜', name: 'Ant', size: 'small' },
    { emoji: '🏠', name: 'House', size: 'big' },
    { emoji: '🍎', name: 'Apple', size: 'small' },
    { emoji: '🚌', name: 'Bus', size: 'big' },
    { emoji: '🐛', name: 'Bug', size: 'small' },
  ],
  [
    { emoji: '🦕', name: 'Dino', size: 'big' },
    { emoji: '🐁', name: 'Mouse', size: 'small' },
    { emoji: '⛰️', name: 'Mountain', size: 'big' },
    { emoji: '🌱', name: 'Seed', size: 'small' },
    { emoji: '🐋', name: 'Whale', size: 'big' },
    { emoji: '🐝', name: 'Bee', size: 'small' },
  ],
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function OppositeGame({ childColor, onComplete }: OppositeGameProps) {
  const [phase, setPhase] = useState<'big' | 'switch' | 'small'>('big')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [tappedItems, setTappedItems] = useState<Set<string>>(new Set())
  const [setIndex, setSetIndex] = useState(0)
  const items = useMemo(() => ITEM_SETS.map((s) => shuffle(s)), [])

  const currentItems = items[setIndex] ?? items[0]
  const targetSize = phase === 'small' ? 'small' : 'big'
  const targetCount = currentItems.filter((i) => i.size === targetSize).length

  const handleTap = useCallback(
    (item: GameItem) => {
      if (feedback || tappedItems.has(item.name)) return

      if (item.size === targetSize) {
        setCorrectCount((c) => c + 1)
        setTappedItems((prev) => new Set(prev).add(item.name))
        setFeedback('Yes! 🎉')

        const newTapped = new Set(tappedItems).add(item.name)
        const done = currentItems.filter((i) => i.size === targetSize).every((i) => newTapped.has(i.name))

        setTimeout(() => {
          setFeedback(null)
          if (done) {
            if (phase === 'big') {
              setPhase('switch')
              setTappedItems(new Set())
              setTimeout(() => setPhase('small'), 1500)
            } else {
              const engagement = Math.min(5, Math.max(2, Math.round(correctCount / 2)))
              onComplete(engagement)
            }
          }
        }, 600)
      } else {
        setFeedback('Not that one!')
        setTimeout(() => setFeedback(null), 600)
      }
    },
    [feedback, tappedItems, targetSize, currentItems, phase, correctCount, onComplete]
  )

  if (phase === 'switch') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
        <motion.div
          className="text-4xl font-bold text-white/90 text-center"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          🔄 Now switch!
        </motion.div>
        <motion.div
          className="text-2xl text-white/70 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Tap the <span className="font-bold" style={{ color: childColor }}>SMALL</span> things!
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      {/* Instruction */}
      <motion.div
        className="text-2xl font-bold text-white/90 text-center"
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Tap the{' '}
        <span style={{ color: childColor }}>
          {targetSize === 'big' ? 'BIG' : 'SMALL'}
        </span>{' '}
        things!
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="text-2xl font-bold"
            style={{ color: feedback.includes('Yes') ? '#22C55E' : '#F97316' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {currentItems.map((item, index) => {
          const isTapped = tappedItems.has(item.name)
          return (
            <motion.button
              key={item.name}
              onClick={() => handleTap(item)}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl cursor-pointer transition-colors"
              style={{
                backgroundColor: isTapped ? `${childColor}22` : 'rgba(255,255,255,0.05)',
                borderWidth: 2,
                borderColor: isTapped ? childColor : 'transparent',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isTapped ? 0.5 : 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className={item.size === 'big' ? 'text-6xl' : 'text-4xl'}>
                {item.emoji}
              </span>
              <span className="text-sm text-white/70">{item.name}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
