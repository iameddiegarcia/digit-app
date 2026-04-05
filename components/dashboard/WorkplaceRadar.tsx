'use client'

import { PRINCIPLE_LABELS, ALL_PRINCIPLES, type Principle } from '@/lib/workplace-principles'

interface PrincipleData {
  score: number
  week_of: string
  reflection: string | null
}

interface WorkplaceRadarProps {
  scores: Record<string, PrincipleData>
  size?: number
}

export function WorkplaceRadar({ scores, size = 240 }: WorkplaceRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size * 0.34
  const labelRadius = size * 0.46
  const numAxes = 12
  const maxLevel = 5

  function polarToCartesian(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  const rings = [1, 2, 3, 4, 5]

  const dataPoints = ALL_PRINCIPLES.map((p, i) => {
    const angle = (360 / numAxes) * i
    const level = scores[p]?.score ?? 0
    const r = (level / maxLevel) * maxRadius
    return polarToCartesian(angle, r)
  })

  const color = '#F59E0B' // amber for Eddie

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((ring) => {
        const r = (ring / maxLevel) * maxRadius
        const points = Array.from({ length: numAxes }, (_, i) => {
          const angle = (360 / numAxes) * i
          const p = polarToCartesian(angle, r)
          return `${p.x},${p.y}`
        }).join(' ')
        return <polygon key={ring} points={points} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {ALL_PRINCIPLES.map((_, i) => {
        const angle = (360 / numAxes) * i
        const end = polarToCartesian(angle, maxRadius)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
      })}

      {/* Data polygon */}
      {Object.keys(scores).length > 0 && (
        <>
          <polygon
            points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth="2"
          />
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
          ))}
        </>
      )}

      {/* Labels */}
      {ALL_PRINCIPLES.map((p, i) => {
        const angle = (360 / numAxes) * i
        const pos = polarToCartesian(angle, labelRadius)
        // Shorten some long labels
        const label = PRINCIPLE_LABELS[p as Principle]
          .replace('Completed Staff Work', 'Staff Work')
          .replace('Continuous Learning', 'Learning')
        return (
          <text
            key={p}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(148,163,184,0.6)"
            fontSize={size < 200 ? 6 : 7}
            fontFamily="system-ui"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
