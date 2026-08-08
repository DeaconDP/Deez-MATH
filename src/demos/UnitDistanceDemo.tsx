import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function UnitDistanceDemo() {
  const [n, setN] = useState(16)
  const [jitter, setJitter] = useState(0.35)

  const { points, unitEdges, erdosStyle, newLower } = useMemo(() => {
    const pts: { x: number; y: number }[] = []
    const side = Math.ceil(Math.sqrt(n))
    for (let i = 0; i < n; i++) {
      const gx = i % side
      const gy = Math.floor(i / side)
      // lattice + algebraic-ish jitter (toy stand-in for number-field construction)
      const jx = Math.sin(i * 1.7 + jitter * 3) * jitter * 10
      const jy = Math.cos(i * 2.3 + jitter * 2) * jitter * 10
      pts.push({ x: 36 + gx * 28 + jx, y: 36 + gy * 28 + jy })
    }
    const unit = 28
    const tol = 3.5 + jitter * 2
    const edges: [number, number][] = []
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (Math.abs(dist(pts[i], pts[j]) - unit) < tol) edges.push([i, j])
      }
    }
    return {
      points: pts,
      unitEdges: edges,
      erdosStyle: n * Math.log(Math.log(n + 3) + 1.2),
      newLower: n ** 1.014,
    }
  }, [n, jitter])

  return (
    <div className="demo">
      <h3 className="demo-title">Unit-distance counterexample spirit</h3>
      <p className="demo-hint">
        Count near-unit segments in a jittered lattice. Erdős expected ~n · polyloglog; the 2026
        disproof gives a true polynomial n^(1+δ).
      </p>
      <svg viewBox="0 0 260 240" role="img" aria-label="Points with unit-distance edges">
        {unitEdges.map(([i, j], k) => (
          <line
            key={k}
            x1={points[i].x}
            y1={points[i].y}
            x2={points[j].x}
            y2={points[j].y}
            stroke="#2ee6c5"
            strokeWidth="1.2"
            opacity={0.75}
          />
        ))}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#f0c95a" />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Points n" value={n} min={9} max={36} onChange={setN} />
        <DimSlider
          label="Algebraic jitter"
          value={jitter}
          min={0}
          max={1}
          step={0.05}
          onChange={setJitter}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <p className="stat">
        Edges ≈ {unitEdges.length} · Erdős-style ~ {erdosStyle.toFixed(0)} · new lower ~{' '}
        {newLower.toFixed(0)}
      </p>
      <p className="demo-callout">
        So what: planar geometric networks can realize denser equal-length patterns than the old
        conjecture allowed — revise extremal distance intuitions.
      </p>
    </div>
  )
}
