import { useMemo, useState, type MouseEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

type Pt = { x: number; y: number }

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function CvpDemo() {
  const [scale, setScale] = useState(36)
  const [target, setTarget] = useState<Pt>({ x: 150, y: 110 })
  const [picked, setPicked] = useState<Pt | null>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  const lattice = useMemo(() => {
    const pts: Pt[] = []
    const v1 = { x: scale, y: 0 }
    const v2 = { x: scale * 0.35, y: scale * 0.9 }
    for (let i = -3; i <= 4; i++) {
      for (let j = -3; j <= 4; j++) {
        pts.push({ x: 40 + i * v1.x + j * v2.x, y: 40 + i * v1.y + j * v2.y })
      }
    }
    return pts.filter((p) => p.x >= 10 && p.x <= 270 && p.y >= 10 && p.y <= 190)
  }, [scale])

  const closest = useMemo(() => {
    let best = lattice[0]
    let bestD = Infinity
    for (const p of lattice) {
      const d = dist(p, target)
      if (d < bestD) {
        bestD = d
        best = p
      }
    }
    return { point: best, d: bestD }
  }, [lattice, target])

  function onSvgClick(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 280
    const y = ((e.clientY - rect.top) / rect.height) * 200
    // If near a lattice point, treat as pick; else move target
    let near: Pt | null = null
    let nearD = 14
    for (const p of lattice) {
      const d = dist(p, { x, y })
      if (d < nearD) {
        nearD = d
        near = p
      }
    }
    if (near) {
      setPicked(near)
      const ok = dist(near, closest.point) < 0.5
      setStatus(ok ? 'ok' : 'err')
    } else {
      setTarget({ x, y })
      setPicked(null)
      setStatus('idle')
    }
  }

  const approxFactor = closest.d < 1e-6 ? 1 : dist(picked ?? closest.point, target) / Math.max(closest.d, 1e-6)

  return (
    <div className="demo">
      <h3 className="demo-title">Closest vector game</h3>
      <p className="demo-hint">
        Tap empty space to move the target (gold). Tap a lattice point (teal) to guess the closest
        vector. In high dimension, even approximate CVP is hard — the crypto story.
      </p>
      <svg
        viewBox="0 0 280 200"
        role="img"
        aria-label="Lattice closest vector playground"
        onClick={onSvgClick}
        style={{ cursor: 'crosshair' }}
      >
        {lattice.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={picked && dist(p, picked) < 0.5 ? 5 : 3.5}
            fill="#2ee6c5"
            opacity={0.9}
          />
        ))}
        <circle cx={target.x} cy={target.y} r={6} fill="#f0c95a" />
        <line
          x1={target.x}
          y1={target.y}
          x2={closest.point.x}
          y2={closest.point.y}
          stroke="#8aa39a"
          strokeDasharray="4 3"
        />
      </svg>
      <div className="controls">
        <DimSlider label="Lattice spacing" value={scale} min={22} max={52} onChange={setScale} />
      </div>
      <p className="stat">
        True distance ≈ {closest.d.toFixed(1)}
        {picked ? ` · your approx factor ≈ ${approxFactor.toFixed(2)}` : ' · pick a lattice point'}
      </p>
      {status !== 'idle' ? (
        <p className={`feedback ${status === 'ok' ? 'ok' : 'err'}`} role="status">
          {status === 'ok' ? 'Correct — that is the closest lattice point.' : 'Not the closest — try again.'}
        </p>
      ) : null}
      <p className="demo-callout">
        So what: post-quantum lattice crypto leans on the hardness of finding (even approximate)
        close vectors. Stronger hardness-of-approximation results strengthen that story.
      </p>
    </div>
  )
}
