import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * Classical Liénard system  x' = y − F(x),  y' = −x  with an odd quintic
 * F(x) = a1·x + a3·x³ + a5·x⁵. Energy E = (x² + y²)/2 changes at rate −x·F(x).
 */
type Params = { a1: number; a3: number; a5: number }

const SPAN = 3.2
const S = 400
const PARTICLES = 650

const PRESETS: { label: string; p: Params }[] = [
  { label: 'Two cycles', p: { a1: 0.75, a3: -1.25, a5: 0.3 } },
  { label: 'One cycle', p: { a1: -0.6, a3: 0.2, a5: 0.05 } },
  { label: 'No cycle', p: { a1: 0.4, a3: 0.3, a5: 0.1 } },
]

const F = (x: number, p: Params) => x * (p.a1 + x * x * (p.a3 + p.a5 * x * x))

function rk4(x: number, y: number, h: number, p: Params): [number, number] {
  const f = (u: number, v: number): [number, number] => [v - F(u, p), -u]
  const [k1x, k1y] = f(x, y)
  const [k2x, k2y] = f(x + (h / 2) * k1x, y + (h / 2) * k1y)
  const [k3x, k3y] = f(x + (h / 2) * k2x, y + (h / 2) * k2y)
  const [k4x, k4y] = f(x + h * k3x, y + h * k3y)
  return [x + (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x), y + (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y)]
}

/** First return to the positive y-axis, starting at (0, s). Optionally records the orbit. */
function returnMap(s: number, p: Params, path?: [number, number][]): number {
  let x = 0
  let y = s
  const h = 0.004
  for (let i = 0; i < 20000; i++) {
    const [nx, ny] = rk4(x, y, h, p)
    if (path && i % 6 === 0) path.push([nx, ny])
    if (x < 0 && nx >= 0 && i > 10) return y + ((ny - y) * -x) / (nx - x)
    x = nx
    y = ny
    if (Math.abs(x) > 40 || Math.abs(y) > 40) return NaN
  }
  return NaN
}

type Cycle = { s: number; stable: boolean; path: [number, number][] }

function findCycles(p: Params): Cycle[] {
  const D = (s: number) => returnMap(s, p) - s
  const grid: { s: number; d: number }[] = []
  for (let i = 0; i <= 70; i++) {
    const s = 0.04 + (i / 70) * (SPAN - 0.1)
    grid.push({ s, d: D(s) })
  }
  const out: Cycle[] = []
  for (let i = 0; i < grid.length - 1; i++) {
    const g0 = grid[i]
    const g1 = grid[i + 1]
    if (!Number.isFinite(g0.d) || !Number.isFinite(g1.d) || g0.d * g1.d > 0) continue
    let lo = g0.s
    let hi = g1.s
    let dlo = g0.d
    for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2
      const dm = D(mid)
      if (dlo * dm <= 0) hi = mid
      else {
        lo = mid
        dlo = dm
      }
    }
    const s = (lo + hi) / 2
    const path: [number, number][] = [[0, s]]
    returnMap(s, p, path)
    // return-map displacement goes + then − across an attracting cycle
    out.push({ s, stable: g0.d > 0 && g1.d < 0, path })
  }
  return out
}

const px = (x: number) => ((x + SPAN) / (2 * SPAN)) * S
const py = (y: number) => S - ((y + SPAN) / (2 * SPAN)) * S

const spawn = () => ({
  x: (Math.random() * 2 - 1) * SPAN,
  y: (Math.random() * 2 - 1) * SPAN,
  age: Math.floor(Math.random() * 240),
})

function setupCanvas(canvas: HTMLCanvasElement | null) {
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return null
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = S * dpr
  canvas.height = S * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#070b0a'
  ctx.fillRect(0, 0, S, S)
  return ctx
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function HilbertSixteenthDemo() {
  const [p, setP] = useState<Params>(PRESETS[0].p)
  const [tracer, setTracer] = useState<[number, number][]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tracerRef = useRef<{ x: number; y: number } | null>(null)
  const pRef = useRef(p)
  useEffect(() => {
    pRef.current = p
  }, [p])

  const cycles = useMemo(() => findCycles(p), [p])
  const stableCount = cycles.filter((c) => c.stable).length

  // Reduced motion: static streamlines, redrawn when the field changes
  useEffect(() => {
    if (!reducedMotion()) return
    const ctx = setupCanvas(canvasRef.current)
    if (!ctx) return
    for (let i = 0; i < 70; i++) {
      let { x, y } = spawn()
      ctx.beginPath()
      ctx.moveTo(px(x), py(y))
      for (let k = 0; k < 900; k++) {
        ;[x, y] = rk4(x, y, 0.01, p)
        ctx.lineTo(px(x), py(y))
      }
      ctx.strokeStyle = 'rgba(46,230,197,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [p])

  // Particle flow (reads the latest field from pRef, so particles survive slider moves)
  useEffect(() => {
    if (reducedMotion()) return
    const ctx = setupCanvas(canvasRef.current)
    if (!ctx) return

    const parts = Array.from({ length: PARTICLES }, spawn)
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(frame)
    })
    if (wrapRef.current) io.observe(wrapRef.current)

    let trailTick = 0
    function frame() {
      raf = 0
      if (!visible || !ctx) return
      const prm = pRef.current
      ctx.fillStyle = 'rgba(7,11,10,0.075)'
      ctx.fillRect(0, 0, S, S)
      ctx.lineWidth = 1.3
      ctx.lineCap = 'round'
      for (const q of parts) {
        const x0 = q.x
        const y0 = q.y
        let x = x0
        let y = y0
        for (let k = 0; k < 2; k++) [x, y] = rk4(x, y, 0.012, prm)
        q.x = x
        q.y = y
        q.age++
        // gold where the field pumps energy in (x·F(x) < 0), teal where it drains it
        const pump = x * F(x, prm) < 0
        ctx.strokeStyle = pump ? 'rgba(240,201,90,0.85)' : 'rgba(46,230,197,0.8)'
        ctx.beginPath()
        ctx.moveTo(px(x0), py(y0))
        ctx.lineTo(px(x), py(y))
        ctx.stroke()
        if (q.age > 260 || Math.abs(x) > SPAN * 1.4 || Math.abs(y) > SPAN * 1.4) Object.assign(q, spawn(), { age: 0 })
      }
      const t = tracerRef.current
      if (t) {
        for (let k = 0; k < 4; k++) [t.x, t.y] = rk4(t.x, t.y, 0.01, prm)
        if (++trailTick % 2 === 0) setTracer((tr) => (tr.length > 1400 ? tr.slice(-1400) : tr).concat([[t.x, t.y]]))
        if (Math.abs(t.x) > 40 || Math.abs(t.y) > 40) tracerRef.current = null
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  function drop(e: ReactPointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 2 * SPAN - SPAN
    const y = SPAN - ((e.clientY - r.top) / r.height) * 2 * SPAN
    if (reducedMotion()) {
      const path: [number, number][] = [[x, y]]
      let u = x
      let v = y
      for (let k = 0; k < 3000; k++) {
        ;[u, v] = rk4(u, v, 0.01, p)
        if (k % 3 === 0) path.push([u, v])
      }
      setTracer(path)
      return
    }
    tracerRef.current = { x, y }
    setTracer([[x, y]])
  }

  function setParam(k: keyof Params, v: number) {
    setP((prev) => ({ ...prev, [k]: v }))
  }

  const toPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)},${py(y).toFixed(1)}`).join('')
  const head = tracer[tracer.length - 1]

  return (
    <div className="demo">
      <h3 className="demo-title">Limit cycles in a flowing plane</h3>
      <p className="demo-hint">
        A classical Liénard oscillator: x′ = y − F(x), y′ = −x, with F a quintic. Particles ride the flow, gold where
        the system pumps energy in, teal where friction drains it. Where pumping and draining balance over a full
        loop, an isolated closed orbit appears: a <em>limit cycle</em>. Tap the plane to drop your own tracer.
      </p>
      <div
        ref={wrapRef}
        onPointerDown={drop}
        style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', cursor: 'crosshair', touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        />
        <svg
          viewBox={`0 0 ${S} ${S}`}
          role="img"
          aria-label={`Phase portrait with ${cycles.length} limit cycle${cycles.length === 1 ? '' : 's'} found.`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', pointerEvents: 'none' }}
        >
          <defs>
            <filter id="h16-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <line x1={0} x2={S} y1={py(0)} y2={py(0)} stroke="#e8f2ef" strokeOpacity="0.12" />
          <line x1={px(0)} x2={px(0)} y1={0} y2={S} stroke="#e8f2ef" strokeOpacity="0.12" />
          {cycles.map((c) => (
            <path
              key={c.s}
              d={toPath(c.path) + 'Z'}
              fill="none"
              stroke={c.stable ? '#ffffff' : '#ff6b6b'}
              strokeWidth={c.stable ? 3 : 2.4}
              strokeDasharray={c.stable ? undefined : '7 6'}
              filter="url(#h16-glow)"
            />
          ))}
          {tracer.length > 1 ? <path d={toPath(tracer)} fill="none" stroke="#7eb6ff" strokeWidth="1.8" strokeOpacity="0.95" /> : null}
          {head ? <circle cx={px(head[0])} cy={py(head[1])} r={4.5} fill="#7eb6ff" filter="url(#h16-glow)" /> : null}
          <text x={8} y={16} fill="#e8f2ef" fontSize="11" fontFamily="IBM Plex Mono">
            limit cycles: {cycles.length}
          </text>
          <text x={8} y={30} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
            white = attracting · red dashed = repelling
          </text>
        </svg>
      </div>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
        {PRESETS.map((pr) => (
          <button key={pr.label} type="button" className="btn btn-ghost" onClick={() => setP(pr.p)}>
            {pr.label}
          </button>
        ))}
      </div>
      <div className="controls">
        <DimSlider label="a₁ (linear damping)" value={p.a1} min={-1.5} max={1.5} step={0.05} onChange={(v) => setParam('a1', v)} format={(v) => v.toFixed(2)} />
        <DimSlider label="a₃ (cubic)" value={p.a3} min={-2.5} max={2.5} step={0.05} onChange={(v) => setParam('a3', v)} format={(v) => v.toFixed(2)} />
        <DimSlider label="a₅ (quintic, kept positive so orbits stay on screen)" value={p.a5} min={0.05} max={1} step={0.01} onChange={(v) => setParam('a5', v)} format={(v) => v.toFixed(2)} />
      </div>
      <p className="stat" role="status">
        F(x) = {p.a1.toFixed(2)}x {p.a3 < 0 ? '−' : '+'} {Math.abs(p.a3).toFixed(2)}x³ + {p.a5.toFixed(2)}x⁵ · {cycles.length} limit cycle
        {cycles.length === 1 ? '' : 's'} ({stableCount} attracting, {cycles.length - stableCount} repelling)
      </p>
      <p className="feedback" style={{ color: cycles.length >= 2 ? 'var(--accent-2)' : 'var(--muted)' }}>
        {cycles.length >= 2
          ? 'Two cycles: the most this family allows. Nudge the sliders and try for a third.'
          : 'Challenge: tune the sliders to get as many cycles as you can.'}
      </p>
      <p className="demo-callout">
        For quintic Liénard systems the claim (OpenAI catalog, Oct 2026, not machine-checked) is exactly two limit
        cycles at most, and two happens. For every planar polynomial field of degree d it claims some finite cap C(d),
        with no formula for C(d). Cycles here are found numerically (return map on the y-axis, inside this window);
        this demo uses odd F only.
      </p>
    </div>
  )
}
