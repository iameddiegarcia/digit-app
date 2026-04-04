'use client'

import { motion } from 'framer-motion'
import { DigitCharacter } from '@/components/digit/DigitCharacter'

interface CelebrationProps {
  childName: string
  activityTitle: string
  childColor: string
  onPlayMore: () => void
}

const CONFETTI_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#F97316',
]

function ConfettiParticle({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const left = `${5 + Math.random() * 90}%`
  const size = 6 + Math.random() * 8
  const delay = Math.random() * 1.5
  const duration = 1.5 + Math.random() * 1.5

  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left,
        top: '-5%',
      }}
      animate={{
        y: [0, window?.innerHeight ? window.innerHeight + 50 : 900],
        x: [0, (Math.random() - 0.5) * 120],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeIn',
      }}
    />
  )
}

export function Celebration({ childName, activityTitle, childColor, onPlayMore }: CelebrationProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-8 px-8 overflow-hidden">
      {/* Confetti layer */}
      {Array.from({ length: 20 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}

      {/* Celebrating Digit */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <DigitCharacter
          form="round_bot"
          state="celebrating"
          color={childColor}
          size={180}
        />
      </motion.div>

      {/* Messages */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white/90">
          Amazing job,{' '}
          <span style={{ color: childColor }}>{childName}</span>!
        </h1>
        <p className="text-xl text-white/60">
          You finished {activityTitle}!
        </p>
      </motion.div>

      {/* Play more button */}
      <motion.button
        onClick={onPlayMore}
        className="px-10 py-4 rounded-full text-xl font-semibold cursor-pointer text-white"
        style={{ backgroundColor: childColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
      >
        Play more!
      </motion.button>
    </div>
  )
}
