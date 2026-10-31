import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

/* ---------- Panel A: a periodic box of disks you can shake ---------- */

const COLS = 8
const ROWS = 8
const NDISK = COLS * ROWS
const DIAM = 45
const BW = COLS * DIAM // 360
const BH = ROWS * (Math.sqrt(3) / 2) * DIAM // ≈ 311.8, so a hex lattice fits exactly
const HEX = Math.PI / Math.sqrt(12) // 0.9069…

type Disk = { x: number; y: number }

const wrap = (v: number, L: number) => ((v % L) + L) % L
const dmin = (d: number, L: number) => d - L * Math.round(d / L)

function randomDisks(): Disk[] {
  return Array.from({ length: NDISK }, () => ({ x: Math.random() * BW, y: Math.random() * BH }))
}
function hexDisks(): Disk[] {
  const out: Disk[] = []
  for (let j = 0; j < ROWS; j++)
    for (let i = 0; i < COLS; i++) out.push({ x: (i + 0.25 + 0.5 * (j % 2)) * DIAM, y: (j + 0.5) * (Math.sqrt(3) / 2) * DIAM })
  return out
}

/** One frame of grow-and-relax with optional jiggle (a crude Lubachevsky–Stillinger-style anneal). */
function step(disks: Disk[], r: number, temp: number) {
  const g = () => (Math.random() + Math.random() + Math.random() - 1.5) * temp
  for (const d of disks) {
    d.x = wrap(d.x + g(), BW)
    d.y = wrap(d.y + g(), BH)
  }
  let worst = 0
  for (let it = 0; it < 8; it++) {
    worst = 0
    for (let i = 0; i < NDISK; i++) {
      for (let j = i + 1; j < NDISK; j++) {
        const dx = dmin(disks[j].x - disks[i].x, BW)
        const dy = dmin(disks[j].y - disks[i].y, BH)
        const d2 = dx * dx + dy * dy
        if (d2 >= 4 * r * r) continue
        const d = Math.sqrt(d2) || 1e-6
        const ov = 2 * r - d
        if (ov > worst) worst = ov
        const push = (ov / 2) * 0.55
        const ux = dx / d
        const uy = dy / d
        disks[i].x = wrap(disks[i].x - ux * push, BW)
        disks[i].y = wrap(disks[i].y - uy * push, BH)
        disks[j].x = wrap(disks[j].x + ux * push, BW)
        disks[j].y = wrap(disks[j].y + uy * push, BH)
      }
    }
  }
  return worst
}

function contacts(disks: Disk[], r: number) {
  const c = new Array(NDISK).fill(0)
  const lim = (2 * r * 1.06) ** 2
  for (let i = 0; i < NDISK; i++)
    for (let j = i + 1; j < NDISK; j++) {
      const dx = dmin(disks[j].x - disks[i].x, BW)
      const dy = dmin(disks[j].y - disks[i].y, BH)
      if (dx * dx + dy * dy < lim) {
        c[i]++
        c[j]++
      }
    }
  return c
}

const density = (r: number) => (NDISK * Math.PI * r * r) / (BW * BH)

/* ---------- Panel B: what happens as dimension grows ---------- */

/** Best known packing densities (all lattices). ★ = proven optimal among all packings. */
const KNOWN: { n: number; d: number; name: string; proven: boolean }[] = [
  { n: 1, d: 1, name: 'ℤ', proven: true },
  { n: 2, d: Math.PI / Math.sqrt(12), name: 'hexagonal', proven: true },
  { n: 3, d: Math.PI / Math.sqrt(18), name: 'FCC (oranges)', proven: true },
  { n: 4, d: Math.PI ** 2 / 16, name: 'D₄', proven: false },
  { n: 5, d: Math.PI ** 2 / (15 * Math.SQRT2), name: 'D₅', proven: false },
  { n: 6, d: Math.PI ** 3 / (48 * Math.sqrt(3)), name: 'E₆', proven: false },
  { n: 7, d: Math.PI ** 3 / 105, name: 'E₇', proven: false },
  { n: 8, d: Math.PI ** 4 / 384, name: 'E₈', proven: true },
  { n: 12, d: Math.PI ** 6 / 19440, name: 'K₁₂', proven: false },
  { n: 16, d: 0.01471, name: 'Barnes–Wall', proven: false },
  { n: 24, d: Math.PI ** 12 / 479001600, name: 'Leech', proven: true },
]

const NMAX = 100
const CW = 400
const CH = 230
const CL = 40
const CR = 12
const CT = 14
const CB = 26
const YMIN = -100 // log2 density

const cx = (n: number) => CL + ((n - 1) / (NMAX - 1)) * (CW - CL - CR)
const cy = (l2: number) => CT + (l2 / YMIN) * (CH - CT - CB)

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function SpherePackingDemo() {
  const disksRef = useRef<Disk[]>([])
  const rRef = useRef(4)
  const [snap, setSnap] = useState<{ disks: Disk[]; r: number; worst: number }>(() => ({ disks: randomDisks(), r: 4, worst: 0 }))
  const [temp, setTemp] = useState(1.2)
  const [running, setRunning] = useState(!reducedMotion())
  const [best, setBest] = useState(0)
  const [n, setN] = useState(24)
  const chartRef = useRef<SVGSVGElement>(null)
  const tempRef = useRef(temp)
  useEffect(() => {
    tempRef.current = temp
  }, [temp])

  useEffect(() => {
    if (!running) return
    if (!disksRef.current.length) {
      disksRef.current = snap.disks.map((d) => ({ ...d }))
      rRef.current = snap.r
    }
    let raf = 0
    const tick = () => {
      const disks = disksRef.current
      const r0 = rRef.current
      const worst = step(disks, r0, tempRef.current)
      const r = worst > 0.02 * r0 ? r0 * 0.997 : Math.min(DIAM / 2, r0 * 1.004)
      rRef.current = r
      // shrinking every disk by worst/2 leaves a genuinely overlap-free packing
      const honest = density(Math.max(0, r0 - worst / 2))
      setBest((b) => Math.max(b, honest))
      setSnap({ disks: disks.map((d) => ({ ...d })), r: r0, worst })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // snap is only the seed when the loop starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  function load(disks: Disk[], r: number, run: boolean) {
    disksRef.current = disks
    rRef.current = r
    setSnap({ disks: disks.map((d) => ({ ...d })), r, worst: 0 })
    setRunning(run)
  }
  function pour() {
    setBest(0)
    load(randomDisks(), 4, true)
  }
  function crystal() {
    setBest(HEX)
    load(hexDisks(), DIAM / 2, false)
  }

  const { disks, r, worst } = snap
  const cnt = contacts(disks, r)
  const dens = density(Math.max(0, r - worst / 2))

  // periodic copies near the edges so disks wrap visibly
  const drawn: { x: number; y: number; c: number; k: string }[] = []
  disks.forEach((d, i) => {
    for (const ox of [-BW, 0, BW])
      for (const oy of [-BH, 0, BH]) {
        const x = d.x + ox
        const y = d.y + oy
        if (x < -r || x > BW + r || y < -r || y > BH + r) continue
        drawn.push({ x, y, c: cnt[i], k: `${i}:${ox}:${oy}` })
      }
  })
  const six = cnt.filter((c) => c >= 6).length

  function scrub(e: ReactPointerEvent<SVGSVGElement>) {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType !== 'mouse') return
    const ctm = chartRef.current?.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const v = Math.round(1 + ((p.x - CL) / (CW - CL - CR)) * (NMAX - 1))
    setN(Math.max(1, Math.min(NMAX, v)))
  }

  const known = [...KNOWN].reverse().find((k) => k.n <= n)
  const exact = KNOWN.find((k) => k.n === n)
  const gapBits = 0.401 * n

  return (
    <div className="demo">
      <h3 className="demo-title">Pack the box, then leave the plane</h3>
      <p className="demo-hint">
        {NDISK} disks in a box that wraps around at the edges. They grow until they jam while you shake them.
        Disk colour counts touching neighbours: bright teal has 6, the honeycomb number. Can shaking reach the
        perfect hexagonal density of {HEX.toFixed(4)}?
      </p>
      <svg viewBox={`0 0 ${BW} ${BH}`} role="img" aria-label={`Disk packing at density ${dens.toFixed(3)}; ${six} of ${NDISK} disks have six neighbours.`}>
        <defs>
          <radialGradient id="sp-disk6" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#b9fff2" />
            <stop offset="55%" stopColor="#2ee6c5" />
            <stop offset="100%" stopColor="#0e6e5e" />
          </radialGradient>
          <radialGradient id="sp-disk5" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#d9f0ff" />
            <stop offset="60%" stopColor="#7eb6ff" />
            <stop offset="100%" stopColor="#2a4a78" />
          </radialGradient>
          <radialGradient id="sp-disk4" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff2c8" />
            <stop offset="60%" stopColor="#f0c95a" />
            <stop offset="100%" stopColor="#6e5414" />
          </radialGradient>
        </defs>
        {drawn.map((d) => (
          <circle
            key={d.k}
            cx={d.x}
            cy={d.y}
            r={Math.max(0.5, r - 0.6)}
            fill={d.c >= 6 ? 'url(#sp-disk6)' : d.c === 5 ? 'url(#sp-disk5)' : 'url(#sp-disk4)'}
            opacity={d.c >= 6 ? 0.95 : d.c === 5 ? 0.8 : 0.65}
          />
        ))}
      </svg>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="pill-inline">density now (white tick = hexagonal {HEX.toFixed(4)})</span>
          <span className="stat">{dens.toFixed(4)}</span>
        </div>
        <div className="meter" aria-hidden="true" style={{ position: 'relative' }}>
          <span style={{ width: `${dens * 100}%` }} />
          <i style={{ position: 'absolute', left: `${HEX * 100}%`, top: 0, bottom: 0, width: 2, background: '#fff' }} />
        </div>
      </div>
      <div className="controls">
        <DimSlider label="Shake strength" value={temp} min={0} max={3} step={0.1} onChange={setTemp} format={(v) => (v === 0 ? 'still' : v.toFixed(1))} />
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={pour}>
          Pour random disks
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setRunning((v) => !v)}>
          {running ? 'Freeze' : 'Run'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={crystal}>
          Show perfect honeycomb
        </button>
      </div>
      <p className="stat" role="status">
        {six}/{NDISK} disks have 6 neighbours · best jammed density this run {best.toFixed(4)} ({((best / HEX) * 100).toFixed(1)}% of
        hexagonal)
      </p>

      <h4 className="pill-inline" style={{ margin: 'var(--space-5) 0 var(--space-2)', fontSize: '0.8rem' }}>
        Higher dimensions: drag across the chart
      </h4>
      <svg
        ref={chartRef}
        viewBox={`0 0 ${CW} ${CH}`}
        role="img"
        aria-label={`Packing density versus dimension, selected dimension ${n}.`}
        onPointerDown={scrub}
        onPointerMove={scrub}
        style={{ cursor: 'ew-resize' }}
      >
        <defs>
          <linearGradient id="sp-zone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7eb6ff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7eb6ff" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[0, -20, -40, -60, -80, -100].map((t) => (
          <g key={t}>
            <line x1={CL} x2={CW - CR} y1={cy(t)} y2={cy(t)} stroke="#16211e" />
            <text x={CL - 5} y={cy(t) + 3} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
              2^{t}
            </text>
          </g>
        ))}
        {[1, 8, 24, 50, 100].map((t) => (
          <text key={t} x={cx(t)} y={CH - 10} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
            n={t}
          </text>
        ))}
        {/* unknown zone: between the easy floor 2^-n and the Kabatiansky–Levenshtein ceiling 2^-0.599n */}
        <path
          d={`M${cx(1)},${cy(-0.599)} L${cx(NMAX)},${cy(-0.599 * NMAX)} L${cx(NMAX)},${cy(-NMAX)} L${cx(1)},${cy(-1)} Z`}
          fill="url(#sp-zone)"
        />
        <line x1={cx(1)} y1={cy(-1)} x2={cx(NMAX)} y2={cy(-NMAX)} stroke="#8aa39a" strokeWidth="1.4" />
        <text x={cx(70)} y={cy(-70) + 14} fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono" transform={`rotate(25 ${cx(70)} ${cy(-70) + 14})`}>
          floor 2⁻ⁿ (any jammed packing)
        </text>
        <line x1={cx(1)} y1={cy(-0.599)} x2={cx(NMAX)} y2={cy(-0.599 * NMAX)} stroke="#ff6b6b" strokeWidth="1.6" strokeDasharray="6 4" />
        <text x={cx(52)} y={cy(-0.599 * 52) - 6} fill="#ff6b6b" fontSize="9" fontFamily="IBM Plex Mono" transform={`rotate(15 ${cx(52)} ${cy(-0.599 * 52) - 6})`}>
          old ceiling ≈ 2^−0.599n (asymptotic)
        </text>
        <text x={cx(80)} y={cy(-62)} textAnchor="middle" fill="#7eb6ff" fontSize="10" fontFamily="IBM Plex Mono">
          the unknown zone
        </text>
        <g stroke="#f0c95a" fill="#f0c95a">
          <line x1={cx(88)} y1={cy(-0.599 * 88) - 2} x2={cx(88)} y2={cy(-0.599 * 88) + 16} strokeWidth="2" />
          <path d={`M${cx(88) - 4},${cy(-0.599 * 88) + 12} L${cx(88)},${cy(-0.599 * 88) + 20} L${cx(88) + 4},${cy(-0.599 * 88) + 12} Z`} />
        </g>
        <text x={cx(88) - 6} y={cy(-0.599 * 88) - 6} textAnchor="end" fill="#f0c95a" fontSize="9" fontFamily="IBM Plex Mono">
          new: ceiling pushed down (schematic)
        </text>
        {KNOWN.map((k) => (
          <circle key={k.n} cx={cx(k.n)} cy={cy(Math.log2(k.d))} r={k.proven ? 4 : 2.8} fill={k.proven ? '#2ee6c5' : '#e8f2ef'} stroke={k.proven ? '#ffffff' : 'none'} />
        ))}
        <line x1={cx(n)} x2={cx(n)} y1={CT} y2={CH - CB} stroke="#ffffff" strokeOpacity="0.5" />
        <circle cx={cx(n)} cy={cy(-n)} r={3} fill="#8aa39a" />
        <circle cx={cx(n)} cy={cy(-0.599 * n)} r={3} fill="#ff6b6b" />
      </svg>
      <p className="stat" role="status" style={{ marginTop: 'var(--space-3)' }}>
        n = {n}:{' '}
        {exact
          ? `best known ${exact.name}, density ${exact.d < 0.01 ? exact.d.toExponential(3) : exact.d.toFixed(4)}${exact.proven ? ' (proven optimal)' : ''}.`
          : known && n <= 24
            ? `no special entry plotted here; nearest smaller is ${known.name} in dimension ${known.n}.`
            : `the floor and the old ceiling differ by a factor of about 2^${gapBits.toFixed(0)} ≈ 10^${(gapBits * Math.log10(2)).toFixed(0)}.`}
      </p>
      <p className="demo-callout">
        Teal dots with white rims are proven optimal (dimensions 1, 2, 3, 8, 24; in 8 and 24 via the Cohn–Elkies
        linear program). The Aug 2026 Astra claim pins down exactly how strong that same linear program can be as
        n grows, and gets a sharper general ceiling from it. The gold arrow is schematic: its exponent is not drawn
        from the paper. The 2D box is an annealing toy, not an optimizer.
      </p>
    </div>
  )
}
