import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

type V = [number, number]
type Mode = 'keller' | 'wrap'

const W = 3 // both panels show [-W, W]^2 at the same scale
const HALF = 95
const LCX = 105
const RCX = 315
const CY = 120
const PX = HALF / W

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/* ---------- Keller map: three polynomial shears, det Jac = 1 everywhere ---------- */
function coeffs(s: number) {
  return { a: 0.5 * s, b: -0.45 * s, c: 0.22 * s }
}
function keller(p: V, s: number): V {
  const { a, b, c } = coeffs(s)
  const x1 = p[0] + a * p[1] * p[1]
  const y2 = p[1] + b * x1 * x1
  const x3 = x1 + c * y2 * y2
  return [x3, y2]
}
function kellerInv(q: V, s: number): V {
  const { a, b, c } = coeffs(s)
  const x1 = q[0] - c * q[1] * q[1]
  const y = q[1] - b * x1 * x1
  const x = x1 - a * y * y
  return [x, y]
}

/* ---------- wrapping map z -> z^k on a ring: det = k^2 |z|^(2k-2) > 0 but k-to-1 ---------- */
function power(p: V, k: number): V {
  const r = Math.hypot(p[0], p[1]) ** k
  const t = Math.atan2(p[1], p[0]) * k
  return [r * Math.cos(t), r * Math.sin(t)]
}
const R_IN = 0.55
const R_OUT = 1.25

function detJac(f: (p: V) => V, p: V) {
  const h = 1e-5
  const fx1 = f([p[0] + h, p[1]])
  const fx0 = f([p[0] - h, p[1]])
  const fy1 = f([p[0], p[1] + h])
  const fy0 = f([p[0], p[1] - h])
  const a = (fx1[0] - fx0[0]) / (2 * h)
  const c = (fx1[1] - fx0[1]) / (2 * h)
  const b = (fy1[0] - fy0[0]) / (2 * h)
  const d = (fy1[1] - fy0[1]) / (2 * h)
  return a * d - b * c
}

type Cell = { pts: V[]; fill: string }

function kellerCells(): Cell[] {
  const n = 10
  const lo = -1.1
  const step = 2.2 / n
  const sub = 4
  const cells: Cell[] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x0 = lo + i * step
      const y0 = lo + j * step
      const pts: V[] = []
      for (let t = 0; t < sub; t++) pts.push([x0 + (step * t) / sub, y0])
      for (let t = 0; t < sub; t++) pts.push([x0 + step, y0 + (step * t) / sub])
      for (let t = 0; t < sub; t++) pts.push([x0 + step - (step * t) / sub, y0 + step])
      for (let t = 0; t < sub; t++) pts.push([x0, y0 + step - (step * t) / sub])
      const hue = 165 + ((i + j) / (2 * n - 2)) * 95
      const light = (i + j) % 2 === 0 ? 52 : 36
      cells.push({ pts, fill: `hsl(${hue} 80% ${light}%)` })
    }
  }
  return cells
}

function ringCells(): Cell[] {
  const nr = 5
  const na = 24
  const sub = 3
  const cells: Cell[] = []
  for (let i = 0; i < nr; i++) {
    for (let j = 0; j < na; j++) {
      const r0 = R_IN + ((R_OUT - R_IN) * i) / nr
      const r1 = R_IN + ((R_OUT - R_IN) * (i + 1)) / nr
      const a0 = (2 * Math.PI * j) / na
      const a1 = (2 * Math.PI * (j + 1)) / na
      const pts: V[] = []
      for (let t = 0; t <= sub; t++) {
        const a = a0 + ((a1 - a0) * t) / sub
        pts.push([r0 * Math.cos(a), r0 * Math.sin(a)])
      }
      for (let t = sub; t >= 0; t--) {
        const a = a0 + ((a1 - a0) * t) / sub
        pts.push([r1 * Math.cos(a), r1 * Math.sin(a)])
      }
      const hue = (360 * j) / na
      const light = (i + j) % 2 === 0 ? 58 : 44
      cells.push({ pts, fill: `hsl(${hue} 85% ${light}%)` })
    }
  }
  return cells
}

const toScreen = (p: V, cx: number): V => [cx + p[0] * PX, CY - p[1] * PX]
const poly = (pts: V[], cx: number) =>
  pts.map((p) => toScreen(p, cx).map((v) => v.toFixed(1)).join(',')).join(' ')

export function JacobianDemo() {
  const [mode, setMode] = useState<Mode>('keller')
  const [s, setS] = useState(0.85)
  const [k, setK] = useState(2)
  const [playing, setPlaying] = useState(false)
  const [target, setTarget] = useState<V>([0.6, 0.35])
  const svgRef = useRef<SVGSVGElement>(null)
  const dragSide = useRef<'L' | 'R' | null>(null)
  const sRef = useRef(s)
  useEffect(() => {
    sRef.current = s
  }, [s])

  useEffect(() => {
    if (!playing || mode !== 'keller') return
    if (reducedMotion()) {
      setPlaying(false)
      return
    }
    let raf = 0
    const t0 = performance.now() - (Math.asin(Math.max(-1, Math.min(1, sRef.current))) / 1.1) * 1000
    const tick = (now: number) => {
      setS(Math.sin(((now - t0) / 1000) * 1.1))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, mode])

  const map = useMemo(
    () => (mode === 'keller' ? (p: V) => keller(p, s) : (p: V) => power(p, k)),
    [mode, s, k],
  )
  const domainCells = useMemo(() => (mode === 'keller' ? kellerCells() : ringCells()), [mode])
  const imageCells = useMemo(
    () => domainCells.map((c) => ({ ...c, pts: c.pts.map(map) })),
    [domainCells, map],
  )

  const preimages: V[] = useMemo(() => {
    if (mode === 'keller') return [kellerInv(target, s)]
    const r = Math.hypot(target[0], target[1]) ** (1 / k)
    if (r < R_IN || r > R_OUT) return []
    const t = Math.atan2(target[1], target[0])
    return Array.from({ length: k }, (_, j) => {
      const a = (t + 2 * Math.PI * j) / k
      return [r * Math.cos(a), r * Math.sin(a)] as V
    })
  }, [mode, target, s, k])

  const dets = preimages.map((p) => detJac(map, p))

  /** Pointer -> world coords of the given panel (or of the panel under the pointer). */
  const toWorld = (e: ReactPointerEvent<SVGSVGElement>, forced?: 'L' | 'R') => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    const side: 'L' | 'R' = forced ?? (pt.x < 210 ? 'L' : 'R')
    const cx = side === 'L' ? LCX : RCX
    const w: V = [
      Math.max(-W, Math.min(W, (pt.x - cx) / PX)),
      Math.max(-W, Math.min(W, (CY - pt.y) / PX)),
    ]
    return { side, w }
  }
  const apply = (hit: { side: 'L' | 'R'; w: V } | null) => {
    if (!hit) return
    setTarget(hit.side === 'R' ? hit.w : map(hit.w))
  }
  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const hit = toWorld(e)
    if (!hit) return
    dragSide.current = hit.side
    e.currentTarget.setPointerCapture(e.pointerId)
    apply(hit)
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragSide.current) apply(toWorld(e, dragSide.current))
  }
  const onUp = () => {
    dragSide.current = null
  }

  const [qx, qy] = toScreen(target, RCX)
  const collide = preimages.length > 1

  return (
    <div className="demo">
      <h3 className="demo-title">Local stretch vs. global inverse</h3>
      <p className="demo-hint">
        Left is the input plane and right is the output plane, at the same scale. Drag on either
        side to move a target point. The glowing dots on the left are every input that lands on it.
        Keller mode: three polynomial shears, so det Jac = 1 everywhere. Press Morph and watch the
        grid flow while every cell keeps its area. Wrap mode: z ↦ z^k on a ring. det Jac never
        vanishes there, yet k inputs collide.
      </p>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button
          type="button"
          className={mode === 'keller' ? 'btn' : 'btn btn-ghost'}
          onClick={() => {
            setMode('keller')
            setTarget([0.6, 0.35])
          }}
        >
          Keller map (det ≡ 1)
        </button>
        <button
          type="button"
          className={mode === 'wrap' ? 'btn' : 'btn btn-ghost'}
          onClick={() => {
            setMode('wrap')
            setPlaying(false)
            setTarget(power([0.9, 0.35], k))
          }}
        >
          Wrap map z^k (det ≠ 0)
        </button>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 420 252"
        role="img"
        aria-label="Input grid on the left, its image under a polynomial map on the right, with the preimages of a draggable target point"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <filter id="jac-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="jac-clip-l">
            <rect x={LCX - HALF} y={CY - HALF} width={2 * HALF} height={2 * HALF} />
          </clipPath>
          <clipPath id="jac-clip-r">
            <rect x={RCX - HALF} y={CY - HALF} width={2 * HALF} height={2 * HALF} />
          </clipPath>
          <marker id="jac-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#f0c95a" />
          </marker>
        </defs>
        {[LCX, RCX].map((cx) => (
          <g key={cx}>
            <rect x={cx - HALF} y={CY - HALF} width={2 * HALF} height={2 * HALF} fill="#070b0a" stroke="#24332e" />
            <line x1={cx - HALF} y1={CY} x2={cx + HALF} y2={CY} stroke="#24332e" />
            <line x1={cx} y1={CY - HALF} x2={cx} y2={CY + HALF} stroke="#24332e" />
          </g>
        ))}
        <g clipPath="url(#jac-clip-l)">
          {domainCells.map((c, i) => (
            <polygon key={i} points={poly(c.pts, LCX)} fill={c.fill} opacity={0.85} stroke="#070b0a" strokeWidth="0.4" />
          ))}
        </g>
        <g clipPath="url(#jac-clip-r)" style={{ mixBlendMode: 'screen' }}>
          {imageCells.map((c, i) => (
            <polygon
              key={i}
              points={poly(c.pts, RCX)}
              fill={c.fill}
              opacity={mode === 'wrap' ? 0.5 : 0.85}
              stroke="#070b0a"
              strokeWidth="0.4"
            />
          ))}
        </g>
        <text x={LCX - HALF + 4} y={CY - HALF - 6} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
          input (x, y)
        </text>
        <text x={RCX - HALF + 4} y={CY - HALF - 6} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
          output F(x, y)
        </text>
        <text x={210} y={CY - HALF - 6} textAnchor="middle" fill="#f0c95a" fontSize="11" fontFamily="IBM Plex Mono">
          F →
        </text>

        {preimages.map((p, i) => {
          const [px, py] = toScreen(p, LCX)
          const inView = Math.abs(p[0]) <= W && Math.abs(p[1]) <= W
          if (!inView) return null
          return (
            <g key={i}>
              <path
                d={`M${px},${py} Q${(px + qx) / 2},${Math.min(py, qy) - 40 - i * 14} ${qx},${qy}`}
                fill="none"
                stroke="#f0c95a"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity={0.8}
                markerEnd="url(#jac-arrow)"
              />
              <circle cx={px} cy={py} r={5.5} fill={collide ? '#ff6b6b' : '#2ee6c5'} stroke="#e8f2ef" strokeWidth="1.2" filter="url(#jac-glow)" />
            </g>
          )
        })}
        <circle cx={qx} cy={qy} r={6.5} fill="#f0c95a" stroke="#070b0a" strokeWidth="1.5" filter="url(#jac-glow)" />
        <text x={210} y={CY + HALF + 16} textAnchor="middle" fill={collide ? '#ff6b6b' : '#2ee6c5'} fontSize="11" fontFamily="IBM Plex Mono">
          {preimages.length === 0
            ? 'target outside the image of this ring'
            : collide
              ? `${preimages.length} different inputs → one output: no inverse`
              : 'exactly one input → this output'}
        </text>
        <text x={210} y={CY + HALF + 30} textAnchor="middle" fill="#8aa39a" fontSize="9.5" fontFamily="IBM Plex Mono">
          {mode === 'keller'
            ? 'F = shear ∘ shear ∘ shear (polynomial, det Jac ≡ 1)'
            : `F(z) = z^${k} on ${R_IN} ≤ |z| ≤ ${R_OUT}  (det = ${k}²|z|^${2 * k - 2})`}
        </text>
      </svg>

      <div className="controls">
        {mode === 'keller' ? (
          <label>
            Shear strength: <span className="stat">{s.toFixed(2)}</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={s}
              onChange={(e) => {
                setPlaying(false)
                setS(Number(e.target.value))
              }}
            />
          </label>
        ) : (
          <label>
            Wrapping number k: <span className="stat">{k}</span>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={k}
              onChange={(e) => {
                const nk = Number(e.target.value)
                setK(nk)
                setTarget(power(preimages[0] ?? [0.9, 0.35], nk))
              }}
            />
          </label>
        )}
      </div>
      {mode === 'keller' && (
        <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
          <button type="button" className="btn" onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Pause morph' : 'Morph'}
          </button>
        </div>
      )}
      <p className="stat" role="status" style={{ fontSize: '0.8rem' }}>
        det Jac at {dets.length === 1 ? 'the input' : `the ${dets.length} inputs`}:{' '}
        {dets.length ? dets.map((d) => d.toFixed(3)).join(', ') : 'n/a'} (finite-difference check).
      </p>
      <p className="demo-callout">
        A nonzero Jacobian only rules out folds near each point. The Jacobian conjecture asked
        whether a constant one, as on the Keller side, also rules out far-apart collisions like on
        the wrap side. Alpöge's July 2026 map on ℂ³ does both at once: det Jac ≡ −2 and two inputs
        share an output. That map lives in 3 complex dimensions and is not drawn here. Both pictures
        are 2D toys. In the plane the question is still open.
      </p>
    </div>
  )
}
