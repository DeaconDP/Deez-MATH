import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

/* ------------------------------------------------------------------ */
/* Geometry: pointy-top hexagonal tiles of circumradius a, in units    */
/* where the forbidden distance is exactly 1.                          */
/* ------------------------------------------------------------------ */

type Pt = { x: number; y: number }
type Preset = 7 | 6 | 5

const PAINTS = ['#2ee6c5', '#f0c95a', '#ff6b6b', '#7eb6ff', '#e28bff', '#ff9f43', '#b7f171']
const SCALE = 64 // svg px per unit length
const VW = 7
const VH = 4.6
const W = VW * SCALE
const H = VH * SCALE
const SQ3 = Math.sqrt(3)
const ARC_SAMPLES = 160
const SEVEN_LOW = 1 / Math.sqrt(7)

const mod = (n: number, m: number) => ((n % m) + m) % m
const key = (q: number, r: number) => `${q},${r}`
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
const len = (v: Pt) => Math.hypot(v.x, v.y)
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

function hexCenter(q: number, r: number, a: number): Pt {
  return { x: a * SQ3 * (q + r / 2), y: a * 1.5 * r }
}

function hexCorners(c: Pt, a: number): Pt[] {
  return Array.from({ length: 6 }, (_, i) => {
    const ang = (Math.PI / 180) * (60 * i - 30)
    return { x: c.x + a * Math.cos(ang), y: c.y + a * Math.sin(ang) }
  })
}

function pointToHex(p: Pt, a: number): [number, number] {
  const qf = ((SQ3 / 3) * p.x - p.y / 3) / a
  const rf = ((2 / 3) * p.y) / a
  const sf = -qf - rf
  let q = Math.round(qf)
  let r = Math.round(rf)
  const s = Math.round(sf)
  const dq = Math.abs(q - qf)
  const dr = Math.abs(r - rf)
  const ds = Math.abs(s - sf)
  if (dq > dr && dq > ds) q = -r - s
  else if (dr > ds) r = -q - s
  return [q, r]
}

/** Closest point on segment ab to p. */
function closestOnSeg(p: Pt, a: Pt, b: Pt): Pt {
  const ab = sub(b, a)
  const l2 = ab.x * ab.x + ab.y * ab.y
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2))
  return { x: a.x + ab.x * t, y: a.y + ab.y * t }
}

/** Exact min / max distance between two disjoint-interior convex polygons, with witness points. */
function polyMinMax(A: Pt[], B: Pt[]) {
  let min = Infinity
  let minPair: [Pt, Pt] = [A[0], B[0]]
  let max = 0
  let maxPair: [Pt, Pt] = [A[0], B[0]]
  for (const p of A) {
    for (const q of B) {
      const d = len(sub(p, q))
      if (d > max) {
        max = d
        maxPair = [p, q]
      }
    }
  }
  for (let i = 0; i < A.length; i++) {
    const a0 = A[i]
    const a1 = A[(i + 1) % A.length]
    for (let j = 0; j < B.length; j++) {
      const b0 = B[j]
      const b1 = B[(j + 1) % B.length]
      const cands: [Pt, Pt][] = [
        [a0, closestOnSeg(a0, b0, b1)],
        [a1, closestOnSeg(a1, b0, b1)],
        [closestOnSeg(b0, a0, a1), b0],
        [closestOnSeg(b1, a0, a1), b1],
      ]
      for (const [p, q] of cands) {
        const d = len(sub(p, q))
        if (d < min) {
          min = d
          minPair = [p, q]
        }
      }
    }
  }
  return { min, minPair, max, maxPair }
}

type Tile = { q: number; r: number; k: string; c: Pt; corners: Pt[] }

function tilesInView(a: number): Tile[] {
  const out: Tile[] = []
  const rMin = Math.floor(-a / (1.5 * a)) - 1
  const rMax = Math.ceil((VH + a) / (1.5 * a)) + 1
  for (let r = rMin; r <= rMax; r++) {
    const qMin = Math.floor((-a) / (a * SQ3) - r / 2) - 1
    const qMax = Math.ceil((VW + a) / (a * SQ3) - r / 2) + 1
    for (let q = qMin; q <= qMax; q++) {
      const c = hexCenter(q, r, a)
      if (c.x < -a || c.x > VW + a || c.y < -a || c.y > VH + a) continue
      out.push({ q, r, k: key(q, r), c, corners: hexCorners(c, a) })
    }
  }
  return out
}

type Witness = { p: Pt; q: Pt; color: number }

function findConflicts(tiles: Tile[], colorOf: (t: Tile) => number, a: number) {
  const witnesses: Witness[] = []
  const bad = new Set<string>()
  // Inside one tile: diameter 2a > 1 means a unit segment fits inside.
  if (2 * a > 1) {
    for (const t of tiles) {
      const dir = { x: (t.corners[0].x - t.c.x) / a, y: (t.corners[0].y - t.c.y) / a }
      witnesses.push({
        p: { x: t.c.x - dir.x / 2, y: t.c.y - dir.y / 2 },
        q: { x: t.c.x + dir.x / 2, y: t.c.y + dir.y / 2 },
        color: colorOf(t),
      })
      bad.add(t.k)
    }
  }
  for (let i = 0; i < tiles.length; i++) {
    const ti = tiles[i]
    const ci = colorOf(ti)
    for (let j = i + 1; j < tiles.length; j++) {
      const tj = tiles[j]
      if (colorOf(tj) !== ci) continue
      const dc = len(sub(ti.c, tj.c))
      if (dc - 2 * a > 1 || dc + 2 * a < 1) continue
      const { min, minPair, max, maxPair } = polyMinMax(ti.corners, tj.corners)
      if (!(min < 1 && max > 1)) continue
      // Both tiles are convex, so sliding the two endpoints linearly from the
      // closest pair to the farthest pair stays inside the tiles; distance is
      // continuous, so bisection finds a pair at distance exactly 1.
      let lo = 0
      let hi = 1
      for (let s = 0; s < 40; s++) {
        const mid = (lo + hi) / 2
        const d = len(sub(lerp(minPair[0], maxPair[0], mid), lerp(minPair[1], maxPair[1], mid)))
        if (d < 1) lo = mid
        else hi = mid
      }
      witnesses.push({
        p: lerp(minPair[0], maxPair[0], hi),
        q: lerp(minPair[1], maxPair[1], hi),
        color: ci,
      })
      bad.add(ti.k)
      bad.add(tj.k)
    }
  }
  return { witnesses, bad }
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

const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

export function PlaneFiveColorsDemo() {
  const reduced = usePrefersReducedMotion()
  const [preset, setPreset] = useState<Preset>(7)
  const [aHund, setAHund] = useState(45)
  const a = aHund / 100
  const [paint, setPaint] = useState<Map<string, number>>(() => new Map())
  const [brush, setBrush] = useState<number | null>(null)
  const [probeA, setProbeA] = useState<Pt>({ x: 3.4, y: 2.3 })
  const [theta, setTheta] = useState(0.4)
  const [spin, setSpin] = useState(!reduced)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<null | 'A' | 'B' | 'paint'>(null)
  const lastPainted = useRef<string>('')

  const tiles = useMemo(() => tilesInView(a), [a])

  const colorOfQR = (q: number, r: number) => paint.get(key(q, r)) ?? mod(q + 3 * r, preset)
  const colorOf = (t: Tile) => colorOfQR(t.q, t.r)

  const { witnesses, bad } = useMemo(
    () => findConflicts(tiles, (t) => paint.get(t.k) ?? mod(t.q + 3 * t.r, preset), a),
    [tiles, paint, preset, a],
  )

  const colorsUsed = useMemo(() => {
    const s = new Set<number>()
    for (const t of tiles) s.add(paint.get(t.k) ?? mod(t.q + 3 * t.r, preset))
    return s.size
  }, [tiles, paint, preset])

  // Auto-spin the probe.
  useEffect(() => {
    if (!spin || reduced) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setTheta((t) => (t + dt * 0.7) % (Math.PI * 2))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spin, reduced])

  const colorAt = (p: Pt) => {
    const [q, r] = pointToHex(p, a)
    return colorOfQR(q, r)
  }

  const probeB: Pt = { x: probeA.x + Math.cos(theta), y: probeA.y + Math.sin(theta) }
  const colA = colorAt(probeA)
  const colB = colorAt(probeB)
  const probeHit = colA === colB

  const arcs = useMemo(() => {
    const out: { p: Pt; q: Pt; color: number; hot: boolean }[] = []
    const [qa, ra] = pointToHex(probeA, a)
    const cA = paint.get(key(qa, ra)) ?? mod(qa + 3 * ra, preset)
    for (let i = 0; i < ARC_SAMPLES; i++) {
      const t0 = (i / ARC_SAMPLES) * Math.PI * 2
      const t1 = ((i + 1) / ARC_SAMPLES) * Math.PI * 2
      const tm = (t0 + t1) / 2
      const mid = { x: probeA.x + Math.cos(tm), y: probeA.y + Math.sin(tm) }
      const [q, r] = pointToHex(mid, a)
      const c = paint.get(key(q, r)) ?? mod(q + 3 * r, preset)
      out.push({
        p: { x: probeA.x + Math.cos(t0), y: probeA.y + Math.sin(t0) },
        q: { x: probeA.x + Math.cos(t1), y: probeA.y + Math.sin(t1) },
        color: c,
        hot: c === cA,
      })
    }
    return out
  }, [probeA, a, paint, preset])
  const hotFraction = arcs.filter((s) => s.hot).length / ARC_SAMPLES

  function toWorld(e: RPointerEvent<SVGElement>): Pt | null {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: pt.x / SCALE, y: pt.y / SCALE }
  }

  function paintAt(p: Pt) {
    if (brush === null) return
    const [q, r] = pointToHex(p, a)
    const k = key(q, r)
    if (k === lastPainted.current) return
    lastPainted.current = k
    setPaint((prev) => {
      const next = new Map(prev)
      next.set(k, brush)
      return next
    })
  }

  function onDown(e: RPointerEvent<SVGSVGElement>) {
    const p = toWorld(e)
    if (!p) return
    const target = (e.target as Element).getAttribute('data-handle')
    if (target === 'A' || target === 'B') {
      dragRef.current = target
      if (target === 'B') setSpin(false)
    } else if (brush !== null) {
      dragRef.current = 'paint'
      lastPainted.current = ''
      paintAt(p)
    } else {
      dragRef.current = 'A'
      setProbeA(p)
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onMove(e: RPointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    const p = toWorld(e)
    if (!p) return
    if (dragRef.current === 'A') {
      setProbeA({ x: Math.max(0, Math.min(VW, p.x)), y: Math.max(0, Math.min(VH, p.y)) })
    } else if (dragRef.current === 'B') {
      setTheta(Math.atan2(p.y - probeA.y, p.x - probeA.x))
    } else paintAt(p)
  }

  function onUp() {
    dragRef.current = null
  }

  function choosePreset(k: Preset) {
    setPreset(k)
    setPaint(new Map())
  }

  const paletteSize = 7
  const inWindow = a > SEVEN_LOW && a < 0.5
  const px = (v: number) => v * SCALE

  return (
    <div className="demo">
      <h3 className="demo-title">Hunt for a unit-distance clash</h3>
      <p className="demo-hint">
        Paint the plane in hexagonal tiles. Two points exactly 1 apart may never share a color. Drag
        the white probe (it is exactly 1 unit long) or let it spin: its ring is the whole unit circle,
        and any arc that matches the center&apos;s color glows red. Red sticks mark real same-color
        pairs at distance 1 found between tiles.
      </p>

      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        {([7, 6, 5] as Preset[]).map((k) => (
          <button
            key={k}
            type="button"
            style={small}
            className={preset === k && paint.size === 0 ? 'btn' : 'btn btn-ghost'}
            aria-pressed={preset === k && paint.size === 0}
            onClick={() => choosePreset(k)}
          >
            {k === 7 ? 'Classic 7-coloring' : `Same trick, ${k} colors`}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Hex-tiled plane using ${colorsUsed} colors. ${witnesses.length} same-color unit-distance pairs in view. Probe ends are ${probeHit ? 'the same color' : 'different colors'}.`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ cursor: brush === null ? 'grab' : 'crosshair' }}
      >
        <defs>
          <filter id="pfc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {tiles.map((t) => {
          const c = colorOf(t)
          return (
            <polygon
              key={t.k}
              points={t.corners.map((p) => `${px(p.x)},${px(p.y)}`).join(' ')}
              fill={PAINTS[c]}
              fillOpacity={bad.has(t.k) ? 0.62 : 0.34}
              stroke={bad.has(t.k) ? '#ff6b6b' : '#070b0a'}
              strokeWidth={bad.has(t.k) ? 1.4 : 1.2}
            />
          )
        })}

        {/* Witness unit segments */}
        <g filter="url(#pfc-glow)">
          {witnesses.slice(0, 400).map((w, i) => (
            <line
              key={i}
              x1={px(w.p.x)}
              y1={px(w.p.y)}
              x2={px(w.q.x)}
              y2={px(w.q.y)}
              stroke="#ff6b6b"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Unit circle around probe center, colored by what it crosses */}
        {arcs.map((s, i) => (
          <line
            key={i}
            x1={px(s.p.x)}
            y1={px(s.p.y)}
            x2={px(s.q.x)}
            y2={px(s.q.y)}
            stroke={s.hot ? '#ff6b6b' : PAINTS[s.color]}
            strokeWidth={s.hot ? 6 : 3}
            strokeLinecap="butt"
            opacity={s.hot ? 1 : 0.9}
            filter={s.hot ? 'url(#pfc-glow)' : undefined}
            pointerEvents="none"
          />
        ))}

        {/* Probe */}
        <line
          x1={px(probeA.x)}
          y1={px(probeA.y)}
          x2={px(probeB.x)}
          y2={px(probeB.y)}
          stroke={probeHit ? '#ff6b6b' : '#e8f2ef'}
          strokeWidth={probeHit ? 4 : 2.5}
          filter={probeHit ? 'url(#pfc-glow)' : undefined}
          pointerEvents="none"
        />
        <circle
          data-handle="A"
          cx={px(probeA.x)}
          cy={px(probeA.y)}
          r={11}
          fill={PAINTS[colA]}
          stroke="#e8f2ef"
          strokeWidth={2.5}
          style={{ cursor: 'move' }}
        />
        <circle
          data-handle="B"
          cx={px(probeB.x)}
          cy={px(probeB.y)}
          r={9}
          fill={PAINTS[colB]}
          stroke={probeHit ? '#ff6b6b' : '#e8f2ef'}
          strokeWidth={2.5}
          style={{ cursor: 'grab' }}
        />
        <text
          x={px(probeA.x)}
          y={px(probeA.y) + 3.5}
          textAnchor="middle"
          fontSize="9"
          fontFamily="IBM Plex Mono"
          fill="#041210"
          pointerEvents="none"
        >
          1
        </text>
        <rect x={8} y={8} width={196} height={24} rx={4} fill="#070b0a" opacity={0.82} />
        <text x={16} y={24} fontSize="11" fontFamily="IBM Plex Mono" fill={witnesses.length ? '#ff6b6b' : '#6dffb0'}>
          {witnesses.length
            ? `${witnesses.length} unit clashes in view`
            : 'no unit clash in view'}
        </text>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button
          type="button"
          style={small}
          className={brush === null ? 'btn' : 'btn btn-ghost'}
          aria-pressed={brush === null}
          onClick={() => setBrush(null)}
        >
          Move probe
        </button>
        {PAINTS.slice(0, paletteSize).map((hex, i) => (
          <button
            key={hex}
            type="button"
            style={{ ...small, padding: '0 0.55rem' }}
            className={brush === i ? 'btn' : 'btn btn-ghost'}
            aria-pressed={brush === i}
            aria-label={`Paint with color ${i + 1}`}
            onClick={() => setBrush(i)}
          >
            <span
              aria-hidden="true"
              style={{ width: '1rem', height: '1rem', borderRadius: 999, background: hex, display: 'inline-block' }}
            />
          </button>
        ))}
        <button
          type="button"
          style={small}
          className={spin ? 'btn' : 'btn btn-ghost'}
          aria-pressed={spin}
          disabled={reduced}
          onClick={() => setSpin((s) => !s)}
        >
          {spin ? 'Spinning' : 'Spin probe'}
        </button>
      </div>

      <div className="controls" style={{ marginTop: 0 }}>
        <DimSlider
          label="Tile radius a (unit = 1)"
          value={aHund}
          min={33}
          max={58}
          onChange={setAHund}
          format={(v) => `${(v / 100).toFixed(2)}${v / 100 > SEVEN_LOW && v / 100 < 0.5 ? '  (inside 1/√7 < a < 1/2)' : ''}`}
        />
      </div>

      <p className="stat" role="status">
        Probe ends: color {colA + 1} and color {colB + 1}
        {probeHit ? ' — same color at distance 1!' : ''} · {Math.round(hotFraction * 100)}% of the unit
        circle around the center shares its color · colors in view: {colorsUsed}
      </p>
      <p className={`feedback ${witnesses.length ? 'err' : 'ok'}`}>
        {witnesses.length === 0
          ? preset === 7 && paint.size === 0
            ? 'The classical hexagon 7-coloring: tiles are under 1 wide, and same-color tiles sit more than 1 apart.'
            : 'No clash in this window. A finite window can sometimes be patched; the claim is about the whole plane.'
          : 2 * a > 1
            ? 'Tiles wider than 1 contain a unit segment inside a single tile.'
            : preset === 7 && paint.size === 0 && !inWindow
              ? 'Same-color tiles are now closer than 1 apart: the 7-coloring only works for 1/√7 < a < 1/2.'
              : 'Same-color tiles within reach of each other: each red stick is a pair of points exactly 1 apart.'}
      </p>
      <p className="demo-callout">
        Tile patterns are a toy: the 2026 claim says every 5-coloring of every point of the plane, not
        just tilings, has a same-color pair at distance 1. Seven colors are known to suffice, so the
        answer is 6 or 7. This page does not check the proof, and the 6-color tile failure above says
        nothing about 6 in general.
      </p>
    </div>
  )
}
