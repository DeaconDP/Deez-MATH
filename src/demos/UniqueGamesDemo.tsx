import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

const N = 20
const M = 60
const K = 5
const SIZE = 380
const C = SIZE / 2
const R = 150
const HUES = ['#2ee6c5', '#f0c95a', '#ff6b6b', '#7eb6ff', '#c792ff']

type Edge = { a: number; b: number; s: number } // constraint: L(b) = L(a) + s (mod K)
type Kind = 'planted' | 'random' | 'mystery'
type Instance = { edges: Edge[]; kind: 'planted' | 'random'; reference: number }

const mod = (x: number) => ((x % K) + K) % K

function rng(seed: number) {
  let s = seed % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function graph(rand: () => number) {
  const out: [number, number][] = []
  const seen = new Set<string>()
  const add = (a: number, b: number) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`
    if (a === b || seen.has(key)) return
    seen.add(key)
    out.push([a, b])
  }
  for (let i = 0; i < N; i++) add(i, (i + 1) % N)
  while (out.length < M) add(Math.floor(rand() * N), Math.floor(rand() * N))
  return out
}

const satisfied = (e: Edge, L: number[]) => mod(L[e.a] + e.s) === L[e.b]
const score = (edges: Edge[], L: number[]) => edges.filter((e) => satisfied(e, L)).length

function incidence(edges: Edge[]) {
  const inc: number[][] = Array.from({ length: N }, () => [])
  edges.forEach((e, i) => {
    inc[e.a].push(i)
    inc[e.b].push(i)
  })
  return inc
}

/** Best label for v given its neighbours (ties keep the current label). */
function bestLabel(v: number, L: number[], edges: Edge[], inc: number[][]) {
  const votes = new Array(K).fill(0)
  for (const i of inc[v]) {
    const e = edges[i]
    if (e.a === v) votes[mod(L[e.b] - e.s)]++
    else votes[mod(L[e.a] + e.s)]++
  }
  let best = L[v]
  for (let c = 0; c < K; c++) if (votes[c] > votes[best]) best = c
  return best
}

function localSearch(edges: Edge[], start: number[]) {
  const inc = incidence(edges)
  const L = start.slice()
  for (let sweep = 0; sweep < 30; sweep++) {
    let changed = false
    for (let v = 0; v < N; v++) {
      const b = bestLabel(v, L, edges, inc)
      if (b !== L[v]) {
        L[v] = b
        changed = true
      }
    }
    if (!changed) break
  }
  return L
}

function makeInstance(kind: 'planted' | 'random', noise: number, seed: number): Instance {
  const rand = rng(seed * 7919 + 13)
  const pairs = graph(rand)
  if (kind === 'planted') {
    const hidden = Array.from({ length: N }, () => Math.floor(rand() * K))
    const edges = pairs.map(([a, b]) => {
      const truth = mod(hidden[b] - hidden[a])
      const s = rand() < noise ? mod(truth + 1 + Math.floor(rand() * (K - 1))) : truth
      return { a, b, s }
    })
    return { edges, kind, reference: score(edges, hidden) }
  }
  const edges = pairs.map(([a, b]) => ({ a, b, s: Math.floor(rand() * K) }))
  let best = 0
  for (let r = 0; r < 150; r++) {
    const L = localSearch(edges, Array.from({ length: N }, () => Math.floor(rand() * K)))
    best = Math.max(best, score(edges, L))
  }
  return { edges, kind, reference: best }
}

const pos = (i: number) => {
  const a = -Math.PI / 2 + (i / N) * Math.PI * 2
  return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) }
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

type Dial = { label: number[]; angle: number[] }
const withLabels = (prev: Dial, label: number[]): Dial => ({
  label,
  // turn each hand the short way round to its new position
  angle: prev.angle.map((a, i) => {
    let d = (((label[i] * (360 / K) - a) % 360) + 360) % 360
    if (d > 180) d -= 360
    return a + d
  }),
})

export function UniqueGamesDemo() {
  const [kind, setKind] = useState<Kind>('planted')
  const [noise, setNoise] = useState(0.1)
  const [seed, setSeed] = useState(3)
  const [mysteryTruth, setMysteryTruth] = useState<'planted' | 'random'>('planted')
  const [guess, setGuess] = useState<null | 'planted' | 'random'>(null)
  const [dial, setDial] = useState<Dial>({ label: new Array(N).fill(0), angle: new Array(N).fill(0) })
  const [busy, setBusy] = useState<null | 'propagate' | 'search'>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const timer = useRef<number | null>(null)

  const effectiveKind = kind === 'mystery' ? mysteryTruth : kind
  const inst = useMemo(
    () => makeInstance(effectiveKind, kind === 'mystery' ? 0.08 : noise, seed),
    [effectiveKind, kind, noise, seed],
  )
  const inc = useMemo(() => incidence(inst.edges), [inst])
  const L = dial.label
  const sat = score(inst.edges, L)
  const pct = sat / M

  useEffect(() => () => {
    if (timer.current != null) clearInterval(timer.current)
  }, [])

  function halt() {
    if (timer.current != null) clearInterval(timer.current)
    timer.current = null
    setBusy(null)
    setFocus(null)
  }

  function resetLabels(next?: number[]) {
    halt()
    setDial((d) => withLabels(d, next ?? new Array(N).fill(0)))
  }

  function newInstance(k: Kind = kind) {
    halt()
    setKind(k)
    setSeed((s) => s + 1)
    setGuess(null)
    if (k === 'mystery') setMysteryTruth(Math.random() < 0.5 ? 'planted' : 'random')
    setDial((d) => withLabels(d, new Array(N).fill(0)))
  }

  function bump(v: number) {
    if (busy) return
    setDial((d) => {
      const next = d.label.slice()
      next[v] = mod(next[v] + 1)
      return { label: next, angle: d.angle.map((a, i) => (i === v ? a + 360 / K : a)) }
    })
  }

  /** Breadth-first propagation from vertex 0: follow each tree edge's rule exactly. */
  function propagate() {
    halt()
    const order: { v: number; from: number; e: number }[] = []
    const seen = new Array(N).fill(false)
    seen[0] = true
    const queue = [0]
    while (queue.length) {
      const u = queue.shift() as number
      for (const i of inc[u]) {
        const e = inst.edges[i]
        const w = e.a === u ? e.b : e.a
        if (!seen[w]) {
          seen[w] = true
          order.push({ v: w, from: u, e: i })
          queue.push(w)
        }
      }
    }
    const work = L.slice()
    const step = (o: { v: number; from: number; e: number }) => {
      const e = inst.edges[o.e]
      work[o.v] = e.a === o.from ? mod(work[o.from] + e.s) : mod(work[o.from] - e.s)
    }
    if (reducedMotion()) {
      order.forEach(step)
      setDial((d) => withLabels(d, work.slice()))
      return
    }
    setBusy('propagate')
    let k = 0
    timer.current = window.setInterval(() => {
      if (k >= order.length) {
        halt()
        return
      }
      step(order[k])
      setFocus(order[k].v)
      setDial((d) => withLabels(d, work.slice()))
      k++
    }, 90)
  }

  /** Greedy local search: each vertex in turn takes the label most neighbours vote for. */
  function search() {
    halt()
    const work = L.slice()
    if (reducedMotion()) {
      setDial((d) => withLabels(d, localSearch(inst.edges, work)))
      return
    }
    setBusy('search')
    let v = 0
    let quiet = 0
    timer.current = window.setInterval(() => {
      const b = bestLabel(v, work, inst.edges, inc)
      setFocus(v)
      if (b !== work[v]) {
        work[v] = b
        quiet = 0
        setDial((d) => withLabels(d, work.slice()))
      } else quiet++
      v = (v + 1) % N
      if (quiet >= N) halt()
    }, 55)
  }

  const showTruth = kind !== 'mystery' || guess != null
  const refPct = inst.reference / M

  return (
    <div className="demo">
      <h3 className="demo-title">Dials and twist rules</h3>
      <p className="demo-hint">
        Every node is a dial with {K} positions. Every edge carries one rule: &quot;my neighbour&apos;s dial is mine
        turned by s&quot;. Given one end, the other end has exactly one legal setting: that is the{' '}
        <em>unique</em> in Unique Games. Tap a dial to turn it. Teal edges are happy, red ones are broken.
      </p>
      <div className="btn-row" role="group" aria-label="Instance type" style={{ marginBottom: 'var(--space-3)' }}>
        {(
          [
            ['planted', 'Almost satisfiable'],
            ['random', 'Random rules'],
            ['mystery', 'Mystery game'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={k === kind ? 'btn' : 'btn btn-ghost'}
            aria-pressed={k === kind}
            onClick={() => newInstance(k)}
          >
            {label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Unique game on ${N} dials and ${M} edges. ${sat} of ${M} rules satisfied.`}>
        <defs>
          <filter id="ug-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="ug-bg">
            <stop offset="0%" stopColor="#2ee6c5" stopOpacity={0.05 + 0.18 * pct * pct} />
            <stop offset="100%" stopColor="#070b0a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R + 30} fill="url(#ug-bg)" />
        <g>
          {inst.edges.map((e, i) => {
            const p = pos(e.a)
            const q = pos(e.b)
            const mx = (p.x + q.x) / 2
            const my = (p.y + q.y) / 2
            const cx = C + (mx - C) * 0.45
            const cy = C + (my - C) * 0.45
            const ok = satisfied(e, L)
            const lit = focus != null && (e.a === focus || e.b === focus)
            return (
              <path
                key={i}
                d={`M${p.x},${p.y} Q${cx},${cy} ${q.x},${q.y}`}
                fill="none"
                stroke={ok ? '#2ee6c5' : '#ff6b6b'}
                strokeOpacity={ok ? (lit ? 1 : 0.75) : lit ? 0.9 : 0.35}
                strokeWidth={ok ? 1.8 : 1.1}
                strokeDasharray={ok ? undefined : '3 3'}
                filter={ok ? 'url(#ug-glow)' : undefined}
                style={{ transition: 'stroke 200ms, stroke-opacity 200ms' }}
              />
            )
          })}
        </g>
        {Array.from({ length: N }, (_, v) => {
          const p = pos(v)
          const isFocus = v === focus
          return (
            <g
              key={v}
              transform={`translate(${p.x},${p.y})`}
              onClick={() => bump(v)}
              style={{ cursor: busy ? 'default' : 'pointer' }}
              role="button"
              aria-label={`Dial ${v + 1}, position ${L[v]}`}
            >
              <circle r={20} fill="transparent" />
              <circle r={14} fill="#0d1513" stroke={HUES[L[v]]} strokeWidth={isFocus ? 3.5 : 2} filter={isFocus ? 'url(#ug-glow)' : undefined} />
              {Array.from({ length: K }, (_, t) => {
                const a = (t / K) * Math.PI * 2 - Math.PI / 2
                return <circle key={t} cx={11 * Math.cos(a)} cy={11 * Math.sin(a)} r={1.1} fill="#3a4a45" />
              })}
              <g style={{ transform: `rotate(${dial.angle[v]}deg)`, transition: 'transform 260ms cubic-bezier(.3,1.4,.5,1)' }}>
                <line x1={0} y1={2} x2={0} y2={-10} stroke={HUES[L[v]]} strokeWidth={2.6} strokeLinecap="round" />
              </g>
              <circle r={2.2} fill="#e8f2ef" />
            </g>
          )
        })}
        <circle cx={C} cy={C} r={52} fill="#070b0a" fillOpacity="0.82" />
        <text x={C} y={C - 6} textAnchor="middle" fill="#e8f2ef" fontSize="30" fontFamily="Syne, sans-serif" fontWeight="700">
          {Math.round(pct * 100)}%
        </text>
        <text x={C} y={C + 14} textAnchor="middle" fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          {sat} / {M} rules happy
        </text>
      </svg>

      <div className="controls">
        {kind === 'planted' ? (
          <DimSlider
            label="Corrupted rules (noise)"
            value={Math.round(noise * 100)}
            min={0}
            max={30}
            onChange={(v) => {
              halt()
              setNoise(v / 100)
            }}
            format={(v) => `${v}%`}
          />
        ) : null}
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={propagate} disabled={busy != null}>
          Propagate from dial 1
        </button>
        <button type="button" className="btn" onClick={search} disabled={busy != null}>
          Greedy local search
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => resetLabels(Array.from({ length: N }, () => Math.floor(Math.random() * K)))}>
          Scramble
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => newInstance()}>
          New game
        </button>
      </div>

      {kind === 'mystery' && guess == null ? (
        <div className="btn-row" role="group" aria-label="Your verdict" style={{ marginBottom: 'var(--space-3)' }}>
          <span className="pill-inline" style={{ alignSelf: 'center' }}>
            Hidden: ~92% satisfiable, or random rules (~60% at best)?
          </span>
          <button type="button" className="btn btn-ghost" onClick={() => setGuess('planted')}>
            Almost satisfiable
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setGuess('random')}>
            Far from it
          </button>
        </div>
      ) : null}

      <p className="stat" role="status">
        You: {sat}/{M} ({Math.round(pct * 100)}%)
        {showTruth
          ? inst.kind === 'planted'
            ? ` · hidden labeling satisfies ${inst.reference}/${M} (${Math.round(refPct * 100)}%)`
            : ` · best of 150 local-search restarts: ${inst.reference}/${M} (${Math.round(refPct * 100)}%)`
          : ' · reference hidden'}
      </p>
      {kind === 'mystery' && guess != null ? (
        <p className={`feedback ${guess === inst.kind ? 'ok' : 'err'}`}>
          {guess === inst.kind ? 'Correct. ' : 'Not this time. '}It was {inst.kind === 'planted' ? 'a planted, almost satisfiable game' : 'random rules'}.
          On {N} dials a few restarts usually tell. The claim is about huge games with many labels.
        </p>
      ) : (
        <p className="feedback" style={{ color: 'var(--muted)' }}>
          {kind === 'planted' && noise === 0
            ? 'Zero noise: propagation hits 100% every time. Deciding "fully satisfiable?" is easy.'
            : 'Try propagation with noise above 0: one corrupted rule on the spanning tree spreads errors downstream.'}
        </p>
      )}
      <p className="demo-callout">
        The gap: 100% satisfiable games are easy (pick a dial, follow the rules). The claimed theorem (OpenAI catalog,
        Oct 2026, not machine-checked) says telling &quot;almost every rule can be satisfied&quot; from &quot;only a
        small fraction can&quot; is NP-hard in general. This 20-dial toy is small enough to solve by brute effort; it
        shows the two worlds, not the hardness.
      </p>
    </div>
  )
}
