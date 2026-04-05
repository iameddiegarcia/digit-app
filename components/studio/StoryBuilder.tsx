'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Trait } from '@/lib/types'

const TRAITS: Trait[] = ['understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']

interface StoryChoice {
  text: string
  next: string
}

interface StoryPage {
  id: string
  text: string
  choices: StoryChoice[]
}

interface StoryBuilderProps {
  creationId: string | null
}

export function StoryBuilder({ creationId }: StoryBuilderProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [pages, setPages] = useState<StoryPage[]>([
    { id: 'page-1', text: '', choices: [] },
  ])
  const [primaryTrait, setPrimaryTrait] = useState<Trait>('understanding')
  const [ageMin, setAgeMin] = useState(2)
  const [ageMax, setAgeMax] = useState(5)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'draft' | 'review'>('draft')
  const isNew = !creationId

  useEffect(() => {
    if (!isNew) loadCreation()
  }, [creationId])

  async function loadCreation() {
    const res = await fetch(`/api/studio/creations/${creationId}`)
    if (res.ok) {
      const { creation } = await res.json()
      setTitle(creation.title)
      setPrimaryTrait(creation.primary_trait || 'understanding')
      setAgeMin(creation.target_age_min)
      setAgeMax(creation.target_age_max)
      setStatus(creation.status)
      if (creation.content?.pages) setPages(creation.content.pages)
    }
  }

  async function handleSave(submitForReview = false) {
    setSaving(true)
    const body = {
      title: title || 'Untitled Story',
      type: 'story',
      content: { pages },
      primary_trait: primaryTrait,
      target_age_min: ageMin,
      target_age_max: ageMax,
      ...(submitForReview ? { status: 'review' } : {}),
    }

    const url = isNew ? '/api/studio/creations' : `/api/studio/creations/${creationId}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      const data = await res.json()
      if (isNew && data.creation?.id) {
        router.replace(`/studio/stories/${data.creation.id}`)
      }
      if (submitForReview) setStatus('review')
    }
    setSaving(false)
  }

  const activePage = pages[activePageIndex]

  function updatePageText(text: string) {
    const updated = [...pages]
    updated[activePageIndex] = { ...updated[activePageIndex], text }
    setPages(updated)
  }

  function addChoice() {
    const updated = [...pages]
    const newPageId = `page-${pages.length + 1}`
    updated[activePageIndex].choices.push({ text: '', next: newPageId })
    updated.push({ id: newPageId, text: '', choices: [] })
    setPages(updated)
  }

  function updateChoiceText(choiceIdx: number, text: string) {
    const updated = [...pages]
    updated[activePageIndex].choices[choiceIdx].text = text
    setPages(updated)
  }

  function addPage() {
    setPages([...pages, { id: `page-${pages.length + 1}`, text: '', choices: [] }])
    setActivePageIndex(pages.length)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-3rem)]">
      {/* Editor */}
      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        <input
          type="text"
          placeholder="Story Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none outline-none text-white placeholder:text-slate-600"
        />

        {/* Settings Bar */}
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={primaryTrait}
            onChange={(e) => setPrimaryTrait(e.target.value as Trait)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            {TRAITS.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Ages</span>
            <input
              type="number" min={1} max={12} value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
            />
            <span>-</span>
            <input
              type="number" min={1} max={12} value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
            />
          </div>
        </div>

        {/* Page Tabs */}
        <div className="flex gap-1 flex-wrap">
          {pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePageIndex(i)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                i === activePageIndex
                  ? 'bg-green-500/15 text-green-400'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              Page {i + 1}
            </button>
          ))}
          <button onClick={addPage} className="px-3 py-1 rounded text-xs text-slate-600 hover:text-green-400">
            + Add Page
          </button>
        </div>

        {/* Page Editor */}
        {activePage && (
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={activePage.text}
              onChange={(e) => updatePageText(e.target.value)}
              placeholder="Write your story here..."
              className="flex-1 min-h-[200px] bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 resize-none outline-none focus:border-green-500/30"
            />

            {/* Choices */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-500 font-medium">Choices (branches)</p>
              {activePage.choices.map((choice, ci) => (
                <div key={ci} className="flex gap-2 items-center">
                  <input
                    value={choice.text}
                    onChange={(e) => updateChoiceText(ci, e.target.value)}
                    placeholder={`Choice ${ci + 1}...`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                  <span className="text-[10px] text-slate-600">
                    &rarr; Page {pages.findIndex((p) => p.id === choice.next) + 1}
                  </span>
                </div>
              ))}
              <button onClick={addChoice} className="text-xs text-green-400 hover:text-green-300 self-start">
                + Add Choice
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 pb-4">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {status !== 'review' && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-slate-950 hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              Submit for Review
            </button>
          )}
          {status === 'review' && (
            <span className="px-4 py-2 text-sm text-amber-400">Waiting for Dad&apos;s review</span>
          )}
          <button
            onClick={() => router.push('/studio')}
            className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-white transition-colors ml-auto"
          >
            Back to Projects
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-72 shrink-0 bg-slate-900/40 border border-slate-800 rounded-xl p-4 overflow-auto">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Preview</h3>
        {activePage ? (
          <div>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
              {activePage.text || <span className="text-slate-600 italic">Start writing...</span>}
            </p>
            {activePage.choices.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {activePage.choices.map((c, i) => (
                  <motion.div
                    key={i}
                    className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400"
                    whileHover={{ scale: 1.02 }}
                  >
                    {c.text || `Choice ${i + 1}`}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-600">Select a page</p>
        )}
      </div>
    </div>
  )
}
