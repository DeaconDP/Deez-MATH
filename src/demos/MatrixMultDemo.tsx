import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/* ------------------------------------------------------------------ */
/*  Part 1: Strassen's 7-multiplication trick on a real 2×2 product    */
/* ------------------------------------------------------------------ */

type M2 = [number, number, number, number] // a11 a12 a21 a22

type Product = {
  name: string
  left: string
  right: string
  aCells: number[]
  bCells: number[]
  eval: (a: M2, b: M2) => number
}

const PRODUCTS: Product[] = [
  { name: 'M1', left: '(a11 + a22)', right: '(b11 + b22)', aCells: [0, 3], bCells: [0, 3], eval: (a, b) => (a[0] + a[3]) * (b[0] + b[3]) },
  { name: 'M2', left: '(a21 + a22)', right: 'b11', aCells: [2, 3], bCells: [0], eval: (a, b) => (a[2] + a[3]) * b[0] },
  { name: 'M3', left: 'a11', right: '(b12 − b22)', aCells: [0], bCells: [1, 3], eval: (a, b) => a[0] * (b[1] - b[3]) },
  { name: 'M4', left: 'a22', right: '(b21 − b11)', aCells: [3], bCells: [2, 0], eval: (a, b) => a[3] * (b[2] - b[0]) },
  { name: 'M5', left: '(a11 + a12)', right: 'b22', aCells: [0, 1], bCells: [3], eval: (a, b) => (a[0] + a[1]) * b[3] },
  { name: 'M6', left: '(a21 − a11)', right: '(b11 + b12)', aCells: [2, 0], bCells: [0, 1], eval: (a, b) => (a[2] - a[0]) * (b[0] + b[1]) },
  { name: 'M7', left: '(a12 − a22)', right: '(b21 + b22)', aCells: [1, 3], bCells: [2, 3], eval: (a, b) => (a[1] - a[3]) * (b[2] + b[3]) },
]

/** Which M's build each output cell, with signs. */
const ASSEMBLY: { cell: number; label: string; terms: [number, 1 | -1][] }[] = [
  { cell: 0, label: 'c11 = M1 + M4 − M5 + M7', terms: [[0, 1], [3, 1], [4, -1], [6, 1]] },
  { cell: 1, label: 'c12 = M3 + M5', terms: [[2, 1], [4, 1]] },
  { cell: 2, label: 'c21 = M2 + M4', terms: [[1, 1], [3, 1]] },
  { cell: 3, label: 'c22 = M1 − M2 + M3 + M6', terms: [[0, 1], [1, -1], [2, 1], [5, 1]] },
]

function naive(a: M2, b: M2): M2 {
  return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]]
}

function randomMatrix(): M2 {
  return [0, 0, 0, 0].map(() => Math.floor(Math.random() * 9) - 3) as M2
}

/* ------------------------------------------------------------------ */
/*  Part 3: the history of ω                                           */
/* ------------------------------------------------------------------ */

const RECORDS = [
  { year: 1969, w: 2.8074, who: 'Strassen' },
  { year: 1978, w: 2.796, who: 'Pan' },
  { year: 1979, w: 2.78, who: 'Bini–Capovani–Lotti–Romani' },
  { year: 1981, w: 2.522, who: 'Schönhage' },
  { year: 1982, w: 2.496, who: 'Coppersmith–Winograd' },
  { year: 1986, w: 2.479, who: 'Strassen (laser method)' },
  { year: 1990, w: 2.3755, who: 'Coppersmith–Winograd' },
  { year: 2010, w: 2.3737, who: 'Stothers' },
  { year: 2012, w: 2.3729, who: 'Vassilevska Williams' },
  { year: 2014, w: 2.37286, who: 'Le Gall' },
  { year: 2020, w: 2.37286, who: 'Alman–Vassilevska Williams' },
  { year: 2022, w: 2.37187, who: 'Duan–Wu–Zhou' },
  { year: 2023, w: 2.37155, who: 'Vassilevska Williams–Xu–Xu–Zhou' },
  { year: 2024, w: 2.37134, who: 'Alman–Duan–Vassilevska Williams–Xu–Xu–Zhou' },
  { year: 2026.77, w: 2.25, who: 'Oct 2026 claim, over ℂ (under examination)' },
]

const HW = 640
const HH = 260
const H_L = 44
const H_R = 16
const H_T = 16
const H_B = 30
const YEAR0 = 1965
const YEAR1 = 2028
const hx = (y: number) => H_L + ((y - YEAR0) / (YEAR1 - YEAR0)) * (HW - H_L - H_R)
const hy = (w: number) => H_T + ((3.0 - w) / 1.0) * (HH - H_T - H_B)

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

function fmtBig(v: number) {
  if (v < 1e5) return Math.round(v).toLocaleString()
  const e = Math.floor(Math.log10(v))
  return `${(v / 10 ** e).toFixed(2)}×10^${e}`
}

export function MatrixMultDemo() {
  const reduced = useReducedMotion()

  /* --- Strassen state --- */
  const [A, setA] = useState<M2>([2, 1, -1, 3])
  const [B, setB] = useState<M2>([1, 4, 2, -2])
  const [step, setStep] = useState(0) // 0..7 products revealed, 8 = assembled
  const timer = useRef<number | undefined>(undefined)

  const mVals = PRODUCTS.map((p) => p.eval(A, B))
  const school = naive(A, B)
  const strassen = ASSEMBLY.map((as) => as.terms.reduce((s, [i, sg]) => s + sg * mVals[i], 0)) as M2
  const active = step >= 1 && step <= 7 ? PRODUCTS[step - 1] : null

  useEffect(() => () => window.clearInterval(timer.current), [])

  const runStrassen = () => {
    window.clearInterval(timer.current)
    if (reduced) {
      setStep(8)
      return
    }
    setStep(1)
    let s = 1
    timer.current = window.setInterval(() => {
      s += 1
      setStep(s)
      if (s >= 8) window.clearInterval(timer.current)
    }, 750)
  }

  const bump = (which: 'A' | 'B', i: number) => {
    const set = which === 'A' ? setA : setB
    set((m) => {
      const next = [...m] as M2
      next[i] = next[i] >= 5 ? -3 : next[i] + 1
      return next
    })
  }

  /* --- recursion state --- */
  const [k, setK] = useState(6)
  const n = 2 ** k
  const costs = [
    { label: 'Schoolbook n³', w: 3, color: '#ff6b6b' },
    { label: 'Strassen n^2.807', w: Math.log2(7), color: '#7eb6ff' },
    { label: '2024 record n^2.3713', w: 2.371339, color: '#2ee6c5' },
    { label: 'Oct 2026 claim n^2.25', w: 2.25, color: '#f0c95a' },
    { label: 'Floor n² (read the input)', w: 2, color: '#8aa39a' },
  ]
  const maxLog = 3 * Math.log10(2 ** 12)

  /* --- history chart --- */
  const [reveal, setReveal] = useState(1)
  const [hover, setHover] = useState<number | null>(null)
  const raf = useRef(0)
  const histRef = useRef<SVGSVGElement | null>(null)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const playHistory = () => {
    cancelAnimationFrame(raf.current)
    if (reduced) {
      setReveal(1)
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 5000)
      setReveal(p)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const cursorYear = YEAR0 + reveal * (YEAR1 - YEAR0)
  const shown = RECORDS.filter((r) => r.year <= cursorYear)

  const stairs = useMemo(() => {
    let d = `M${hx(YEAR0)} ${hy(3)}`
    d += `H${hx(RECORDS[0].year)}`
    RECORDS.forEach((r, i) => {
      if (r.year > cursorYear) return
      d += `V${hy(r.w)}`
      const nextYear = i + 1 < RECORDS.length ? Math.min(RECORDS[i + 1].year, cursorYear) : cursorYear
      d += `H${hx(Math.min(nextYear, YEAR1))}`
    })
    return d
  }, [cursorYear])

  const onHistMove = (clientX: number) => {
    const svg = histRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * HW
    let best = 0
    let bd = Infinity
    shown.forEach((rec, i) => {
      const d = Math.abs(hx(rec.year) - x)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    setHover(shown.length ? best : null)
  }
  const hov = hover !== null ? shown[hover] : null

  const cellStyle = (on: boolean, color: string) => ({
    fill: on ? color : '#121a18',
    fillOpacity: on ? 0.28 : 1,
    stroke: on ? color : '#24332e',
    strokeWidth: on ? 2 : 1,
    transition: 'all 200ms',
  })

  const grid = (m: M2, x: number, y: number, which: 'A' | 'B' | 'C', hi: number[], color: string) => (
    <g>
      {m.map((v, i) => {
        const cx = x + (i % 2) * 44
        const cy = y + Math.floor(i / 2) * 44
        const on = hi.includes(i)
        return (
          <g
            key={i}
            style={{ cursor: which === 'C' ? 'default' : 'pointer' }}
            onClick={which === 'C' ? undefined : () => bump(which, i)}
          >
            <rect x={cx} y={cy} width={40} height={40} rx={4} style={cellStyle(on, color)} />
            <text x={cx + 20} y={cy + 25} fontSize="15" fill="#e8f2ef" textAnchor="middle" fontWeight={600}>
              {which === 'C' && step < 8 ? '?' : v}
            </text>
          </g>
        )
      })}
    </g>
  )

  const cHighlight = step === 8 ? [0, 1, 2, 3] : []

  return (
    <div className="demo">
      <h3 className="demo-title">Beating n³: how matrix multiplication gets cheaper</h3>
      <p className="demo-hint">
        Multiplying two 2×2 matrices the schoolbook way takes 8 multiplications. Strassen (1969)
        found a way to do it with 7. Tap any entry of A or B to change it, then run the 7 products
        and check that both methods give the same answer.
      </p>

      <svg viewBox="0 0 640 216" role="img" aria-label="Strassen's seven products for a 2 by 2 matrix product">
        <text x={20} y={22} fontSize="12" fill="#2ee6c5">A</text>
        {grid(A, 20, 30, 'A', active?.aCells ?? [], '#2ee6c5')}
        <text x={124} y={78} fontSize="20" fill="#8aa39a">×</text>
        <text x={150} y={22} fontSize="12" fill="#f0c95a">B</text>
        {grid(B, 150, 30, 'B', active?.bCells ?? [], '#f0c95a')}
        <text x={254} y={78} fontSize="20" fill="#8aa39a">=</text>
        <text x={280} y={22} fontSize="12" fill="#e8f2ef">C</text>
        {grid(step === 8 ? strassen : ([0, 0, 0, 0] as M2), 280, 30, 'C', cHighlight, '#6dffb0')}

        {PRODUCTS.map((p, i) => {
          const y = 22 + i * 25
          const done = step > i
          const now = step === i + 1
          return (
            <g key={p.name} opacity={done ? 1 : 0.28} style={{ transition: 'opacity 250ms' }}>
              <rect x={396} y={y - 15} width={236} height={21} rx={3} fill={now ? '#2ee6c522' : 'transparent'} stroke={now ? '#2ee6c5' : 'none'} />
              <text x={402} y={y} fontSize="11" fill={now ? '#2ee6c5' : '#e8f2ef'}>
                {p.name} = {p.left}·{p.right}
              </text>
              <text x={626} y={y} fontSize="11" fill="#f0c95a" textAnchor="end">
                {done ? mVals[i] : ''}
              </text>
            </g>
          )
        })}
        <text x={20} y={150} fontSize="11" fill="#8aa39a">
          multiplications used
        </text>
        <rect x={20} y={158} width={360} height={14} rx={7} fill="#121a18" stroke="#24332e" />
        <rect x={20} y={158} width={(360 * 8) / 8} height={14} rx={7} fill="#ff6b6b" opacity={0.18} />
        <rect x={20} y={158} width={(360 * Math.min(step, 7)) / 8} height={14} rx={7} fill="#2ee6c5" style={{ transition: 'width 300ms' }} />
        <line x1={20 + (360 * 7) / 8} x2={20 + (360 * 7) / 8} y1={154} y2={176} stroke="#2ee6c5" strokeDasharray="2 2" />
        <text x={20} y={192} fontSize="11" fill="#e8f2ef">
          Strassen {Math.min(step, 7)} / 7 · schoolbook 8
        </text>
        {step === 8 && (
          <text x={20} y={206} fontSize="11" fill={school.every((v, i) => v === strassen[i]) ? '#6dffb0' : '#ff6b6b'}>
            Schoolbook gives [{school.join(', ')}], and so does Strassen. One multiplication saved.
          </text>
        )}
      </svg>

      {step === 8 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 4, marginTop: 'var(--space-2)' }}>
          {ASSEMBLY.map((as) => (
            <span key={as.cell} className="pill-inline">
              {as.label} = <span className="stat">{strassen[as.cell]}</span>
            </span>
          ))}
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <button type="button" className="btn" onClick={runStrassen}>
          Run the 7 products
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            window.clearInterval(timer.current)
            setA(randomMatrix())
            setB(randomMatrix())
            setStep(0)
          }}
        >
          Random A and B
        </button>
      </div>

      <h4 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9rem' }}>Saving one multiplication, recursively</h4>
      <p className="demo-hint">
        The trick never uses commutativity, so the entries can be blocks. Split an n×n matrix into
        four blocks and recurse. That costs 7^k block products against 8^k, which is n^2.807 against
        n³. Push the size up and compare growth rates on a log scale.
      </p>
      <div className="controls">
        <DimSlider label="Recursion levels k (n = 2^k)" value={k} min={1} max={12} onChange={setK} format={(v) => `${v}  →  n = ${(2 ** v).toLocaleString()}`} />
      </div>
      <svg viewBox="0 0 640 170" role="img" aria-label="Operation counts on a log scale">
        {costs.map((c, i) => {
          const v = n ** c.w
          const w = Math.max(3, (Math.log10(v) / maxLog) * 420)
          const y = 12 + i * 31
          return (
            <g key={c.label}>
              <text x={8} y={y + 13} fontSize="11" fill={c.color}>
                {c.label}
              </text>
              <rect x={190} y={y} width={w} height={18} rx={3} fill={c.color} opacity={0.85} style={{ transition: 'width 300ms' }} />
              <text x={196 + w} y={y + 13} fontSize="11" fill="#e8f2ef">
                {fmtBig(v)}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="stat" style={{ fontSize: '0.8rem', marginTop: 'var(--space-2)' }}>
        At n = {n.toLocaleString()}, n³ / n^2.25 = {fmtBig(n ** 0.75)}. Bar length is the number of
        digits, a log scale.
      </p>

      <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)', fontSize: '0.9rem' }}>Half a century of pushing ω down</h4>
      <svg
        ref={histRef}
        viewBox={`0 0 ${HW} ${HH}`}
        role="img"
        aria-label="Record upper bounds on the matrix multiplication exponent omega over time"
        onPointerMove={(e) => onHistMove(e.clientX)}
        onPointerDown={(e) => onHistMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
      >
        {[2, 2.25, 2.5, 2.75, 3].map((w) => (
          <g key={w}>
            <line x1={H_L} x2={HW - H_R} y1={hy(w)} y2={hy(w)} stroke="#24332e" strokeDasharray={w === 2 ? undefined : '2 4'} />
            <text x={H_L - 6} y={hy(w) + 4} fontSize="10" fill="#8aa39a" textAnchor="end">
              {w}
            </text>
          </g>
        ))}
        {[1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <text key={y} x={hx(y)} y={HH - 10} fontSize="10" fill="#8aa39a" textAnchor="middle">
            {y}
          </text>
        ))}
        <rect x={H_L} y={hy(2)} width={HW - H_L - H_R} height={HH - H_B - hy(2)} fill="#8aa39a" opacity={0.08} />
        <text x={HW - H_R - 4} y={hy(2) - 5} fontSize="9.5" fill="#8aa39a" textAnchor="end">
          ω ≥ 2: any method must read all n² entries
        </text>
        <path d={stairs} fill="none" stroke="#2ee6c5" strokeWidth={2.2} style={{ filter: 'drop-shadow(0 0 4px #2ee6c588)' }} />
        {shown.map((r, i) => {
          const last = r.year > 2025
          return (
            <circle
              key={`${r.year}-${r.who}`}
              cx={hx(r.year)}
              cy={hy(r.w)}
              r={hover === i ? 6 : last ? 5 : 3}
              fill={last ? '#f0c95a' : '#2ee6c5'}
              stroke="#070b0a"
              style={{ filter: last ? 'drop-shadow(0 0 6px #f0c95a)' : undefined }}
            />
          )
        })}
        {shown.some((r) => r.year > 2025) && (
          <line x1={hx(2024)} x2={hx(2026.77)} y1={hy(2.371339)} y2={hy(2.25)} stroke="#f0c95a" strokeDasharray="4 3" strokeWidth={1.6} />
        )}
        {hov && (
          <g>
            <line x1={hx(hov.year)} x2={hx(hov.year)} y1={H_T} y2={HH - H_B} stroke="#e8f2ef" strokeOpacity={0.3} />
            <rect
              x={Math.min(hx(hov.year) + 8, HW - 268)}
              y={H_T + 4}
              width={260}
              height={36}
              rx={4}
              fill="#121a18"
              stroke={hov.year > 2025 ? '#f0c95a' : '#2ee6c5'}
            />
            <text x={Math.min(hx(hov.year) + 16, HW - 260)} y={H_T + 19} fontSize="10.5" fill="#e8f2ef">
              {Math.floor(hov.year)} · ω &lt; {hov.w}
            </text>
            <text x={Math.min(hx(hov.year) + 16, HW - 260)} y={H_T + 33} fontSize="9.5" fill="#8aa39a">
              {hov.who.length > 44 ? `${hov.who.slice(0, 43)}…` : hov.who}
            </text>
          </g>
        )}
      </svg>
      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
        <button type="button" className="btn btn-ghost" onClick={playHistory}>
          Replay the history
        </button>
      </div>

      <p className="demo-callout">
        From 1990 to 2024 the record moved only in the third decimal place. The October 2026 claim
        drops it to 9/4 = 2.25 over ℂ, plus ω &lt; 2.371054886… over every fixed field. It is still
        under examination, and this app does not check it. These exponents are asymptotic: the
        hidden constants are so large that real libraries still use schoolbook or Strassen-style
        kernels. Records before 2026 are rounded.
      </p>
    </div>
  )
}
