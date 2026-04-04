'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StoryTapProps {
  childColor: string
  onComplete: (engagement: number) => void
}

interface StoryBeat {
  text: string
  emoji: string
  action: string
  animation: {
    animate: object
    transition: object
  }
}

const BEATS: StoryBeat[] = [
  {
    text: 'Bear walks through the forest',
    emoji: '🐻',
    action: 'Tap to make Bear walk!',
    animation: {
      animate: { x: [0, 40, 80, 40, 0] },
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
  },
  {
    text: 'Bird flies over the trees',
    emoji: '🐦',
    action: 'Tap to make Bird fly!',
    animation: {
      animate: { x: [0, 30, 60, 30, 0], y: [0, -40, -20, -50, 0] },
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
  },
  {
    text: 'Bunny jumps with joy',
    emoji: '🐰',
    action: 'Tap to make Bunny jump!',
    animation: {
      animate: { y: [0, -50, 0, -30, 0] },
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  },
  {
    text: 'Everyone dances together',
    emoji: '🎉',
    action: 'Tap to start the party!',
    animation: {
      animate: { rotate: [0, 15, -15, 15, -15, 0] },
      transition: { duration: 1, ease: 'easeInOut' },
    },
  },
  {
    text: 'A beautiful flower grows',
    emoji: '🌸',
    action: 'Tap to grow the flower!',
    animation: {
      animate: { scale: [0.3, 0.6, 1, 1.2, 1] },
      transition: { duration: 1, ease: 'easeOut' },
    },
  },
]

export function StoryTap({ childColor, onComplete }: StoryTapProps) {
  const [beatIndex, setBeatIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  const beat = BEATS[beatIndex]

  function handleTap() {
    if (animating) return
    setAnimating(true)
    setAnimationKey((k) => k + 1)

    setTimeout(() => {
      setAnimating(false)
      if (beatIndex + 1 >= BEATS.length) {
        onComplete(5)
      } else {
        setBeatIndex((b) => b + 1)
      }
    }, 1300)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      {/* Progress dots */}
      <div className="flex gap-3">
        {BEATS.map((_, i) => (
          <div
            key={i}
            data-testid="progress-dot"
            className="w-3 h-3 rounded-full transition-colors"
            style={{
              backgroundColor: i <= beatIndex ? childColor : 'rgba(255,255,255,0.2)',
              opacity: i <= beatIndex ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Story text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beatIndex}
          className="text-2xl font-semibold text-white/90 text-center max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {beat.text}
        </motion.p>
      </AnimatePresence>

      {/* Animated emoji area */}
      <div className="relative h-40 w-40 flex items-center justify-center">
        <motion.div
          key={animationKey}
          className="text-7xl select-none"
          {...(animating ? beat.animation : {})}
        >
          {beat.emoji}
        </motion.div>
      </div>

      {/* Tap button */}
      <motion.button
        onClick={handleTap}
        disabled={animating}
        className="flex flex-col items-center gap-2 px-10 py-6 rounded-full cursor-pointer"
        style={{ backgroundColor: `${childColor}22`, border: `2px solid ${childColor}` }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-4xl">{beat.emoji}</span>
        <span className="text-lg font-medium" style={{ color: childColor }}>
          {beat.action}
        </span>
      </motion.button>

      {/* Instruction */}
      <span className="text-sm text-white/40">Tap to continue the story</span>
    </div>
  )
}
