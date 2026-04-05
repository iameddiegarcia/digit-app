'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SortItProps {
  childColor: string
  onComplete: (engagement: number) => void
}

interface SortItem {
  emoji: string
  name: string
  category: string
}

interface SortRound {
  items: SortItem[]
  categories: { name: string; color: string }[]
}

const ROUNDS: SortRound[] = [
  {
    categories: [
      { name: 'Red', color: '#EF4444' },
      { name: 'Blue', color: '#3B82F6' },
    ],
    items: [
      { emoji: '🍎', name: 'Apple', category: 'Red' },
      { emoji: '🚗', name: 'Car', category: 'Red' },
      { emoji: '❤️', name: 'Heart', category: 'Red' },
      { emoji: '🐳', name: 'Whale', category: 'Blue' },
      { emoji: '💧', name: 'Water', category: 'Blue' },
      { emoji: '🧢', name: 'Cap', category: 'Blue' },
    ],
  },
  {
    categories: [
      { name: 'Animals', color: '#22C55E' },
      { name: 'Food', color: '#F97316' },
    ],
    items: [
      { emoji: '🐶', name: 'Dog', category: 'Animals' },
      { emoji: '🐱', name: 'Cat', category: 'Animals' },
      { emoji: '🐸', name: 'Frog', category: 'Animals' },
      { emoji: '🍕', name: 'Pizza', category: 'Food' },
      { emoji: '🍌', name: 'Banana', category: 'Food' },
      { emoji: '🧁', name: 'Cupcake', category: 'Food' },
    ],
  },
  {
    categories: [
      { name: 'Big', color: '#A855F7' },
      { name: 'Small', color: '#EAB308' },
      { name: 'Fly', color: '#06B6D4' },
    ],
    items: [
      { emoji: '🐘', name: 'Elephant', category: 'Big' },
      { emoji: '🏠', name: 'House', category: 'Big' },
      { emoji: '🐜', name: 'Ant', category: 'Small' },
      { emoji: '🐛', name: 'Bug', category: 'Small' },
      { emoji: '🦅', name: 'Eagle', category: 'Fly' },
      { emoji: '🦋', name: 'Butterfly', category: 'Fly' },
    ],
  },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function SortIt({ childColor, onComplete }: SortItProps) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<SortItem | null>(null)
  const [sortedItems, setSortedItems] = useState<Set<string>>(new Set())
  const [correctCount, setCorrectCount] = useState(0)
  const shuffledRounds = useMemo(() => ROUNDS.map((r) => ({ ...r, items: shuffle(r.items) })), [])

  const current = shuffledRounds[roundIndex]
  const allSorted = current.items.every((item) => sortedItems.has(item.name))

  function handlePickItem(item: SortItem) {
    if (feedback || sortedItems.has(item.name)) return
    setSelectedItem(item)
  }

  function handleDropInCategory(categoryName: string) {
    if (!selectedItem || feedback) return

    if (selectedItem.category === categoryName) {
      setCorrectCount((c) => c + 1)
      setSortedItems((prev) => new Set(prev).add(selectedItem.name))
      setFeedback('Yes! 🎉')
      setSelectedItem(null)

      setTimeout(() => {
        setFeedback(null)
        const newSorted = new Set(sortedItems).add(selectedItem.name)
        if (current.items.every((item) => newSorted.has(item.name))) {
          if (roundIndex + 1 >= ROUNDS.length) {
            const engagement = Math.min(5, Math.max(2, Math.round(correctCount / 3) + 1))
            onComplete(engagement)
          } else {
            setRoundIndex((r) => r + 1)
            setSortedItems(new Set())
          }
        }
      }, 600)
    } else {
      setFeedback('Try another box!')
      setSelectedItem(null)
      setTimeout(() => setFeedback(null), 600)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-8">
      {/* Progress */}
      <div className="flex gap-3">
        {ROUNDS.map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-colors"
            style={{
              backgroundColor: i <= roundIndex ? childColor : 'rgba(255,255,255,0.2)',
              opacity: i <= roundIndex ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <span className="text-xl text-white/70">
        Tap an item, then tap its box!
      </span>

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

      {/* Items to sort */}
      <motion.div
        className="flex flex-wrap gap-3 justify-center max-w-md"
        key={roundIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {current.items.map((item) => {
          const isSorted = sortedItems.has(item.name)
          const isSelected = selectedItem?.name === item.name
          return (
            <motion.button
              key={item.name}
              onClick={() => handlePickItem(item)}
              className="flex flex-col items-center gap-1 p-4 rounded-2xl cursor-pointer"
              style={{
                backgroundColor: isSelected ? `${childColor}33` : 'rgba(255,255,255,0.05)',
                borderWidth: 2,
                borderColor: isSelected ? childColor : 'transparent',
                opacity: isSorted ? 0.3 : 1,
              }}
              whileTap={{ scale: 0.9 }}
              layout
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="text-xs text-white/60">{item.name}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Category boxes */}
      <div className="flex gap-4 mt-4">
        {current.categories.map((cat) => (
          <motion.button
            key={cat.name}
            onClick={() => handleDropInCategory(cat.name)}
            className="flex flex-col items-center gap-2 px-8 py-6 rounded-2xl cursor-pointer"
            style={{
              backgroundColor: `${cat.color}22`,
              borderWidth: 3,
              borderColor: cat.color,
              borderStyle: 'dashed',
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-lg font-bold" style={{ color: cat.color }}>
              {cat.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
