'use client'

interface TraitData {
  trait: string
  level: number
  trend: string
}

interface TraitRadarProps {
  traits: TraitData[]
  color: string
  size?: number
}

const TRAIT_LABELS: Record<string, string> = {
  understanding: 'Understanding',
  organizing: 'Organizing',
  problem_solving: 'Problem Solving',
  responsibility: 'Responsibility',
  real_world: 'Real World',
  adaptability: 'Adaptability',
}

export function TraitRadar({ traits, color, size = 200 }: TraitRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size * 0.38
  const labelRadius = size * 0.48
  const numAxes = 6
  const maxLevel = 5

  function polarToCartesian(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  // Grid rings
  const rings = [1, 2, 3, 4, 5]

  // Data points
  const orderedTraits = ['understanding', 'organizing', 'problem_solving', 'responsibility', 'real_world', 'adaptability']
  const dataPoints = orderedTraits.map((t, i) => {
    const angle = (360 / numAxes) * i
    const traitData = traits.find((td) => td.trait === t)
    const level = traitData?.level ?? 0
    const r = (level / maxLevel) * maxRadius
    return polarToCartesian(angle, r)
  })

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

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
      {orderedTraits.map((_, i) => {
        const angle = (360 / numAxes) * i
        const end = polarToCartesian(angle, maxRadius)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
      })}

      {/* Data polygon */}
      {traits.length > 0 && (
        <>
          <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill={color} fillOpacity={0.15} stroke={color} strokeWidth="2" />
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
          ))}
        </>
      )}

      {/* Labels */}
      {orderedTraits.map((t, i) => {
        const angle = (360 / numAxes) * i
        const pos = polarToCartesian(angle, labelRadius)
        return (
          <text
            key={t}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(148,163,184,0.6)"
            fontSize={size < 150 ? 7 : 9}
            fontFamily="system-ui"
          >
            {TRAIT_LABELS[t] ?? t}
          </text>
        )
      })}
    </svg>
  )
}
