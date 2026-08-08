import { useEffect, useState } from 'react'
import { DimSlider } from './shared/DimSlider'
import { ProbabilityMeter } from './shared/ProbabilityMeter'

export function NonSoficDemo() {
  const [n, setN] = useState(6)
  const [tick, setTick] = useState(0)
  const [mode, setMode] = useState<'sofic-ish' | 'non-sofic'>('sofic-ish')

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 700)
    return () => window.clearInterval(id)
  }, [])

  // Toy error: sofic-ish groups can approximate multiplication; non-sofic resists as n grows
  const error =
    mode === 'sofic-ish'
      ? Math.max(0.02, 0.35 / n + 0.02 * Math.sin(tick / 2))
      : Math.min(0.95, 0.25 + 0.08 * Math.log2(n + 1) + 0.03 * Math.sin(tick))

  const size = 220
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return { x: size / 2 + Math.cos(a) * 70, y: size / 2 + Math.sin(a) * 70 }
  })

  return (
    <div className="demo">
      <h3 className="demo-title">Finite permutation approximation</h3>
      <p className="demo-hint">
        Sofic groups can be approximated by finite permutations. Watch the toy “multiplication
        error” as you grow the finite model — a non-sofic group refuses to settle.
      </p>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Permutation points on a circle">
        {nodes.map((p, i) => {
          const j = (i + 1 + (tick % 3)) % n
          const q = nodes[j]
          return (
            <line
              key={`e-${i}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={mode === 'sofic-ish' ? '#2ee6c5' : '#ff6b6b'}
              strokeWidth="1.5"
              opacity={0.55}
            />
          )
        })}
        {nodes.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} fill="#f0c95a" />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Finite model size" value={n} min={3} max={16} onChange={setN} />
        <label>
          Group type
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'sofic-ish' | 'non-sofic')}
            style={{
              minHeight: 44,
              background: 'var(--bg-elevated)',
              color: 'var(--fg)',
              border: '1px solid var(--line)',
              borderRadius: 4,
              padding: '0 12px',
            }}
          >
            <option value="sofic-ish">Sofic-ish (approximable)</option>
            <option value="non-sofic">Non-sofic (resists)</option>
          </select>
        </label>
      </div>
      <ProbabilityMeter label="Toy multiplication error" value={error} />
      <p className="demo-callout">
        So what: foundations for dynamics and operator algebras often assumed “every group is
        sofic.” An explicit counterexample redraws which theorems get that free pass.
      </p>
    </div>
  )
}
