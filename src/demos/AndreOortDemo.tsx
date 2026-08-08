import { useState } from 'react'
import { DimSlider } from './shared/DimSlider'

export function AndreOortDemo() {
  const [special, setSpecial] = useState(4)
  const [noise, setNoise] = useState(8)

  const dots = Array.from({ length: special + noise }, (_, i) => {
    const isSpecial = i < special
    const a = (i / (special + noise)) * Math.PI * 2
    const r = isSpecial ? 55 : 35 + (i % 5) * 12
    return {
      x: 130 + Math.cos(a) * r,
      y: 120 + Math.sin(a) * r * 0.75,
      special: isSpecial,
    }
  })

  return (
    <div className="demo">
      <h3 className="demo-title">Special points vs ambient moduli</h3>
      <p className="demo-hint">
        André–Oort-type results say special arithmetic points can’t accumulate wildly — their
        closure is algebraic. Gold = special; teal = generic sample.
      </p>
      <svg viewBox="0 0 260 240" role="img" aria-label="Special points on a moduli sketch">
        <ellipse cx="130" cy="120" rx="100" ry="70" fill="none" stroke="#24332e" strokeWidth="2" />
        <text x="130" y="30" textAnchor="middle" fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          moduli space (sketch)
        </text>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.special ? 6 : 3}
            fill={d.special ? '#f0c95a' : '#2ee6c5'}
            opacity={d.special ? 1 : 0.55}
          />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Special points" value={special} min={2} max={10} onChange={setSpecial} />
        <DimSlider label="Generic samples" value={noise} min={0} max={20} onChange={setNoise} />
      </div>
      <p className="demo-callout">
        So what: number theorists can trust that “special” loci organize into algebraic pieces —
        o-minimality supplies the tameness engine behind that control.
      </p>
    </div>
  )
}
