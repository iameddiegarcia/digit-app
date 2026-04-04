'use client'

import { motion } from 'framer-motion'
import type { DigitForm, DigitState } from '@/lib/types'
import { ROUND_BOT } from './digit-svg'

interface DigitCharacterProps {
  form: DigitForm
  state: DigitState
  color: string
  size?: number
}

const stateAnimations: Record<DigitState, Record<string, unknown>> = {
  idle: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  happy: {
    y: [0, -18, 0],
    scale: [1, 1.08, 1],
    transition: { repeat: Infinity, duration: 0.6, ease: 'easeOut' },
  },
  thinking: {
    rotate: [0, -3, 3, 0],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  celebrating: {
    y: [0, -24, 0],
    scale: [1, 1.12, 1],
    rotate: [0, -5, 5, 0],
    transition: { repeat: Infinity, duration: 0.5, ease: 'easeOut' },
  },
  transitioning: {
    scale: [1, 0.8, 1.1, 1],
    opacity: [1, 0.5, 1],
    transition: { duration: 0.8 },
  },
  listening: {
    scale: 1.03,
    y: -4,
    transition: { duration: 0.3 },
  },
  sleepy: {
    y: [0, 2, 0],
    rotate: [0, -2, 2, 0],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
}

export function DigitCharacter({ form, state, color, size = 200 }: DigitCharacterProps) {
  const parts = ROUND_BOT
  const mouthState = state in parts.mouth ? state : 'idle'

  return (
    <motion.div
      animate={stateAnimations[state] as import('framer-motion').TargetAndTransition}
      style={{ width: size, height: size }}
      className="relative"
    >
      <svg
        viewBox={parts.viewBox}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g dangerouslySetInnerHTML={{ __html: parts.extras(color) }} />
        <g dangerouslySetInnerHTML={{ __html: parts.body(color) }} />
        <g dangerouslySetInnerHTML={{ __html: parts.eyes }} />
        <g dangerouslySetInnerHTML={{ __html: parts.mouth[mouthState] }} />
      </svg>

      {state === 'thinking' && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 20,
            height: 20,
            background: '#FFD700',
            filter: 'blur(8px)',
            top: '2%',
            left: '46%',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {state === 'celebrating' && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-300"
              style={{
                top: `${20 + Math.random() * 40}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 20],
                opacity: [1, 0],
                scale: [1, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8 + Math.random() * 0.4,
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  )
}
