import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'

/* ------------------------------------------------------------------ */
/*  Dittert's function φ(A) = ∏ row sums + ∏ col sums − per(A)        */
/*  over nonnegative n×n matrices whose entries sum to n.              */
/*  Conjecture: φ(A) ≤ 2 − n!/nⁿ, with equality only at J_n = (1/n).  */
/* ------------------------------------------------------------------ */

const DIMS = [3, 4, 5, 6] as const
type Dim = (typeof DIMS)[number]

const STATUS: Record<Dim, { text: string; color: string }> = {
  3: { text: 'Proved classically (n = 2, 3)', color: 'var(--muted)' },
  4: { text: 'Oct 2026: Lean-checked strengthening', color: 'var(--accent)' },
  5: { text: 'Oct 2026: Lean-checked strengthening', color: 'var(--accent)' },
  6: { text: 'Open: no proof for n ≥ 6', color: 'var(--danger)' },
}

function factorial(n: number) {
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}

/** Ryser's formula. Exact up to rounding for n ≤ 6. */
function permanent(a: number[], n: number) {
  let total = 0
  for (let S = 1; S < 1 << n; S++) {
    let prod = 1
    let bits = 0
    for (let j = 0; j < n; j++) if ((S >> j) & 1) bits++
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let j = 0; j < n; j++) if ((S >> j) & 1) s += a[i * n + j]
      prod *= s
    }
    total += ((n - bits) % 2 ? -1 : 1) * prod
  }
  return total
}

function analyse(a: number[], n: number) {
  const rows: number[] = []
  const cols: number[] = []
  for (let i = 0; i < n; i++) {
    let r = 0
    let c = 0
    for (let j = 0; j < n; j++) {
      r += a[i * n + j]
      c += a[j * n + i]
    }
    rows.push(r)
    cols.push(c)
  }
  const pr = rows.reduce((p, v) => p * v, 1)
  const pc = cols.reduce((p, v) => p * v, 1)
  const per = permanent(a, n)
  return { rows, cols, pr, pc, per, phi: pr + pc - per }
}

function normalize(a: number[], n: number) {
  const s = a.reduce((p, v) => p + v, 0)
  if (s <= 0) return a.map(() => 1 / n)
  return a.map((v) => (v * n) / s)
}

const uniform = (n: number) => Array.from({ length: n * n }, () => 1 / n)
const identity = (n: number) => Array.from({ length: n * n }, (_, k) => (k % (n + 1) === 0 ? 1 : 0))
const randomM = (n: number) => normalize(Array.from({ length: n * n }, () => Math.random() ** 2), n)

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!m) return
    const f = () => setReduced(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return reduced
}

/** dark → teal → gold heat ramp */
const RAMP: [number, number, number][] = [
  [14, 22, 20],
  [26, 158, 135],
  [46, 230, 197],
  [240, 201, 90],
]
function heat(v: number, max: number) {
  const t = Math.max(0, Math.min(1, v / max)) * (RAMP.length - 1)
  const i = Math.min(RAMP.length - 2, Math.floor(t))
  const f = t - i
  const c = RAMP[i].map((x, k) => Math.round(x + (RAMP[i + 1][k] - x) * f))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

const GRID = 250
const TRACE_W = 640
const TRACE_H = 120

export function IneqDittertDemo() {
  const reduced = useReducedMotion()
  const [n, setN] = useState<Dim>(4)
  const [a, setA] = useState<number[]>(() => randomM(4))
  const [trace, setTrace] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const raf = useRef(0)
  const drag = useRef<{ i: number; y: number; v: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const bound = 2 - factorial(n) / n ** n
  const info = analyse(a, n)
  const gap = bound - info.phi
  const atTop = gap < 2e-4

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const stopAdversary = () => {
    cancelAnimationFrame(raf.current)
    setRunning(false)
  }

  const pickDim = (d: Dim) => {
    stopAdversary()
    setN(d)
    setA(randomM(d))
    setTrace([])
  }

  const runAdversary = () => {
    if (running) {
      stopAdversary()
      return
    }
    let cur = a.slice()
    let f = analyse(cur, n).phi
    const hist = [f]
    let iter = 0
    const total = reduced ? 1 : 140
    setRunning(true)
    const frame = () => {
      const batch = reduced ? 6000 : 45
      for (let b = 0; b < batch; b++) {
        iter++
        const temp = 0.35 * Math.exp(-iter / 1800) + 0.004
        const cand = cur.slice()
        const k = Math.floor(Math.random() * n * n)
        cand[k] = Math.max(0, cand[k] + (Math.random() - 0.5) * temp * 2)
        if (Math.random() < 0.5) {
          const k2 = Math.floor(Math.random() * n * n)
          cand[k2] = Math.max(0, cand[k2] + (Math.random() - 0.5) * temp)
        }
        const c = normalize(cand, n)
        const g = analyse(c, n).phi
        if (g > f) {
          cur = c
          f = g
        }
      }
      hist.push(f)
      setA(cur)
      setTrace(hist.slice())
      if (hist.length < total + 1 && !reduced) raf.current = requestAnimationFrame(frame)
      else setRunning(false)
    }
    raf.current = requestAnimationFrame(frame)
  }

  const cell = GRID / n
  const maxEntry = Math.max(...a, 1.6 / n)

  const onDown = (e: RPointerEvent, i: number) => {
    stopAdversary()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    drag.current = { i, y: e.clientY, v: a[i] }
  }
  const onMove = (e: RPointerEvent) => {
    const d = drag.current
    const svg = svgRef.current
    if (!d || !svg) return
    const scale = svg.getBoundingClientRect().height / 330
    const dy = (d.y - e.clientY) / scale
    const next = a.slice()
    next[d.i] = Math.max(0, d.v + dy * 0.012)
    setA(normalize(next, n))
  }
  const onUp = (e: RPointerEvent) => {
    const d = drag.current
    drag.current = null
    // tap without movement: add a dose of mass to that cell
    if (d && Math.abs(d.y - e.clientY) < 3) {
      const next = a.slice()
      next[d.i] += 0.35
      setA(normalize(next, n))
    }
  }

  // thermometer geometry
  const lo = 0.8
  const hi = 2.05
  const ty = (v: number) => 300 - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * 280

  const tracePath = trace
    .map((v, i) => {
      const x = (i / Math.max(1, Math.max(140, trace.length - 1))) * TRACE_W
      const y = TRACE_H - 8 - ((Math.max(lo, v) - lo) / (hi - lo)) * (TRACE_H - 16)
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join('')
  const traceBoundY = TRACE_H - 8 - ((bound - lo) / (hi - lo)) * (TRACE_H - 16)

  return (
    <div className="demo">
      <h3 className="demo-title">Try to break Dittert’s ceiling</h3>
      <p className="demo-hint">
        Fill an n×n grid with nonnegative numbers that add up to n. Score it with Dittert’s
        function: φ(A) = (product of row sums) + (product of column sums) − per(A). Dittert
        conjectured that φ never exceeds 2 − n!/nⁿ, and that only the flat matrix with every entry
        1/n reaches it. Drag a cell up or down, or tap it to pour in mass. Then let the adversary
        search for a counterexample.
      </p>

      <div className="btn-row" role="group" aria-label="Matrix size" style={{ marginBottom: 'var(--space-3)' }}>
        {DIMS.map((d) => (
          <button key={d} type="button" className={d === n ? 'btn' : 'btn btn-ghost'} aria-pressed={d === n} onClick={() => pickDim(d)}>
            n = {d}
          </button>
        ))}
      </div>
      <p className="stat" style={{ color: STATUS[n].color, fontSize: '0.8rem', margin: '0 0 var(--space-3)' }}>
        {STATUS[n].text}
      </p>

      <svg
        ref={svgRef}
        viewBox="0 0 640 330"
        role="img"
        aria-label={`Matrix heatmap with Dittert score ${info.phi.toFixed(4)} against ceiling ${bound.toFixed(4)}`}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <defs>
          <linearGradient id="dit-therm" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="#1a9e87" />
            <stop offset="100%" stopColor="#2ee6c5" />
          </linearGradient>
        </defs>
        {/* matrix */}
        <g transform="translate(20 20)">
          {a.map((v, k) => {
            const i = Math.floor(k / n)
            const j = k % n
            return (
              <g key={`${n}-${k}`} onPointerDown={(e) => onDown(e, k)} style={{ cursor: 'ns-resize' }}>
                <rect
                  x={j * cell + 1}
                  y={i * cell + 1}
                  width={cell - 2}
                  height={cell - 2}
                  rx={3}
                  fill={heat(v, maxEntry)}
                  style={{ transition: running ? undefined : 'fill 150ms' }}
                />
                <text
                  x={j * cell + cell / 2}
                  y={i * cell + cell / 2 + 4}
                  fontSize={n >= 6 ? 9 : 11}
                  textAnchor="middle"
                  fill={v / maxEntry > 0.55 ? '#041210' : '#e8f2ef'}
                  pointerEvents="none"
                >
                  {v.toFixed(2)}
                </text>
              </g>
            )
          })}
          {/* row sums */}
          {info.rows.map((r, i) => (
            <g key={`r${i}`}>
              <rect x={GRID + 6} y={i * cell + cell / 2 - 5} width={Math.min(60, r * 30)} height={10} rx={2} fill="#f0c95a" opacity={0.75} />
              <text x={GRID + 70} y={i * cell + cell / 2 + 4} fontSize="9.5" fill="#8aa39a">
                {r.toFixed(2)}
              </text>
            </g>
          ))}
          {/* column sums */}
          {info.cols.map((c, j) => (
            <g key={`c${j}`}>
              <rect x={j * cell + cell / 2 - 5} y={GRID + 6} width={10} height={Math.min(30, c * 15)} rx={2} fill="#7eb6ff" opacity={0.75} />
            </g>
          ))}
          <text x={GRID + 6} y={-6} fontSize="9.5" fill="#f0c95a">row sums</text>
          <text x={0} y={GRID + 50} fontSize="9.5" fill="#7eb6ff">column sums</text>
        </g>

        {/* thermometer */}
        <g transform="translate(360 0)">
          <rect x={20} y={20} width={34} height={280} rx={17} fill="#121a18" stroke="#24332e" />
          <rect
            x={24}
            y={ty(info.phi)}
            width={26}
            height={300 - ty(info.phi) - 4}
            rx={13}
            fill={atTop ? '#f0c95a' : 'url(#dit-therm)'}
            style={{ filter: atTop ? 'drop-shadow(0 0 8px #f0c95a)' : undefined }}
          />
          <line x1={8} x2={70} y1={ty(bound)} y2={ty(bound)} stroke="#ff6b6b" strokeWidth={2} />
          <text x={76} y={ty(bound) - 4} fontSize="10.5" fill="#ff6b6b">
            ceiling 2 − {n}!/{n}^{n}
          </text>
          <text x={76} y={ty(bound) + 11} fontSize="10.5" fill="#ff6b6b">
            = {bound.toFixed(5)}
          </text>
          <text x={76} y={190} fontSize="12" fill="#e8f2ef" fontWeight={600}>
            φ(A) = {info.phi.toFixed(5)}
          </text>
          <text x={76} y={210} fontSize="9.5" fill="#8aa39a">
            ∏ rows {info.pr.toFixed(4)}
          </text>
          <text x={76} y={224} fontSize="9.5" fill="#8aa39a">
            + ∏ cols {info.pc.toFixed(4)}
          </text>
          <text x={76} y={238} fontSize="9.5" fill="#8aa39a">
            − per(A) {info.per.toFixed(4)}
          </text>
          <text x={76} y={262} fontSize="10.5" fill={atTop ? '#f0c95a' : '#2ee6c5'}>
            {atTop ? 'At the ceiling: A ≈ J_n' : `gap to ceiling ${gap.toFixed(5)}`}
          </text>
        </g>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={runAdversary}>
          {running ? 'Stop adversary' : 'Unleash adversary'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { stopAdversary(); setA(randomM(n)); setTrace([]) }}>
          Random
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { stopAdversary(); setA(identity(n)); setTrace([]) }}>
          Identity
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { stopAdversary(); setA(uniform(n)); setTrace([]) }}>
          Flat J_n
        </button>
      </div>

      {trace.length > 1 && (
        <svg viewBox={`0 0 ${TRACE_W} ${TRACE_H}`} role="img" aria-label="Adversary's best score over time">
          <line x1={0} x2={TRACE_W} y1={traceBoundY} y2={traceBoundY} stroke="#ff6b6b" strokeDasharray="4 3" />
          <path d={tracePath} fill="none" stroke="#2ee6c5" strokeWidth={2} />
          <text x={6} y={traceBoundY - 5} fontSize="9" fill="#ff6b6b">ceiling</text>
          <text x={6} y={TRACE_H - 4} fontSize="9" fill="#8aa39a">
            adversary’s best φ so far (random local tweaks, keep only improvements)
          </text>
        </svg>
      )}

      <p className="demo-callout">
        The adversary only ever finds the flat matrix at the top, but a search that fails is not a
        proof. In October 2026, IneqAgent produced Lean 4 proofs of stronger inequalities than this
        one for n = 4 and n = 5, plus a Holens–Djokovic (4,4) certificate that implies Merris’s
        conjecture for n = 4. This app does not re-check the Lean. The conjecture for every n is
        still open.
      </p>
    </div>
  )
}
