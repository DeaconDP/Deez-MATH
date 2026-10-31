import { useEffect, useMemo, useRef, useState } from 'react'

type Found = { p: number; q: number; y: string; x: number; yv: number; h: number }

type Curve = {
  id: string
  label: string
  equation: string
  /** Window in the real plane. */
  xr: [number, number]
  yr: [number, number]
  /** Real branches to draw, as y-values for a given x (NaN where none). */
  branches: ((x: number) => number)[]
  /** Given x = p/q in lowest terms, list rational y values (as display strings + numeric) or []. */
  solve: (p: number, q: number) => { s: string; v: number }[]
  /** What is actually known. */
  truth: string
  tone: 'ok' | 'err'
}

const isqrt = (n: number) => {
  if (n < 0) return -1
  const r = Math.round(Math.sqrt(n))
  for (const c of [r - 1, r, r + 1]) if (c >= 0 && c * c === n) return c
  return -1
}
const icbrt = (n: number) => {
  const r = Math.round(Math.cbrt(n))
  for (const c of [r - 1, r, r + 1]) if (c * c * c === n) return c
  return null
}
const gcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}
const frac = (n: number, d: number) => {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  return d === 1 ? `${n}` : `${n}/${d}`
}
const pm = (s: string, v: number) => (v === 0 ? [{ s, v }] : [{ s, v }, { s: s.startsWith('-') ? s.slice(1) : `-${s}`, v: -v }])

const CURVES: Curve[] = [
  {
    id: 'circle',
    label: 'x² + y² = 1',
    equation: 'x² + y² = 1',
    xr: [-1.6, 1.6],
    yr: [-1.25, 1.25],
    branches: [(x) => Math.sqrt(1 - x * x), (x) => -Math.sqrt(1 - x * x)],
    // y² = (q² − p²)/q²
    solve: (p, q) => {
      const r = isqrt(q * q - p * p)
      return r < 0 ? [] : pm(frac(r, q), r / q)
    },
    truth:
      'Infinitely many rational points: (1−t²)/(1+t²), 2t/(1+t²) for every rational t. Search finds them fast.',
    tone: 'ok',
  },
  {
    id: 'three',
    label: 'x² + y² = 3',
    equation: 'x² + y² = 3',
    xr: [-2.4, 2.4],
    yr: [-1.9, 1.9],
    branches: [(x) => Math.sqrt(3 - x * x), (x) => -Math.sqrt(3 - x * x)],
    solve: (p, q) => {
      const r = isqrt(3 * q * q - p * p)
      return r < 0 ? [] : pm(frac(r, q), r / q)
    },
    truth:
      'No rational points, ever. Proof: clear denominators to a² + b² = 3c²; look mod 3 and descend. A search alone could never tell you this.',
    tone: 'err',
  },
  {
    id: 'mordell',
    label: 'y² = x³ − 2',
    equation: 'y² = x³ − 2',
    xr: [-0.5, 3.6],
    yr: [-6.5, 6.5],
    branches: [(x) => Math.sqrt(x ** 3 - 2), (x) => -Math.sqrt(x ** 3 - 2)],
    // y² = (p³ − 2q³)/q³ is a rational square iff (p³ − 2q³)·q is a perfect square
    solve: (p, q) => {
      const n = p ** 3 - 2 * q ** 3
      const r = isqrt(n * q)
      return r < 0 ? [] : pm(frac(r, q * q), r / (q * q))
    },
    truth:
      'Rational points exist: (3, ±5) shows up early, but the next one, (129/100, ±383/1000), hides until denominator 100. Infinitely many exist, getting huge fast.',
    tone: 'ok',
  },
  {
    id: 'selmer',
    label: '3x³ + 4y³ + 5 = 0',
    equation: '3x³ + 4y³ + 5 = 0',
    xr: [-3, 3],
    yr: [-3, 3],
    branches: [(x) => Math.cbrt(-(3 * x ** 3 + 5) / 4)],
    // y³ = −(3p³ + 5q³)/(4q³) = −2(3p³ + 5q³)/(2q)³ is a rational cube iff the numerator is a cube
    solve: (p, q) => {
      const c = icbrt(-2 * (3 * p ** 3 + 5 * q ** 3))
      return c == null ? [] : [{ s: frac(c, 2 * q), v: c / (2 * q) }]
    },
    truth:
      "Selmer (1951): no rational points. It has real solutions and solutions modulo every prime power, so no congruence trick works. It took a genuinely new argument.",
    tone: 'err',
  },
]

const W = 380
const H = 260
const MAX_Q = 120

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function HilbertTenthDemo() {
  const [ci, setCi] = useState(0)
  const [qDone, setQDone] = useState(0)
  const [found, setFound] = useState<Found[]>([])
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number | null>(null)
  const stateRef = useRef({ q: 0, found: [] as Found[] })
  const curve = CURVES[ci]

  const sx = (x: number) => ((x - curve.xr[0]) / (curve.xr[1] - curve.xr[0])) * W
  const sy = (y: number) => H - ((y - curve.yr[0]) / (curve.yr[1] - curve.yr[0])) * H

  const paths = useMemo(() => {
    const c = curve
    const toX = (x: number) => ((x - c.xr[0]) / (c.xr[1] - c.xr[0])) * W
    const toY = (y: number) => H - ((y - c.yr[0]) / (c.yr[1] - c.yr[0])) * H
    return c.branches.map((f) => {
      let d = ''
      let pen = false
      const N = 900
      for (let i = 0; i <= N; i++) {
        const x = c.xr[0] + ((c.xr[1] - c.xr[0]) * i) / N
        const y = f(x)
        if (!Number.isFinite(y) || y < c.yr[0] - 1 || y > c.yr[1] + 1) {
          pen = false
          continue
        }
        d += `${pen ? 'L' : 'M'}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`
        pen = true
      }
      return d
    })
  }, [curve])

  function stop() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setRunning(false)
  }
  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])

  function reset(i: number) {
    stop()
    setCi(i)
    setQDone(0)
    setFound([])
    stateRef.current = { q: 0, found: [] }
  }

  /** Search one denominator q: every x = p/q in lowest terms inside the window. */
  function searchQ(c: Curve, q: number, into: Found[]) {
    const pMin = Math.ceil(c.xr[0] * q)
    const pMax = Math.floor(c.xr[1] * q)
    for (let p = pMin; p <= pMax; p++) {
      if (gcd(p, q) !== 1) continue
      for (const y of c.solve(p, q)) {
        if (y.v < c.yr[0] || y.v > c.yr[1]) continue
        into.push({ p, q, y: y.s, x: p / q, yv: y.v, h: q })
      }
    }
  }

  function run() {
    if (running) {
      stop()
      return
    }
    const c = curve
    if (stateRef.current.q >= MAX_Q) {
      stateRef.current = { q: 0, found: [] }
      setFound([])
      setQDone(0)
    }
    if (reducedMotion()) {
      const st = stateRef.current
      while (st.q < MAX_Q) searchQ(c, ++st.q, st.found)
      setFound(st.found.slice())
      setQDone(st.q)
      return
    }
    setRunning(true)
    let last = 0
    const tick = (now: number) => {
      const st = stateRef.current
      // ~1 denominator per frame early, faster later
      const per = st.q < 12 ? (now - last > 90 ? 1 : 0) : 2
      if (per) last = now
      for (let k = 0; k < per && st.q < MAX_Q; k++) searchQ(c, ++st.q, st.found)
      setFound(st.found.slice())
      setQDone(st.q)
      if (st.q < MAX_Q) rafRef.current = requestAnimationFrame(tick)
      else {
        rafRef.current = null
        setRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const tested = useMemo(() => {
    let n = 0
    for (let q = 1; q <= qDone; q++) {
      for (let p = Math.ceil(curve.xr[0] * q); p <= Math.floor(curve.xr[1] * q); p++) if (gcd(p, q) === 1) n++
    }
    return n
  }, [qDone, curve])

  const latest = found[found.length - 1]
  const done = qDone >= MAX_Q
  const nPoints = found.length

  return (
    <div className="demo">
      <h3 className="demo-title">Rational point hunter</h3>
      <p className="demo-hint">
        Pick an equation and press Search. The hunter tries every fraction x = p/q, with q = 1, 2, 3, …, and checks
        whether a rational y completes a solution. Glowing dots are rational zeros it found. The question: when the
        screen stays dark, does that mean there are none?
      </p>
      <div className="btn-row" role="group" aria-label="Equation" style={{ marginBottom: 'var(--space-3)' }}>
        {CURVES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={i === ci ? 'btn' : 'btn btn-ghost'}
            aria-pressed={i === ci}
            onClick={() => reset(i)}
            style={{ padding: '0 var(--space-3)' }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${curve.equation}: ${nPoints} rational points found with denominators up to ${qDone}.`}>
        <defs>
          <filter id="h10-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#1c2925" />
        <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#1c2925" />
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#7eb6ff" strokeOpacity="0.55" strokeWidth="1.6" />
        ))}
        {running ? (
          <rect x={0} y={0} width={W} height={H} fill="none" stroke="#2ee6c5" strokeOpacity={0.25 + 0.25 * Math.sin(qDone)} strokeWidth="3" />
        ) : null}
        <g filter="url(#h10-glow)">
          {found.map((f, i) => (
            <circle
              key={`${f.p}/${f.q}:${f.y}`}
              cx={sx(f.x)}
              cy={sy(f.yv)}
              r={i === found.length - 1 && running ? 5.5 : f.q <= 3 ? 4.2 : 3}
              fill={f.q >= 50 ? '#f0c95a' : '#2ee6c5'}
            />
          ))}
        </g>
        {latest && latest.q >= 50 ? (
          <text x={Math.min(W - 6, sx(latest.x) + 8)} y={sy(latest.yv) - 8} fill="#f0c95a" fontSize="11" fontFamily="IBM Plex Mono" textAnchor={sx(latest.x) > W - 120 ? 'end' : 'start'}>
            ({frac(latest.p, latest.q)}, {latest.y})
          </text>
        ) : null}
        <text x={8} y={16} fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          {curve.equation} · real solutions in blue
        </text>
      </svg>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="pill-inline">denominators searched</span>
          <span className="stat">
            q ≤ {qDone} of {MAX_Q}
          </span>
        </div>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${(qDone / MAX_Q) * 100}%`, transition: 'width 80ms linear' }} />
        </div>
      </div>
      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={run}>
          {running ? 'Pause' : done ? 'Search again' : qDone ? 'Resume' : 'Search'}
        </button>
      </div>
      <p className="stat" role="status">
        {tested.toLocaleString()} values of x tried · {nPoints} rational point{nPoints === 1 ? '' : 's'} found
        {latest ? ` · latest (${frac(latest.p, latest.q)}, ${latest.y})` : ''}
      </p>
      {done ? (
        <p className={`feedback ${curve.tone}`}>
          {nPoints === 0
            ? `Nothing up to q = ${MAX_Q}. The search cannot tell "none exist" from "not yet". `
            : ''}
          {curve.truth}
        </p>
      ) : (
        <p className="feedback" style={{ color: 'var(--muted)' }}>
          A search halts when it finds a point. If none exist, it runs forever.
        </p>
      )}
      <p className="demo-callout">
        Each equation here was settled by hand, with a different idea each time. The Oct 2026 claim (OpenAI catalog,
        not machine-checked here) is that no single algorithm can do this for every integer polynomial in any number
        of variables: no program answers &quot;is there a rational zero?&quot; correctly for all of them. It does not
        say these four are hard.
      </p>
    </div>
  )
}
