import { useEffect, useMemo, useRef, useState } from 'react'

/*
 * Classical toy of the low individual-degree test over F_11 in two variables.
 * Bob holds a table: one value per point (x, y). Alice is asked for a whole
 * axis-parallel line and must answer with a polynomial of degree <= d on it.
 * The referee checks that Alice's polynomial, read at the point, matches Bob.
 */

const P = 11
const CELL = 16
const GX = 8
const GY = 22
const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

type Axis = 'row' | 'col'
type Round = { x: number; y: number; axis: Axis; ok: boolean }

const mod = (a: number) => ((a % P) + P) % P
const hue = (v: number) => `hsl(${(v * 360) / P} 70% 58%)`

function makeRand(seed: number) {
  let s = (seed * 69069 + 1) % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/** All univariate polynomials of degree <= d over F_P, as value tables. */
function allPolys(d: number): number[][] {
  const out: number[][] = []
  const count = P ** (d + 1)
  for (let k = 0; k < count; k++) {
    const coeffs: number[] = []
    let r = k
    for (let i = 0; i <= d; i++) {
      coeffs.push(r % P)
      r = Math.floor(r / P)
    }
    out.push(
      Array.from({ length: P }, (_, t) => {
        let v = 0
        for (let i = d; i >= 0; i--) v = mod(v * t + coeffs[i])
        return v
      }),
    )
  }
  return out
}

/** A random polynomial of individual degree <= d in x and in y. */
function plantedTable(d: number, seed: number): number[] {
  const rand = makeRand(seed)
  const a: number[][] = Array.from({ length: d + 1 }, () => Array.from({ length: d + 1 }, () => Math.floor(rand() * P)))
  const out: number[] = []
  for (let y = 0; y < P; y++)
    for (let x = 0; x < P; x++) {
      let v = 0
      for (let i = 0; i <= d; i++) for (let j = 0; j <= d; j++) v += a[i][j] * x ** i * y ** j
      out.push(mod(v))
    }
  return out
}

function lineValues(table: number[], axis: Axis, k: number) {
  return Array.from({ length: P }, (_, t) => (axis === 'row' ? table[k * P + t] : table[t * P + k]))
}

/** Alice's best reply: the degree <= d polynomial agreeing with Bob's table on the most points of the line. */
function bestFit(vals: number[], polys: number[][]) {
  let best = polys[0]
  let bestAgree = -1
  for (const q of polys) {
    let a = 0
    for (let t = 0; t < P; t++) if (q[t] === vals[t]) a++
    if (a > bestAgree) {
      bestAgree = a
      best = q
      if (a === P) break
    }
  }
  return best
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

export function MipStarLidtDemo() {
  const reduced = usePrefersReducedMotion()
  const [d, setD] = useState(2)
  const [seed, setSeed] = useState(5)
  const planted = useMemo(() => plantedTable(d, seed), [d, seed])
  const [table, setTable] = useState<number[]>(() => plantedTable(2, 5))
  const [round, setRound] = useState<Round | null>(null)
  const [score, setScore] = useState({ pass: 0, total: 0 })
  const [playing, setPlaying] = useState(!reduced)
  const [history, setHistory] = useState<{ delta: number; rej: number }[]>([])

  const polys = useMemo(() => allPolys(d), [d])

  const answers = useMemo(() => {
    const rows = Array.from({ length: P }, (_, y) => bestFit(lineValues(table, 'row', y), polys))
    const cols = Array.from({ length: P }, (_, x) => bestFit(lineValues(table, 'col', x), polys))
    return { rows, cols }
  }, [table, polys])

  const fails = useMemo(
    () =>
      table.map((v, i) => {
        const x = i % P
        const y = Math.floor(i / P)
        return (answers.rows[y][x] !== v ? 1 : 0) + (answers.cols[x][y] !== v ? 1 : 0)
      }),
    [table, answers],
  )
  const failTotal = fails.reduce((a, b) => a + b, 0)
  const passRate = 1 - failTotal / (2 * P * P)
  const changed = table.reduce((acc, v, i) => acc + (v !== planted[i] ? 1 : 0), 0)
  const delta = changed / (P * P)

  // Record a point on the soundness plot whenever the table settles.
  useEffect(() => {
    setHistory((h) => {
      const last = h[h.length - 1]
      const pt = { delta, rej: 1 - passRate }
      if (last && last.delta === pt.delta && last.rej === pt.rej) return h
      return [...h.slice(-59), pt]
    })
  }, [delta, passRate])

  function ask() {
    const x = Math.floor(Math.random() * P)
    const y = Math.floor(Math.random() * P)
    const axis: Axis = Math.random() < 0.5 ? 'row' : 'col'
    const alice = axis === 'row' ? answers.rows[y][x] : answers.cols[x][y]
    const ok = alice === table[y * P + x]
    setRound({ x, y, axis, ok })
    setScore((s) => ({ pass: s.pass + (ok ? 1 : 0), total: s.total + 1 }))
  }

  const askRef = useRef(ask)
  useEffect(() => {
    askRef.current = ask
  })
  useEffect(() => {
    if (!playing || reduced) return
    const id = window.setInterval(() => askRef.current(), 1100)
    return () => window.clearInterval(id)
  }, [playing, reduced])

  function newTable(next: number[]) {
    setTable(next)
    setScore({ pass: 0, total: 0 })
    setRound(null)
  }

  function corrupt(k: number) {
    const next = table.slice()
    for (let i = 0; i < k; i++) {
      const c = Math.floor(Math.random() * P * P)
      next[c] = mod(next[c] + 1 + Math.floor(Math.random() * (P - 1)))
    }
    newTable(next)
  }

  function changeDegree(nd: number) {
    setD(nd)
    setHistory([])
    newTable(plantedTable(nd, seed))
  }

  // Line panel geometry
  const LX = GX + P * CELL + 26
  const LY = GY
  const LS = 12.5
  const lineVals = round ? lineValues(table, round.axis, round.axis === 'row' ? round.y : round.x) : null
  const aliceVals = round ? (round.axis === 'row' ? answers.rows[round.y] : answers.cols[round.x]) : null
  const qpos = round ? (round.axis === 'row' ? round.x : round.y) : -1

  const W = LX + P * LS + 12
  const H = GY + P * CELL + 26

  return (
    <div className="demo">
      <h3 className="demo-title">The referee&apos;s line test</h3>
      <p className="demo-hint">
        Bob holds a table of values on an 11 × 11 grid (numbers mod 11, shown as colors). The referee
        picks a random point and a row or column through it. Bob is asked only for the point; Alice,
        who cannot talk to Bob, is asked for the whole line and must answer with a polynomial of degree
        at most {d}. They pass if her polynomial matches Bob at the point. Tap cells to corrupt Bob&apos;s
        table and watch the rejection rate respond.
      </p>

      <div className="btn-row" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => corrupt(6)}>
          Corrupt 6 cells
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => newTable(plantedTable(d, seed + 101))}>
          Another low-degree table
        </button>
        <button
          type="button"
          style={small}
          className="btn btn-ghost"
          onClick={() => newTable(Array.from({ length: P * P }, () => Math.floor(Math.random() * P)))}
        >
          Random table
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => newTable(planted.slice())}>
          Honest
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bob's table, pass rate ${(passRate * 100).toFixed(1)} percent`}>
        <defs>
          <filter id="lidt-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text x={GX} y={14} fontSize="9" fill="#8aa39a" fontFamily="IBM Plex Mono">
          Bob&apos;s table · red = fails a check
        </text>
        {round ? (
          <rect
            x={round.axis === 'row' ? GX - 2 : GX + round.x * CELL - 2}
            y={round.axis === 'row' ? GY + round.y * CELL - 2 : GY - 2}
            width={round.axis === 'row' ? P * CELL + 4 : CELL + 4}
            height={round.axis === 'row' ? CELL + 4 : P * CELL + 4}
            fill="none"
            stroke={round.ok ? '#2ee6c5' : '#ff6b6b'}
            strokeWidth={2}
            rx={3}
            filter="url(#lidt-glow)"
          />
        ) : null}
        {table.map((v, i) => {
          const x = i % P
          const y = Math.floor(i / P)
          const f = fails[i]
          return (
            <g key={i} onClick={() => newTable(table.map((u, j) => (j === i ? mod(u + 1) : u)))} style={{ cursor: 'pointer' }}>
              <rect
                x={GX + x * CELL + 1}
                y={GY + y * CELL + 1}
                width={CELL - 2}
                height={CELL - 2}
                rx={2}
                fill={hue(v)}
                fillOpacity={0.78}
                stroke={f ? '#ff6b6b' : 'none'}
                strokeWidth={f === 2 ? 2.2 : 1.2}
              />
              {v !== planted[i] ? <circle cx={GX + x * CELL + CELL - 4} cy={GY + y * CELL + 4} r={1.8} fill="#ffffff" /> : null}
            </g>
          )
        })}
        {round ? (
          <circle
            cx={GX + round.x * CELL + CELL / 2}
            cy={GY + round.y * CELL + CELL / 2}
            r={5}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            pointerEvents="none"
          />
        ) : null}

        {/* Line panel */}
        <text x={LX} y={14} fontSize="9" fill="#8aa39a" fontFamily="IBM Plex Mono">
          {round ? `${round.axis === 'row' ? `row y=${round.y}` : `column x=${round.x}`}: value vs position` : 'the asked line'}
        </text>
        <rect x={LX - 4} y={LY - 4} width={P * LS + 8} height={P * CELL + 8} fill="#0b1210" stroke="#24332e" rx={3} />
        {lineVals && aliceVals ? (
          <g>
            <rect x={LX + qpos * LS} y={LY - 2} width={LS} height={P * CELL + 4} fill={round?.ok ? '#2ee6c5' : '#ff6b6b'} opacity={0.15} />
            {lineVals.map((v, t) => {
              const yb = LY + (P - 1 - v) * CELL + CELL / 2
              const ya = LY + (P - 1 - aliceVals[t]) * CELL + CELL / 2
              const cx = LX + t * LS + LS / 2
              const mismatch = v !== aliceVals[t]
              return (
                <g key={t}>
                  {mismatch ? <line x1={cx} x2={cx} y1={yb} y2={ya} stroke="#ff6b6b" strokeWidth={1.2} strokeDasharray="2 2" /> : null}
                  <rect x={cx - 3.5} y={ya - 3.5} width={7} height={7} fill="none" stroke="#e8f2ef" strokeWidth={1.2} />
                  <circle cx={cx} cy={yb} r={3.6} fill={hue(v)} stroke={t === qpos ? '#ffffff' : 'none'} strokeWidth={1.5} />
                </g>
              )
            })}
          </g>
        ) : null}
        <text x={LX} y={H - 8} fontSize="8.5" fill="#8aa39a" fontFamily="IBM Plex Mono">
          ● Bob  □ Alice
        </text>
        <text x={GX} y={H - 8} fontSize="9" fill={round ? (round.ok ? '#6dffb0' : '#ff6b6b') : '#8aa39a'} fontFamily="IBM Plex Mono">
          {round ? `referee: ${round.ok ? 'ACCEPT' : 'REJECT'} at (${round.x},${round.y})` : 'waiting for a question'}
        </text>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button type="button" style={small} className="btn" onClick={ask}>
          Ask one question
        </button>
        <button type="button" style={small} className="btn btn-ghost" disabled={reduced} onClick={() => setPlaying((p) => !p)}>
          {playing && !reduced ? 'Pause referee' : 'Auto referee'}
        </button>
        {[1, 2].map((k) => (
          <button
            key={k}
            type="button"
            style={small}
            className={d === k ? 'btn' : 'btn btn-ghost'}
            aria-pressed={d === k}
            onClick={() => changeDegree(k)}
          >
            degree ≤ {k}
          </button>
        ))}
        <button
          type="button"
          style={small}
          className="btn btn-ghost"
          onClick={() => {
            setSeed((s) => s + 1)
            setHistory([])
            newTable(plantedTable(d, seed + 1))
          }}
        >
          New planted polynomial
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-3)', alignItems: 'start' }}>
        <div>
          <p className="stat" role="status" style={{ margin: 0 }}>
            Exact pass rate {(passRate * 100).toFixed(1)}%
          </p>
          <div className="meter" style={{ margin: '6px 0' }}>
            <span style={{ width: `${passRate * 100}%`, transition: 'width 300ms' }} />
          </div>
          <p className="pill-inline" style={{ margin: 0 }}>
            Cells changed from the planted polynomial: {changed} ({(delta * 100).toFixed(0)}%) · questions
            asked {score.total}, passed {score.pass}
          </p>
        </div>
        <svg viewBox="0 0 160 110" role="img" aria-label="Rejection rate against cells changed">
          <line x1={24} y1={92} x2={154} y2={92} stroke="#24332e" />
          <line x1={24} y1={6} x2={24} y2={92} stroke="#24332e" />
          <text x={89} y={106} textAnchor="middle" fontSize="8" fill="#8aa39a" fontFamily="IBM Plex Mono">
            cells changed →
          </text>
          <text x={10} y={50} fontSize="8" fill="#8aa39a" fontFamily="IBM Plex Mono" transform="rotate(-90 10 50)" textAnchor="middle">
            rejected →
          </text>
          {history.map((h, i) => (
            <circle
              key={i}
              cx={24 + h.delta * 130}
              cy={92 - h.rej * 86}
              r={i === history.length - 1 ? 4 : 2.2}
              fill={i === history.length - 1 ? '#f0c95a' : '#2ee6c5'}
              opacity={i === history.length - 1 ? 1 : 0.55}
              filter={i === history.length - 1 ? 'url(#lidt-glow)' : undefined}
            />
          ))}
        </svg>
      </div>

      <p className="feedback" style={{ color: 'var(--muted)' }}>
        Try “Another low-degree table”: almost every cell changes, yet the pass rate is 100%. Soundness
        never promised closeness to the planted polynomial, only to some low-degree polynomial. A
        random table is far from all of them, and the referee rejects it most of the time.
      </p>
      <p className="demo-callout">
        Classical toy. Here Alice plays her best possible reply to Bob&apos;s fixed table. The theorem
        FormalFlow&apos;s agents checked in Lean is the quantum version: even provers sharing
        entanglement who pass with high probability must be close to a low individual-degree
        polynomial, with side conditions repaired during formalization. MIP* = RE itself was proved
        earlier by Ji, Natarajan, Vidick, Wright and Yuen. This page does not re-run Lean.
      </p>
    </div>
  )
}
