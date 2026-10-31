import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'

type V = { x: number; y: number }

const HW = 180
const HH = 130
const RAIN_MAX = 900

const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y })
const scale = (a: V, s: number): V => ({ x: a.x * s, y: a.y * s })
const dot = (a: V, b: V) => a.x * b.x + a.y * b.y
const norm = (a: V) => Math.hypot(a.x, a.y)
const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y)
const comb = (b1: V, b2: V, i: number, j: number): V => ({ x: i * b1.x + j * b2.x, y: i * b1.y + j * b2.y })
const det = (b1: V, b2: V) => b1.x * b2.y - b1.y * b2.x

const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

/** Coordinates of t in basis (b1, b2). */
function coords(t: V, b1: V, b2: V): [number, number] {
  const D = det(b1, b2)
  return [(t.x * b2.y - t.y * b2.x) / D, (b1.x * t.y - b1.y * t.x) / D]
}

/** Lagrange–Gauss reduction (2D LLL): same lattice, shortest possible basis. */
function gauss(b1: V, b2: V): [V, V] {
  let u = b1
  let v = b2
  for (let it = 0; it < 100; it++) {
    if (norm(u) > norm(v)) [u, v] = [v, u]
    const m = Math.round(dot(u, v) / dot(u, u))
    if (m === 0) break
    v = add(v, scale(u, -m))
  }
  return [u, v]
}

/** Exact CVP in 2D: round in a reduced basis, then search the neighbors. */
function closest(t: V, r1: V, r2: V): V {
  const [c1, c2] = coords(t, r1, r2)
  const i0 = Math.round(c1)
  const j0 = Math.round(c2)
  let best = comb(r1, r2, i0, j0)
  let bd = dist(best, t)
  for (let di = -2; di <= 2; di++)
    for (let dj = -2; dj <= 2; dj++) {
      const p = comb(r1, r2, i0 + di, j0 + dj)
      const d = dist(p, t)
      if (d < bd - 1e-9) {
        bd = d
        best = p
      }
    }
  return best
}

/** Babai rounding with whatever basis you hold. */
function babai(t: V, b1: V, b2: V): V {
  const [c1, c2] = coords(t, b1, b2)
  return comb(b1, b2, Math.round(c1), Math.round(c2))
}

/** Voronoi cell of the origin: clip a big square by perpendicular bisectors. */
function voronoiCell(r1: V, r2: V): V[] {
  let poly: V[] = [
    { x: -400, y: -400 },
    { x: 400, y: -400 },
    { x: 400, y: 400 },
    { x: -400, y: 400 },
  ]
  for (let i = -2; i <= 2; i++)
    for (let j = -2; j <= 2; j++) {
      if (i === 0 && j === 0) continue
      const v = comb(r1, r2, i, j)
      const c = dot(v, v) / 2
      const out: V[] = []
      for (let k = 0; k < poly.length; k++) {
        const P = poly[k]
        const Q = poly[(k + 1) % poly.length]
        const fp = dot(P, v) - c
        const fq = dot(Q, v) - c
        if (fp <= 0) out.push(P)
        if (fp * fq < 0) {
          const t = fp / (fp - fq)
          out.push({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t })
        }
      }
      poly = out
    }
  return poly
}

function makeRand(seed: number) {
  let s = seed % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/** Same lattice, deliberately ugly basis: long, nearly parallel vectors that still fit on screen. */
function scramble(b1: V, b2: V, seed: number): [V, V] {
  const [r1, r2] = gauss(b1, b2)
  const cands: [V, V, number][] = []
  for (let a = -5; a <= 5; a++)
    for (let b = -5; b <= 5; b++)
      for (let c = -5; c <= 5; c++)
        for (let d = -5; d <= 5; d++) {
          if (Math.abs(a * d - b * c) !== 1) continue
          const u = comb(r1, r2, a, b)
          const v = comb(r1, r2, c, d)
          if (norm(u) > 150 || norm(v) > 150 || Math.abs(u.x) > HW - 12 || Math.abs(v.x) > HW - 12) continue
          if (Math.abs(u.y) > HH - 12 || Math.abs(v.y) > HH - 12) continue
          cands.push([u, v, (norm(u) * norm(v)) / Math.abs(det(u, v))])
        }
  cands.sort((p, q) => q[2] - p[2])
  const top = cands.slice(0, 6)
  if (!top.length) return [b1, b2]
  const pick = top[Math.floor(makeRand(seed)() * top.length)]
  return [pick[0], pick[1]]
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

const START_B1: V = { x: 46, y: 0 }
const START_B2: V = { x: 17, y: -40 }

export function CvpDemo() {
  const reduced = usePrefersReducedMotion()
  const [b1, setB1] = useState<V>(START_B1)
  const [b2, setB2] = useState<V>(START_B2)
  const [t, setT] = useState<V>({ x: 62, y: 38 })
  const [rain, setRain] = useState<{ p: V; ok: boolean }[]>([])
  const [raining, setRaining] = useState(false)
  const [seed, setSeed] = useState(3)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drag = useRef<null | 'b1' | 'b2' | 't'>(null)

  const [r1, r2] = useMemo(() => gauss(b1, b2), [b1, b2])
  const cell = useMemo(() => voronoiCell(r1, r2), [r1, r2])

  const points = useMemo(() => {
    const out: V[] = []
    const R = 30
    for (let i = -R; i <= R; i++)
      for (let j = -R; j <= R; j++) {
        const p = comb(r1, r2, i, j)
        if (Math.abs(p.x) <= HW + 30 && Math.abs(p.y) <= HH + 30) out.push(p)
      }
    return out
  }, [r1, r2])

  const cvp = closest(t, r1, r2)
  const bab = babai(t, b1, b2)
  const dTrue = dist(cvp, t)
  const dBab = dist(bab, t)
  const babaiOk = dist(cvp, bab) < 1e-6
  const ratio = dTrue < 1e-6 ? 1 : dBab / dTrue

  // Monte Carlo over one fundamental domain: how often is rounding right?
  const stats = useMemo(() => {
    const rand = makeRand(12345)
    let ok = 0
    let worst = 1
    let sum = 0
    const N = 3000
    for (let s = 0; s < N; s++) {
      const p = add(scale(r1, rand()), scale(r2, rand()))
      const c = closest(p, r1, r2)
      const b = babai(p, b1, b2)
      const dc = dist(c, p)
      const r = dc < 1e-6 ? 1 : dist(b, p) / dc
      if (r < 1 + 1e-9) ok++
      worst = Math.max(worst, r)
      sum += r
    }
    return { okRate: ok / N, worst, mean: sum / N }
  }, [r1, r2, b1, b2])

  const defect = (norm(b1) * norm(b2)) / Math.abs(det(b1, b2))

  // Rain: drop random targets, color by whether rounding is right.
  useEffect(() => {
    if (!raining) return
    const rand = makeRand(Date.now() % 1000003)
    let raf = 0
    const tick = () => {
      const batch: { p: V; ok: boolean }[] = []
      for (let s = 0; s < (reduced ? 400 : 12); s++) {
        const p = { x: (rand() * 2 - 1) * HW, y: (rand() * 2 - 1) * HH }
        batch.push({ p, ok: dist(closest(p, r1, r2), babai(p, b1, b2)) < 1e-6 })
      }
      setRain((prev) => {
        const next = prev.concat(batch)
        return next.length > RAIN_MAX ? next.slice(next.length - RAIN_MAX) : next
      })
      if (reduced) {
        setRaining(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [raining, reduced, r1, r2, b1, b2])

  function toLocal(e: RPointerEvent<SVGElement>): V | null {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: pt.x, y: pt.y }
  }

  function onDown(e: RPointerEvent<SVGSVGElement>) {
    const p = toLocal(e)
    if (!p) return
    const h = (e.target as Element).getAttribute('data-handle')
    if (h === 'b1' || h === 'b2') drag.current = h
    else {
      drag.current = 't'
      setT(p)
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onMove(e: RPointerEvent<SVGSVGElement>) {
    if (!drag.current) return
    const p = toLocal(e)
    if (!p) return
    const c = { x: Math.max(-HW + 6, Math.min(HW - 6, p.x)), y: Math.max(-HH + 6, Math.min(HH - 6, p.y)) }
    if (drag.current === 't') {
      setT(c)
      return
    }
    if (norm(c) < 22) return
    const nb1 = drag.current === 'b1' ? c : b1
    const nb2 = drag.current === 'b2' ? c : b2
    // Keep the lattice from collapsing: bounded area and no very short vectors.
    if (Math.abs(det(nb1, nb2)) < 700 || norm(gauss(nb1, nb2)[0]) < 20) return
    setB1(nb1)
    setB2(nb2)
    setRain([])
  }

  function onUp() {
    drag.current = null
  }

  function setBasis(u: V, v: V) {
    setB1(u)
    setB2(v)
    setRain([])
  }

  const cellPath = (o: V) => `M${cell.map((p) => `${p.x + o.x},${p.y + o.y}`).join(' L')} Z`
  const para = (o: V) => {
    const h1 = scale(b1, 0.5)
    const h2 = scale(b2, 0.5)
    const pts = [
      add(add(o, h1), h2),
      add(add(o, h1), scale(h2, -1)),
      add(add(o, scale(h1, -1)), scale(h2, -1)),
      add(add(o, scale(h1, -1)), h2),
    ]
    return `M${pts.map((p) => `${p.x},${p.y}`).join(' L')} Z`
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Good basis, bad basis, same lattice</h3>
      <p className="demo-hint">
        Drag the gold target anywhere. The teal cell is every spot whose closest lattice point is its
        center (the true answer). The dashed gold box is what Babai rounding thinks, using the basis
        arrows you hold. Scramble the basis: the dots do not move at all, but rounding goes badly wrong.
        Then let it rain targets.
      </p>

      <svg
        ref={svgRef}
        viewBox={`${-HW} ${-HH} ${HW * 2} ${HH * 2}`}
        role="img"
        aria-label={`Lattice closest-vector game. True distance ${dTrue.toFixed(1)}, Babai rounding distance ${dBab.toFixed(1)}.`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <filter id="cvp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="cvp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#e8f2ef" />
          </marker>
        </defs>

        {/* Voronoi honeycomb */}
        {points.map((p, i) => (
          <path key={`c${i}`} d={cellPath(p)} fill="none" stroke="#1d2b27" strokeWidth={0.8} />
        ))}

        {/* Rain */}
        {rain.map((r, i) => (
          <circle key={`r${i}`} cx={r.p.x} cy={r.p.y} r={1.6} fill={r.ok ? '#2ee6c5' : '#ff6b6b'} opacity={0.75} />
        ))}

        <path d={cellPath(cvp)} fill="#2ee6c5" fillOpacity={0.14} stroke="#2ee6c5" strokeWidth={1.6} filter="url(#cvp-glow)" />
        <path d={para(bab)} fill="#f0c95a" fillOpacity={0.06} stroke="#f0c95a" strokeWidth={1.3} strokeDasharray="5 4" />

        {points.map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r={2.6} fill="#8aa39a" />
        ))}

        {/* Basis arrows */}
        <line x1={0} y1={0} x2={b1.x} y2={b1.y} stroke="#e8f2ef" strokeWidth={1.8} markerEnd="url(#cvp-arrow)" />
        <line x1={0} y1={0} x2={b2.x} y2={b2.y} stroke="#e8f2ef" strokeWidth={1.8} markerEnd="url(#cvp-arrow)" />
        <circle data-handle="b1" cx={b1.x} cy={b1.y} r={9} fill="#e8f2ef" fillOpacity={0.18} stroke="#e8f2ef" style={{ cursor: 'grab' }} />
        <circle data-handle="b2" cx={b2.x} cy={b2.y} r={9} fill="#e8f2ef" fillOpacity={0.18} stroke="#e8f2ef" style={{ cursor: 'grab' }} />
        <text x={b1.x + 10} y={b1.y - 8} fontSize="10" fill="#e8f2ef" fontFamily="IBM Plex Mono" pointerEvents="none">
          b₁
        </text>
        <text x={b2.x + 10} y={b2.y - 8} fontSize="10" fill="#e8f2ef" fontFamily="IBM Plex Mono" pointerEvents="none">
          b₂
        </text>

        {/* Answers */}
        {!babaiOk ? (
          <line x1={t.x} y1={t.y} x2={bab.x} y2={bab.y} stroke="#ff6b6b" strokeWidth={1.6} strokeDasharray="4 3" />
        ) : null}
        <line x1={t.x} y1={t.y} x2={cvp.x} y2={cvp.y} stroke="#2ee6c5" strokeWidth={2} />
        <circle cx={cvp.x} cy={cvp.y} r={5.5} fill="#2ee6c5" filter="url(#cvp-glow)" />
        {!babaiOk ? <circle cx={bab.x} cy={bab.y} r={5.5} fill="none" stroke="#ff6b6b" strokeWidth={2} /> : null}
        <g filter="url(#cvp-glow)" pointerEvents="none">
          <circle cx={t.x} cy={t.y} r={6.5} fill="#f0c95a" />
          <circle cx={t.x} cy={t.y} r={2} fill="#070b0a" />
        </g>

        <rect x={-HW + 6} y={-HH + 6} width={176} height={22} rx={4} fill="#070b0a" opacity={0.85} />
        <text x={-HW + 12} y={-HH + 21} fontSize="10" fontFamily="IBM Plex Mono" fill={babaiOk ? '#6dffb0' : '#ff6b6b'}>
          {babaiOk ? 'rounding found the closest point' : `rounding is ${ratio.toFixed(2)}× too far`}
        </text>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button
          type="button"
          style={small}
          className="btn"
          onClick={() => {
            const s = seed + 1
            setSeed(s)
            const [u, v] = scramble(b1, b2, s)
            setBasis(u, v)
          }}
        >
          Scramble basis (same lattice)
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => setBasis(r1, r2)}>
          Reduce basis (Gauss/LLL)
        </button>
        <button
          type="button"
          style={small}
          className={raining ? 'btn' : 'btn btn-ghost'}
          aria-pressed={raining}
          onClick={() => setRaining((r) => !r)}
        >
          {raining ? 'Stop rain' : 'Rain targets'}
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => setBasis(START_B1, START_B2)}>
          Reset
        </button>
      </div>

      <p className="stat" role="status">
        True distance {dTrue.toFixed(1)} · rounding distance {dBab.toFixed(1)} · basis skew{' '}
        {defect.toFixed(2)} (1 = perfectly square)
      </p>
      <div style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="pill-inline">Rounding is exactly right on this share of targets</span>
          <span className="stat">{(stats.okRate * 100).toFixed(1)}%</span>
        </div>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${stats.okRate * 100}%`, transition: 'width 300ms' }} />
        </div>
        <span className="pill-inline">
          Average overshoot {stats.mean.toFixed(2)}× · worst sampled {stats.worst.toFixed(2)}× (3000
          random targets)
        </span>
      </div>
      <p className="demo-callout">
        In 2D the exact answer is a few lines of code, and this page computes it. The 2026 claim is
        about n dimensions: a direct reduction from 3SAT makes even an n^(1/400)-factor approximation
        hard. Lattice cryptography leans on exactly this gap: the secret key is a good basis, the public
        key a scrambled one. This is a toy picture, not the reduction.
      </p>
    </div>
  )
}
