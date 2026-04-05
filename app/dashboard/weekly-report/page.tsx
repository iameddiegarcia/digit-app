'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import WeeklyReportCard from '@/components/dashboard/WeeklyReportCard'

interface WeeklyReportData {
  weekOf: string
  children: Array<{
    childId: string
    name: string
    color: string
    sessionsCount: number
    observationsCount: number
    traitEventsCount: number
    traitCounts: Record<string, number>
    traitLevels: Record<string, { level: number; count: number }>
    highlights: { trait: string; notes: string; date: string }[]
  }>
  familyPulse: number
  spouseCompleted: boolean
  totalSessions: number
  totalObservations: number
}

function getWeekOffset(weekOf: string, offset: number): string {
  const d = new Date(weekOf + 'T12:00:00')
  d.setDate(d.getDate() + offset * 7)
  return d.toISOString().split('T')[0]
}

export default function WeeklyReportPage() {
  const [data, setData] = useState<WeeklyReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState<string | null>(null)

  async function loadWeek(week?: string) {
    setLoading(true)
    try {
      const url = week
        ? `/api/dashboard/weekly-report?week=${week}`
        : '/api/dashboard/weekly-report'
      const res = await fetch(url)
      if (res.ok) {
        const d = await res.json()
        setData(d)
        setCurrentWeek(d.weekOf)
      }
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWeek()
  }, [])

  function goWeek(offset: number) {
    if (currentWeek) {
      const next = getWeekOffset(currentWeek, offset)
      loadWeek(next)
    }
  }

  // Don't allow navigating into the future
  const isCurrentWeek = (() => {
    if (!currentWeek) return true
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    return currentWeek >= monday.toISOString().split('T')[0]
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Week navigation */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => goWeek(-1)}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          &larr; Previous
        </button>
        <h2 className="text-sm font-semibold text-slate-300">
          Week of {currentWeek ? new Date(currentWeek + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
        </h2>
        <button
          onClick={() => goWeek(1)}
          disabled={isCurrentWeek}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isCurrentWeek
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Next &rarr;
        </button>
      </motion.div>

      {data ? (
        <WeeklyReportCard data={data} />
      ) : (
        <p className="text-center text-sm text-slate-500 py-12">No report data available.</p>
      )}
    </div>
  )
}
