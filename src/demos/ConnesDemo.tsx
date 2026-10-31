import { useEffect, useMemo, useRef, useState } from 'react'

type El = number[]
type GroupSpec = {
  name: string
  gens: El[]
  genNames: string[]
  id: El
  mul: (a: El, b: El) => El
  nameOf?: (a: El) => string
}

const permMul = (p: El, q: El) => q.map((_, i) => p[q[i]])
const permId = (n: number) => Array.from({ length: n }, (_, i) => i)
const quatMul = (p: El, q: El): El => [
  p[0] * q[0] - p[1] * q[1] - p[2] * q[2] - p[3] * q[3],
  p[0] * q[1] + p[1] * q[0] + p[2] * q[3] - p[3] * q[2],
  p[0] * q[2] - p[1] * q[3] + p[2] * q[0] + p[3] * q[1],
  p[0] * q[3] + p[1] * q[2] - p[2] * q[1] + p[3] * q[0],
]
const quatName = (q: El) => {
  const names = ['1', 'i', 'j', 'k']
  const k = q.findIndex((v) => v !== 0)
  return (q[k] < 0 ? '−' : '') + names[k]
}

const G: Record<string, GroupSpec> = {
  z4: { name: 'ℤ₄', gens: [[1, 2, 3, 0]], genNames: ['a'], id: permId(4), mul: permMul },
  v4: { name: 'ℤ₂×ℤ₂', gens: [[1, 0, 2, 3], [0, 1, 3, 2]], genNames: ['a', 'b'], id: permId(4), mul: permMul },
  d4: { name: 'D₄', gens: [[1, 2, 3, 0], [0, 3, 2, 1]], genNames: ['r', 's'], id: permId(4), mul: permMul },
  q8: { name: 'Q₈', gens: [[0, 1, 0, 0], [0, 0, 1, 0]], genNames: ['i', 'j'], id: [1, 0, 0, 0], mul: quatMul, nameOf: quatName },
  s3: { name: 'S₃', gens: [[1, 2, 0], [1, 0, 2]], genNames: ['r', 's'], id: permId(3), mul: permMul },
  z6: { name: 'ℤ₆', gens: [[1, 2, 3, 4, 5, 0]], genNames: ['a'], id: permId(6), mul: permMul },
}

const PAIRS: { label: string; a: string; b: string }[] = [
  { label: 'D₄ vs Q₈', a: 'd4', b: 'q8' },
  { label: 'ℤ₄ vs ℤ₂×ℤ₂', a: 'z4', b: 'v4' },
  { label: 'S₃ vs ℤ₆', a: 's3', b: 'z6' },
]

const GEN_COLORS = ['#2ee6c5', '#f0c95a']

type Built = {
  spec: GroupSpec
  els: El[]
  names: string[]
  edges: { from: number; to: number; gen: number; involution: boolean }[]
  graphPos: [number, number][]
  orders: number[]
  dims: number[]
}

function compress(word: string) {
  return word.replace(/(.)\1+/g, (m, c: string) => c + '⁰¹²³⁴⁵⁶⁷⁸⁹'[m.length])
}

function build(spec: GroupSpec): Built {
  const key = (e: El) => e.join(',')
  const els: El[] = [spec.id]
  const words = ['']
  const index = new Map([[key(spec.id), 0]])
  for (let q = 0; q < els.length; q++) {
    spec.gens.forEach((g, gi) => {
      const y = spec.mul(els[q], g)
      if (!index.has(key(y))) {
        index.set(key(y), els.length)
        els.push(y)
        words.push(words[q] + spec.genNames[gi])
      }
    })
  }
  const n = els.length
  const idx = (e: El) => index.get(key(e)) ?? 0
  const mul = (i: number, j: number) => idx(spec.mul(els[i], els[j]))
  const inv = els.map((_, i) => els.findIndex((_, j) => mul(i, j) === 0))
  const names = els.map((e, i) => (spec.nameOf ? spec.nameOf(e) : i === 0 ? 'e' : compress(words[i])))

  // Orders.
  const orders = els.map((_, i) => {
    let k = 1
    let x = i
    while (x !== 0) {
      x = mul(x, i)
      k++
    }
    return k
  })

  // Conjugacy classes and commutator subgroup give the irrep dimensions here:
  // (#1-dim irreps) = |G/[G,G]|, and the remaining classes share one dimension for these groups.
  const seen = new Set<number>()
  let classes = 0
  for (let i = 0; i < n; i++) {
    if (seen.has(i)) continue
    classes++
    for (let g = 0; g < n; g++) seen.add(mul(mul(g, i), inv[g]))
  }
  const comm = new Set<number>([0])
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) comm.add(mul(mul(a, b), mul(inv[a], inv[b])))
  let grew = true
  while (grew) {
    grew = false
    for (const a of [...comm]) for (const b of [...comm]) if (!comm.has(mul(a, b))) {
      comm.add(mul(a, b))
      grew = true
    }
  }
  const linear = n / comm.size
  const rest = classes - linear
  const d = rest > 0 ? Math.round(Math.sqrt((n - linear) / rest)) : 0
  const dims = [...Array(linear).fill(1), ...Array(rest).fill(d)]

  // Layout: left cosets of <first generator> as concentric rings.
  const g0 = idx(spec.gens[0])
  const graphPos: [number, number][] = Array(n)
  const placed = new Set<number>()
  let ring = 0
  const cycle = orders[g0]
  const rings = Math.ceil(n / cycle)
  for (let i = 0; i < n; i++) {
    if (placed.has(i)) continue
    let x = i
    const radius = rings === 1 ? 62 : 30 + (ring * 46) / Math.max(1, rings - 1)
    for (let step = 0; step < cycle; step++) {
      const ang = -Math.PI / 2 + (2 * Math.PI * step) / cycle + ring * (Math.PI / cycle)
      graphPos[x] = [Math.cos(ang) * radius, Math.sin(ang) * radius]
      placed.add(x)
      x = mul(x, g0)
    }
    ring++
  }

  const edges: Built['edges'] = []
  spec.gens.forEach((g, gi) => {
    const gIdx = idx(g)
    const involution = orders[gIdx] === 2
    for (let i = 0; i < n; i++) {
      const j = mul(i, gIdx)
      if (involution && j < i) continue
      edges.push({ from: i, to: j, gen: gi, involution })
    }
  })

  return { spec, els, names, edges, graphPos, orders, dims }
}

/** Cells of the block-diagonal algebra ⊕ M_d, one per element (Σ d² = |G|). */
function blockCells(dims: number[], side: number) {
  const D = dims.reduce((s, d) => s + d, 0)
  const cell = side / D
  const cells: [number, number][] = []
  const blocks: { x: number; y: number; s: number }[] = []
  let off = 0
  for (const d of dims) {
    blocks.push({ x: off * cell - side / 2, y: off * cell - side / 2, s: d * cell })
    for (let r = 0; r < d; r++)
      for (let c = 0; c < d; c++) cells.push([(off + c + 0.5) * cell - side / 2, (off + r + 0.5) * cell - side / 2])
    off += d
  }
  return { cells, blocks, cell }
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

function orderSummary(orders: number[]) {
  const m = new Map<number, number>()
  orders.forEach((o) => m.set(o, (m.get(o) ?? 0) + 1))
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([o, c]) => `${c}× order ${o}`).join(', ')
}

function GroupPanel({ g, cx, t, sel, onSel }: { g: Built; cx: number; t: number; sel: number; onSel: (i: number) => void }) {
  const cy = 118
  const { cells, blocks, cell } = useMemo(() => blockCells(g.dims, 120), [g])
  const e = ease(t)
  const pos = g.graphPos.map(([x, y], i) => [cx + x + (cells[i][0] - x) * e, cy + y + (cells[i][1] - y) * e] as const)
  const powers = new Set<number>()
  {
    let x = sel
    for (let k = 0; k < g.orders[sel]; k++) {
      powers.add(x)
      const prod = g.spec.mul(g.els[x], g.els[sel]).join(',')
      x = g.els.findIndex((el) => el.join(',') === prod)
    }
  }
  const nodeR = 10 * (1 - e) + (cell / 2 - 1.5) * e
  return (
    <g>
      <text x={cx} y={20} textAnchor="middle" fill="#e8f2ef" fontSize="14" fontFamily="Syne, sans-serif" fontWeight="700">
        {g.spec.name}
      </text>
      <g opacity={1 - e}>
        {g.edges.map((ed, k) => {
          const a = pos[ed.from]
          const b = pos[ed.to]
          const lit = powers.has(ed.from) && powers.has(ed.to)
          return (
            <g key={k}>
              <line
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke={GEN_COLORS[ed.gen]}
                strokeWidth={lit ? 2.4 : 1.3}
                opacity={lit ? 1 : 0.55}
                markerEnd={ed.involution ? undefined : `url(#cn-arrow-${ed.gen})`}
              />
            </g>
          )
        })}
      </g>
      <g opacity={e}>
        {blocks.map((b, k) => (
          <rect key={k} x={cx + b.x} y={cy + b.y} width={b.s} height={b.s} fill="none" stroke="#2ee6c5" strokeWidth="1.6" rx="2" filter="url(#cn-glow)" />
        ))}
        <rect x={cx - 60} y={cy - 60} width={120} height={120} fill="none" stroke="#24332e" strokeDasharray="3 3" />
      </g>
      {pos.map(([x, y], i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={() => onSel(i)}>
          <rect
            x={x - nodeR}
            y={y - nodeR}
            width={nodeR * 2}
            height={nodeR * 2}
            rx={nodeR * (1 - e) + 2 * e}
            fill={i === sel ? '#f0c95a' : powers.has(i) ? '#3b3420' : '#121a18'}
            stroke={powers.has(i) ? '#f0c95a' : '#8aa39a'}
            strokeWidth="1.2"
          />
          {e < 0.5 && (
            <text x={x} y={y + 3} textAnchor="middle" fill={i === sel ? '#041210' : '#e8f2ef'} fontSize="7.5" fontFamily="IBM Plex Mono" style={{ pointerEvents: 'none' }}>
              {g.names[i]}
            </text>
          )}
        </g>
      ))}
      <text x={cx} y={206} textAnchor="middle" fill="#8aa39a" fontSize="8.5" fontFamily="IBM Plex Mono">
        {e > 0.5 ? `⊕ M_d, d = ${g.dims.join(', ')}` : g.spec.genNames.map((n, k) => `${k ? '  ' : ''}${n}`).join('')}
      </text>
    </g>
  )
}

export function ConnesDemo() {
  const [pair, setPair] = useState(0)
  const [target, setTarget] = useState(0)
  const [t, setT] = useState(0)
  const [selA, setSelA] = useState(1)
  const [selB, setSelB] = useState(1)
  const tRef = useRef(0)
  useEffect(() => {
    tRef.current = t
  }, [t])

  const ga = useMemo(() => build(G[PAIRS[pair].a]), [pair])
  const gb = useMemo(() => build(G[PAIRS[pair].b]), [pair])

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setT(target)
      return
    }
    let raf = 0
    const start = tRef.current
    const t0 = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1300)
      setT(start + (target - start) * k)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  const same = ga.dims.length === gb.dims.length && [...ga.dims].sort().join() === [...gb.dims].sort().join()
  const done = t > 0.98

  return (
    <div className="demo">
      <h3 className="demo-title">Two different groups, one algebra</h3>
      <p className="demo-hint">
        Each picture is a Cayley graph: dots are group elements, colored arrows multiply by a
        generator. Tap a dot to light up the powers of that element. The two groups differ, as their
        element orders show. Now press Fourier transform. The group algebra splits into blocks of
        matrices, and when the block shapes match, the algebras are the same.
      </p>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        {PAIRS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className={pair === i ? 'btn' : 'btn btn-ghost'}
            onClick={() => {
              setPair(i)
              setSelA(1)
              setSelB(1)
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 420 228" role="img" aria-label="Cayley graphs of two groups morphing into the block matrices of their group algebras">
        <defs>
          {GEN_COLORS.map((c, i) => (
            <marker key={c} id={`cn-arrow-${i}`} viewBox="0 0 10 10" refX="19" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,1 L10,5 L0,9 z" fill={c} />
            </marker>
          ))}
          <filter id="cn-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <GroupPanel g={ga} cx={105} t={t} sel={selA} onSel={setSelA} />
        <GroupPanel g={gb} cx={315} t={t} sel={selB} onSel={setSelB} />
        <text x={210} y={122} textAnchor="middle" fill={done ? (same ? '#6dffb0' : '#ff6b6b') : '#8aa39a'} fontSize={done ? 20 : 13} fontFamily="IBM Plex Mono" filter={done ? 'url(#cn-glow)' : undefined}>
          {done ? (same ? '≅' : '≇') : '≇'}
        </text>
        <text x={210} y={222} textAnchor="middle" fill={done ? (same ? '#6dffb0' : '#ff6b6b') : '#8aa39a'} fontSize="10" fontFamily="IBM Plex Mono">
          {done
            ? same
              ? 'same algebra: it has forgotten which group it came from'
              : 'different block shapes: the algebra still tells them apart'
            : 'groups are not isomorphic'}
        </text>
      </svg>
      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        <button type="button" className="btn" onClick={() => setTarget((v) => (v > 0.5 ? 0 : 1))}>
          {target > 0.5 ? 'Back to groups' : 'Fourier transform'}
        </button>
      </div>
      <p className="stat" role="status" style={{ fontSize: '0.8rem' }}>
        {ga.spec.name}: {orderSummary(ga.orders)}. Selected {ga.names[selA]} has order {ga.orders[selA]}.
        <br />
        {gb.spec.name}: {orderSummary(gb.orders)}. Selected {gb.names[selB]} has order {gb.orders[selB]}.
        <br />
        Algebra blocks (computed from conjugacy classes): {ga.dims.join('+')} vs {gb.dims.join('+')}.
      </p>
      <p className="pill-inline" style={{ display: 'block', marginTop: 'var(--space-2)' }}>
        Each dot flies to one matrix entry only to show the dimension count, Σ d² = |G|. The real
        Fourier map mixes all elements together.
      </p>
      <p className="demo-callout">
        Finite groups forget easily, as this toy shows. Connes conjectured that rigid infinite
        groups, those with property (T) and the ICC condition, could always be recovered from L(G).
        The August 2026 Astra result builds infinitely many non-isomorphic property-(T) groups with
        the same L(G). The algebra alone cannot name the group.
      </p>
    </div>
  )
}
