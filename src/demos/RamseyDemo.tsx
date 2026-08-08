import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

const COLORS = ['#2ee6c5', '#f0c95a', '#ff6b6b', '#7aa2ff', '#e28bff']

function hasMonoTriangle(n: number, colorOf: (i: number, j: number) => number, colors: number) {
  for (let c = 0; c < colors; c++) {
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        if (colorOf(a, b) !== c) continue
        for (let d = b + 1; d < n; d++) {
          if (colorOf(a, d) === c && colorOf(b, d) === c) return true
        }
      }
    }
  }
  return false
}

/** Toy lower-bound story: k^Θ(k) style growth */
function lowerBound(k: number) {
  return k ** (0.55 * k)
}

export function RamseyDemo() {
  const [n, setN] = useState(5)
  const [k, setK] = useState(3)
  const [seed, setSeed] = useState(1)

  const edges = useMemo(() => {
    const list: { i: number; j: number; c: number }[] = []
    let s = seed * 9973
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        list.push({ i, j, c: Math.floor(rand() * k) })
      }
    }
    return list
  }, [n, k, seed])

  const colorOf = (i: number, j: number) => {
    const e = edges.find((x) => x.i === i && x.j === j)
    return e?.c ?? 0
  }

  const mono = hasMonoTriangle(n, colorOf, k)

  const nodes = useMemo(() => {
    const size = 240
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      return { x: size / 2 + Math.cos(a) * 88, y: size / 2 + Math.sin(a) * 88 }
    })
  }, [n])

  return (
    <div className="demo">
      <h3 className="demo-title">Multicolor Ramsey playground</h3>
      <p className="demo-hint">
        Color every edge with k colors. A monochromatic triangle is the unavoidable “party”
        pattern. Grow n and k — the lower-bound story says R_k(3) grows like k^Θ(k).
      </p>
      <svg viewBox="0 0 240 240" role="img" aria-label="Edge-colored complete graph">
        {edges.map((e, idx) => (
          <line
            key={idx}
            x1={nodes[e.i].x}
            y1={nodes[e.i].y}
            x2={nodes[e.j].x}
            y2={nodes[e.j].y}
            stroke={COLORS[e.c % COLORS.length]}
            strokeWidth="2"
            opacity={0.85}
          />
        ))}
        {nodes.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={8} fill="#121a18" stroke="#e8f2ef" />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Vertices n" value={n} min={3} max={8} onChange={setN} />
        <DimSlider label="Colors k" value={k} min={2} max={5} onChange={setK} />
      </div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
          Reshuffle colors
        </button>
      </div>
      <p className={`feedback ${mono ? 'err' : 'ok'}`} role="status">
        {mono
          ? 'Monochromatic triangle present in this coloring.'
          : 'No monochromatic triangle in this random coloring.'}
      </p>
      <p className="stat">
        Toy lower-bound scale for R_k(3) ≈ {lowerBound(k).toExponential(2)}
      </p>
      <p className="demo-callout">
        So what: Ramsey lower bounds show how large a labeled network can grow before some conflict
        triangle is forced — useful intuition for unavoidable structure.
      </p>
    </div>
  )
}
