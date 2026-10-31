import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

type V = [number, number]

const VIEW = 4.4 // world window [-VIEW, VIEW]
const BOX = 280
const S = BOX / (2 * VIEW)
const OX = 10 + BOX / 2
const OY = 10 + BOX / 2
const BOUND_2D = 4.5
const EPS = 1e-9

const toPx = (p: V): V => [OX + p[0] * S, OY - p[1] * S]
const cross = (o: V, a: V, b: V) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

function hull(pts: V[]): V[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const lower: V[] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: V[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)] // counter-clockwise
}

function areaCentroid(h: V[]) {
  let a = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < h.length; i++) {
    const p = h[i]
    const q = h[(i + 1) % h.length]
    const c = p[0] * q[1] - q[0] * p[1]
    a += c
    cx += (p[0] + q[0]) * c
    cy += (p[1] + q[1]) * c
  }
  a /= 2
  if (Math.abs(a) < 1e-12) return { area: 0, c: [0, 0] as V }
  return { area: Math.abs(a), c: [cx / (6 * a), cy / (6 * a)] as V }
}

/** -1 outside, 0 on boundary, 1 strictly inside (h counter-clockwise). */
function where(h: V[], p: V) {
  let onEdge = false
  for (let i = 0; i < h.length; i++) {
    const a = h[i]
    const b = h[(i + 1) % h.length]
    const c = cross(a, b, p) / Math.max(1e-12, Math.hypot(b[0] - a[0], b[1] - a[1]))
    if (c < -EPS * 1e3) return -1
    if (c < EPS * 1e3) onEdge = true
  }
  return onEdge ? 0 : 1
}

/** Lattice points c + Z^2 (lattice re-centered on the barycenter). */
function latticeScan(h: V[], c: V) {
  const pts: { p: V; k: -1 | 0 | 1; origin: boolean }[] = []
  const R = Math.ceil(VIEW) + 1
  for (let i = -R; i <= R; i++) {
    for (let j = -R; j <= R; j++) {
      const p: V = [c[0] + i, c[1] + j]
      if (Math.abs(p[0]) > VIEW || Math.abs(p[1]) > VIEW) continue
      pts.push({ p, k: h.length >= 3 ? (where(h, p) as -1 | 0 | 1) : -1, origin: i === 0 && j === 0 })
    }
  }
  return pts
}

function interiorCount(h: V[], c: V) {
  let n = 0
  const R = 12
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) if (where(h, [c[0] + i, c[1] + j]) === 1) n++
  return n
}

const scaleAbout = (pts: V[], c: V, f: number): V[] => pts.map((p) => [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f])

const PRESETS: { label: string; v: V[] }[] = [
  { label: 'Extremal triangle', v: [[-1, -1], [2, -1], [-1, 2]] },
  { label: 'Square', v: [[-1, -1], [1, -1], [1, 1], [-1, 1]] },
  { label: 'Hexagon', v: [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1]] },
  { label: 'Small kite', v: [[-0.7, -0.25], [0.45, -0.6], [0.65, 0.3], [-0.3, 0.5]] },
]

function factorial(n: number) {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

export function EhrhartDemo() {
  const [verts, setVerts] = useState<V[]>(PRESETS[1].v)
  const [best, setBest] = useState(0)
  const [animating, setAnimating] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragIdx = useRef<number | null>(null)
  const raf = useRef(0)

  const h = useMemo(() => hull(verts), [verts])
  const { area, c } = useMemo(() => areaCentroid(h), [h])
  const lattice = useMemo(() => latticeScan(h, c), [h, c])
  const interior = lattice.filter((l) => l.k === 1)
  const extra = interior.filter((l) => !l.origin).length
  const valid = h.length >= 3 && extra === 0
  const ratio = area / BOUND_2D

  useEffect(() => {
    if (valid && area > best + 1e-9) setBest(area)
  }, [valid, area, best])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const local = (e: ReactPointerEvent<SVGSVGElement>): V | null => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [Math.max(-VIEW, Math.min(VIEW, (pt.x - OX) / S)), Math.max(-VIEW, Math.min(VIEW, (OY - pt.y) / S))]
  }
  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const p = local(e)
    if (!p || animating) return
    let bestI = -1
    let bestD = 0.45
    verts.forEach((v, i) => {
      const d = Math.hypot(v[0] - p[0], v[1] - p[1])
      if (d < bestD) {
        bestD = d
        bestI = i
      }
    })
    if (bestI < 0) {
      if (verts.length >= 10) return
      bestI = verts.length // tap empty space: add a vertex
      setVerts([...verts, p])
    }
    dragIdx.current = bestI
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragIdx.current === null) return
    const p = local(e)
    if (!p) return
    const i = dragIdx.current
    setVerts((vs) => vs.map((v, k) => (k === i ? p : v)))
  }
  const onUp = () => {
    dragIdx.current = null
  }

  const inflate = () => {
    if (h.length < 3) return
    // Largest scale (about the barycenter) keeping it the only interior lattice point.
    // Bodies scaled about c are nested, so the count is monotone and bisection works.
    let lo = 0.01
    let hi = 12
    for (let it = 0; it < 50; it++) {
      const mid = (lo + hi) / 2
      if (interiorCount(scaleAbout(h, c, mid), c) <= 1) lo = mid
      else hi = mid
    }
    const target = lo * (1 - 1e-7)
    const start = verts
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVerts(scaleAbout(start, c, target))
      return
    }
    setAnimating(true)
    const t0 = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1100)
      const e = 1 - (1 - k) ** 3
      setVerts(scaleAbout(start, c, 1 + (target - 1) * e))
      if (k < 1) raf.current = requestAnimationFrame(tick)
      else setAnimating(false)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const bars = [1, 2, 3, 4, 5, 6].map((n) => ({ n, v: (n + 1) ** n / factorial(n) }))
  const maxLog = Math.log10(bars[bars.length - 1].v)
  const fillColor = valid ? `hsl(${168 - Math.min(1, ratio) * 120} 80% 55%)` : '#ff6b6b'
  const [cpx, cpy] = toPx(c)

  return (
    <div className="demo">
      <h3 className="demo-title">How fat can a body be around one lattice point?</h3>
      <p className="demo-hint">
        Drag the corners, or tap empty space to add one. The shape is their convex hull, and the
        grid of dots is re-centered on its center of mass (gold), so the center is always a lattice
        point. Goal: make the area as big as possible while gold stays the only lattice point strictly
        inside. Red dots break the rule. Scale to the limit grows or shrinks the shape about its center until the next dot just touches.
      </p>
      <svg
        ref={svgRef}
        viewBox="0 0 420 300"
        role="img"
        aria-label="Draggable convex polygon over a lattice centered at its barycenter, with a bar chart of the volume bound by dimension"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          <filter id="eh-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="eh-fill" cx="50%" cy="50%" r="60%">
            <stop offset="0" stopColor={fillColor} stopOpacity="0.4" />
            <stop offset="1" stopColor={fillColor} stopOpacity="0.12" />
          </radialGradient>
        </defs>
        <rect x={10} y={10} width={BOX} height={BOX} fill="#070b0a" stroke="#24332e" />
        {h.length >= 3 && (
          <polygon
            points={h.map((p) => toPx(p).join(',')).join(' ')}
            fill="url(#eh-fill)"
            stroke={fillColor}
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#eh-glow)"
          />
        )}
        {lattice.map((l, i) => {
          const [x, y] = toPx(l.p)
          if (l.origin) return null
          if (l.k === 1)
            return <circle key={i} cx={x} cy={y} r={5} fill="#ff6b6b" filter="url(#eh-glow)" />
          if (l.k === 0) return <circle key={i} cx={x} cy={y} r={3.5} fill="none" stroke="#2ee6c5" strokeWidth="1.5" />
          return <circle key={i} cx={x} cy={y} r={1.8} fill="#3a5049" />
        })}
        <circle cx={cpx} cy={cpy} r={6} fill="#f0c95a" filter="url(#eh-glow)" />
        {verts.map((v, i) => {
          const [x, y] = toPx(v)
          const onHull = h.some((q) => q[0] === v[0] && q[1] === v[1])
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={8}
              fill="#121a18"
              stroke={onHull ? '#e8f2ef' : '#3a5049'}
              strokeWidth="2"
              style={{ cursor: 'grab' }}
            />
          )
        })}

        {/* bound by dimension */}
        <text x={302} y={24} fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          bound (n+1)ⁿ/n!
        </text>
        {bars.map((b, i) => {
          const y = 36 + i * 34
          const w = 20 + (Math.log10(b.v) / maxLog) * 80
          const here = b.n === 2
          return (
            <g key={b.n}>
              <text x={302} y={y + 13} fill={here ? '#f0c95a' : '#8aa39a'} fontSize="9" fontFamily="IBM Plex Mono">
                n={b.n}
              </text>
              <rect x={326} y={y + 3} width={w} height={14} rx={2} fill={here ? '#f0c95a' : '#2ee6c5'} opacity={here ? 0.9 : 0.35} />
              <text x={330} y={y + 27} fill={here ? '#f0c95a' : '#8aa39a'} fontSize="8.5" fontFamily="IBM Plex Mono">
                {b.v < 100 ? b.v.toFixed(2).replace(/\.00$/, '') : b.v.toFixed(0)}
                {here ? ' ← this plane' : ''}
              </text>
            </g>
          )
        })}
      </svg>

      <div style={{ margin: 'var(--space-3) 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="pill-inline">Area vs. the sharp bound 9/2</span>
          <span className="stat" style={{ color: valid ? 'var(--fg)' : 'var(--danger)' }}>
            {area.toFixed(3)} / 4.5
          </span>
        </div>
        <div className="meter" aria-hidden="true" style={{ position: 'relative', overflow: 'visible' }}>
          <span
            style={{
              width: `${Math.min(100, ratio * 100)}%`,
              background: valid ? undefined : 'var(--danger)',
              transition: 'width 120ms linear',
            }}
          />
        </div>
      </div>
      <p className="stat" role="status" style={{ fontSize: '0.8rem', color: valid ? 'var(--ok)' : 'var(--danger)' }}>
        {valid
          ? `Valid: the barycenter is the only interior lattice point. Area ${area.toFixed(3)} ≤ 4.5.`
          : `Rule broken: ${extra} more lattice point${extra === 1 ? '' : 's'} inside. The bound does not apply.`}{' '}
        <span style={{ color: 'var(--muted)' }}>Best valid area so far: {best.toFixed(3)}.</span>
      </p>
      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        <button type="button" className="btn" onClick={inflate} disabled={animating || h.length < 3}>
          Scale to the limit
        </button>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="btn btn-ghost" onClick={() => setVerts(p.v)} disabled={animating}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="demo-callout">
        In the plane the ceiling is 9/2, reached by the extremal triangle. Ehrhart proved that case
        in the 1950s, and no amount of dragging beats it. The conjecture says (n+1)ⁿ/n! in every
        dimension n, reached by a simplex. The August 2026 Astra result claims a proof for all n.
        This demo only checks the plane, numerically.
      </p>
    </div>
  )
}
