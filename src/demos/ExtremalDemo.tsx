import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'

type P = { x: number; y: number }
type Edge = [number, number]
type PresetId = 'tree' | 'c4' | 'c6' | 'k33' | 'cube' | 'k4'

const VW = 320
const VH = 220
const MAX_V = 16
const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

type Preset = {
  label: string
  v: P[]
  e: Edge[]
  /** Known ex(n,H) exponent, and whether it is exact. */
  known?: { exp: number; text: string }
}

const ring = (k: number, r: number, cx = 160, cy = 110, rot = -Math.PI / 2): P[] =>
  Array.from({ length: k }, (_, i) => ({
    x: cx + r * Math.cos(rot + (i / k) * Math.PI * 2),
    y: cy + r * Math.sin(rot + (i / k) * Math.PI * 2),
  }))
const cyc = (k: number): Edge[] => Array.from({ length: k }, (_, i) => [i, (i + 1) % k] as Edge)

const PRESETS: Record<PresetId, Preset> = {
  tree: {
    label: 'Tree',
    v: [
      { x: 160, y: 40 },
      { x: 100, y: 100 },
      { x: 220, y: 100 },
      { x: 70, y: 165 },
      { x: 130, y: 165 },
      { x: 190, y: 165 },
      { x: 250, y: 165 },
    ],
    e: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ],
    known: { exp: 1, text: 'trees: Θ(n), exponent 1' },
  },
  c4: { label: 'C4', v: ring(4, 70, 160, 110, -Math.PI / 4), e: cyc(4), known: { exp: 1.5, text: 'C4: Θ(n^3/2)' } },
  c6: { label: 'C6', v: ring(6, 78), e: cyc(6), known: { exp: 4 / 3, text: 'C6: Θ(n^4/3)' } },
  k33: {
    label: 'K3,3',
    v: [
      { x: 100, y: 45 },
      { x: 100, y: 110 },
      { x: 100, y: 175 },
      { x: 220, y: 45 },
      { x: 220, y: 110 },
      { x: 220, y: 175 },
    ],
    e: [0, 1, 2].flatMap((a) => [3, 4, 5].map((b) => [a, b] as Edge)),
    known: { exp: 5 / 3, text: 'K3,3: Θ(n^5/3)' },
  },
  cube: {
    label: 'Cube Q3',
    v: [
      { x: 85, y: 40 },
      { x: 235, y: 40 },
      { x: 235, y: 185 },
      { x: 85, y: 185 },
      { x: 130, y: 85 },
      { x: 190, y: 85 },
      { x: 190, y: 140 },
      { x: 130, y: 140 },
    ],
    e: [...cyc(4), ...cyc(4).map(([a, b]) => [a + 4, b + 4] as Edge), [0, 4], [1, 5], [2, 6], [3, 7]],
    known: { exp: 1.6, text: 'Q3: at most n^8/5, exact exponent open' },
  },
  k4: {
    label: 'K4 (odd cycles)',
    v: ring(4, 72, 160, 110, -Math.PI / 4),
    e: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
      [1, 3],
    ],
  },
}

const ekey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

function peel(n: number, edges: Edge[]) {
  const adj: Set<number>[] = Array.from({ length: n }, () => new Set())
  for (const [a, b] of edges) {
    adj[a].add(b)
    adj[b].add(a)
  }
  const alive = new Set(Array.from({ length: n }, (_, i) => i))
  const order: number[] = []
  const degAt: number[] = []
  const aliveBefore: Set<number>[] = []
  while (alive.size) {
    let best = -1
    let bd = Infinity
    for (const v of alive) {
      let d = 0
      for (const u of adj[v]) if (alive.has(u)) d++
      if (d < bd) {
        bd = d
        best = v
      }
    }
    aliveBefore.push(new Set(alive))
    order.push(best)
    degAt.push(bd)
    alive.delete(best)
  }
  const r = degAt.length ? Math.max(...degAt) : 0
  const coreStep = degAt.indexOf(r)
  const core = coreStep >= 0 && r > 0 ? aliveBefore[coreStep] : new Set<number>()
  return { order, degAt, r, coreStep, core }
}

function twoColor(n: number, edges: Edge[]) {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const side = new Array<number>(n).fill(-1)
  for (let s = 0; s < n; s++) {
    if (side[s] >= 0) continue
    side[s] = 0
    const q = [s]
    while (q.length) {
      const v = q.shift() as number
      for (const u of adj[v])
        if (side[u] < 0) {
          side[u] = 1 - side[v]
          q.push(u)
        }
    }
  }
  const odd = edges.filter(([a, b]) => side[a] === side[b])
  return { side, odd }
}

export function ExtremalDemo() {
  const [preset, setPreset] = useState<PresetId | null>('cube')
  const [verts, setVerts] = useState<P[]>(PRESETS.cube.v)
  const [edges, setEdges] = useState<Edge[]>(PRESETS.cube.e)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rubber, setRubber] = useState<{ from: number; to: P } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const n = verts.length
  const pl = useMemo(() => peel(n, edges), [n, edges])
  const { side, odd } = useMemo(() => twoColor(n, edges), [n, edges])
  const bipartite = odd.length === 0
  const oddSet = new Set(odd.map(([a, b]) => ekey(a, b)))
  const removed = new Set(pl.order.slice(0, step))
  const done = step >= n
  const showCore = step > pl.coreStep && pl.r > 0
  const current = step < n ? pl.order[step] : -1

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s >= n) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 700)
    return () => window.clearInterval(id)
  }, [playing, n])

  function load(id: PresetId) {
    setPreset(id)
    setVerts(PRESETS[id].v)
    setEdges(PRESETS[id].e)
    setStep(0)
    setPlaying(false)
  }

  function edited() {
    setPreset(null)
    setStep(0)
    setPlaying(false)
  }

  function toLocal(e: RPointerEvent<SVGElement>): P | null {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: pt.x, y: pt.y }
  }
  const hitVertex = (p: P) => {
    let best = -1
    let bd = 15
    verts.forEach((v, i) => {
      const d = Math.hypot(v.x - p.x, v.y - p.y)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    return best
  }

  function onDown(e: RPointerEvent<SVGSVGElement>) {
    const p = toLocal(e)
    if (!p) return
    const eAttr = (e.target as Element).getAttribute('data-edge')
    if (eAttr) {
      const [a, b] = eAttr.split('-').map(Number)
      setEdges((prev) => prev.filter(([x, y]) => ekey(x, y) !== ekey(a, b)))
      edited()
      return
    }
    const v = hitVertex(p)
    if (v >= 0) {
      setRubber({ from: v, to: p })
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    if (n >= MAX_V) return
    setVerts((prev) => [...prev, { x: Math.max(12, Math.min(VW - 12, p.x)), y: Math.max(12, Math.min(VH - 12, p.y)) }])
    edited()
  }

  function onMove(e: RPointerEvent<SVGSVGElement>) {
    if (!rubber) return
    const p = toLocal(e)
    if (p) setRubber({ ...rubber, to: p })
  }

  function onUp(e: RPointerEvent<SVGSVGElement>) {
    if (!rubber) return
    const p = toLocal(e)
    const v = p ? hitVertex(p) : -1
    if (v >= 0 && v !== rubber.from) {
      const k = ekey(rubber.from, v)
      setEdges((prev) =>
        prev.some(([a, b]) => ekey(a, b) === k)
          ? prev.filter(([a, b]) => ekey(a, b) !== k)
          : [...prev, [rubber.from, v]],
      )
      edited()
    }
    setRubber(null)
  }

  const conj = bipartite && pl.r > 0 ? 2 - 1 / pl.r : null
  const known = preset ? PRESETS[preset].known : undefined
  const ex = (x: number) => 30 + (x - 1) * 260

  return (
    <div className="demo">
      <h3 className="demo-title">Peel a graph down to its core</h3>
      <p className="demo-hint">
        Degeneracy r is found by peeling: keep deleting a vertex of smallest degree; r is the largest
        degree you ever had to delete. Press Peel to watch it. Tap empty space to add a vertex, drag
        vertex to vertex to add an edge, tap an edge to delete it. The ruler shows how many edges an
        n-vertex graph can have while avoiding your pattern, as a power of n.
      </p>

      <div className="btn-row" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        {(Object.keys(PRESETS) as PresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            style={small}
            className={preset === id ? 'btn' : 'btn btn-ghost'}
            aria-pressed={preset === id}
            onClick={() => load(id)}
          >
            {PRESETS[id].label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-label={`Pattern graph with ${n} vertices and ${edges.length} edges. Degeneracy ${pl.r}. ${bipartite ? 'Bipartite.' : 'Not bipartite.'}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setRubber(null)}
      >
        <defs>
          <filter id="ext-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {edges.map(([a, b]) => {
          const k = ekey(a, b)
          const gone = removed.has(a) || removed.has(b)
          const isCore = showCore && pl.core.has(a) && pl.core.has(b)
          const isOdd = oddSet.has(k)
          return (
            <g key={k}>
              <line
                x1={verts[a].x}
                y1={verts[a].y}
                x2={verts[b].x}
                y2={verts[b].y}
                stroke={isCore ? '#f0c95a' : isOdd ? '#ff6b6b' : '#2ee6c5'}
                strokeWidth={isCore ? 3 : 2}
                opacity={isCore ? 0.95 : gone ? 0.12 : 0.85}
                filter={isCore ? 'url(#ext-glow)' : undefined}
                style={{ transition: 'opacity 400ms' }}
              />
              <line
                data-edge={k}
                x1={verts[a].x}
                y1={verts[a].y}
                x2={verts[b].x}
                y2={verts[b].y}
                stroke="transparent"
                strokeWidth={11}
                style={{ cursor: 'pointer' }}
              />
            </g>
          )
        })}
        {rubber ? (
          <line
            x1={verts[rubber.from].x}
            y1={verts[rubber.from].y}
            x2={rubber.to.x}
            y2={rubber.to.y}
            stroke="#f0c95a"
            strokeDasharray="4 3"
            strokeWidth={1.6}
          />
        ) : null}
        {verts.map((v, i) => {
          const gone = removed.has(i)
          const idx = pl.order.indexOf(i)
          const isCore = showCore && pl.core.has(i)
          const fill = isCore ? '#f0c95a' : bipartite ? (side[i] ? '#7eb6ff' : '#2ee6c5') : '#121a18'
          return (
            <g key={i} style={{ transition: 'opacity 400ms' }} opacity={gone && !isCore ? 0.3 : 1}>
              {i === current && playing ? (
                <circle cx={v.x} cy={v.y} r={16} fill="none" stroke="#ff6b6b" strokeWidth={2} filter="url(#ext-glow)" />
              ) : null}
              <circle cx={v.x} cy={v.y} r={9} fill={fill} stroke="#e8f2ef" strokeWidth={1.4} filter={isCore ? 'url(#ext-glow)' : undefined} />
              {gone ? (
                <text x={v.x + 11} y={v.y - 9} fontSize="9" fontFamily="IBM Plex Mono" fill="#e8f2ef" pointerEvents="none">
                  #{idx + 1}·deg {pl.degAt[idx]}
                </text>
              ) : null}
            </g>
          )
        })}
        <text x={8} y={VH - 8} fontSize="10" fontFamily="IBM Plex Mono" fill="#8aa39a">
          {done
            ? `degeneracy r = ${pl.r}${pl.r > 0 ? ` · gold = ${pl.r}-core (all degrees ≥ ${pl.r})` : ''}`
            : step > 0
              ? `peeled ${step}/${n} · worst degree so far ${Math.max(0, ...pl.degAt.slice(0, step))}`
              : `${n} vertices · ${edges.length} edges`}
        </text>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button
          type="button"
          style={small}
          className="btn"
          disabled={n === 0}
          onClick={() => {
            if (done) setStep(0)
            setPlaying((p) => !p || done)
          }}
        >
          {playing ? 'Pause' : done ? 'Peel again' : 'Peel'}
        </button>
        <button type="button" style={small} className="btn btn-ghost" disabled={done} onClick={() => setStep((s) => Math.min(n, s + 1))}>
          Step
        </button>
        <button
          type="button"
          style={small}
          className="btn btn-ghost"
          onClick={() => {
            setVerts([])
            setEdges([])
            edited()
          }}
        >
          Blank canvas
        </button>
      </div>

      {/* Exponent ruler */}
      <svg viewBox="0 0 320 78" role="img" aria-label="Exponent ruler for the extremal number">
        <line x1={ex(1)} x2={ex(2)} y1={40} y2={40} stroke="#24332e" strokeWidth={6} strokeLinecap="round" />
        {[1, 1.25, 1.5, 1.75, 2].map((x) => (
          <g key={x}>
            <line x1={ex(x)} x2={ex(x)} y1={34} y2={46} stroke="#8aa39a" strokeWidth={1} />
            <text x={ex(x)} y={60} textAnchor="middle" fontSize="8.5" fill="#8aa39a" fontFamily="IBM Plex Mono">
              n^{x}
            </text>
          </g>
        ))}
        {conj !== null ? (
          <g style={{ transition: 'transform 400ms' }} transform={`translate(${ex(conj)},0)`}>
            <path d="M0,36 L-6,24 L6,24 Z" fill="#f0c95a" />
            <text x={0} y={18} textAnchor="middle" fontSize="8.5" fill="#f0c95a" fontFamily="IBM Plex Mono">
              conjectured ≤ 2−1/{pl.r}
            </text>
          </g>
        ) : null}
        {!bipartite ? (
          <g transform={`translate(${ex(2)},0)`}>
            <path d="M0,36 L-6,24 L6,24 Z" fill="#ff6b6b" />
            <text x={-4} y={18} textAnchor="end" fontSize="8.5" fill="#ff6b6b" fontFamily="IBM Plex Mono">
              not bipartite: Θ(n²)
            </text>
          </g>
        ) : null}
        {known && bipartite ? (
          <g transform={`translate(${ex(known.exp)},0)`}>
            <path d="M0,44 L-6,56 L6,56 Z" fill="#2ee6c5" />
            <text x={0} y={72} textAnchor="middle" fontSize="8.5" fill="#2ee6c5" fontFamily="IBM Plex Mono">
              {known.text}
            </text>
          </g>
        ) : null}
      </svg>

      <p className="stat" role="status" style={{ marginTop: 'var(--space-3)' }}>
        r = {pl.r} · {bipartite ? 'bipartite (teal/blue sides)' : `not bipartite: ${odd.length} edge${odd.length === 1 ? '' : 's'} close an odd cycle (red)`}
        {conj !== null ? ` · degeneracy conjecture predicts ex(n, H) = O(n^${conj.toFixed(3)})` : ''}
      </p>
      <p className="pill-inline">
        ex(n, H) is the most edges an n-vertex graph can have with no copy of H. For a bipartite H that
        is r-degenerate, the Erdős–Simonovits conjecture says ex(n, H) = O(n^(2−1/r)). Every known
        exponent in the presets sits at or below the gold marker.
      </p>
      <p className="demo-callout">
        The 2026 catalog entry reports explicit counterexamples to this degeneracy conjecture and to a
        companion compactness conjecture. Those graphs are not drawn here; this sandbox only shows the
        quantities the conjectures are about, so treat it as a ruler, not as the counterexample.
      </p>
    </div>
  )
}
