import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/** Toy density story: classical Minkowski-ish decay vs improved bound narrative */
function classicalBound(dim: number) {
  return 2 ** (-0.599 * dim)
}
function improvedBound(dim: number) {
  return 2 ** (-0.556 * dim)
}

export function SpherePackingDemo() {
  const [dim, setDim] = useState(8)
  const [radius, setRadius] = useState(28)

  const { classical, improved, gain } = useMemo(() => {
    const c = classicalBound(dim)
    const i = improvedBound(dim)
    return { classical: c, improved: i, gain: i / c }
  }, [dim])

  const size = 280
  const centers = useMemo(() => {
    const pts: { x: number; y: number }[] = []
    const step = radius * Math.sqrt(3)
    let row = 0
    for (let y = radius; y < size - radius; y += step * 0.75) {
      const offset = row % 2 === 0 ? 0 : radius
      for (let x = radius + offset; x < size - radius; x += radius * 2) {
        pts.push({ x, y })
      }
      row++
    }
    return pts
  }, [radius])

  return (
    <div className="demo">
      <h3 className="demo-title">Packing density explorer</h3>
      <p className="demo-hint">
        Drag radius to pack disks in 2D. Raise dimension to see how upper bounds decay — and how an
        improved bound leaves more headroom.
      </p>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Hexagonal disk packing">
        {centers.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={radius}
            fill="none"
            stroke="#2ee6c5"
            strokeWidth="1.2"
            opacity={0.85}
          />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Disk radius" value={radius} min={14} max={48} onChange={setRadius} />
        <DimSlider label="Dimension n" value={dim} min={3} max={48} onChange={setDim} />
      </div>
      <p className="stat">
        Classical-style upper ~ {classical.toExponential(2)} · Improved-style ~{' '}
        {improved.toExponential(2)} · ratio ≈ {gain.toFixed(2)}×
      </p>
      <p className="demo-callout">
        So what: materials and wireless packing care about the ceiling — a tighter math bound tells
        you when a design is already near impossible density.
      </p>
    </div>
  )
}
