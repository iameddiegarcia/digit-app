'use client'

interface SessionSummaryCardProps {
  startedAt: string
  endedAt: string | null
  summary: string | null
  activityCount: number
  platform: string
}

export function SessionSummaryCard({ startedAt, endedAt, summary, activityCount, platform }: SessionSummaryCardProps) {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : null
  const durationMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null

  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white">
          {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-[10px] text-slate-600 capitalize">{platform}</span>
      </div>

      <div className="flex gap-3 text-[10px] text-slate-500 mb-2">
        {durationMin !== null && <span>{durationMin} min</span>}
        <span>{activityCount} activities</span>
      </div>

      {summary && (
        <p className="text-xs text-slate-400 leading-relaxed">{summary}</p>
      )}
    </div>
  )
}
