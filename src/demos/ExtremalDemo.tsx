import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

type Edge = [number, number]

function degeneracy(n: number, edges: Edge[]) {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const remaining = new Set(Array.from({ length: n }, (_, i) => i))
  let maxMin = 0
  while (remaining.size) {
    let best = -1
    let bestDeg = Infinity
    for (const v of remaining) {
      const deg = adj[v].filter((u) => remaining.has(u)).length
      if (deg < bestDeg) {
        bestDeg = deg
        best = v
      }
    }
    maxMin = Math.max(maxMin, bestDeg)
    remaining.delete(best)
  }
  return maxMin
}

/** Build a small “looks locally sparse” graph that still concentrates edges somewhere */
function buildCounterexample(n: number, clump: number): Edge[] {
  const edges: Edge[] = []
  // path backbone (sparse locally)
  for (let i = 0; i < n - 1; i++) edges.push([i, i + 1])
  // dense clump on first `clump` vertices — local check on leaves looks fine, global denser
  for (let i = 0; i < clump; i++) {
    for (let j = i + 1; j < clump; j++) {
      if (Math.abs(i - j) === 1) continue
      edges.push([i, j])
    }
  }
  return edges
}

export function ExtremalDemo() {
  const [n, setN] = useState(8)
  const [clump, setClump] = useState(4)
  const edges = useMemo(() => buildCounterexample(n, Math.min(clump, n)), [n, clump])
  const deg = useMemo(() => degeneracy(n, edges), [n, edges])
  const density = (2 * edges.length) / (n * (n - 1))

  const nodes = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      return { x: 120 + Math.cos(a) * 85, y: 120 + Math.sin(a) * 85 }
    })
  }, [n])

  const localLeafDeg = useMemo(() => {
    // degree of a far vertex on the path
    const v = n - 1
    return edges.filter(([a, b]) => a === v || b === v).length
  }, [edges, n])

  return (
    <div className="demo">
      <h3 className="demo-title">Local sparsity vs global clump</h3>
      <p className="demo-hint">
        Compactness / degeneracy hopes say local sparsity controls the whole graph. Build a path with
        a dense clump — leaves look sparse while global degeneracy rises.
      </p>
      <svg viewBox="0 0 240 240" role="img" aria-label="Graph with dense clump">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={a < clump && b < clump ? '#ff6b6b' : '#2ee6c5'}
            strokeWidth={a < clump && b < clump ? 2.2 : 1.4}
            opacity={0.85}
          />
        ))}
        {nodes.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={7}
            fill={i < clump ? '#f0c95a' : '#121a18'}
            stroke="#e8f2ef"
          />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Vertices" value={n} min={5} max={12} onChange={setN} />
        <DimSlider
          label="Clump size"
          value={Math.min(clump, n)}
          min={2}
          max={Math.min(7, n)}
          onChange={setClump}
        />
      </div>
      <p className="stat">
        Leaf degree {localLeafDeg} · degeneracy {deg} · edge density {(density * 100).toFixed(1)}%
      </p>
      <p className="feedback err" role="status">
        Local checks on the path end look sparse; the clump breaks naive “compactness” / degeneracy
        hopes — the spirit of the Erdős counterexamples.
      </p>
      <p className="demo-callout">
        So what: network-design and sparse-graph algorithms should not assume every local sparsity
        rule lifts cleanly to the whole graph.
      </p>
    </div>
  )
}
