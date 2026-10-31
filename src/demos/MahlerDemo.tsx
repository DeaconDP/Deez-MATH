import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

type V = { x: number; y: number }
type Mode = 'general' | 'symmetric'

const SIZE = 360
const SCALE = 72
const C = SIZE / 2

const FLOOR_GENERAL = 27 / 4 // triangle in the plane: (n+1)^(n+1)/(n!)^2 at n = 2
const FLOOR_SYMMETRIC = 8 // square (the 2D Hanner polytope): 4^n/n! at n = 2
const CEILING = Math.PI ** 2 // ellipse, Blaschke–Santaló

const toSvg = (p: V) => ({ x: C + p.x * SCALE, y: C - p.y * SCALE })

function regular(n: number, r: number, phase = Math.PI / 2): V[] {
  return Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * Math.PI * 2
    return { x: r * Math.cos(a), y: r * Math.sin(a) }
  })
}

const cross = (o: V, a: V, b: V) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

/** Andrew monotone chain. Returns hull indices into pts, counter-clockwise. */
function hullIdx(pts: V[]): number[] {
  const idx = pts.map((_, i) => i).sort((i, j) => pts[i].x - pts[j].x || pts[i].y - pts[j].y)
  if (idx.length < 3) return idx
  const lower: number[] = []
  for (const i of idx) {
    while (lower.length >= 2 && cross(pts[lower[lower.length - 2]], pts[lower[lower.length - 1]], pts[i]) <= 1e-12) lower.pop()
    lower.push(i)
  }
  const upper: number[] = []
  for (let k = idx.length - 1; k >= 0; k--) {
    const i = idx[k]
    while (upper.length >= 2 && cross(pts[upper[upper.length - 2]], pts[upper[upper.length - 1]], pts[i]) <= 1e-12) upper.pop()
    upper.push(i)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

function area(poly: V[]) {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    s += a.x * b.y - a.y * b.x
  }
  return Math.abs(s) / 2
}

/** Vertices of (K − z)°, one per edge of K. Vertex i is dual to edge (i, i+1). */
function polar(hull: V[], z: V): V[] | null {
  const out: V[] = []
  for (let i = 0; i < hull.length; i++) {
    const a = { x: hull[i].x - z.x, y: hull[i].y - z.y }
    const b = { x: hull[(i + 1) % hull.length].x - z.x, y: hull[(i + 1) % hull.length].y - z.y }
    const det = a.x * b.y - a.y * b.x
    if (det <= 1e-9) return null // z is not strictly inside K
    out.push({ x: (b.y - a.y) / det, y: (a.x - b.x) / det })
  }
  return out
}

function polarArea(hull: V[], z: V) {
  const p = polar(hull, z)
  return p ? area(p) : Infinity
}

/** Santaló point: the interior point minimizing |(K − z)°|. Nelder–Mead in 2D (the function is convex). */
function santalo(hull: V[]): V {
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length
  let simplex: { p: V; f: number }[] = [
    { x: cx, y: cy },
    { x: cx + 0.05, y: cy },
    { x: cx, y: cy + 0.05 },
  ].map((p) => ({ p, f: polarArea(hull, p) }))
  for (let it = 0; it < 220; it++) {
    simplex.sort((a, b) => a.f - b.f)
    const [best, mid, worst] = simplex
    if (Math.abs(worst.f - best.f) < 1e-12) break
    const m = { x: (best.p.x + mid.p.x) / 2, y: (best.p.y + mid.p.y) / 2 }
    const at = (t: number) => {
      const p = { x: m.x + t * (worst.p.x - m.x), y: m.y + t * (worst.p.y - m.y) }
      return { p, f: polarArea(hull, p) }
    }
    const r = at(-1)
    if (r.f < best.f) {
      const e = at(-2)
      simplex = [best, mid, e.f < r.f ? e : r]
    } else if (r.f < mid.f) {
      simplex = [best, mid, r]
    } else {
      const c = at(0.5)
      if (c.f < worst.f) simplex = [best, mid, c]
      else
        simplex = [best, ...[mid, worst].map((s) => {
          const p = { x: (s.p.x + best.p.x) / 2, y: (s.p.y + best.p.y) / 2 }
          return { p, f: polarArea(hull, p) }
        })]
    }
  }
  simplex.sort((a, b) => a.f - b.f)
  return simplex[0].p
}

function presetsFor(mode: Mode) {
  return mode === 'general'
    ? [
        { label: 'Triangle', pts: () => regular(3, 1.05) },
        { label: 'Square', pts: () => regular(4, 1.2, Math.PI / 4) },
        { label: 'Hexagon', pts: () => regular(6, 1.25) },
        { label: 'Near-disk', pts: () => regular(24, 1.2) },
        { label: 'Kite', pts: () => [{ x: 0, y: 1.4 }, { x: -0.9, y: 0.1 }, { x: 0, y: -0.7 }, { x: 0.9, y: 0.1 }] },
      ]
    : [
        { label: 'Square', pts: () => regular(4, 1.2, Math.PI / 4) },
        { label: 'Hexagon', pts: () => regular(6, 1.25) },
        { label: 'Octagon', pts: () => regular(8, 1.2) },
        { label: 'Near-disk', pts: () => regular(24, 1.2) },
      ]
}

type Mat = [number, number, number, number]
const apply = (m: Mat, p: V): V => ({ x: m[0] * p.x + m[1] * p.y, y: m[2] * p.x + m[3] * p.y })

function fitToView(pts: V[]): V[] {
  const r = Math.max(...pts.map((p) => Math.hypot(p.x, p.y)))
  const k = r > 0 ? 1.35 / r : 1
  return pts.map((p) => ({ x: p.x * k, y: p.y * k }))
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function MahlerDemo() {
  const [mode, setMode] = useState<Mode>('general')
  const [pts, setPts] = useState<V[]>(() => regular(3, 1.05))
  const [drag, setDrag] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [morphing, setMorphing] = useState(false)
  const [lastBefore, setLastBefore] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])

  const geo = useMemo(() => {
    const idx = hullIdx(pts)
    const hull = idx.map((i) => pts[i])
    if (hull.length < 3 || area(hull) < 1e-4) return null
    const s = mode === 'symmetric' ? { x: 0, y: 0 } : santalo(hull)
    const pol = polar(hull, s)
    if (!pol) return null
    const vol = area(hull)
    const pvol = area(pol)
    return { idx, hull, s, pol, vol, pvol, product: vol * pvol }
  }, [pts, mode])

  const floor = mode === 'general' ? FLOOR_GENERAL : FLOOR_SYMMETRIC

  const toWorld = useCallback((e: ReactPointerEvent) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const x = Math.max(-2.3, Math.min(2.3, (pt.x - C) / SCALE))
    const y = Math.max(-2.3, Math.min(2.3, (C - pt.y) / SCALE))
    return { x, y }
  }, [])

  function moveVertex(i: number, p: V) {
    setPts((prev) => {
      const next = prev.slice()
      next[i] = p
      if (mode === 'symmetric') {
        const m = prev.length / 2
        next[(i + m) % prev.length] = { x: -p.x, y: -p.y }
      }
      return next
    })
  }

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (morphing) return
    const w = toWorld(e)
    if (!w) return
    let best = -1
    let bd = 0.32
    pts.forEach((p, i) => {
      const d = Math.hypot(p.x - w.x, p.y - w.y)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    if (best >= 0) {
      setDrag(best)
      setLastBefore(null)
      svgRef.current?.setPointerCapture(e.pointerId)
    }
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const w = toWorld(e)
    if (!w) return
    if (drag != null) {
      moveVertex(drag, w)
      return
    }
    let best: number | null = null
    let bd = 0.25
    pts.forEach((p, i) => {
      const d = Math.hypot(p.x - w.x, p.y - w.y)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    setHover(best)
  }

  function endDrag(e: ReactPointerEvent<SVGSVGElement>) {
    if (drag != null && svgRef.current?.hasPointerCapture(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
    setDrag(null)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setLastBefore(null)
    setPts(m === 'general' ? regular(3, 1.05) : regular(4, 1.2, Math.PI / 4))
  }

  /** Random linear map with positive diagonal, so the straight-line path from I stays invertible. */
  function stretch() {
    if (morphing || !geo) return
    const s = 0.55 + Math.random() * 0.9
    const h = (Math.random() - 0.5) * 1.6
    const A: Mat = [s, h, 0, 1 / s]
    const start = pts
    const center = mode === 'general' ? geo.s : { x: 0, y: 0 }
    const target = fitToView(start.map((p) => apply(A, { x: p.x - center.x, y: p.y - center.y })))
    setLastBefore(geo.product)
    if (reducedMotion()) {
      setPts(target)
      return
    }
    setMorphing(true)
    const t0 = performance.now()
    const dur = 1100
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const k = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      setPts(start.map((p, i) => ({ x: p.x + (target[i].x - p.x) * k, y: p.y + (target[i].y - p.y) * k })))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else {
        rafRef.current = null
        setMorphing(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const active = drag ?? hover
  const activeHullPos = geo && active != null ? geo.idx.indexOf(active) : -1

  // Gauge: maps [6.4, 10.1] onto the bar
  const G0 = 6.4
  const G1 = 10.1
  const gx = (v: number) => 14 + ((Math.max(G0, Math.min(G1, v)) - G0) / (G1 - G0)) * 332
  const product = geo?.product ?? NaN
  const ratio = product / floor

  const kPath = geo ? geo.hull.map((p, i) => `${i ? 'L' : 'M'}${toSvg(p).x},${toSvg(p).y}`).join(' ') + 'Z' : ''
  const polWorld = geo ? geo.pol.map((p) => ({ x: geo.s.x + p.x, y: geo.s.y + p.y })) : []
  const pPath = polWorld.map((p, i) => `${i ? 'L' : 'M'}${toSvg(p).x},${toSvg(p).y}`).join(' ') + (polWorld.length ? 'Z' : '')

  return (
    <div className="demo">
      <h3 className="demo-title">Shape × its polar: drag the corners</h3>
      <p className="demo-hint">
        Teal is a convex shape K. Gold is its polar K°: every point y with x·y ≤ 1 for all x in K, measured from the
        white cross (the Santaló point, where the polar is smallest). Drag a corner. Each corner of K becomes an
        edge of K°. Pointy shapes have fat polars. Then hit <em>Random stretch</em>.
      </p>
      <div className="btn-row" role="group" aria-label="Body type" style={{ marginBottom: 'var(--space-3)' }}>
        {(['general', 'symmetric'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={m === mode ? 'btn' : 'btn btn-ghost'}
            aria-pressed={m === mode}
            onClick={() => switchMode(m)}
          >
            {m === 'general' ? 'Any convex body' : 'Symmetric bodies'}
          </button>
        ))}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Convex body with ${geo?.hull.length ?? 0} corners and its polar. Volume product ${product.toFixed(3)}.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => setHover(null)}
        style={{ cursor: drag != null ? 'grabbing' : hover != null ? 'grab' : 'default' }}
      >
        <defs>
          <filter id="mahler-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="mahler-k" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2ee6c5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2ee6c5" stopOpacity="0.08" />
          </radialGradient>
        </defs>
        {[-2, -1, 0, 1, 2].map((t) => (
          <g key={t} stroke="#16211e" strokeWidth="1">
            <line x1={C + t * SCALE} y1={0} x2={C + t * SCALE} y2={SIZE} />
            <line x1={0} y1={C + t * SCALE} x2={SIZE} y2={C + t * SCALE} />
          </g>
        ))}
        {geo ? (
          <>
            <path d={pPath} fill="rgba(240,201,90,0.08)" stroke="#f0c95a" strokeWidth="1.8" strokeLinejoin="round" filter="url(#mahler-glow)" />
            <path d={kPath} fill="url(#mahler-k)" stroke="#2ee6c5" strokeWidth="2.2" strokeLinejoin="round" filter="url(#mahler-glow)" />
            {activeHullPos >= 0 ? (
              (() => {
                // vertex j of K ↔ the polar edge between polar vertices j−1 and j
                const n = geo.hull.length
                const a = toSvg(polWorld[(activeHullPos - 1 + n) % n])
                const b = toSvg(polWorld[activeHullPos])
                return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
              })()
            ) : null}
            <g stroke="#e8f2ef" strokeWidth="1.6">
              <line x1={toSvg(geo.s).x - 6} y1={toSvg(geo.s).y} x2={toSvg(geo.s).x + 6} y2={toSvg(geo.s).y} />
              <line x1={toSvg(geo.s).x} y1={toSvg(geo.s).y - 6} x2={toSvg(geo.s).x} y2={toSvg(geo.s).y + 6} />
            </g>
          </>
        ) : null}
        {pts.map((p, i) => {
          const q = toSvg(p)
          const onHull = geo?.idx.includes(i)
          const isActive = i === active
          return (
            <circle
              key={i}
              cx={q.x}
              cy={q.y}
              r={isActive ? 9 : pts.length > 12 ? 4 : 7}
              fill={onHull ? (isActive ? '#ffffff' : '#2ee6c5') : '#070b0a'}
              stroke={onHull ? '#041210' : '#8aa39a'}
              strokeWidth="1.5"
              strokeDasharray={onHull ? undefined : '2 2'}
            />
          )
        })}
        <text x={10} y={18} fill="#2ee6c5" fontSize="12" fontFamily="IBM Plex Mono">
          K  area {geo ? geo.vol.toFixed(3) : '-'}
        </text>
        <text x={10} y={34} fill="#f0c95a" fontSize="12" fontFamily="IBM Plex Mono">
          K° area {geo ? geo.pvol.toFixed(3) : '-'}
        </text>
      </svg>

      <svg viewBox="0 0 360 74" role="img" aria-label={`Volume product gauge: ${product.toFixed(3)}`} style={{ marginTop: 'var(--space-3)' }}>
        <defs>
          <linearGradient id="mahler-gauge" x1="0" x2="1">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="20%" stopColor="#f0c95a" />
            <stop offset="100%" stopColor="#2ee6c5" />
          </linearGradient>
        </defs>
        <rect x={14} y={30} width={332} height={10} rx={5} fill="url(#mahler-gauge)" opacity="0.35" />
        <rect x={14} y={30} width={Math.max(0, gx(floor) - 14)} height={10} rx={5} fill="#ff6b6b" opacity="0.25" />
        {[
          { v: FLOOR_GENERAL, t: 'triangle 6.75', on: mode === 'general' },
          { v: FLOOR_SYMMETRIC, t: 'square 8', on: mode === 'symmetric' },
          { v: CEILING, t: 'ellipse π²', on: true },
        ].map((m) => (
          <g key={m.t} opacity={m.on ? 1 : 0.35}>
            <line x1={gx(m.v)} y1={24} x2={gx(m.v)} y2={46} stroke="#e8f2ef" strokeWidth="1" />
            <text x={gx(m.v)} y={60} textAnchor="middle" fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
              {m.t}
            </text>
          </g>
        ))}
        {Number.isFinite(product) ? (
          <g style={{ transition: 'transform 120ms linear' }} transform={`translate(${gx(product)},0)`}>
            <path d="M0,27 L-6,14 L6,14 Z" fill="#ffffff" />
            <text x={0} y={10} textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="IBM Plex Mono">
              {product.toFixed(3)}
            </text>
          </g>
        ) : null}
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        {presetsFor(mode).map((p) => (
          <button
            key={p.label}
            type="button"
            className="btn btn-ghost"
            disabled={morphing}
            onClick={() => {
              setLastBefore(null)
              setPts(p.pts())
            }}
          >
            {p.label}
          </button>
        ))}
        <button type="button" className="btn" onClick={stretch} disabled={morphing || !geo}>
          Random stretch
        </button>
      </div>

      <p className="stat" role="status">
        |K|·|K°| = {Number.isFinite(product) ? product.toFixed(4) : 'n/a'} · {Number.isFinite(ratio) ? ratio.toFixed(3) : '-'}× the{' '}
        {mode === 'general' ? 'triangle' : 'square'} floor
        {lastBefore != null && !morphing ? ` · before stretch ${lastBefore.toFixed(4)}` : ''}
      </p>
      <p className="feedback ok" style={{ minHeight: '1.2em' }}>
        {lastBefore != null && !morphing && Math.abs(lastBefore - product) < 1e-3
          ? 'Same number. Linear stretches squash K and inflate K° by exactly the same factor, so the product only sees shape.'
          : Number.isFinite(ratio) && ratio < 1.0005
            ? `You are on the floor: the ${mode === 'general' ? 'triangle (simplex)' : 'square (Hanner polytope)'}. Try to go lower.`
            : ' '}
      </p>
      <p className="demo-callout">
        In the plane Mahler settled both cases himself in 1939, so this picture is the known 2D story, computed
        exactly for the polygon you drew. The October 2026 claim (not machine-checked) is that the same floors hold
        in every dimension: simplices for all convex bodies, Hanner polytopes (cube-like and octahedron-like
        building blocks) for symmetric ones.
      </p>
    </div>
  )
}
