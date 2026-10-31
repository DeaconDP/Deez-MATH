import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * Two views of the ETH claim.
 * 1. Brute-force #3-SAT on a tiny random formula: every cell is one assignment, so the
 *    cost is literally the size of the grid, 2^n.
 * 2. "Exponent per variable": log2(cost)/n. Brute force sits at 1, the older 1.307^n
 *    algorithm at log2(1.307) ≈ 0.386, and ETH says no algorithm gets below some fixed c > 0.
 *    The claimed shape 2^(n/√log n) has exponent per variable 1/√(log2 n) → 0, so it
 *    eventually dives under every horizontal line c. Constants and log-log factors dropped.
 */

const PPSZ = Math.log2(1.307)

type Lit = { v: number; neg: boolean }
type Clause = [Lit, Lit, Lit]

function makeFormula(n: number, m: number, seed: number): Clause[] {
  let s = (seed * 2654435761) % 2147483647 || 1
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const out: Clause[] = []
  for (let c = 0; c < m; c++) {
    const vars = new Set<number>()
    while (vars.size < 3) vars.add(Math.floor(rand() * n))
    const lits = [...vars].map((v) => ({ v, neg: rand() < 0.5 }))
    out.push([lits[0], lits[1], lits[2]])
  }
  return out
}

function satisfies(f: Clause[], a: number) {
  for (const cl of f) {
    let ok = false
    for (const l of cl) {
      const bit = (a >> l.v) & 1
      if (bit === (l.neg ? 0 : 1)) {
        ok = true
        break
      }
    }
    if (!ok) return false
  }
  return true
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!m) return
    const on = () => setReduced(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}

const VAR_NAMES = 'abcdefghijkl'

function litText(l: Lit) {
  return `${l.neg ? '¬' : ''}${VAR_NAMES[l.v]}`
}

export function EthFalseDemo() {
  const [n, setN] = useState(10)
  const [ratio, setRatio] = useState(3.2)
  const [seed, setSeed] = useState(7)
  const [scanned, setScanned] = useState(0)
  const [running, setRunning] = useState(false)
  const [c, setC] = useState(0.2)
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<SVGSVGElement | null>(null)

  const total = 1 << n
  const m = Math.max(1, Math.round(ratio * n))
  const formula = useMemo(() => makeFormula(n, m, seed), [n, m, seed])
  const sat = useMemo(() => {
    const arr = new Uint8Array(total)
    for (let a = 0; a < total; a++) arr[a] = satisfies(formula, a) ? 1 : 0
    return arr
  }, [formula, total])
  const found = useMemo(() => {
    let k = 0
    for (let a = 0; a < scanned; a++) k += sat[a]
    return k
  }, [sat, scanned])

  const cols = 1 << Math.ceil(n / 2)
  const rows = total / cols

  // draw the assignment grid
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const Wd = cv.width
    const Hd = cv.height
    const cw = Wd / cols
    const ch = Hd / rows
    ctx.fillStyle = '#070b0a'
    ctx.fillRect(0, 0, Wd, Hd)
    const gap = cw > 6 ? 1 : 0
    for (let a = 0; a < total; a++) {
      const x = (a % cols) * cw
      const y = Math.floor(a / cols) * ch
      if (a >= scanned) ctx.fillStyle = '#121a18'
      else if (sat[a]) ctx.fillStyle = '#2ee6c5'
      else ctx.fillStyle = '#3a1c1f'
      ctx.fillRect(x + gap, y + gap, cw - 2 * gap, ch - 2 * gap)
    }
    if (scanned > 0 && scanned < total) {
      const a = scanned - 1
      ctx.save()
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 12
      ctx.fillStyle = '#ffffff'
      ctx.fillRect((a % cols) * cw, Math.floor(a / cols) * ch, cw, ch)
      ctx.restore()
    }
    // re-glow solutions
    if (scanned > 0) {
      ctx.save()
      ctx.shadowColor = '#2ee6c5'
      ctx.shadowBlur = 8
      ctx.fillStyle = '#7dffe6'
      for (let a = 0; a < Math.min(scanned, total); a++) {
        if (!sat[a]) continue
        ctx.fillRect((a % cols) * cw + cw * 0.3, Math.floor(a / cols) * ch + ch * 0.3, cw * 0.4, ch * 0.4)
      }
      ctx.restore()
    }
  }, [sat, scanned, total, cols, rows])

  useEffect(() => {
    if (!running) return
    if (reduced) {
      setScanned(total)
      setRunning(false)
      return
    }
    let raf = 0
    let a = 0
    const step = Math.max(1, Math.ceil(total / 200))
    const tick = () => {
      a = Math.min(total, a + step)
      setScanned(a)
      if (a >= total) setRunning(false)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, total, reduced])

  const reset = () => {
    setRunning(false)
    setScanned(0)
  }

  // ---- exponent-per-variable chart ----
  const CW = 320
  const CH = 190
  const L0 = 2
  const L1 = 256 // x axis is log2 n
  const cx = (L: number) => 34 + ((L - L0) / (L1 - L0)) * (CW - 44)
  const cy = (e: number) => 16 + (1 - e / 1.05) * (CH - 40)
  const claimed = (L: number) => 1 / Math.sqrt(L)
  const curve = Array.from({ length: 160 }, (_, i) => {
    const L = L0 + ((L1 - L0) * i) / 159
    return `${i === 0 ? 'M' : 'L'}${cx(L).toFixed(1)},${cy(Math.min(1.05, claimed(L))).toFixed(1)}`
  }).join(' ')
  const crossL = 1 / (c * c) // n* = 2^(1/c²)
  const crossVisible = crossL <= L1
  const ppszCross = 1 / (PPSZ * PPSZ)

  const onChart = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return
    const svg = chartRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const y = ((e.clientY - r.top) / r.height) * CH
    const v = (1 - (y - 16) / (CH - 40)) * 1.05
    setC(Math.max(0.06, Math.min(0.95, Number(v.toFixed(3)))))
  }

  const nStar = crossL < 60 ? Math.round(2 ** crossL).toLocaleString() : `2^${crossL.toFixed(0)}`
  const atoms = crossL > 266 ? ' (more than the atoms in the observable universe)' : ''

  return (
    <div className="demo">
      <h3 className="demo-title">Why “subexponential” is a statement about infinity</h3>
      <p className="demo-hint">
        Part 1: a random 3-SAT formula on n variables. Brute force checks all 2^n assignments, one
        cell each, and counts the ones that satisfy every clause. The claimed algorithm counts
        them too, but without visiting every cell.
      </p>

      <canvas
        ref={canvasRef}
        width={512}
        height={Math.round((512 * rows) / cols)}
        role="img"
        aria-label={`Grid of ${total} assignments, ${found} satisfying found so far`}
      />
      <p className="stat" style={{ margin: '0.5rem 0', fontSize: '0.8rem' }}>
        {m} clauses, e.g.{' '}
        <span style={{ color: '#8aa39a' }}>
          {formula
            .slice(0, 3)
            .map((cl) => `(${cl.map(litText).join(' ∨ ')})`)
            .join(' ∧ ')}{' '}
          ∧ …
        </span>
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
        <span className="stat">
          checked <strong>{scanned.toLocaleString()}</strong> / {total.toLocaleString()}
        </span>
        <span className="stat" style={{ color: 'var(--accent)' }}>
          #SAT so far = <strong>{found}</strong>
        </span>
      </div>
      <div className="controls">
        <DimSlider
          label="Variables n (each one doubles the grid)"
          value={n}
          min={4}
          max={12}
          onChange={(v) => {
            setN(v)
            reset()
          }}
        />
        <DimSlider
          label="Clauses per variable"
          value={ratio}
          min={1}
          max={6}
          step={0.1}
          onChange={(v) => {
            setRatio(v)
            reset()
          }}
          format={(v) => `${v.toFixed(1)} (${Math.round(v * n)} clauses)`}
        />
      </div>
      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setScanned(0)
            setRunning(true)
          }}
          disabled={running}
        >
          {running ? 'Counting…' : '▶ Brute-force count'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setSeed((s) => s + 1)
            reset()
          }}
        >
          New formula
        </button>
      </div>

      <p className="demo-hint">
        Part 2: the exponent per variable, log₂(cost)/n. ETH says every 3-SAT algorithm stays above
        some line c &gt; 0 forever. Drag on the chart to move that line. The claimed curve
        1/√(log₂ n) falls under every line eventually, but look where.
      </p>
      <svg
        ref={chartRef}
        viewBox={`0 0 ${CW} ${CH}`}
        role="img"
        aria-label={`Exponent per variable chart. The claimed curve crosses the line c = ${c.toFixed(2)} at n = 2 to the ${crossL.toFixed(0)}`}
        onPointerDown={onChart}
        onPointerMove={onChart}
        style={{ cursor: 'ns-resize' }}
      >
        <defs>
          <linearGradient id="eth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff6b6b" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ff6b6b" stopOpacity="0.02" />
          </linearGradient>
          <filter id="eth-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* ETH forbidden zone below c */}
        <rect x={cx(L0)} y={cy(c)} width={cx(L1) - cx(L0)} height={cy(0) - cy(c)} fill="url(#eth-fill)" />
        <line x1={cx(L0)} x2={cx(L1)} y1={cy(0)} y2={cy(0)} stroke="#24332e" />
        <line x1={cx(L0)} x2={cx(L0)} y1={cy(1.05)} y2={cy(0)} stroke="#24332e" />
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={cx(L0) - 4} y={cy(v) + 3} fill="#8aa39a" fontSize="7" textAnchor="end">
            {v}
          </text>
        ))}
        {[2, 64, 128, 192, 256].map((L) => (
          <text key={L} x={cx(L)} y={CH - 12} fill="#8aa39a" fontSize="7" textAnchor="middle">
            2^{L}
          </text>
        ))}
        <text x={CW - 10} y={CH - 2} fill="#8aa39a" fontSize="7" textAnchor="end">
          variables n (log scale)
        </text>
        {/* brute force & PPSZ */}
        <line x1={cx(L0)} x2={cx(L1)} y1={cy(1)} y2={cy(1)} stroke="#e8f2ef" strokeOpacity={0.7} />
        <text x={cx(L1) - 2} y={cy(1) - 4} fill="#e8f2ef" fontSize="7" textAnchor="end">
          brute force 2^n → 1
        </text>
        <line x1={cx(L0)} x2={cx(L1)} y1={cy(PPSZ)} y2={cy(PPSZ)} stroke="#7eb6ff" strokeOpacity={0.8} strokeDasharray="4 3" />
        <text x={cx(L1) - 2} y={cy(PPSZ) - 4} fill="#7eb6ff" fontSize="7" textAnchor="end">
          best before, 1.307^n → 0.386
        </text>
        {/* ETH line */}
        <line x1={cx(L0)} x2={cx(L1)} y1={cy(c)} y2={cy(c)} stroke="#ff6b6b" strokeWidth={1.6} />
        <rect x={cx(L0) + 2} y={cy(c) - 11} width={64} height={10} rx={2} fill="#070b0a" opacity={0.8} />
        <text x={cx(L0) + 4} y={cy(c) - 3} fill="#ff6b6b" fontSize="7.5">
          ETH line c = {c.toFixed(2)}
        </text>
        {/* claimed curve */}
        <path d={curve} fill="none" stroke="#2ee6c5" strokeWidth={2.2} filter="url(#eth-glow)" />
        <text x={cx(150)} y={cy(claimed(150)) - 6} fill="#2ee6c5" fontSize="7.5">
          claimed 2^(n/√log n)
        </text>
        {crossVisible ? (
          <g>
            <line x1={cx(crossL)} x2={cx(crossL)} y1={cy(c)} y2={cy(0)} stroke="#f0c95a" strokeDasharray="2 2" />
            <circle cx={cx(crossL)} cy={cy(c)} r={4.5} fill="#f0c95a" filter="url(#eth-glow)" />
          </g>
        ) : (
          <text x={cx(L1) - 2} y={cy(c) + 10} fill="#f0c95a" fontSize="7.5" textAnchor="end">
            crossing is off the chart →
          </text>
        )}
      </svg>
      <div className="controls">
        <DimSlider
          label="ETH constant c"
          value={c}
          min={0.06}
          max={0.95}
          step={0.01}
          onChange={setC}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <p className="stat" role="status">
        The claimed shape beats 2^({c.toFixed(2)}·n) only once n &gt; 2^(1/c²) ={' '}
        <strong style={{ color: '#f0c95a' }}>{nStar}</strong> variables{atoms}. It passes the old
        1.307^n line near n ≈ {Math.round(2 ** ppszCross)}, but only with every constant set to 1.
      </p>
      <p className="demo-callout">
        Toy shapes: the paper’s bound carries unknown constants and polyloglog(n) factors, which can
        move these crossings enormously. The point is the limit. For every c &gt; 0 the curve ends
        up below the line, and that is exactly what refutes ETH. It is still far slower than any
        polynomial, so P vs NP is untouched. Experts were still checking the proof on 31 Oct 2026.
      </p>
    </div>
  )
}
