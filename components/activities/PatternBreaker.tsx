'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PatternBreakerProps {
  childColor: string
  onComplete: (engagement: number) => void
}

type PatternItem = { emoji: string; label: string }

const PATTERNS: { sequence: PatternItem[]; answer: PatternItem; options: PatternItem[] }[] = [
  {
    sequence: [
      { emoji: '🔴', label: 'Red' },
      { emoji: '🔵', label: 'Blue' },
      { emoji: '🔴', label: 'Red' },
      { emoji: '🔵', label: 'Blue' },
    ],
    answer: { emoji: '🔴', label: 'Red' },
    options: [
      { emoji: '🔴', label: 'Red' },
      { emoji: '🟢', label: 'Green' },
      { emoji: '🔵', label: 'Blue' },
    ],
  },
  {
    sequence: [
      { emoji: '⭐', label: 'Star' },
      { emoji: '⭐', label: 'Star' },
      { emoji: '🌙', label: 'Moon' },
      { emoji: '⭐', label: 'Star' },
      { emoji: '⭐', label: 'Star' },
    ],
    answer: { emoji: '🌙', label: 'Moon' },
    options: [
      { emoji: '⭐', label: 'Star' },
      { emoji: '🌙', label: 'Moon' },
      { emoji: '☀️', label: 'Sun' },
    ],
  },
  {
    sequence: [
      { emoji: '🍎', label: 'Apple' },
      { emoji: '🍌', label: 'Banana' },
      { emoji: '🍎', label: 'Apple' },
      { emoji: '🍌', label: 'Banana' },
      { emoji: '🍎', label: 'Apple' },
    ],
    answer: { emoji: '🍌', label: 'Banana' },
    options: [
      { emoji: '🍌', label: 'Banana' },
      { emoji: '🍇', label: 'Grape' },
      { emoji: '🍎', label: 'Apple' },
    ],
  },
  {
    sequence: [
      { emoji: '🟩', label: 'Green' },
      { emoji: '🟨', label: 'Yellow' },
      { emoji: '🟩', label: 'Green' },
      { emoji: '🟨', label: 'Yellow' },
      { emoji: '🟩', label: 'Green' },
    ],
    answer: { emoji: '🟨', label: 'Yellow' },
    options: [
      { emoji: '🟥', label: 'Red' },
      { emoji: '🟨', label: 'Yellow' },
      { emoji: '🟩', label: 'Green' },
    ],
  },
  {
    sequence: [
      { emoji: '🐶', label: 'Dog' },
      { emoji: '🐱', label: 'Cat' },
      { emoji: '🐶', label: 'Dog' },
      { emoji: '🐱', label: 'Cat' },
    ],
    answer: { emoji: '🐶', label: 'Dog' },
    options: [
      { emoji: '🐱', label: 'Cat' },
      { emoji: '🐶', label: 'Dog' },
      { emoji: '🐸', label: 'Frog' },
    ],
  },
]

const TOTAL_ROUNDS = 5

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function PatternBreaker({ childColor, onComplete }: PatternBreakerProps) {
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const rounds = useMemo(() => shuffle(PATTERNS).slice(0, TOTAL_ROUNDS), [])

  const current = rounds[round]

  function handleTap(item: PatternItem) {
    if (feedback) return

    if (item.label === current.answer.label) {
      setCorrectCount((c) => c + 1)
      setFeedback('Yes! 🎉')
      setTimeout(() => {
        setFeedback(null)
        if (round + 1 >= TOTAL_ROUNDS) {
          const engagement = Math.min(5, Math.max(1, correctCount + 1))
          onComplete(engagement)
        } else {
          setRound((r) => r + 1)
        }
      }, 800)
    } else {
      setFeedback('Look at the pattern!')
      setTimeout(() => setFeedback(null), 800)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      {/* Progress dots */}
      <div className="flex gap-3">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-colors"
            style={{
              backgroundColor: i <= round ? childColor : 'rgba(255,255,255,0.2)',
              opacity: i <= round ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <span className="text-xl text-white/70">What comes next?</span>

      {/* Pattern sequence */}
      <motion.div
        className="flex items-center gap-3"
        key={round}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {current.sequence.map((item, i) => (
          <span key={i} className="text-5xl">
            {item.emoji}
          </span>
        ))}
        <motion.span
          className="text-5xl"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          ❓
        </motion.span>
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

      {/* Options */}
      <div className="flex gap-6">
        {current.options.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => handleTap(item)}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-5xl">{item.emoji}</span>
            <span className="text-sm text-white/70">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
