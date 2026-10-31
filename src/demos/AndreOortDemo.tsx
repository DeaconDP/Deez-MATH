import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * The counting engine behind the Pila–Zannier route to André–Oort:
 * Pila–Wilkie says a "tame" (o-minimal) set has very few rational points of height ≤ T
 * off its algebraic pieces (≪ T^ε), while algebraic curves can carry a power of T.
 * Everything here is exact rational arithmetic on the unit square.
 */

const T_MAX = 60

type Pt = { x: number; y: number; h: number; label: string }
type CurveId = 'line' | 'circle' | 'parabola' | 'exp' | 'sine'

type Curve = {
  id: CurveId
  name: string
  formula: string
  kind: 'algebraic' | 'transcendental'
  f: (x: number) => number
  color: string
  why: string
}

const CURVES: Curve[] = [
  {
    id: 'line',
    name: 'Line',
    formula: 'y = (2x + 1)/3',
    kind: 'algebraic',
    f: (x) => (2 * x + 1) / 3,
    color: '#2ee6c5',
    why: 'Every rational x gives a rational y, so the count grows like T².',
  },
  {
    id: 'circle',
    name: 'Circle',
    formula: 'x² + y² = 1',
    kind: 'algebraic',
    f: (x) => Math.sqrt(Math.max(0, 1 - x * x)),
    color: '#7eb6ff',
    why: 'Rational points are Pythagorean triples, so the count grows like T.',
  },
  {
    id: 'parabola',
    name: 'Parabola',
    formula: 'y = x²',
    kind: 'algebraic',
    f: (x) => x * x,
    color: '#b28bff',
    why: 'x = p/q gives y = p²/q² of height q², so the count grows like T.',
  },
  {
    id: 'exp',
    name: 'Exponential',
    formula: 'y = 2^x − 1',
    kind: 'transcendental',
    f: (x) => 2 ** x - 1,
    color: '#f0c95a',
    why: '2^(p/q) is irrational unless q divides p, so only x = 0 and x = 1 work. Ever.',
  },
  {
    id: 'sine',
    name: 'Sine',
    formula: 'y = sin(πx/2)',
    kind: 'transcendental',
    f: (x) => Math.sin((Math.PI * x) / 2),
    color: '#ff8a5b',
    why: 'Niven’s theorem: the only rational sines at rational angles are 0, ±½, ±1. Three points, ever.',
  },
]

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

/** All p/q in [0,1], lowest terms, q ≤ T_MAX. Height = max(p, q) = q. */
const FAREY: { p: number; q: number }[] = (() => {
  const out: { p: number; q: number }[] = []
  for (let q = 1; q <= T_MAX; q++) for (let p = 0; p <= q; p++) if (gcd(p, q) === 1) out.push({ p, q })
  return out
})()

function frac(p: number, q: number) {
  const g = gcd(p, q) || 1
  return { p: p / g, q: q / g, h: Math.max(Math.abs(p / g), q / g) }
}

function rationalPoints(id: CurveId): Pt[] {
  const pts: Pt[] = []
  const add = (xp: number, xq: number, yp: number, yq: number) => {
    const x = frac(xp, xq)
    const y = frac(yp, yq)
    const h = Math.max(x.h, y.h)
    if (h <= T_MAX * T_MAX)
      pts.push({ x: x.p / x.q, y: y.p / y.q, h, label: `(${x.p}/${x.q}, ${y.p}/${y.q})` })
  }
  if (id === 'exp') {
    add(0, 1, 0, 1)
    add(1, 1, 1, 1)
    return pts
  }
  if (id === 'sine') {
    add(0, 1, 0, 1)
    add(1, 3, 1, 2)
    add(1, 1, 1, 1)
    return pts
  }
  for (const { p, q } of FAREY) {
    if (id === 'line') add(p, q, 2 * p + q, 3 * q)
    else if (id === 'parabola') add(p, q, p * p, q * q)
    else {
      const r2 = q * q - p * p
      const r = Math.round(Math.sqrt(r2))
      if (r * r === r2) add(p, q, r, q)
    }
  }
  return pts
}

function countsUpTo(pts: Pt[]): number[] {
  const c = new Array<number>(T_MAX + 1).fill(0)
  for (const pt of pts) if (pt.h <= T_MAX) c[pt.h] += 1
  for (let t = 1; t <= T_MAX; t++) c[t] += c[t - 1]
  return c
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

const SIZE = 600
const PAD = 28

export function AndreOortDemo() {
  const [curveId, setCurveId] = useState<CurveId>('circle')
  const [T, setT] = useState(25)
  const [playing, setPlaying] = useState(false)
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const curve = CURVES.find((c) => c.id === curveId) ?? CURVES[0]
  const allCounts = useMemo(() => {
    const m = {} as Record<CurveId, number[]>
    for (const c of CURVES) m[c.id] = countsUpTo(rationalPoints(c.id))
    return m
  }, [])
  const points = useMemo(() => rationalPoints(curveId), [curveId])
  const onCurve = points.filter((pt) => pt.h <= T)
  const gridCount = useMemo(() => {
    let n = 0
    for (const f of FAREY) if (f.q <= T) n++
    return n * n
  }, [T])

  // draw: Farey starfield + curve + captured points
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const inner = SIZE - 2 * PAD
    const px = (x: number) => PAD + x * inner
    const py = (y: number) => SIZE - PAD - y * inner

    const img = ctx.createImageData(SIZE, SIZE)
    const acc = new Float32Array(SIZE * SIZE)
    const xs = FAREY.filter((f) => f.q <= T)
    for (const a of xs) {
      const X = Math.round(px(a.p / a.q))
      const wa = 1 / a.q
      for (const b of xs) {
        const Y = Math.round(py(b.p / b.q))
        acc[Y * SIZE + X] += wa * (1 / b.q)
      }
    }
    for (let i = 0; i < acc.length; i++) {
      const v = acc[i]
      const o = i * 4
      if (v > 0) {
        const s = Math.min(1, 0.07 + 3 * v ** 0.6)
        img.data[o] = 60 * s + 20
        img.data[o + 1] = 170 * s + 30
        img.data[o + 2] = 150 * s + 30
        img.data[o + 3] = 255
      } else {
        img.data[o] = 7
        img.data[o + 1] = 11
        img.data[o + 2] = 10
        img.data[o + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)

    // frame
    ctx.strokeStyle = '#24332e'
    ctx.lineWidth = 1
    ctx.strokeRect(PAD, PAD, inner, inner)
    ctx.fillStyle = '#8aa39a'
    ctx.font = '15px IBM Plex Mono, monospace'
    ctx.fillText('0', PAD - 14, SIZE - PAD + 16)
    ctx.fillText('1', SIZE - PAD - 4, SIZE - PAD + 18)
    ctx.fillText('1', PAD - 16, PAD + 6)

    // curve with glow
    ctx.save()
    ctx.shadowColor = curve.color
    ctx.shadowBlur = 14
    ctx.strokeStyle = curve.color
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let i = 0; i <= 300; i++) {
      const x = i / 300
      const y = curve.f(x)
      if (i === 0) ctx.moveTo(px(x), py(y))
      else ctx.lineTo(px(x), py(y))
    }
    ctx.stroke()
    ctx.restore()

    // captured rational points
    ctx.save()
    for (const pt of points) {
      if (pt.h > T) continue
      const fresh = pt.h > T - 3
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = fresh ? 18 : 8
      ctx.fillStyle = fresh ? '#ffffff' : '#f0c95a'
      ctx.beginPath()
      ctx.arc(px(pt.x), py(pt.y), fresh ? 6.5 : 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }, [T, curve, points])

  useEffect(() => {
    if (!playing) return
    if (reduced) {
      setT(T_MAX)
      setPlaying(false)
      return
    }
    let t = 1
    setT(1)
    const id = window.setInterval(() => {
      t += 1
      setT(t)
      if (t >= T_MAX) {
        window.clearInterval(id)
        setPlaying(false)
      }
    }, 110)
    return () => window.clearInterval(id)
  }, [playing, reduced])

  // log–log growth chart
  const CW = 300
  const CH = 150
  const maxCount = Math.max(...CURVES.map((c) => allCounts[c.id][T_MAX]))
  const lx = (t: number) => 30 + (Math.log(t) / Math.log(T_MAX)) * (CW - 40)
  const ly = (n: number) => CH - 20 - (Math.log(Math.max(n, 1)) / Math.log(maxCount)) * (CH - 32)
  const path = (counts: number[]) =>
    counts
      .slice(1)
      .map((n, i) => `${i === 0 ? 'M' : 'L'}${lx(i + 1).toFixed(1)},${ly(n).toFixed(1)}`)
      .join(' ')
  const count = allCounts[curveId][T]

  return (
    <div className="demo">
      <h3 className="demo-title">Tame curves catch almost no fractions</h3>
      <p className="demo-hint">
        Each star is a point (x, y) whose coordinates are both fractions with numerator and
        denominator at most T. Brighter stars have smaller denominators. Pick a curve and raise T.
        Algebraic curves keep catching more stars. Transcendental curves catch a handful and then
        nothing, however far you go.
      </p>
      <div className="btn-row" style={{ marginBottom: '0.75rem', gap: '0.4rem' }}>
        {CURVES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn ${c.id === curveId ? '' : 'btn-ghost'}`}
            onClick={() => setCurveId(c.id)}
            aria-pressed={c.id === curveId}
            style={{
              padding: '0 0.8rem',
              fontSize: '0.78rem',
              ...(c.id === curveId ? { background: c.color, borderColor: c.color } : { borderColor: c.color + '66' }),
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={`${curve.formula}: ${onCurve.length} rational points of height at most ${T}`}
        style={{ maxWidth: 420, margin: '0 auto' }}
      />
      <p className="stat" style={{ margin: '0.6rem 0 0.2rem', textAlign: 'center' }}>
        <span style={{ color: curve.color }}>{curve.formula}</span> · {curve.kind} ·{' '}
        <strong style={{ color: '#f0c95a' }}>{count}</strong> of {gridCount.toLocaleString()} stars
        caught
      </p>
      <p className="pill-inline" style={{ textAlign: 'center', margin: 0 }}>
        {curve.why}
      </p>

      <div className="controls">
        <DimSlider label="Height T" value={T} min={1} max={T_MAX} onChange={setT} />
      </div>
      <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
        <button type="button" className="btn" onClick={() => setPlaying(true)} disabled={playing}>
          {playing ? 'Raising T…' : '▶ Raise T from 1 to 60'}
        </button>
      </div>

      <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label="Log-log plot of rational points caught versus height">
        <text x={CW / 2} y={12} textAnchor="middle" fill="#8aa39a" fontSize="8" fontFamily="IBM Plex Mono">
          points caught vs. T (log–log)
        </text>
        <line x1={30} y1={CH - 20} x2={CW - 10} y2={CH - 20} stroke="#24332e" />
        <line x1={30} y1={14} x2={30} y2={CH - 20} stroke="#24332e" />
        {[1, 10, 60].map((t) => (
          <text key={t} x={lx(t)} y={CH - 8} fill="#8aa39a" fontSize="7" textAnchor="middle">
            {t}
          </text>
        ))}
        {[1, 10, 100, 1000].filter((n) => n <= maxCount).map((n) => (
          <text key={n} x={26} y={ly(n) + 2} fill="#8aa39a" fontSize="7" textAnchor="end">
            {n}
          </text>
        ))}
        <line x1={lx(T)} x2={lx(T)} y1={14} y2={CH - 20} stroke="#e8f2ef" strokeOpacity={0.25} strokeDasharray="2 3" />
        {CURVES.map((c) => (
          <path
            key={c.id}
            d={path(allCounts[c.id])}
            fill="none"
            stroke={c.color}
            strokeWidth={c.id === curveId ? 2.4 : 1}
            strokeOpacity={c.id === curveId ? 1 : 0.35}
          />
        ))}
        <circle cx={lx(T)} cy={ly(count)} r={3.5} fill="#ffffff" />
        <text x={CW - 12} y={ly(allCounts.line[T_MAX]) + 10} fill="#2ee6c5" fontSize="7" textAnchor="end">
          ~T² (line)
        </text>
        <text x={CW - 12} y={ly(allCounts.circle[T_MAX]) - 4} fill="#7eb6ff" fontSize="7" textAnchor="end">
          ~T (circle, parabola)
        </text>
        <text x={CW - 12} y={ly(3) - 4} fill="#f0c95a" fontSize="7" textAnchor="end">
          flat (transcendental)
        </text>
      </svg>

      <p className="demo-callout">
        That flat line is the Pila–Wilkie theorem in miniature: off its algebraic pieces, a tame
        (o-minimal) set has fewer than T^ε rational points of height T. Pila and Zannier turned
        this into a route to André–Oort. Special (CM) points pull back to many algebraic points on
        a transcendental, tame set, so they must sit on algebraic pieces, which turn out to be
        special subvarieties. Tsimerman supplied key inputs, including the Galois-orbit bounds that
        finished André–Oort for Siegel modular varieties. The demo shows the counting engine, not
        that proof.
      </p>
    </div>
  )
}
