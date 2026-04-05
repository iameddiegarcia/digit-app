'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TapTheSoundProps {
  childColor: string
  onComplete: (engagement: number) => void
}

interface SoundRound {
  sound: string
  answer: string
  options: { emoji: string; name: string }[]
}

const ANIMALS = [
  { emoji: '🐶', name: 'Dog', sound: 'Woof woof!' },
  { emoji: '🐱', name: 'Cat', sound: 'Meow!' },
  { emoji: '🐮', name: 'Cow', sound: 'Mooo!' },
  { emoji: '🐷', name: 'Pig', sound: 'Oink oink!' },
  { emoji: '🐸', name: 'Frog', sound: 'Ribbit!' },
  { emoji: '🦁', name: 'Lion', sound: 'Roar!' },
  { emoji: '🐔', name: 'Chicken', sound: 'Cluck cluck!' },
  { emoji: '🦆', name: 'Duck', sound: 'Quack!' },
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

function generateRounds(): SoundRound[] {
  const picked = shuffle(ANIMALS).slice(0, TOTAL_ROUNDS)
  return picked.map((target) => {
    const others = ANIMALS.filter((a) => a.name !== target.name)
    const distractors = shuffle(others).slice(0, 2)
    const options = shuffle([
      { emoji: target.emoji, name: target.name },
      ...distractors.map((d) => ({ emoji: d.emoji, name: d.name })),
    ])
    return { sound: target.sound, answer: target.name, options }
  })
}

export function TapTheSound({ childColor, onComplete }: TapTheSoundProps) {
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showSound, setShowSound] = useState(true)
  const rounds = useMemo(() => generateRounds(), [])

  const current = rounds[round]

  const handleTap = useCallback(
    (name: string) => {
      if (feedback) return

      if (name === current.answer) {
        setCorrectCount((c) => c + 1)
        setFeedback('Yes! 🎉')
        setTimeout(() => {
          setFeedback(null)
          if (round + 1 >= TOTAL_ROUNDS) {
            const engagement = Math.min(5, Math.max(1, correctCount + 1))
            onComplete(engagement)
          } else {
            setRound((r) => r + 1)
            setShowSound(true)
          }
        }, 800)
      } else {
        setFeedback('Try again!')
        setTimeout(() => setFeedback(null), 600)
      }
    },
    [feedback, current, round, correctCount, onComplete]
  )

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

      {/* Sound display */}
      <motion.div
        className="flex flex-col items-center gap-4"
        key={round}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xl text-white/70">Who says...</span>
        <motion.div
          className="text-5xl font-bold px-8 py-6 rounded-3xl bg-white/10"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          {current.sound}
        </motion.div>
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

      {/* Animal options */}
      <div className="flex gap-6">
        {current.options.map((option) => (
          <motion.button
            key={option.name}
            onClick={() => handleTap(option.name)}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-6xl">{option.emoji}</span>
            <span className="text-lg text-white/80">{option.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
