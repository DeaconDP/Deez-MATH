import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Part A: bottlenecks. Two unit disks joined by a corridor of half-   */
/*  width h. h = 1 gives the stadium (convex); h < 1 a dumbbell.       */
/* ------------------------------------------------------------------ */

const C = 1.6 // lobe centres at (±C, 0)
const XMIN = -2.8
const XMAX = 2.8
const CW = 640
const CH = 290
const sc = CW / (XMAX - XMIN)
const cx = (x: number) => (x - XMIN) * sc
const cy = (y: number) => CH / 2 - y * sc

function inside(x: number, y: number, h: number) {
  if ((x + C) ** 2 + y * y <= 1) return true
  if ((x - C) ** 2 + y * y <= 1) return true
  return Math.abs(x) <= C && Math.abs(y) <= h
}

/** half-height of the shape's vertical slice at x */
function halfExtent(x: number, h: number) {
  let m = 0
  for (const c of [-C, C]) {
    const d = x - c
    if (Math.abs(d) <= 1) m = Math.max(m, Math.sqrt(1 - d * d))
  }
  if (Math.abs(x) <= C) m = Math.max(m, h)
  return m
}

const PROFILE_N = 400
function cutProfile(h: number) {
  // cumulative area from the left and Cheeger ratio of each vertical cut
  const xs: number[] = []
  const cum: number[] = []
  const dx = (C + 1 - (-C - 1)) / PROFILE_N
  let a = 0
  for (let i = 0; i <= PROFILE_N; i++) {
    const x = -C - 1 + i * dx
    xs.push(x)
    cum.push(a)
    a += 2 * halfExtent(x + dx / 2, h) * dx
  }
  const total = a
  const ratio = xs.map((x, i) => {
    const small = Math.min(cum[i], total - cum[i])
    return small > 1e-6 ? (2 * halfExtent(x, h)) / small : Infinity
  })
  return { xs, cum, total, ratio }
}

/* ------------------------------------------------------------------ */
/*  Part B: how the proven bound on ψ_n grew with dimension             */
/* ------------------------------------------------------------------ */

const BOUNDS: { label: string; f: (lnN: number) => number; color: string }[] = [
  { label: 'KLS 1995: √n', f: (L) => Math.exp(L / 2), color: '#ff6b6b' },
  { label: 'Lee–Vempala 2017: n^¼', f: (L) => Math.exp(L / 4), color: '#ff8a2b' },
  { label: 'Chen 2021: e^√(log n · log log n)', f: (L) => Math.exp(Math.sqrt(L * Math.log(L))), color: '#e28bff' },
  { label: 'Klartag–Lehec 2022: (log n)^5', f: (L) => L ** 5, color: '#7eb6ff' },
  { label: 'Jambulapati–Lee–Vempala 2022: (log n)^2.22', f: (L) => L ** 2.2226, color: '#9ad0ff' },
  { label: 'Klartag 2023: √log n', f: (L) => Math.sqrt(L), color: '#f0c95a' },
  { label: 'Oct 2026: a constant', f: () => 1, color: '#2ee6c5' },
]

const GW = 640
const GH = 230
const G_L = 46
const G_R = 16
const M_MAX = 60
const gx = (m: number) => G_L + ((m - 1) / (M_MAX - 1)) * (GW - G_L - G_R)
const LOG_TOP = 16
const gy = (v: number) => 14 + ((LOG_TOP - Math.min(LOG_TOP, Math.log10(Math.max(1, v)))) / LOG_TOP) * (GH - 40)

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

const WALKERS = 500
const DELTA = 0.2

type Walk = { x: Float64Array; y: Float64Array; t: number; trace: { t: number; f: number }[] }

function seedWalkers(): Walk {
  const x = new Float64Array(WALKERS)
  const y = new Float64Array(WALKERS)
  for (let i = 0; i < WALKERS; i++) {
    const r = Math.sqrt(Math.random()) * 0.95
    const a = Math.random() * Math.PI * 2
    x[i] = -C + r * Math.cos(a)
    y[i] = r * Math.sin(a)
  }
  return { x, y, t: 0, trace: [{ t: 0, f: 0 }] }
}

const T_MAX = 1500 // walk steps shown on the mixing plot

export function KlsDemo() {
  const reduced = useReducedMotion()
  const [h, setH] = useState(1)
  const [cut, setCut] = useState(0)
  const [running, setRunning] = useState(!reduced)
  const [m, setM] = useState(20)
  const [, setTick] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const walk = useRef<Walk>(seedWalkers())
  const raf = useRef(0)
  const hRef = useRef(h)
  const cutRef = useRef(cut)

  const profile = useMemo(() => cutProfile(h), [h])
  const bestIdx = useMemo(() => {
    let b = 0
    profile.ratio.forEach((r, i) => {
      if (r < profile.ratio[b]) b = i
    })
    return b
  }, [profile])
  const cutIdx = Math.max(0, Math.min(PROFILE_N, Math.round(((cut - (-C - 1)) / (2 * C + 2)) * PROFILE_N)))
  const cutRatio = profile.ratio[cutIdx]
  const convex = h >= 0.999

  const drawScene = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const hh = hRef.current
    ctx.fillStyle = '#070b0a'
    ctx.fillRect(0, 0, CW, CH)
    // body: outline sampled from the slice profile
    ctx.beginPath()
    for (let i = 0; i <= 400; i++) {
      const x = -C - 1 + (i / 400) * (2 * C + 2)
      const e = halfExtent(x, hh)
      if (i) ctx.lineTo(cx(x), cy(e))
      else ctx.moveTo(cx(x), cy(e))
    }
    for (let i = 400; i >= 0; i--) {
      const x = -C - 1 + (i / 400) * (2 * C + 2)
      ctx.lineTo(cx(x), cy(-halfExtent(x, hh)))
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(46,230,197,0.07)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(46,230,197,0.55)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    // walkers
    const w = walk.current
    for (let i = 0; i < WALKERS; i++) {
      const right = w.x[i] > 0
      ctx.fillStyle = right ? 'rgba(240,201,90,0.9)' : 'rgba(46,230,197,0.85)'
      ctx.fillRect(cx(w.x[i]) - 1.5, cy(w.y[i]) - 1.5, 3, 3)
    }
    // user cut
    const c = cutRef.current
    const e = halfExtent(c, hh)
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx(c), cy(Math.max(e, 0.05) + 0.12))
    ctx.lineTo(cx(c), cy(-Math.max(e, 0.05) - 0.12))
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.fillStyle = '#ff6b6b'
    ctx.font = '11px ui-monospace, monospace'
    ctx.fillText('drag to cut', cx(c) + 6, cy(-Math.max(e, 0.05) - 0.12) + 4)
  }, [])

  useEffect(() => {
    hRef.current = h
    cutRef.current = cut
    drawScene()
  }, [h, cut, drawScene])

  const resetWalk = useCallback(() => {
    walk.current = seedWalkers()
    setTick((t) => t + 1)
    drawScene()
  }, [drawScene])

  useEffect(() => {
    resetWalk()
  }, [h, resetWalk])

  const advance = useCallback((steps: number) => {
    const w = walk.current
    const hh = hRef.current
    for (let s = 0; s < steps; s++) {
      for (let i = 0; i < WALKERS; i++) {
        const r = Math.sqrt(Math.random()) * DELTA
        const a = Math.random() * Math.PI * 2
        const nx = w.x[i] + r * Math.cos(a)
        const ny = w.y[i] + r * Math.sin(a)
        if (inside(nx, ny, hh)) {
          w.x[i] = nx
          w.y[i] = ny
        }
      }
      w.t++
      if (w.t <= T_MAX && w.t % 5 === 0) {
        let right = 0
        for (let i = 0; i < WALKERS; i++) if (w.x[i] > 0) right++
        w.trace.push({ t: w.t, f: right / WALKERS })
      }
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const frame = () => {
      advance(4)
      drawScene()
      setTick((t) => t + 1)
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf.current)
  }, [running, advance, drawScene])

  const setCutFromPointer = (clientX: number) => {
    const el = canvasRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = XMIN + ((clientX - r.left) / r.width) * (XMAX - XMIN)
    setCut(Math.max(-C - 0.98, Math.min(C + 0.98, x)))
  }

  const w = walk.current
  const lastF = w.trace[w.trace.length - 1]?.f ?? 0
  const halfTime = w.trace.find((p) => p.f >= 0.4)?.t

  // mixing plot
  const MW = 300
  const MH = 130
  const mx = (t: number) => 8 + (t / T_MAX) * (MW - 16)
  const my = (f: number) => MH - 16 - (f / 0.6) * (MH - 28)
  const mixPath = w.trace.map((p, i) => `${i ? 'L' : 'M'}${mx(p.t).toFixed(1)} ${my(p.f).toFixed(1)}`).join('')

  // cut-ratio profile plot
  const finite = profile.ratio.filter(Number.isFinite)
  const rMax = Math.min(6, Math.max(...finite))
  const qx = (x: number) => 8 + ((x + C + 1) / (2 * C + 2)) * (MW - 16)
  const qy = (r: number) => MH - 16 - (Math.min(r, rMax) / rMax) * (MH - 28)
  const ratioPath = profile.xs
    .map((x, i) => (Number.isFinite(profile.ratio[i]) ? `${qx(x).toFixed(1)} ${qy(profile.ratio[i]).toFixed(1)}` : null))
    .filter(Boolean)
    .map((p, i) => `${i ? 'L' : 'M'}${p}`)
    .join('')

  const lnN = m * Math.LN10

  return (
    <div className="demo">
      <h3 className="demo-title">Convex shapes have no secret bottlenecks</h3>
      <p className="demo-hint">
        500 random walkers start in the left lobe and take small random steps, rejecting any step
        that leaves the shape. That ball walk is how algorithms sample convex bodies. Pinch the
        middle and the shape stops being convex: a thin neck becomes a cheap cut, and the walkers
        get stuck. KLS says convex shapes, and log-concave distributions, can’t hide a bottleneck
        that a flat cut wouldn’t expose, in any dimension. Drag the red line to test cuts.
      </p>

      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        aria-label="Random walkers inside a convex stadium or a pinched dumbbell"
        style={{ cursor: 'ew-resize' }}
        onPointerDown={(e) => {
          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
          setCutFromPointer(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons) setCutFromPointer(e.clientX)
        }}
      />

      <div className="controls">
        <label>
          Neck width: <span className="stat">{h.toFixed(2)}</span>{' '}
          <span style={{ color: convex ? 'var(--ok)' : 'var(--danger)' }}>{convex ? '· convex (stadium)' : '· not convex (dumbbell)'}</span>
          <input type="range" min={0.06} max={1} step={0.01} value={h} onChange={(e) => setH(Number(e.target.value))} />
        </label>
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause walkers' : 'Run walkers'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={resetWalk}>
          Restart walkers
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setCut(profile.xs[bestIdx])}>
          Snap to best flat cut
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
        <div>
          <svg viewBox={`0 0 ${MW} ${MH}`} role="img" aria-label="Fraction of walkers in the right half over time">
            <line x1={8} x2={MW - 8} y1={my(0.5)} y2={my(0.5)} stroke="#f0c95a" strokeDasharray="4 3" opacity={0.7} />
            <text x={MW - 10} y={my(0.5) - 4} fontSize="9" fill="#f0c95a" textAnchor="end">
              mixed: 50%
            </text>
            <path d={mixPath} fill="none" stroke={convex ? '#2ee6c5' : '#ff6b6b'} strokeWidth={2} />
            <text x={10} y={MH - 4} fontSize="9" fill="#8aa39a">
              share of walkers on the right vs steps
            </text>
          </svg>
          <p className="stat" style={{ fontSize: '0.75rem', margin: 'var(--space-2) 0 0' }}>
            Right side now: {(lastF * 100).toFixed(0)}% ·{' '}
            {halfTime ? `reached 40% after ${halfTime} steps` : w.t > T_MAX ? `still below 40% after ${T_MAX} steps` : 'mixing…'}
          </p>
        </div>
        <div>
          <svg viewBox={`0 0 ${MW} ${MH}`} role="img" aria-label="Cost of each vertical cut">
            <path d={ratioPath} fill="none" stroke="#7eb6ff" strokeWidth={1.8} />
            <circle cx={qx(profile.xs[bestIdx])} cy={qy(profile.ratio[bestIdx])} r={4} fill="#f0c95a" />
            <line x1={qx(cut)} x2={qx(cut)} y1={8} y2={MH - 16} stroke="#ff6b6b" />
            <text x={10} y={MH - 4} fontSize="9" fill="#8aa39a">
              cut cost = cut length ÷ smaller area
            </text>
          </svg>
          <p className="stat" style={{ fontSize: '0.75rem', margin: 'var(--space-2) 0 0' }}>
            Your cut: {Number.isFinite(cutRatio) ? cutRatio.toFixed(3) : '∞'} · best flat cut: {profile.ratio[bestIdx].toFixed(3)}
          </p>
        </div>
      </div>

      <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)', fontSize: '0.9rem' }}>The hard part: every dimension at once</h4>
      <p className="demo-hint">
        In 2D every convex shape is easy. The question was whether the worst bottleneck factor ψ_n
        could grow with the dimension n. Each curve is a proven upper bound on ψ_n, plotted with
        every constant set to 1, so only the growth shapes are meaningful.
      </p>
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label="Upper bounds on the KLS constant as the dimension grows">
        {[0, 4, 8, 12, 16].map((e) => (
          <g key={e}>
            <line x1={G_L} x2={GW - G_R} y1={gy(10 ** e)} y2={gy(10 ** e)} stroke="#24332e" strokeDasharray="2 4" />
            <text x={G_L - 6} y={gy(10 ** e) + 3} fontSize="9.5" fill="#8aa39a" textAnchor="end">
              {e === 0 ? '1' : `10^${e}`}
            </text>
          </g>
        ))}
        {[1, 10, 20, 30, 40, 50, 60].map((mm) => (
          <text key={mm} x={gx(mm)} y={GH - 8} fontSize="9.5" fill="#8aa39a" textAnchor="middle">
            n = 10^{mm}
          </text>
        ))}
        {BOUNDS.map((b) => {
          const d = Array.from({ length: 120 }, (_, i) => {
            const mm = 1 + (i / 119) * (M_MAX - 1)
            return `${i ? 'L' : 'M'}${gx(mm).toFixed(1)} ${gy(b.f(mm * Math.LN10)).toFixed(1)}`
          }).join('')
          const last = b.f === BOUNDS[BOUNDS.length - 1].f
          return <path key={b.label} d={d} fill="none" stroke={b.color} strokeWidth={last ? 3 : 1.6} style={{ filter: last ? 'drop-shadow(0 0 5px #2ee6c5)' : undefined }} />
        })}
        <line x1={gx(m)} x2={gx(m)} y1={10} y2={GH - 22} stroke="#e8f2ef" strokeOpacity={0.35} />
        {BOUNDS.map((b) => (
          <circle key={b.label} cx={gx(m)} cy={gy(b.f(lnN))} r={3.5} fill={b.color} stroke="#070b0a" />
        ))}
      </svg>
      <div className="controls">
        <label>
          Dimension n: <span className="stat">10^{m}</span>
          <input type="range" min={1} max={M_MAX} value={m} onChange={(e) => setM(Number(e.target.value))} />
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, fontSize: '0.72rem' }}>
        {BOUNDS.map((b) => {
          const v = b.f(lnN)
          return (
            <span key={b.label} className="stat" style={{ color: b.color }}>
              {b.label}: {v >= 1e5 ? v.toExponential(1) : v.toFixed(v < 10 ? 2 : 0)}
            </span>
          )
        })}
      </div>

      <p className="demo-callout">
        Song and Zhang’s October 2026 proof, with two independent follow-ups, gives a universal
        constant. The bound does not grow at all with dimension. A September 2026 bound of
        4^(log* n) had already grown absurdly slowly, but not flat, so it is left off the chart.
        HongruZhao/KLS500 is a Lean formalization of a Poincaré constant at most 500, and peer
        review is pending. The 2D picture shows only the intuition, since every 2D convex body is
        trivially fine.
      </p>
    </div>
  )
}
