'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CHARACTER_TRAIT_LABELS, ALL_CHARACTER_TRAITS, type CharacterTrait } from '@/lib/character-values'

interface Chore {
  id: string
  child_id: string
  title: string
  description: string | null
  emoji: string
  points: number
  frequency: string
  character_trait: string | null
}

interface Completion {
  id: string
  chore_id: string
  child_id: string
  completed_at: string
  approved: boolean
  points_earned: number
  streak_count: number
}

interface ChildInfo {
  id: string
  name: string
  color: string
}

const SUGGESTED_CHORES: Record<string, { title: string; emoji: string; trait: CharacterTrait; ages: string }[]> = {
  toddler: [
    { title: 'Put toys away', emoji: '🧸', trait: 'self_control', ages: '2-4' },
    { title: 'Put dirty clothes in hamper', emoji: '👕', trait: 'responsibility' as CharacterTrait, ages: '2-4' },
    { title: 'Help feed pet', emoji: '🐾', trait: 'kindness', ages: '2-4' },
    { title: 'Wipe up spills', emoji: '🧽', trait: 'goodness', ages: '2-4' },
  ],
  kid: [
    { title: 'Make bed', emoji: '🛏️', trait: 'faithfulness', ages: '5-8' },
    { title: 'Set the table', emoji: '🍽️', trait: 'kindness', ages: '5-8' },
    { title: 'Water plants', emoji: '🌱', trait: 'patience', ages: '5-8' },
    { title: 'Fold laundry', emoji: '👚', trait: 'self_control', ages: '5-8' },
  ],
  preteen: [
    { title: 'Load/unload dishwasher', emoji: '🫧', trait: 'faithfulness', ages: '9-12' },
    { title: 'Take out trash', emoji: '🗑️', trait: 'goodness', ages: '9-12' },
    { title: 'Help prepare dinner', emoji: '🍳', trait: 'love', ages: '9-12' },
    { title: 'Clean bathroom', emoji: '🚿', trait: 'self_control', ages: '9-12' },
    { title: 'Help younger siblings', emoji: '🤝', trait: 'gentleness', ages: '9-12' },
  ],
}

const CHILDREN: ChildInfo[] = [
  { id: '00000000-0000-0000-0000-000000000020', name: 'Emily', color: '#F9A8D4' },
  { id: '00000000-0000-0000-0000-000000000010', name: 'Santi', color: '#60A5FA' },
  { id: '00000000-0000-0000-0000-000000000030', name: 'Kylie', color: '#4ADE80' },
]

function getChildAge(id: string): string {
  if (id.endsWith('20')) return 'toddler'  // Emily, 2
  if (id.endsWith('10')) return 'toddler'  // Santi, 3
  return 'preteen'                          // Kylie, 10
}

export default function ChoreManager() {
  const [chores, setChores] = useState<Chore[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>(CHILDREN[0].id)
  const [newTitle, setNewTitle] = useState('')
  const [newEmoji, setNewEmoji] = useState('✅')
  const [newPoints, setNewPoints] = useState(1)
  const [newFreq, setNewFreq] = useState('daily')
  const [newTrait, setNewTrait] = useState<string>('')

  useEffect(() => {
    loadChores()
  }, [])

  async function loadChores() {
    try {
      const res = await fetch('/api/dashboard/chores')
      if (res.ok) {
        const data = await res.json()
        setChores(data.chores)
        setCompletions(data.completions)
      }
    } catch { /* ignore */ }
  }

  async function addChore() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/dashboard/chores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: selectedChild,
        title: newTitle,
        emoji: newEmoji,
        points: newPoints,
        frequency: newFreq,
        characterTrait: newTrait || null,
      }),
    })
    if (res.ok) {
      setNewTitle('')
      setNewEmoji('✅')
      setNewPoints(1)
      setNewTrait('')
      setShowAdd(false)
      loadChores()
    }
  }

  async function addSuggested(suggestion: { title: string; emoji: string; trait: CharacterTrait }, childId: string) {
    await fetch('/api/dashboard/chores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        title: suggestion.title,
        emoji: suggestion.emoji,
        points: 1,
        frequency: 'daily',
        characterTrait: suggestion.trait,
      }),
    })
    loadChores()
  }

  async function removeChore(id: string) {
    await fetch(`/api/dashboard/chores?id=${id}`, { method: 'DELETE' })
    loadChores()
  }

  async function approveCompletion(completionId: string) {
    await fetch('/api/dashboard/chores/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionId }),
    })
    loadChores()
  }

  // Pending approvals
  const pendingApprovals = completions.filter((c) => !c.approved)

  return (
    <div className="space-y-4">
      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.12] p-4">
          <h4 className="text-xs font-semibold text-amber-400 mb-2">
            Pending Approval ({pendingApprovals.length})
          </h4>
          <div className="space-y-2">
            {pendingApprovals.map((comp) => {
              const chore = chores.find((c) => c.id === comp.chore_id)
              const child = CHILDREN.find((c) => c.id === comp.child_id)
              return (
                <motion.div
                  key={comp.id}
                  className="flex items-center justify-between py-1.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{chore?.emoji}</span>
                    <span className="text-[11px] text-slate-300">{chore?.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ color: child?.color, backgroundColor: child?.color + '15' }}>
                      {child?.name}
                    </span>
                    {comp.streak_count > 1 && (
                      <span className="text-[9px] text-orange-400">🔥 {comp.streak_count}</span>
                    )}
                  </div>
                  <button
                    onClick={() => approveCompletion(comp.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                  >
                    Approve
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Per-child chore lists */}
      {CHILDREN.map((child) => {
        const childChores = chores.filter((c) => c.child_id === child.id)
        const todayCompletions = completions.filter((c) => c.child_id === child.id)
        const totalPoints = todayCompletions.reduce((s, c) => s + c.points_earned, 0)
        const suggestions = SUGGESTED_CHORES[getChildAge(child.id)] ?? []
        const existingTitles = new Set(childChores.map((c) => c.title))
        const availableSuggestions = suggestions.filter((s) => !existingTitles.has(s.title))

        return (
          <div key={child.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: child.color + '33', border: `1px solid ${child.color}` }}
                >
                  {child.name[0]}
                </div>
                <h4 className="text-sm font-semibold text-white">{child.name}&apos;s Chores</h4>
              </div>
              {totalPoints > 0 && (
                <span className="text-[10px] font-medium text-amber-400">
                  ⭐ {totalPoints} pts today
                </span>
              )}
            </div>

            {/* Active chores */}
            {childChores.length > 0 ? (
              <div className="space-y-1.5 mb-3">
                {childChores.map((chore) => {
                  const done = todayCompletions.some((c) => c.chore_id === chore.id)
                  return (
                    <div key={chore.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{chore.emoji}</span>
                        <span className={`text-[11px] ${done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                          {chore.title}
                        </span>
                        {chore.character_trait && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-violet-500/10 text-violet-400">
                            {CHARACTER_TRAIT_LABELS[chore.character_trait as CharacterTrait] ?? chore.character_trait}
                          </span>
                        )}
                        <span className="text-[8px] text-slate-600">{chore.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-amber-500">{chore.points}pt</span>
                        <button
                          onClick={() => removeChore(chore.id)}
                          className="text-[10px] text-slate-600 hover:text-red-400 transition-colors px-1"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 mb-3">No chores assigned yet</p>
            )}

            {/* Quick-add suggestions */}
            {availableSuggestions.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] text-slate-500 mb-1.5">Quick Add</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableSuggestions.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => addSuggested(s, child.id)}
                      className="px-2 py-1 rounded-lg text-[10px] bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12] transition-colors"
                    >
                      {s.emoji} {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add custom chore */}
      <AnimatePresence>
        {showAdd ? (
          <motion.div
            className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-xs font-semibold text-white mb-3">Add Custom Chore</h4>
            <div className="space-y-3">
              {/* Child select */}
              <div className="flex gap-2">
                {CHILDREN.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChild(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      selectedChild === c.id
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={selectedChild === c.id ? {
                      backgroundColor: c.color + '20',
                      border: `1px solid ${c.color}40`,
                    } : { border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Title + emoji */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="w-12 px-2 py-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-center text-sm text-white"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Chore name"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-sm text-white placeholder:text-slate-600"
                />
              </div>

              {/* Points + frequency */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Points:</span>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-sm text-white text-center"
                    min={1}
                    max={10}
                  />
                </div>
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-sm text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="once">One-time</option>
                </select>
                <select
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-sm text-white"
                >
                  <option value="">Trait (optional)</option>
                  {ALL_CHARACTER_TRAITS.map((t) => (
                    <option key={t} value={t}>{CHARACTER_TRAIT_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addChore}
                  className="px-4 py-2 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  Add Chore
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg text-[11px] text-slate-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-2.5 rounded-xl text-[11px] font-medium text-slate-400 border border-dashed border-white/[0.08] hover:border-white/[0.15] hover:text-white transition-colors"
          >
            + Add Custom Chore
          </button>
        )}
      </AnimatePresence>
    </div>
  )
}
