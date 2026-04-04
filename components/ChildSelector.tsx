'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DigitCharacter } from '@/components/digit/DigitCharacter'

interface ChildOption {
  id: string
  nickname: string
  color: string
  available: boolean
}

const CHILDREN: ChildOption[] = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    nickname: 'Santi',
    color: '#60A5FA',
    available: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000020',
    nickname: 'Emily',
    color: '#F9A8D4',
    available: false, // TBD — Emily's Kitty form not yet implemented
  },
]

export function ChildSelector() {
  const router = useRouter()

  function handleSelect(child: ChildOption) {
    if (!child.available) return
    router.push(`/play/${child.id}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 px-8">
      <motion.h1
        className="text-4xl font-bold text-white/90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Who's playing?
      </motion.h1>

      <div className="flex gap-16">
        {CHILDREN.map((child, index) => (
          <motion.button
            key={child.id}
            onClick={() => handleSelect(child)}
            disabled={!child.available}
            className={`flex flex-col items-center gap-4 p-8 rounded-3xl transition-colors ${
              child.available
                ? 'hover:bg-white/5 cursor-pointer active:scale-95'
                : 'opacity-40 cursor-not-allowed'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
            whileTap={child.available ? { scale: 0.92 } : undefined}
          >
            <DigitCharacter
              form="round_bot"
              state={child.available ? 'idle' : 'sleepy'}
              color={child.color}
              size={160}
            />
            <span
              className="text-2xl font-semibold"
              style={{ color: child.color }}
            >
              {child.nickname}
            </span>
            {!child.available && (
              <span className="text-sm text-white/30">Coming soon</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
