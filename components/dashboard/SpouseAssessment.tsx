'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ALL_CHARACTER_TRAITS, CHARACTER_TRAIT_LABELS, CHARACTER_FOUNDATIONS, type CharacterTrait } from '@/lib/character-values'

interface SpouseAssessmentProps {
  existingRatings?: Record<string, number> | null
  existingGrateful?: string | null
  existingPrayer?: string | null
  onSubmit: (data: { ratings: Record<string, number>; grateful_for: string; prayer_request: string }) => Promise<void>
}

export function SpouseAssessment({ existingRatings, existingGrateful, existingPrayer, onSubmit }: SpouseAssessmentProps) {
  const [ratings, setRatings] = useState<Record<string, number>>(
    existingRatings ?? Object.fromEntries(ALL_CHARACTER_TRAITS.map((t) => [t, 0]))
  )
  const [grateful, setGrateful] = useState(existingGrateful ?? '')
  const [prayer, setPrayer] = useState(existingPrayer ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!existingRatings)

  function getFoundation(trait: CharacterTrait) {
    return CHARACTER_FOUNDATIONS.find((f) => f.trait === trait)
  }

  function setRating(trait: string, value: number) {
    setRatings((prev) => ({ ...prev, [trait]: value }))
    setSaved(false)
  }

  async function handleSubmit() {
    const allRated = ALL_CHARACTER_TRAITS.every((t) => ratings[t] > 0)
    if (!allRated) return
    setSaving(true)
    await onSubmit({ ratings, grateful_for: grateful, prayer_request: prayer })
    setSaving(false)
    setSaved(true)
  }

  const allRated = ALL_CHARACTER_TRAITS.every((t) => ratings[t] > 0)

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <p className="text-xs text-slate-400 italic">
          &ldquo;But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.&rdquo;
        </p>
        <p className="text-[10px] text-rose-400/60 mt-1">Galatians 5:22-23</p>
      </div>

      <p className="text-xs text-slate-500">
        How did our family live out each of these this week? Rate 1-5 honestly — this is about growth, not grades.
      </p>

      {/* Trait Ratings */}
      <div className="space-y-4">
        {ALL_CHARACTER_TRAITS.map((trait, i) => {
          const foundation = getFoundation(trait)
          return (
            <motion.div
              key={trait}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {CHARACTER_TRAIT_LABELS[trait]}
                  </h4>
                  {foundation && (
                    <p className="text-[10px] text-slate-500 mt-0.5 italic">
                      {foundation.meaning}
                    </p>
                  )}
                </div>
              </div>

              {/* 1-5 rating buttons */}
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(trait, value)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      ratings[trait] === value
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 scale-110'
                        : ratings[trait] > 0 && ratings[trait] >= value
                          ? 'bg-rose-500/10 text-rose-400/60 border border-rose-500/20'
                          : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {foundation && ratings[trait] > 0 && (
                <motion.p
                  className="text-[10px] text-violet-400/60 mt-2 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {foundation.scripture} — {foundation.reference}
                </motion.p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Grateful For */}
      <div>
        <label className="text-xs font-medium text-amber-400 mb-1.5 block">
          What are you grateful for this week?
        </label>
        <textarea
          value={grateful}
          onChange={(e) => { setGrateful(e.target.value); setSaved(false) }}
          placeholder="Something that brought you joy or gratitude..."
          rows={2}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-500/30 resize-none"
        />
      </div>

      {/* Prayer Request */}
      <div>
        <label className="text-xs font-medium text-violet-400 mb-1.5 block">
          Prayer request for next week
        </label>
        <textarea
          value={prayer}
          onChange={(e) => { setPrayer(e.target.value); setSaved(false) }}
          placeholder="What would you like to bring before the Lord together?"
          rows={2}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/30 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving || !allRated || saved}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
            saved
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Submitted' : 'Submit Check-In'}
        </button>
        {!allRated && !saved && (
          <span className="text-[10px] text-slate-500">Rate all 9 traits to submit</span>
        )}
        {saved && (
          <span className="text-[10px] text-emerald-400/60">Waiting for your spouse to complete theirs...</span>
        )}
      </div>
    </div>
  )
}
