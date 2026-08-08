import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function factorial(n: number) {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function ehrhartBound(n: number) {
  return (n + 1) ** n / factorial(n)
}

export function EhrhartDemo() {
  const [dim, setDim] = useState(2)
  const [scale, setScale] = useState(1.2)

  // 2D visualization: triangle-ish body around barycenter with one interior lattice point
  const bound = useMemo(() => ehrhartBound(dim), [dim])
  const toyVolume = useMemo(() => {
    // scale a simplex-like volume relative to the bound
    const base = ehrhartBound(2) * (scale ** dim)
    return Math.min(base, bound * 1.05)
  }, [dim, scale, bound])

  const size = 240
  const cx = size / 2
  const cy = size / 2
  const r = 40 * scale
  const verts = [
    { x: cx, y: cy - r * 1.2 },
    { x: cx - r, y: cy + r * 0.8 },
    { x: cx + r, y: cy + r * 0.8 },
  ]

  return (
    <div className="demo">
      <h3 className="demo-title">Lattice-point volume explorer</h3>
      <p className="demo-hint">
        A convex body with only one interior lattice point (at the barycenter) cannot be arbitrarily
        fat. Scale the body and dimension against Ehrhart’s sharp bound (n+1)^n / n!.
      </p>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Polygon with lattice points">
        {[...Array(7)].map((_, i) =>
          [...Array(7)].map((_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={30 + i * 30}
              cy={30 + j * 30}
              r={2}
              fill="#24332e"
            />
          )),
        )}
        <polygon
          points={verts.map((v) => `${v.x},${v.y}`).join(' ')}
          fill="color-mix(in srgb, #2ee6c5 18%, transparent)"
          stroke="#2ee6c5"
          strokeWidth="2"
        />
        <circle cx={cx} cy={cy + 8} r={4} fill="#f0c95a" />
      </svg>
      <div className="controls">
        <DimSlider
          label="Scale"
          value={scale}
          min={0.7}
          max={1.8}
          step={0.05}
          onChange={setScale}
          format={(v) => v.toFixed(2)}
        />
        <DimSlider label="Dimension n" value={dim} min={1} max={8} onChange={setDim} />
      </div>
      <p className="stat">
        Toy volume ≈ {toyVolume.toFixed(2)} · Ehrhart bound ≈ {bound.toFixed(2)} ·{' '}
        {toyVolume <= bound + 1e-6 ? 'within bound' : 'over bound (impossible under the theorem)'}
      </p>
      <p className="demo-callout">
        So what: integer programming cares how large a feasible region can be when interior integer
        points are scarce — a sharp volume constant is a hard ceiling.
      </p>
    </div>
  )
}
