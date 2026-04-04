'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShapeBuilderProps {
  childColor: string
  onComplete: (engagement: number) => void
}

type ShapeType = 'circle' | 'square' | 'triangle'

interface ShapeSlot {
  shape: ShapeType
  x: number
  y: number
  placed: boolean
}

interface Puzzle {
  slots: ShapeSlot[]
}

const PUZZLES: Puzzle[] = [
  {
    slots: [
      { shape: 'circle', x: 50, y: 30, placed: false },
      { shape: 'square', x: 150, y: 30, placed: false },
      { shape: 'triangle', x: 100, y: 110, placed: false },
    ],
  },
  {
    slots: [
      { shape: 'square', x: 30, y: 40, placed: false },
      { shape: 'circle', x: 130, y: 40, placed: false },
      { shape: 'triangle', x: 50, y: 120, placed: false },
      { shape: 'square', x: 160, y: 120, placed: false },
    ],
  },
]

function ShapeSVG({ shape, size, color, ghost }: { shape: ShapeType; size: number; color: string; ghost?: boolean }) {
  const opacity = ghost ? 0.2 : 1
  const stroke = ghost ? color : 'none'
  const fill = ghost ? 'transparent' : color

  if (shape === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" fill={fill} stroke={stroke} strokeWidth="2" opacity={opacity} />
      </svg>
    )
  }
  if (shape === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <rect x="4" y="4" width="52" height="52" rx="6" fill={fill} stroke={stroke} strokeWidth="2" opacity={opacity} />
      </svg>
    )
  }
  // triangle
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <polygon points="30,4 56,56 4,56" fill={fill} stroke={stroke} strokeWidth="2" opacity={opacity} />
    </svg>
  )
}

const SHAPE_COLORS: Record<ShapeType, string> = {
  circle: '#EF4444',
  square: '#3B82F6',
  triangle: '#22C55E',
}

export function ShapeBuilder({ childColor, onComplete }: ShapeBuilderProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [placedSlots, setPlacedSlots] = useState<Set<number>>(new Set())
  const [feedback, setFeedback] = useState<string | null>(null)

  const puzzle = PUZZLES[puzzleIndex]

  // Find first unplaced slot matching this shape
  function handleShapeTap(shape: ShapeType) {
    if (feedback) return

    const slotIndex = puzzle.slots.findIndex(
      (s, i) => s.shape === shape && !placedSlots.has(i)
    )

    if (slotIndex === -1) return

    const newPlaced = new Set(placedSlots)
    newPlaced.add(slotIndex)
    setPlacedSlots(newPlaced)

    // Check if puzzle is complete
    if (newPlaced.size === puzzle.slots.length) {
      setFeedback('Great! 🎉')
      setTimeout(() => {
        setFeedback(null)
        if (puzzleIndex + 1 >= PUZZLES.length) {
          onComplete(4)
        } else {
          setPuzzleIndex((p) => p + 1)
          setPlacedSlots(new Set())
        }
      }, 800)
    }
  }

  // Build palette: one button per unplaced shape type needed
  const neededShapes = puzzle.slots
    .filter((_, i) => !placedSlots.has(i))
    .map((s) => s.shape)
  const uniqueNeeded = [...new Set(neededShapes)]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8">
      {/* Puzzle indicator */}
      <div className="flex gap-3">
        {PUZZLES.map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: i <= puzzleIndex ? childColor : 'rgba(255,255,255,0.2)',
              opacity: i <= puzzleIndex ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <span className="text-xl text-white/70">
        Tap the shapes to build the picture!
      </span>

      {/* Target area with ghost shapes */}
      <motion.div
        className="relative bg-white/5 rounded-3xl"
        style={{ width: 260, height: 200 }}
        key={puzzleIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {puzzle.slots.map((slot, i) => (
          <div
            key={i}
            data-testid="ghost-shape"
            className="absolute"
            style={{ left: slot.x, top: slot.y }}
          >
            {placedSlots.has(i) ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ShapeSVG shape={slot.shape} size={60} color={SHAPE_COLORS[slot.shape]} />
              </motion.div>
            ) : (
              <ShapeSVG shape={slot.shape} size={60} color={childColor} ghost />
            )}
          </div>
        ))}
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="text-2xl font-bold text-green-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shape palette */}
      <div className="flex gap-6">
        {uniqueNeeded.map((shape) => (
          <motion.button
            key={shape}
            onClick={() => handleShapeTap(shape)}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            aria-label={shape}
          >
            <ShapeSVG shape={shape} size={60} color={SHAPE_COLORS[shape]} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
