import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Real class numbers h(−D) of imaginary quadratic fields, computed   */
/*  by counting reduced binary quadratic forms, versus Cohen–Lenstra.  */
/* ------------------------------------------------------------------ */

const D_MAX = 200_000
const PRIMES = [3, 5, 7, 11] as const
const COLORS: Record<number, string> = { 3: '#2ee6c5', 5: '#f0c95a', 7: '#7eb6ff', 11: '#ff8a2b' }

/** Cohen–Lenstra: P(p | h) = 1 − ∏_{k≥1} (1 − p^{−k}). */
function clPrediction(p: number) {
  let q = 1
  for (let k = 1; k < 60; k++) q *= 1 - p ** -k
  return 1 - q
}
const PRED: Record<number, number> = Object.fromEntries(PRIMES.map((p) => [p, clPrediction(p)]))

function squarefree(m: number) {
  if (m % 4 === 0) return false
  for (let p = 3; p * p <= m; p += 2) if (m % (p * p) === 0) return false
  return true
}

/** Is −D a fundamental discriminant? (D > 0) */
function fundamental(D: number) {
  if (D % 4 === 3) return squarefree(D)
  if (D % 4 === 0) {
    const m = D / 4
    return (m % 4 === 1 || m % 4 === 2) && squarefree(m)
  }
  return false
}

/** Class number = number of reduced forms (a, b, c) with b² − 4ac = −D. */
function classNumber(D: number) {
  let count = 0
  const par = D % 2
  for (let a = 1; 3 * a * a <= D; a++) {
    let b = -a + 1
    if (((b % 2) + 2) % 2 !== par) b++
    for (; b <= a; b += 2) {
      const num = b * b + D
      if (num % (4 * a)) continue
      const c = num / (4 * a)
      if (c < a) continue
      if (b < 0 && a === c) continue
      count++
    }
  }
  return count
}

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

type Snapshot = { D: number; rates: Record<number, number> }

const CW = 640
const CH = 250
const H_MAX = 1.8 * Math.sqrt(D_MAX)
const sx = (D: number) => 30 + (D / D_MAX) * (CW - 40)
const sy = (h: number) => CH - 20 - Math.min(1, h / H_MAX) * (CH - 30)

const GW = 640
const GH = 200
const G_L = 40
const G_R = 60
const gx = (D: number) => G_L + (Math.log10(Math.max(D, 100)) - 2) / (Math.log10(D_MAX) - 2) * (GW - G_L - G_R)
const gy = (r: number) => GH - 22 - (r / 0.5) * (GH - 34)

export function CohenLenstraDemo() {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const raf = useRef(0)
  const state = useRef({ D: 2, fields: 0, divisible: { 3: 0, 5: 0, 7: 0, 11: 0 } as Record<number, number>, classOne: [] as number[] })
  const [snaps, setSnaps] = useState<Snapshot[]>([])
  const [, setVersion] = useState(0)
  const [running, setRunning] = useState(false)
  const [focus, setFocus] = useState<number>(3)
  const focusRef = useRef(focus)
  const pointsD = useRef(new Int32Array(70_000))
  const pointsH = useRef(new Int32Array(70_000))

  const plotPoint = (ctx: CanvasRenderingContext2D, D: number, h: number, fp: number) => {
    const hit = h % fp === 0
    ctx.fillStyle = hit ? COLORS[fp] : '#8aa39a'
    ctx.globalAlpha = hit ? 0.75 : 0.22
    ctx.fillRect(sx(D), sy(h), hit ? 1.6 : 1.2, hit ? 1.6 : 1.2)
    ctx.globalAlpha = 1
    if (h === 1) {
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(sx(D) + 2, sy(h) - 2, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawFrame = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#070b0a'
    ctx.fillRect(0, 0, CW, CH)
    ctx.strokeStyle = '#24332e'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(30, CH - 20)
    ctx.lineTo(CW - 10, CH - 20)
    ctx.moveTo(30, 10)
    ctx.lineTo(30, CH - 20)
    ctx.stroke()
    ctx.fillStyle = '#8aa39a'
    ctx.font = '10px ui-monospace, monospace'
    for (const D of [50_000, 100_000, 150_000, 200_000]) ctx.fillText(`${D / 1000}k`, sx(D) - (D === D_MAX ? 26 : 10), CH - 6)
    ctx.fillText('h(−D)', 34, 20)
    ctx.fillText('D →', CW - 36, CH - 26)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current)
    state.current = { D: 2, fields: 0, divisible: { 3: 0, 5: 0, 7: 0, 11: 0 }, classOne: [] }
    setSnaps([])
    setRunning(false)
    drawFrame()
    setVersion((v) => v + 1)
  }, [drawFrame])

  useEffect(() => {
    drawFrame()
    return () => cancelAnimationFrame(raf.current)
  }, [drawFrame])

  // re-colour every computed field when the highlighted prime changes
  useEffect(() => {
    focusRef.current = focus
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawFrame()
    const n = Math.min(state.current.fields, pointsD.current.length)
    for (let i = 0; i < n; i++) plotPoint(ctx, pointsD.current[i], pointsH.current[i], focus)
  }, [focus, drawFrame])

  const run = () => {
    if (running) {
      cancelAnimationFrame(raf.current)
      setRunning(false)
      return
    }
    if (state.current.D >= D_MAX) reset()
    setRunning(true)
    const budget = reduced ? 400 : 9
    const frame = () => {
      const ctx = canvasRef.current?.getContext('2d')
      const st = state.current
      const t0 = performance.now()
      const newSnaps: Snapshot[] = []
      while (performance.now() - t0 < budget && st.D < D_MAX) {
        st.D++
        const D = st.D
        if (!fundamental(D)) continue
        const h = classNumber(D)
        st.fields++
        for (const p of PRIMES) if (h % p === 0) st.divisible[p]++
        if (h === 1) st.classOne.push(D)
        if (st.fields <= pointsD.current.length) {
          pointsD.current[st.fields - 1] = D
          pointsH.current[st.fields - 1] = h
        }
        if (ctx) plotPoint(ctx, D, h, focusRef.current)
        if (st.fields % 150 === 0) {
          newSnaps.push({ D, rates: Object.fromEntries(PRIMES.map((p) => [p, st.divisible[p] / st.fields])) })
        }
      }
      if (newSnaps.length) setSnaps((s) => [...s, ...newSnaps])
      setVersion((v) => v + 1)
      if (st.D < D_MAX) raf.current = requestAnimationFrame(frame)
      else setRunning(false)
    }
    raf.current = requestAnimationFrame(frame)
  }

  const st = state.current
  const rate = (p: number) => (st.fields ? st.divisible[p] / st.fields : 0)

  return (
    <div className="demo">
      <h3 className="demo-title">Gauss’s class numbers, live: does Cohen–Lenstra hold?</h3>
      <p className="demo-hint">
        Each dot is a real imaginary quadratic field ℚ(√−D). Its class number h(−D) measures how
        badly unique factorization fails there, and h = 1 means it doesn’t fail at all. This demo
        computes h exactly by counting reduced quadratic forms. Cohen and Lenstra predicted that an
        odd prime p divides h with probability 1 − (1 − 1/p)(1 − 1/p²)(1 − 1/p³)⋯. For p = 3 that
        is 43.99%, not the naive 1/3. Press run and watch the real data chase the prediction.
      </p>

      <canvas ref={canvasRef} width={CW} height={CH} aria-label="Scatter plot of class numbers against discriminant" />

      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        <button type="button" className="btn" onClick={run}>
          {running ? 'Pause' : st.D >= D_MAX ? 'Run again' : st.D > 2 ? 'Resume' : 'Run: compute class numbers'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>

      <div role="group" aria-label="Highlight prime" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        {PRIMES.map((p) => (
          <button
            key={p}
            type="button"
            className="btn btn-ghost"
            aria-pressed={focus === p}
            onClick={() => setFocus(p)}
            style={{ borderColor: focus === p ? COLORS[p] : undefined, color: COLORS[p], minHeight: 36, padding: '0 var(--space-3)' }}
          >
            highlight {p} | h
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)' }}>
        <Tile label="discriminants scanned" value={`D ≤ ${st.D.toLocaleString()}`} color="var(--fg)" />
        <Tile label="fields computed" value={st.fields.toLocaleString()} color="var(--fg)" />
        <Tile
          label="fields with h = 1 (white dots)"
          value={st.classOne.length ? `${st.classOne.length}: ${st.classOne.join(', ')}` : '—'}
          color="#ffffff"
        />
      </div>

      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label="Empirical rate of p dividing h versus the Cohen–Lenstra prediction" style={{ marginTop: 'var(--space-3)' }}>
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((r) => (
          <g key={r}>
            <line x1={G_L} x2={GW - G_R} y1={gy(r)} y2={gy(r)} stroke="#24332e" strokeDasharray="2 4" />
            <text x={G_L - 6} y={gy(r) + 3} fontSize="9.5" fill="#8aa39a" textAnchor="end">
              {Math.round(r * 100)}%
            </text>
          </g>
        ))}
        {[100, 1000, 10_000, 100_000].map((D) => (
          <text key={D} x={gx(D)} y={GH - 6} fontSize="9.5" fill="#8aa39a" textAnchor="middle">
            D = {D.toLocaleString()}
          </text>
        ))}
        {PRIMES.map((p) => {
          const pts = snaps.filter((s) => s.D >= 100)
          const d = pts.map((s, i) => `${i ? 'L' : 'M'}${gx(s.D).toFixed(1)} ${gy(s.rates[p]).toFixed(1)}`).join('')
          const on = focus === p
          return (
            <g key={p} opacity={on ? 1 : 0.4}>
              <line x1={G_L} x2={GW - G_R} y1={gy(PRED[p])} y2={gy(PRED[p])} stroke={COLORS[p]} strokeDasharray="6 4" strokeWidth={on ? 1.5 : 1} />
              <text x={GW - G_R + 4} y={gy(PRED[p]) + 3} fontSize="9.5" fill={COLORS[p]}>
                {(PRED[p] * 100).toFixed(1)}%
              </text>
              <path d={d} fill="none" stroke={COLORS[p]} strokeWidth={on ? 2.2 : 1.3} />
              {st.fields > 0 && pts.length > 0 && (
                <circle cx={gx(pts[pts.length - 1].D)} cy={gy(rate(p))} r={on ? 4 : 2.5} fill={COLORS[p]} />
              )}
            </g>
          )
        })}
        <text x={G_L + 4} y={14} fontSize="9.5" fill="#8aa39a">
          solid: share of fields so far with p | h · dashed: Cohen–Lenstra prediction
        </text>
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
        {PRIMES.map((p) => (
          <Tile
            key={p}
            label={`${p} | h: data vs prediction (naive 1/${p} = ${(100 / p).toFixed(1)}%)`}
            value={`${(rate(p) * 100).toFixed(1)}% / ${(PRED[p] * 100).toFixed(1)}%`}
            color={COLORS[p]}
          />
        ))}
      </div>

      <p className="demo-callout">
        These are real computations, and the data runs below the dashed lines. Convergence is
        slow: for p = 3 the proven count of 3-torsion has a secondary term whose relative size shrinks only like D^(−1/6). Numbers
        like these motivated the conjectures but can never prove them. Landesman and Levy’s 2026
        framework goes after the averages themselves, and proves related statements over function
        fields. This demo checks the prediction and proves nothing. Gauss asked which fields have
        h = 1. There are exactly nine, and all of them show up early on the plot.
      </p>
    </div>
  )
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: '#070b0a' }}>
      <div className="pill-inline" style={{ fontSize: '0.68rem' }}>
        {label}
      </div>
      <div className="stat" style={{ color, fontSize: '0.95rem', fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  )
}
