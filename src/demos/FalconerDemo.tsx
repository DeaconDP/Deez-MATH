import { useState } from 'react'
import { Toggle } from '../components/Toggle'
import { DimSlider } from './shared/DimSlider'

type Ambient = 2 | 3
type Pt = { x: number; y: number; z: number }

function cloudPoints(dim: Ambient, h: number): Pt[] {
  const count = 6 + Math.round(h * 4)
  const fill = 0.15 + 0.85 * (h / dim)
  return Array.from({ length: count }, (_, i) => {
    const t = i / Math.max(count - 1, 1)
    const x = 36 + ((Math.sin(i * 2.17) + 1) / 2) * 188 * fill + (1 - fill) * t * 160
    const y = 28 + ((Math.cos(i * 1.63) + 1) / 2) * 150 * fill + (1 - fill) * Math.sin(t * Math.PI) * 36
    const z = dim === 3 ? Math.sin(i * 1.11) * 48 * (h / dim) : 0
    return { x, y, z }
  })
}

function distinctDistances(pts: Pt[]) {
  const seen: string[] = []
  for (let i = 0; i < pts.length && seen.length < 4; i++) {
    for (let j = i + 1; j < pts.length && seen.length < 4; j++) {
      const value = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y, pts[i].z - pts[j].z).toFixed(0)
      if (!seen.includes(value)) seen.push(value)
    }
  }
  return seen
}

export function FalconerDemo() {
  const [dim, setDim] = useState<Ambient>(2)
  const [h, setH] = useState(0.8)
  const threshold = dim / 2
  const thick = h > threshold
  const pts = cloudPoints(dim, h)
  const distances = thick ? distinctDistances(pts) : []
  const marker = 20 + 200 * (threshold / dim)
  const cursor = 20 + 200 * (h / dim)

  return (
    <div className="demo">
      <h3 className="demo-title">Distance set past half the dimension</h3>
      <p className="demo-hint">
        Cartoon only. Slide the cloud dimension past the marker at d/2. Above the marker, a few
        distinct distances appear. The claim is positive Lebesgue measure. This picture does not
        check that.
      </p>
      <svg viewBox="0 0 260 220" role="img" aria-label="Point cloud and a dimension marker at d over 2">
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y + p.z * 0.15} r={dim === 3 ? 3.2 : 3.6} fill="#f0c95a" opacity={0.85} />
        ))}
        <line x1="20" y1="200" x2="220" y2="200" stroke="#2ee6c5" strokeWidth="3" opacity={0.35} />
        <line x1={marker} y1="190" x2={marker} y2="210" stroke="#2ee6c5" strokeWidth="2" />
        <circle cx={cursor} cy="200" r="4" fill="#e8f2ef" />
      </svg>
      <div className="controls">
        <Toggle
          id="falconer-dim"
          label={dim === 3 ? 'Dimension 3' : 'Dimension 2'}
          hint="The marker sits at d/2."
          checked={dim === 3}
          onChange={(on) => {
            const next: Ambient = on ? 3 : 2
            setDim(next)
            setH((value) => Math.min(value, next))
          }}
        />
        <DimSlider
          label="Cloud dimension"
          value={h}
          min={0}
          max={dim}
          step={0.1}
          onChange={setH}
          format={(v) => v.toFixed(1)}
        />
      </div>
      <p className="stat">
        Threshold d/2 = {threshold.toFixed(1)}.
        {thick ? ` Distances ${distances.join(', ')}.` : ' Below the marker, this cartoon keeps the distance list empty.'}
      </p>
    </div>
  )
}
