'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DigitSpeechProps {
  message: string | null
  isVisible: boolean
}

export function DigitSpeech({ message, isVisible }: DigitSpeechProps) {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 max-w-xs text-center"
        >
          <p className="text-lg font-medium text-white leading-relaxed">
            {message}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 backdrop-blur-md rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
