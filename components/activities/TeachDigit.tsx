'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TeachDigitProps {
  childColor: string
  onComplete: (engagement: number) => void
}

const CONCEPTS = [
  'Why does ice melt?',
  'What makes a rainbow?',
  'Why do we need sleep?',
  'How do plants grow?',
  'Why is the sky blue?',
  'What causes thunder?',
  'Why do we have seasons?',
  'How do magnets work?',
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

interface EvalResult {
  clarity: number
  simplicity: number
  feedback: string
  tip: string
}

const TOTAL_ROUNDS = 2

export function TeachDigit({ childColor, onComplete }: TeachDigitProps) {
  const [round, setRound] = useState(0)
  const [concepts] = useState(() => shuffle(CONCEPTS).slice(0, TOTAL_ROUNDS))
  const [explanation, setExplanation] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<EvalResult | null>(null)
  const [totalScore, setTotalScore] = useState(0)

  async function handleSubmit() {
    if (!explanation.trim() || evaluating) return
    setEvaluating(true)

    try {
      const res = await fetch('/api/studio/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concepts[round], explanation }),
      })
      const data: EvalResult = await res.json()
      setResult(data)
      setTotalScore((s) => s + data.clarity + data.simplicity)
    } catch {
      setResult({
        clarity: 3,
        simplicity: 3,
        feedback: 'Great try! Keep it up!',
        tip: 'Try using simpler words.',
      })
      setTotalScore((s) => s + 6)
    } finally {
      setEvaluating(false)
    }
  }

  function handleNext() {
    if (round + 1 >= TOTAL_ROUNDS) {
      const avg = totalScore / (TOTAL_ROUNDS * 2)
      const engagement = Math.min(5, Math.max(1, Math.round(avg)))
      onComplete(engagement)
    } else {
      setRound((r) => r + 1)
      setExplanation('')
      setResult(null)
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
        key={round}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-lg text-white/60">Teach Digit:</span>
        <h2 className="text-2xl font-bold text-white/90 mt-2">
          {concepts[round]}
        </h2>
        <p className="text-sm text-white/50 mt-1">
          Explain it like you&apos;re teaching a younger kid
        </p>
      </motion.div>

      {!result ? (
        <>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Type your explanation here..."
            className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-4 text-white/90 placeholder:text-white/30 resize-none focus:outline-none focus:border-white/30"
            maxLength={500}
          />
          <motion.button
            onClick={handleSubmit}
            disabled={!explanation.trim() || evaluating}
            className="px-8 py-3 rounded-full text-lg font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: childColor }}
            whileTap={{ scale: 0.95 }}
          >
            {evaluating ? 'Digit is reading...' : 'Submit to Digit'}
          </motion.button>
        </>
      ) : (
        <motion.div
          className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Scores */}
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: childColor }}>
                {result.clarity}/5
              </div>
              <div className="text-xs text-white/50">Clarity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: childColor }}>
                {result.simplicity}/5
              </div>
              <div className="text-xs text-white/50">Simplicity</div>
            </div>
          </div>

          <p className="text-white/80 text-center">{result.feedback}</p>
          <p className="text-white/50 text-sm text-center italic">💡 {result.tip}</p>

          <motion.button
            onClick={handleNext}
            className="w-full py-3 rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: childColor }}
            whileTap={{ scale: 0.95 }}
          >
            {round + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Next concept'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
