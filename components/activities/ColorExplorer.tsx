'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorExplorerProps {
  childColor: string
  onComplete: (engagement: number) => void
}

interface ColorOption {
  name: string
  hex: string
}

const ALL_COLORS: ColorOption[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
]

const TOTAL_ROUNDS = 4

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function generateRounds() {
  const shuffled = shuffle(ALL_COLORS)
  return shuffled.slice(0, TOTAL_ROUNDS).map((target) => {
    const others = ALL_COLORS.filter((c) => c.hex !== target.hex)
    const distractors = shuffle(others).slice(0, 2)
    const options = shuffle([target, ...distractors])
    return { target, options }
  })
}

export function ColorExplorer({ childColor, onComplete }: ColorExplorerProps) {
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const rounds = useMemo(() => generateRounds(), [])

  const current = rounds[round]

  function handleTap(color: ColorOption) {
    if (feedback) return

    if (color.hex === current.target.hex) {
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
      setFeedback('Try again!')
      setTimeout(() => setFeedback(null), 600)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      {/* Progress dots */}
      <div className="flex gap-3">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            data-testid="progress-dot"
            className="w-3 h-3 rounded-full transition-colors"
            style={{
              backgroundColor: i < round ? childColor : i === round ? childColor : 'rgba(255,255,255,0.2)',
              opacity: i <= round ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Target color display */}
      <motion.div
        className="flex flex-col items-center gap-4"
        key={round}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xl text-white/70">Find this color:</span>
        <motion.div
          className="w-28 h-28 rounded-3xl shadow-lg"
          style={{ backgroundColor: current.target.hex }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <span className="text-2xl font-bold text-white/90">
          {current.target.name}
        </span>
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

      {/* Color options */}
      <div className="flex gap-6">
        {current.options.map((color) => (
          <motion.button
            key={color.hex}
            onClick={() => handleTap(color)}
            className="w-24 h-24 rounded-2xl shadow-md cursor-pointer"
            style={{ backgroundColor: color.hex }}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            aria-label={color.name}
          />
        ))}
      </div>
    </div>
  )
}
