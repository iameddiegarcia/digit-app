'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BuildPuzzleProps {
  childColor: string
  onComplete: (engagement: number) => void
}

type PuzzleType = 'number' | 'shape' | 'color'

const PUZZLE_PROMPTS: { type: PuzzleType; prompt: string; example: string }[] = [
  {
    type: 'number',
    prompt: 'Create a number pattern',
    example: 'Like: 2, 4, 6, 8, ...',
  },
  {
    type: 'shape',
    prompt: 'Create a shape pattern',
    example: 'Like: ⭐🌙⭐🌙...',
  },
]

const SHAPE_OPTIONS = ['⭐', '🌙', '☀️', '❤️', '🔷', '🟢', '🌸', '⚡']
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'] as const

const TOTAL_ROUNDS = 2

export function BuildPuzzle({ childColor, onComplete }: BuildPuzzleProps) {
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'build' | 'predict' | 'review'>('build')
  const [pattern, setPattern] = useState<string[]>([])
  const [numberInput, setNumberInput] = useState('')
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [totalEngagement, setTotalEngagement] = useState(0)

  const currentPrompt = PUZZLE_PROMPTS[round % PUZZLE_PROMPTS.length]

  function addToPattern(item: string) {
    if (pattern.length < 8) {
      setPattern((p) => [...p, item])
    }
  }

  function addNumber() {
    const num = numberInput.trim()
    if (num && pattern.length < 8 && !isNaN(Number(num))) {
      setPattern((p) => [...p, num])
      setNumberInput('')
    }
  }

  function removeLastItem() {
    setPattern((p) => p.slice(0, -1))
  }

  function handleConfirmPattern() {
    if (pattern.length >= 3) {
      setPhase('predict')
    }
  }

  function handlePredict(diff: string) {
    setDifficulty(diff)
    setPhase('review')
    // Award engagement based on pattern length and having a prediction
    const score = Math.min(5, Math.max(2, pattern.length >= 5 ? 4 : 3))
    setTotalEngagement((t) => t + score)
  }

  function handleNext() {
    if (round + 1 >= TOTAL_ROUNDS) {
      const engagement = Math.min(5, Math.max(1, Math.round(totalEngagement / TOTAL_ROUNDS)))
      onComplete(engagement)
    } else {
      setRound((r) => r + 1)
      setPattern([])
      setDifficulty(null)
      setPhase('build')
      setNumberInput('')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-8 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-3">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: i <= round ? childColor : 'rgba(255,255,255,0.2)',
              opacity: i <= round ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <motion.div
        className="text-center"
        key={`${round}-${phase}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white/90">
          {currentPrompt.prompt}
        </h2>
        <p className="text-sm text-white/50 mt-1">{currentPrompt.example}</p>
      </motion.div>

      {/* Pattern display */}
      <div className="flex gap-2 items-center min-h-[60px] p-4 rounded-2xl bg-white/5 w-full justify-center flex-wrap">
        {pattern.length === 0 ? (
          <span className="text-white/30">Your pattern will appear here</span>
        ) : (
          pattern.map((item, i) => (
            <motion.span
              key={i}
              className="text-3xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {currentPrompt.type === 'number' ? (
                <span className="font-bold text-white/90">{item}</span>
              ) : (
                item
              )}
            </motion.span>
          ))
        )}
      </div>

      {phase === 'build' && (
        <>
          {currentPrompt.type === 'shape' ? (
            <div className="grid grid-cols-4 gap-3">
              {SHAPE_OPTIONS.map((shape) => (
                <motion.button
                  key={shape}
                  onClick={() => addToPattern(shape)}
                  className="text-3xl p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer"
                  whileTap={{ scale: 0.9 }}
                >
                  {shape}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNumber()}
                placeholder="Type a number"
                className="w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-center focus:outline-none focus:border-white/30"
              />
              <motion.button
                onClick={addNumber}
                className="px-4 py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: childColor }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </div>
          )}

          <div className="flex gap-3">
            {pattern.length > 0 && (
              <motion.button
                onClick={removeLastItem}
                className="px-4 py-2 rounded-full text-sm text-white/60 bg-white/5"
                whileTap={{ scale: 0.95 }}
              >
                Undo
              </motion.button>
            )}
            {pattern.length >= 3 && (
              <motion.button
                onClick={handleConfirmPattern}
                className="px-6 py-2 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: childColor }}
                whileTap={{ scale: 0.95 }}
              >
                Done! ({pattern.length} items)
              </motion.button>
            )}
          </div>
        </>
      )}

      {phase === 'predict' && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg text-white/70 text-center">
            How hard do you think this pattern is for Santi or Emily?
          </p>
          <div className="flex gap-4">
            {DIFFICULTY_OPTIONS.map((diff) => (
              <motion.button
                key={diff}
                onClick={() => handlePredict(diff)}
                className="px-6 py-3 rounded-full font-bold text-white/90 bg-white/5 hover:bg-white/10 cursor-pointer"
                whileTap={{ scale: 0.93 }}
              >
                {diff}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {phase === 'review' && (
        <motion.div
          className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xl font-bold text-white/90">Nice puzzle! 🧩</p>
          <p className="text-white/60">
            You predicted this is <span className="font-bold" style={{ color: childColor }}>{difficulty}</span> for your siblings
          </p>
          <motion.button
            onClick={handleNext}
            className="px-8 py-3 rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: childColor }}
            whileTap={{ scale: 0.95 }}
          >
            {round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Build another!'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
