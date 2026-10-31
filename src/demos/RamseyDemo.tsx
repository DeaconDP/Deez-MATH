import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

const COLORS = ['#2ee6c5', '#f0c95a', '#7eb6ff']
const COLOR_NAMES = ['teal', 'gold', 'blue']
/** Known exact values R_k(3) for k = 2, 3. */
const R_EXACT: Record<number, number> = { 2: 6, 3: 17 }

type Graph = { n: number; k: number; col: number[] }
type Tri = [number, number, number, number]

const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

function makeRand(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function emptyGraph(n: number, k: number): Graph {
  return { n, k, col: new Array(n * n).fill(0) }
}

function setEdge(g: Graph, i: number, j: number, c: number) {
  g.col[i * g.n + j] = c
  g.col[j * g.n + i] = c
}

function randomGraph(n: number, k: number, seed: number): Graph {
  const g = emptyGraph(n, k)
  const rand = makeRand(seed)
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) setEdge(g, i, j, Math.floor(rand() * k))
  return g
}

/** Pentagon + pentagram: the 2-coloring of K5 with no monochromatic triangle. */
function pentagon(): Graph {
  const g = emptyGraph(5, 2)
  for (let i = 0; i < 5; i++)
    for (let j = i + 1; j < 5; j++) setEdge(g, i, j, (j - i) % 5 === 1 || (j - i) % 5 === 4 ? 0 : 1)
  return g
}

/** Greenwood–Gleason: K16 on GF(16), color = discrete log of (x xor y) mod 3. */
function greenwoodGleason(extra: boolean): Graph {
  const log = new Array<number>(16).fill(0)
  let v = 1
  for (let i = 0; i < 15; i++) {
    log[v] = i
    v <<= 1
    if (v & 16) v ^= 0b10011
  }
  const n = extra ? 17 : 16
  const g = emptyGraph(n, 3)
  for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) setEdge(g, i, j, log[i ^ j] % 3)
  if (extra) for (let i = 0; i < 16; i++) setEdge(g, i, 16, i % 3)
  return g
}

function monoTriangles(g: Graph): Tri[] {
  const out: Tri[] = []
  const { n, col } = g
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++) {
      const c = col[a * n + b]
      for (let d = b + 1; d < n; d++) {
        if (col[a * n + d] === c && col[b * n + d] === c) out.push([a, b, d, c])
      }
    }
  return out
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/* ---------- growth chart (log scale) ---------- */

function factorial(k: number) {
  let f = 1
  for (let i = 2; i <= k; i++) f *= i
  return f
}

function GrowthChart() {
  const W = 300
  const H = 140
  const L = 34
  const B = 22
  const KMAX = 8
  const YMAX = 5.2
  const x = (k: number) => L + ((k - 1) / (KMAX - 1)) * (W - L - 10)
  const y = (v: number) => H - B - (Math.log10(v) / YMAX) * (H - B - 10)
  const upper = Array.from({ length: KMAX }, (_, i) => i + 1).map((k) => [k, Math.floor(Math.E * factorial(k)) + 1])
  const lower = Array.from({ length: KMAX }, (_, i) => i + 1).map((k) => [k, 2 ** k + 1])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Log-scale chart of bounds on R_k(3)" style={{ marginTop: 'var(--space-3)' }}>
      {[0, 1, 2, 3, 4, 5].map((e) => (
        <g key={e}>
          <line x1={L} x2={W - 8} y1={y(10 ** e)} y2={y(10 ** e)} stroke="#24332e" strokeWidth={0.6} />
          <text x={L - 4} y={y(10 ** e) + 3} textAnchor="end" fontSize="7.5" fill="#8aa39a" fontFamily="IBM Plex Mono">
            {e === 0 ? '1' : `1e${e}`}
          </text>
        </g>
      ))}
      {Array.from({ length: KMAX }, (_, i) => i + 1).map((k) => (
        <text key={k} x={x(k)} y={H - 8} textAnchor="middle" fontSize="7.5" fill="#8aa39a" fontFamily="IBM Plex Mono">
          k={k}
        </text>
      ))}
      <path
        d={`M${upper.map(([k, v]) => `${x(k)},${y(v)}`).join(' L')} L${[...lower].reverse().map(([k, v]) => `${x(k)},${y(v)}`).join(' L')} Z`}
        fill="#f0c95a"
        opacity={0.08}
      />
      <polyline points={upper.map(([k, v]) => `${x(k)},${y(v)}`).join(' ')} fill="none" stroke="#ff6b6b" strokeWidth={1.6} />
      <polyline points={lower.map(([k, v]) => `${x(k)},${y(v)}`).join(' ')} fill="none" stroke="#7eb6ff" strokeWidth={1.6} strokeDasharray="4 3" />
      {[
        [1, 3],
        [2, 6],
        [3, 17],
      ].map(([k, v]) => (
        <circle key={k} cx={x(k)} cy={y(v)} r={3.2} fill="#2ee6c5" />
      ))}
      <line x1={x(4)} x2={x(4)} y1={y(51)} y2={y(62)} stroke="#2ee6c5" strokeWidth={3} />
      <text x={x(5.6)} y={y(2.2e4)} fontSize="7.5" fill="#ff6b6b" fontFamily="IBM Plex Mono" textAnchor="end">
        upper ⌊e·k!⌋+1
      </text>
      <text x={x(7.9)} y={y(170)} fontSize="7.5" fill="#7eb6ff" fontFamily="IBM Plex Mono" textAnchor="end">
        easy lower 2^k+1
      </text>
      <text x={L + 4} y={16} fontSize="7.5" fill="#f0c95a" fontFamily="IBM Plex Mono">
        gold gap = where R_k(3) lives · dots = known values
      </text>
    </svg>
  )
}

/* ---------- main ---------- */

export function RamseyDemo() {
  const reduced = usePrefersReducedMotion()
  const [g, setG] = useState<Graph>(() => pentagon())
  const [seed, setSeed] = useState(7)
  const [hunting, setHunting] = useState(false)
  const [steps, setSteps] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const [flash, setFlash] = useState<[number, number] | null>(null)
  const gRef = useRef(g)
  useEffect(() => {
    gRef.current = g
  }, [g])

  const tris = useMemo(() => monoTriangles(g), [g])
  const threshold = R_EXACT[g.k]
  const forced = g.n >= threshold

  const nodes = useMemo(() => {
    const R = g.n > 10 ? 108 : 96
    return Array.from({ length: g.n }, (_, i) => {
      const a = (i / g.n) * Math.PI * 2 - Math.PI / 2
      return { x: 130 + Math.cos(a) * R, y: 130 + Math.sin(a) * R }
    })
  }, [g.n])

  // Local-search hunt: recolor an edge of a mono triangle to the color that
  // creates the fewest mono triangles through it (with a little noise).
  useEffect(() => {
    if (!hunting) return
    const rand = makeRand(Date.now() % 100000)
    let raf = 0
    let count = 0
    let bestSeen = Infinity
    const perFrame = reduced ? 40 : 2
    let cur = gRef.current
    const tick = () => {
      let last: [number, number] | null = null
      let left = 0
      for (let s = 0; s < perFrame; s++) {
        const ts = monoTriangles(cur)
        left = ts.length
        bestSeen = Math.min(bestSeen, left)
        if (left === 0) break
        const [a, b, d] = ts[Math.floor(rand() * ts.length)]
        const pairs: [number, number][] = [
          [a, b],
          [a, d],
          [b, d],
        ]
        const [i, j] = pairs[Math.floor(rand() * 3)]
        const n = cur.n
        let choice = cur.col[i * n + j]
        if (rand() < 0.12) choice = Math.floor(rand() * cur.k)
        else {
          let bestCount = Infinity
          for (let c = 0; c < cur.k; c++) {
            let t = 0
            for (let w = 0; w < n; w++) if (w !== i && w !== j && cur.col[i * n + w] === c && cur.col[j * n + w] === c) t++
            if (t < bestCount || (t === bestCount && rand() < 0.5)) {
              bestCount = t
              choice = c
            }
          }
        }
        const next = { ...cur, col: cur.col.slice() }
        setEdge(next, i, j, choice)
        cur = next
        last = [i, j]
        count++
      }
      const finalCount = monoTriangles(cur).length
      bestSeen = Math.min(bestSeen, finalCount)
      setG(cur)
      setFlash(last)
      setSteps((s) => s + perFrame)
      setBest(bestSeen)
      if (finalCount === 0 || count > 3000) {
        setHunting(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hunting, reduced])

  function load(next: Graph) {
    setHunting(false)
    setSteps(0)
    setBest(null)
    setFlash(null)
    setG(next)
  }

  function cycleEdge(i: number, j: number) {
    setHunting(false)
    setG((prev) => {
      const next = { ...prev, col: prev.col.slice() }
      setEdge(next, i, j, (prev.col[i * prev.n + j] + 1) % prev.k)
      return next
    })
    setFlash([i, j])
  }

  function resize(n: number, k: number) {
    const s = seed + 1
    setSeed(s)
    load(randomGraph(n, k, s))
  }

  const edges: [number, number][] = []
  for (let i = 0; i < g.n; i++) for (let j = i + 1; j < g.n; j++) edges.push([i, j])
  const inTri = new Set<number>()
  for (const [a, b, d] of tris) {
    inTri.add(a * g.n + b)
    inTri.add(a * g.n + d)
    inTri.add(b * g.n + d)
  }
  const thin = g.n > 10

  return (
    <div className="demo">
      <h3 className="demo-title">Escape the same-color triangle</h3>
      <p className="demo-hint">
        Every pair of dots is joined by an edge in one of k colors. Tap an edge to recolor it. Any
        triangle whose three edges share a color lights up. Press Hunt and a local search recolors edges
        trying to kill every triangle. Below R_k(3) dots it can win; at R_k(3) it never can.
      </p>

      <div className="btn-row" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => load(pentagon())}>
          K5 · pentagon trick
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => resize(6, 2)}>
          K6 · 2 colors
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => load(greenwoodGleason(false))}>
          K16 · Greenwood–Gleason
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => load(greenwoodGleason(true))}>
          K17 · one more dot
        </button>
      </div>

      <svg viewBox="0 0 260 260" role="img" aria-label={`Complete graph on ${g.n} vertices with ${g.k} edge colors, ${tris.length} monochromatic triangles`}>
        <defs>
          <filter id="ram-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {tris.slice(0, 120).map(([a, b, d, c], idx) => (
          <polygon
            key={`t${idx}`}
            points={`${nodes[a].x},${nodes[a].y} ${nodes[b].x},${nodes[b].y} ${nodes[d].x},${nodes[d].y}`}
            fill={COLORS[c]}
            opacity={0.16}
            pointerEvents="none"
          />
        ))}
        {edges.map(([i, j]) => {
          const c = g.col[i * g.n + j]
          const hot = inTri.has(i * g.n + j)
          const isFlash = flash && flash[0] === i && flash[1] === j
          const dim = tris.length > 0 && !hot
          return (
            <g key={`${i}-${j}`} onClick={() => cycleEdge(i, j)} style={{ cursor: 'pointer' }}>
              <line
                x1={nodes[i].x}
                y1={nodes[i].y}
                x2={nodes[j].x}
                y2={nodes[j].y}
                stroke={isFlash ? '#ffffff' : COLORS[c]}
                strokeWidth={hot ? (thin ? 2.2 : 3.4) : thin ? 0.9 : 2}
                opacity={dim ? 0.28 : 0.9}
                filter={hot || isFlash ? 'url(#ram-glow)' : undefined}
              />
              <line x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} stroke="transparent" strokeWidth={thin ? 6 : 12} />
            </g>
          )
        })}
        {nodes.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={thin ? 5 : 8} fill="#121a18" stroke="#e8f2ef" strokeWidth={1.4} pointerEvents="none" />
        ))}
        <text x={8} y={252} fontSize="10" fontFamily="IBM Plex Mono" fill={tris.length ? '#ff6b6b' : '#6dffb0'}>
          {tris.length ? `${tris.length} same-color triangle${tris.length === 1 ? '' : 's'}` : 'no same-color triangle'}
        </text>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button
          type="button"
          style={small}
          className="btn"
          disabled={tris.length === 0 && !hunting}
          onClick={() => {
            if (!hunting) {
              setSteps(0)
              setBest(null)
            }
            setHunting((h) => !h)
          }}
        >
          {hunting ? 'Stop hunt' : 'Hunt for an escape'}
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => resize(g.n, g.k)}>
          Random coloring
        </button>
      </div>

      <div className="controls" style={{ marginTop: 0 }}>
        <DimSlider label="Dots n" value={g.n} min={3} max={17} onChange={(n) => resize(n, g.k)} />
        <DimSlider
          label="Colors k"
          value={g.k}
          min={2}
          max={3}
          onChange={(k) => resize(g.n, k)}
          format={(k) => `${k} (${COLOR_NAMES.slice(0, k).join(', ')})`}
        />
      </div>

      <p className="stat" role="status">
        n = {g.n}, k = {g.k}, R_{g.k}(3) = {threshold} ·{' '}
        {forced
          ? 'at or past the threshold: every coloring has a same-color triangle.'
          : `below the threshold: some coloring of K${g.n} avoids them.`}
        {steps > 0 ? ` · hunt: ${steps} recolorings, fewest triangles seen ${best ?? '–'}` : ''}
      </p>
      {steps > 0 && !hunting ? (
        <p className={`feedback ${tris.length === 0 ? 'ok' : 'err'}`}>
          {tris.length === 0
            ? 'Escape found: no same-color triangle.'
            : forced
              ? 'Stuck, and it always will be: the theorem says no escape exists at this size.'
              : 'Hunt gave up. An escape exists here; local search just did not find it. Try again.'}
        </p>
      ) : null}

      <GrowthChart />
      <p className="pill-inline" style={{ marginTop: 'var(--space-2)' }}>
        R_k(3) is the smallest n that forces a same-color triangle with k colors. Known: 3, 6, 17, and
        51 to 62 for k = 4. The classical ceiling e·k! is superexponential, while lower constructions
        were only exponential (best rate about 3.2^k).
      </p>
      <p className="demo-callout">
        The 2026 claim pushes the lower bound up to k^Θ(k), the same growth type as k!, so a gathering
        can get enormous before the triangle is forced. The chart shows only the classical bounds; this
        page draws no curve for the new constants and does not check the proof.
      </p>
    </div>
  )
}
