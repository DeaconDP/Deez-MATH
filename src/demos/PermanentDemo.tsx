import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

type Perm = { p: number[]; sign: 1 | -1 }

function perms(n: number): Perm[] {
  const out: Perm[] = []
  const rec = (pre: number[], rest: number[]) => {
    if (!rest.length) {
      let inv = 0
      for (let i = 0; i < pre.length; i++) for (let j = i + 1; j < pre.length; j++) if (pre[i] > pre[j]) inv++
      out.push({ p: pre, sign: inv % 2 ? -1 : 1 })
      return
    }
    rest.forEach((v, i) => rec([...pre, v], [...rest.slice(0, i), ...rest.slice(i + 1)]))
  }
  rec([], Array.from({ length: n }, (_, i) => i))
  return out
}

const PRESETS: Record<number, number[][]> = {
  2: [
    [1, 1],
    [1, 1],
  ],
  3: [
    [1, 1, 0],
    [1, 1, 1],
    [0, 1, 1],
  ],
  4: [
    [1, 1, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [1, 0, 1, 1],
  ],
}

const W = 400
const H = 230
const GRID = 176
const GX = 16
const GY = 30

/* cost chart */
const CW = 400
const CH = 200
const CL = 44
const CR = 10
const CT = 10
const CB = 24
const NMAX = 40
const YMAX = 50 // log10

const log10Fact = (n: number) => {
  let s = 0
  for (let k = 2; k <= n; k++) s += Math.log10(k)
  return s
}
const CURVES = [
  { id: 'naive', label: 'expand all n! terms', color: '#ff6b6b', f: (n: number) => log10Fact(n) + Math.log10(n), dash: '' },
  { id: 'ryser', label: 'Ryser formula ~2ⁿ·n² (best known for per)', color: '#f0c95a', f: (n: number) => n * Math.log10(2) + 2 * Math.log10(n), dash: '' },
  { id: 'formula', label: 'proven floor, formulas n⁴/log n', color: '#c792ff', f: (n: number) => Math.log10(n ** 4 / Math.log2(n)), dash: '5 4' },
  { id: 'circuit', label: 'proven floor, circuits n² log log n', color: '#7eb6ff', f: (n: number) => Math.log10(n * n * Math.max(1, Math.log2(Math.log2(n)))), dash: '5 4' },
  { id: 'det', label: 'determinant, elimination n³', color: '#2ee6c5', f: (n: number) => 3 * Math.log10(n), dash: '' },
]

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function PermanentDemo() {
  const [n, setN] = useState(3)
  const [m, setM] = useState<number[][]>(PRESETS[3])
  const [idx, setIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [cn, setCn] = useState(20)
  const chartRef = useRef<SVGSVGElement>(null)

  const all = useMemo(() => perms(n), [n])
  const prod = (p: Perm) => p.p.reduce((s, c, r) => s * m[r][c], 1)

  const final = useMemo(() => {
    let det = 0
    let per = 0
    for (const p of all) {
      const v = p.p.reduce((s, c, r) => s * m[r][c], 1)
      per += v
      det += p.sign * v
    }
    return { det, per }
  }, [all, m])

  const tally = useMemo(() => {
    let det = 0
    let per = 0
    let even = 0
    let odd = 0
    for (let k = 0; k <= idx && k < all.length; k++) {
      const v = all[k].p.reduce((s, c, r) => s * m[r][c], 1)
      per += v
      det += all[k].sign * v
      if (v) {
        if (all[k].sign > 0) even++
        else odd++
      }
    }
    return { det, per, even, odd }
  }, [all, m, idx])

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(
      () => {
        setIdx((i) => Math.min(all.length - 1, i + 1))
      },
      n === 4 ? 420 : 750,
    )
    return () => clearInterval(id)
  }, [playing, all.length, n])

  useEffect(() => {
    if (playing && idx >= all.length - 1) setPlaying(false)
  }, [playing, idx, all.length])

  function size(k: number) {
    setN(k)
    setM(PRESETS[k].map((r) => r.slice()))
    setIdx(-1)
    setPlaying(false)
  }
  function toggle(r: number, c: number) {
    setM((prev) => prev.map((row, i) => row.map((v, j) => (i === r && j === c ? 1 - v : v))))
    setIdx(-1)
    setPlaying(false)
  }
  function play() {
    if (reducedMotion()) {
      setIdx(all.length - 1)
      return
    }
    if (idx >= all.length - 1) setIdx(-1)
    setPlaying((p) => !p)
  }

  const cur = idx >= 0 ? all[idx] : null
  const curProd = cur ? prod(cur) : 0
  const cell = GRID / n
  const done = idx >= all.length - 1

  // bipartite layout
  const LX = 262
  const RX = 372
  const nodeY = (i: number) => GY + ((i + 0.5) * GRID) / n

  const cx = (k: number) => CL + ((k - 2) / (NMAX - 2)) * (CW - CL - CR)
  const cy = (l: number) => CT + (1 - Math.min(YMAX, l) / YMAX) * (CH - CT - CB)
  const curvePath = (f: (k: number) => number) => {
    let d = ''
    for (let k = 2; k <= NMAX; k++) {
      const v = f(k)
      if (v > YMAX + 2) break
      d += `${d ? 'L' : 'M'}${cx(k).toFixed(1)},${cy(v).toFixed(1)}`
    }
    return d
  }
  function scrub(e: ReactPointerEvent<SVGSVGElement>) {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType !== 'mouse') return
    const ctm = chartRef.current?.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    setCn(Math.max(2, Math.min(NMAX, Math.round(2 + ((p.x - CL) / (CW - CL - CR)) * (NMAX - 2)))))
  }
  const fmtPow = (l: number) => (l < 6 ? Math.round(10 ** l).toLocaleString() : `10^${l.toFixed(1)}`)

  return (
    <div className="demo">
      <h3 className="demo-title">Same terms, different signs</h3>
      <p className="demo-hint">
        Determinant and permanent both sum one product per way of placing n non-attacking rooks on the matrix. The
        determinant gives odd placements a minus sign; the permanent adds them all. For a 0/1 matrix the permanent
        counts perfect matchings in the graph on the right. Tap cells to toggle, then play through every placement.
      </p>
      <div className="btn-row" role="group" aria-label="Matrix size" style={{ marginBottom: 'var(--space-3)' }}>
        {[2, 3, 4].map((k) => (
          <button key={k} type="button" className={k === n ? 'btn' : 'btn btn-ghost'} aria-pressed={k === n} onClick={() => size(k)}>
            {k}×{k}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${n} by ${n} zero-one matrix. Determinant ${final.det}, permanent ${final.per}.`}>
        <defs>
          <filter id="per-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text x={GX} y={18} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
          matrix (tap to toggle)
        </text>
        <text x={LX - 12} y={18} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
          rows → columns
        </text>
        {m.map((row, r) =>
          row.map((v, c) => {
            const rook = cur && cur.p[r] === c
            return (
              <g key={`${r}-${c}`} onClick={() => toggle(r, c)} style={{ cursor: 'pointer' }}>
                <rect
                  x={GX + c * cell + 2}
                  y={GY + r * cell + 2}
                  width={cell - 4}
                  height={cell - 4}
                  rx={4}
                  fill={v ? 'rgba(46,230,197,0.16)' : '#0d1513'}
                  stroke={rook ? (curProd ? (cur.sign > 0 ? '#2ee6c5' : '#ff6b6b') : '#8aa39a') : '#24332e'}
                  strokeWidth={rook ? 2.5 : 1}
                />
                <text x={GX + (c + 0.5) * cell} y={GY + (r + 0.5) * cell + 6} textAnchor="middle" fontSize={cell * 0.38} fontFamily="IBM Plex Mono" fill={v ? '#e8f2ef' : '#3a4a45'}>
                  {v}
                </text>
                {rook ? (
                  <circle
                    cx={GX + (c + 0.5) * cell}
                    cy={GY + (r + 0.5) * cell}
                    r={cell * 0.36}
                    fill="none"
                    stroke={curProd ? (cur.sign > 0 ? '#2ee6c5' : '#ff6b6b') : '#8aa39a'}
                    strokeWidth="2.5"
                    filter={curProd ? 'url(#per-glow)' : undefined}
                  />
                ) : null}
              </g>
            )
          }),
        )}
        {m.map((row, r) =>
          row.map((v, c) => {
            const on = cur && cur.p[r] === c
            if (!v && !on) return null
            return (
              <line
                key={`e${r}-${c}`}
                x1={LX}
                y1={nodeY(r)}
                x2={RX}
                y2={nodeY(c)}
                stroke={on ? (v ? (cur.sign > 0 ? '#2ee6c5' : '#ff6b6b') : '#8aa39a') : '#2ee6c5'}
                strokeOpacity={on ? 1 : 0.22}
                strokeWidth={on ? 3 : 1.4}
                strokeDasharray={on && !v ? '3 3' : undefined}
                filter={on && curProd ? 'url(#per-glow)' : undefined}
              />
            )
          }),
        )}
        {Array.from({ length: n }, (_, i) => (
          <g key={i}>
            <circle cx={LX} cy={nodeY(i)} r={8} fill="#0d1513" stroke="#e8f2ef" />
            <text x={LX - 14} y={nodeY(i) + 4} textAnchor="end" fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
              r{i + 1}
            </text>
            <circle cx={RX} cy={nodeY(i)} r={8} fill="#0d1513" stroke="#f0c95a" />
            <text x={RX + 14} y={nodeY(i) + 4} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
              c{i + 1}
            </text>
          </g>
        ))}
        {cur ? (
          <text x={W / 2 + 20} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill={curProd ? (cur.sign > 0 ? '#2ee6c5' : '#ff6b6b') : '#8aa39a'}>
            placement {idx + 1}/{all.length}: {cur.sign > 0 ? 'even' : 'odd'}, product {curProd}
            {curProd ? ' → a perfect matching' : ''}
          </text>
        ) : null}
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
        {[
          { name: 'det', v: tally.det, f: final.det, color: 'var(--accent)', note: `${tally.even} even − ${tally.odd} odd` },
          { name: 'per', v: tally.per, f: final.per, color: 'var(--accent-2)', note: `${tally.even} + ${tally.odd}` },
        ].map((b) => (
          <div key={b.name} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 'var(--space-3)', background: '#070b0a' }}>
            <div className="pill-inline">{b.name} (running)</div>
            <div className="stat" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: b.color }}>
              {idx >= 0 ? b.v : '–'}
            </div>
            <div className="pill-inline">
              {idx >= 0 ? b.note : 'press play'} {done ? '' : `· final ${b.f}`}
            </div>
          </div>
        ))}
      </div>
      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={play}>
          {playing ? 'Pause' : done ? 'Replay placements' : idx >= 0 ? 'Resume' : `Play all ${all.length} placements`}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setPlaying(false)
            setIdx((i) => Math.min(all.length - 1, i + 1))
          }}
          disabled={done}
        >
          Step
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setM(Array.from({ length: n }, () => new Array(n).fill(1)))
            setIdx(-1)
            setPlaying(false)
          }}
        >
          All ones
        </button>
      </div>
      <p className="feedback" style={{ color: 'var(--muted)' }}>
        {final.det === 0 && final.per > 0
          ? `Here the signs cancel perfectly: det = 0 but per = ${final.per}. Cancellation is what makes det cheap (row reduction exploits it); the permanent has none to exploit.`
          : 'Try "All ones": det collapses to 0 (n ≥ 2) while per = n!.'}
      </p>

      <h4 className="pill-inline" style={{ margin: 'var(--space-5) 0 var(--space-2)', fontSize: '0.8rem' }}>
        Cost to compute, size n×n (log scale; drag to read)
      </h4>
      <svg ref={chartRef} viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={`Operation counts at n = ${cn}.`} onPointerDown={scrub} onPointerMove={scrub} style={{ cursor: 'ew-resize' }}>
        <defs>
          <linearGradient id="per-gap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0c95a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#c792ff" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <g key={t}>
            <line x1={CL} x2={CW - CR} y1={cy(t)} y2={cy(t)} stroke="#16211e" />
            <text x={CL - 5} y={cy(t) + 3} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
              10^{t}
            </text>
          </g>
        ))}
        {[2, 10, 20, 30, 40].map((t) => (
          <text key={t} x={cx(t)} y={CH - 8} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
            n={t}
          </text>
        ))}
        {/* the open gap for the permanent: proven floor (formulas) up to best known algorithm */}
        <path
          d={`${curvePath(CURVES[1].f)} ${Array.from({ length: NMAX - 1 }, (_, i) => NMAX - i)
            .map((k) => `L${cx(k).toFixed(1)},${cy(CURVES[2].f(k)).toFixed(1)}`)
            .join(' ')} Z`}
          fill="url(#per-gap)"
        />
        <text x={cx(31)} y={cy(6)} textAnchor="middle" fill="#e8f2ef" fontSize="10" fontFamily="IBM Plex Mono" opacity="0.7">
          open gap for the permanent
        </text>
        {CURVES.map((c) => (
          <path key={c.id} d={curvePath(c.f)} fill="none" stroke={c.color} strokeWidth="2" strokeDasharray={c.dash || undefined} />
        ))}
        <line x1={cx(cn)} x2={cx(cn)} y1={CT} y2={CH - CB} stroke="#ffffff" strokeOpacity="0.45" />
        {CURVES.map((c) => (c.f(cn) <= YMAX ? <circle key={c.id} cx={cx(cn)} cy={cy(c.f(cn))} r={3.2} fill={c.color} /> : null))}
      </svg>
      <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-2) 0 0', display: 'grid', gap: 2, fontSize: '0.75rem' }}>
        {CURVES.map((c) => (
          <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: c.color }}>
              {c.dash ? '- -' : '—'} {c.label}
            </span>
            <span className="stat">{fmtPow(c.f(cn))}</span>
          </li>
        ))}
      </ul>
      <p className="demo-callout">
        The Aug 2026 Astra claim raises the proven floors for the permanent: Ω(n² log log n) gates for division-free
        circuits and Ω(n⁴/log n) leaves for formulas (drawn with constant 1, so only the shapes mean anything). Even
        raised, those floors are polynomial, while the best known algorithm is exponential: the shaded gap is still
        wide open.
      </p>
    </div>
  )
}
