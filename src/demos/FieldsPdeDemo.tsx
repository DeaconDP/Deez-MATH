import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Hard-disk gas (elastic collisions, Boltzmann–Grad scaling N·r = c) */
/*  and its velocity distribution relaxing toward Maxwell–Boltzmann.   */
/* ------------------------------------------------------------------ */

type Init = 'ring' | 'beams'

type Sim = {
  n: number
  r: number
  x: Float64Array
  y: Float64Array
  vx: Float64Array
  vy: Float64Array
  t: number
  collisions: number
  H: { t: number; h: number }[]
}

const V0 = 0.45 // initial speed (box widths per second)
const NR = 2.5 // Boltzmann–Grad: N · r held fixed

function makeSim(n: number, init: Init): Sim {
  const r = NR / n
  const x = new Float64Array(n)
  const y = new Float64Array(n)
  const vx = new Float64Array(n)
  const vy = new Float64Array(n)
  // place on a jittered lattice so no disks overlap
  const side = Math.ceil(Math.sqrt(n))
  const cell = 1 / side
  for (let i = 0; i < n; i++) {
    const gx = i % side
    const gy = Math.floor(i / side)
    const jitter = Math.max(0, cell / 2 - r) * 0.9
    x[i] = (gx + 0.5) * cell + (Math.random() - 0.5) * 2 * jitter
    y[i] = (gy + 0.5) * cell + (Math.random() - 0.5) * 2 * jitter
    if (init === 'ring') {
      const a = Math.random() * Math.PI * 2
      vx[i] = V0 * Math.cos(a)
      vy[i] = V0 * Math.sin(a)
    } else {
      vx[i] = i % 2 ? V0 : -V0
      vy[i] = 0
    }
  }
  return { n, r, x, y, vx, vy, t: 0, collisions: 0, H: [] }
}

function step(s: Sim, dt: number) {
  const { n, r, x, y, vx, vy } = s
  for (let i = 0; i < n; i++) {
    x[i] += vx[i] * dt
    y[i] += vy[i] * dt
    if (x[i] < r) {
      x[i] = 2 * r - x[i]
      vx[i] = Math.abs(vx[i])
    } else if (x[i] > 1 - r) {
      x[i] = 2 * (1 - r) - x[i]
      vx[i] = -Math.abs(vx[i])
    }
    if (y[i] < r) {
      y[i] = 2 * r - y[i]
      vy[i] = Math.abs(vy[i])
    } else if (y[i] > 1 - r) {
      y[i] = 2 * (1 - r) - y[i]
      vy[i] = -Math.abs(vy[i])
    }
  }
  // spatial hash
  const G = Math.max(1, Math.min(80, Math.floor(1 / (2 * r))))
  const head = new Int32Array(G * G).fill(-1)
  const next = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    const cx = Math.min(G - 1, Math.floor(x[i] * G))
    const cy = Math.min(G - 1, Math.floor(y[i] * G))
    const c = cy * G + cx
    next[i] = head[c]
    head[c] = i
  }
  const d2 = 4 * r * r
  for (let i = 0; i < n; i++) {
    const cx = Math.min(G - 1, Math.floor(x[i] * G))
    const cy = Math.min(G - 1, Math.floor(y[i] * G))
    for (let oy = -1; oy <= 1; oy++) {
      const yy = cy + oy
      if (yy < 0 || yy >= G) continue
      for (let ox = -1; ox <= 1; ox++) {
        const xx = cx + ox
        if (xx < 0 || xx >= G) continue
        for (let j = head[yy * G + xx]; j !== -1; j = next[j]) {
          if (j <= i) continue
          const dx = x[j] - x[i]
          const dy = y[j] - y[i]
          const dd = dx * dx + dy * dy
          if (dd >= d2 || dd === 0) continue
          const dvx = vx[j] - vx[i]
          const dvy = vy[j] - vy[i]
          const dot = dvx * dx + dvy * dy
          if (dot >= 0) continue // already separating
          // equal masses: swap the normal components of velocity
          const k = dot / dd
          vx[i] += k * dx
          vy[i] += k * dy
          vx[j] -= k * dx
          vy[j] -= k * dy
          s.collisions++
        }
      }
    }
  }
  s.t += dt
}

/** Boltzmann's H = Σ f ln f over a velocity-space histogram. */
function hFunction(s: Sim) {
  const B = 14
  const V = 2.6 * V0
  const counts = new Float64Array(B * B)
  for (let i = 0; i < s.n; i++) {
    const bx = Math.floor(((s.vx[i] + V) / (2 * V)) * B)
    const by = Math.floor(((s.vy[i] + V) / (2 * V)) * B)
    if (bx < 0 || by < 0 || bx >= B || by >= B) continue
    counts[by * B + bx]++
  }
  const cellArea = ((2 * V) / B) ** 2
  let h = 0
  for (const c of counts) {
    if (!c) continue
    const f = c / s.n / cellArea
    h += f * Math.log(f) * cellArea
  }
  return h
}

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

const W = 640
const HGT = 340
const BOX = 300

function speedColor(v: number) {
  const t = Math.max(0, Math.min(1, v / (2 * V0)))
  // teal (slow) → gold (fast)
  const r = Math.round(46 + (240 - 46) * t)
  const g = Math.round(230 + (201 - 230) * t)
  const b = Math.round(197 + (90 - 197) * t)
  return `rgb(${r},${g},${b})`
}

function draw(ctx: CanvasRenderingContext2D, s: Sim) {
  ctx.fillStyle = '#070b0a'
  ctx.fillRect(0, 0, W, HGT)
  ctx.font = '10px ui-monospace, monospace'

  // ---- gas box ----
  const ox = 10
  const oy = 10
  ctx.strokeStyle = '#24332e'
  ctx.strokeRect(ox, oy, BOX, BOX)
  const rad = Math.max(1.3, s.r * BOX)
  for (let i = 0; i < s.n; i++) {
    const sp = Math.hypot(s.vx[i], s.vy[i])
    ctx.fillStyle = speedColor(sp)
    ctx.beginPath()
    ctx.arc(ox + s.x[i] * BOX, oy + (1 - s.y[i]) * BOX, rad, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#8aa39a'
  ctx.fillText('position space (colour = speed)', ox, oy + BOX + 14)

  // ---- velocity space ----
  const vx0 = 340
  const vy0 = 10
  const VS = 140
  const V = 2.6 * V0
  ctx.strokeStyle = '#24332e'
  ctx.strokeRect(vx0, vy0, VS, VS)
  ctx.beginPath()
  ctx.moveTo(vx0 + VS / 2, vy0)
  ctx.lineTo(vx0 + VS / 2, vy0 + VS)
  ctx.moveTo(vx0, vy0 + VS / 2)
  ctx.lineTo(vx0 + VS, vy0 + VS / 2)
  ctx.stroke()
  // equilibrium 1σ circle
  let e2 = 0
  for (let i = 0; i < s.n; i++) e2 += s.vx[i] ** 2 + s.vy[i] ** 2
  const sigma2 = e2 / s.n / 2
  ctx.strokeStyle = 'rgba(240,201,90,0.5)'
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.arc(vx0 + VS / 2, vy0 + VS / 2, (Math.sqrt(sigma2) / V) * (VS / 2), 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 0.7
  for (let i = 0; i < s.n; i++) {
    ctx.fillStyle = speedColor(Math.hypot(s.vx[i], s.vy[i]))
    ctx.fillRect(vx0 + VS / 2 + (s.vx[i] / V) * (VS / 2) - 1, vy0 + VS / 2 - (s.vy[i] / V) * (VS / 2) - 1, 2, 2)
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#8aa39a'
  ctx.fillText('velocity space', vx0, vy0 + VS + 14)

  // ---- speed histogram vs 2D Maxwell (Rayleigh) ----
  const hx0 = 500
  const hy0 = 10
  const HW2 = 130
  const HH2 = 140
  const bins = 18
  const vmax = 3 * Math.sqrt(sigma2)
  const counts = new Array(bins).fill(0)
  for (let i = 0; i < s.n; i++) {
    const b = Math.floor((Math.hypot(s.vx[i], s.vy[i]) / vmax) * bins)
    if (b >= 0 && b < bins) counts[b]++
  }
  const bw = vmax / bins
  const dens = counts.map((c) => c / s.n / bw)
  const rayleigh = (v: number) => (v / sigma2) * Math.exp(-(v * v) / (2 * sigma2))
  const peak = Math.max(rayleigh(Math.sqrt(sigma2)) * 1.5, ...dens.map((d) => Math.min(d, rayleigh(Math.sqrt(sigma2)) * 3)))
  ctx.strokeStyle = '#24332e'
  ctx.strokeRect(hx0, hy0, HW2, HH2)
  for (let b = 0; b < bins; b++) {
    const h = Math.min(HH2, (dens[b] / peak) * HH2)
    ctx.fillStyle = 'rgba(46,230,197,0.55)'
    ctx.fillRect(hx0 + (b * HW2) / bins + 0.5, hy0 + HH2 - h, HW2 / bins - 1, h)
  }
  ctx.strokeStyle = '#f0c95a'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let k = 0; k <= 60; k++) {
    const v = (k / 60) * vmax
    const px = hx0 + (v / vmax) * HW2
    const py = hy0 + HH2 - (rayleigh(v) / peak) * HH2
    if (k) ctx.lineTo(px, py)
    else ctx.moveTo(px, py)
  }
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.fillStyle = '#8aa39a'
  ctx.fillText('speeds vs Maxwell', hx0, hy0 + HH2 + 14)

  // ---- H(t) ----
  const tx0 = 340
  const ty0 = 180
  const TW = 290
  const TH = 108
  ctx.strokeStyle = '#24332e'
  ctx.strokeRect(tx0, ty0, TW, TH)
  const Hs = s.H
  if (Hs.length > 1) {
    const tMax = Math.max(8, Hs[Hs.length - 1].t)
    let lo = Infinity
    let hi = -Infinity
    for (const p of Hs) {
      lo = Math.min(lo, p.h)
      hi = Math.max(hi, p.h)
    }
    const pad = (hi - lo) * 0.15 + 0.05
    lo -= pad
    hi += pad
    ctx.strokeStyle = '#2ee6c5'
    ctx.lineWidth = 2
    ctx.beginPath()
    Hs.forEach((p, i) => {
      const px = tx0 + (p.t / tMax) * TW
      const py = ty0 + TH - ((p.h - lo) / (hi - lo)) * TH
      if (i) ctx.lineTo(px, py)
      else ctx.moveTo(px, py)
    })
    ctx.stroke()
    ctx.lineWidth = 1
  }
  ctx.fillStyle = '#8aa39a'
  ctx.fillText('Boltzmann’s H(t) = ∫ f log f dv: falls, then flattens', tx0, ty0 + TH + 14)
  ctx.fillStyle = '#e8f2ef'
  ctx.fillText(`t = ${s.t.toFixed(1)} s   collisions: ${s.collisions.toLocaleString()}`, tx0, ty0 + TH + 30)
  ctx.fillStyle = '#8aa39a'
  ctx.fillText(`N = ${s.n}, radius = ${(s.r * 1000).toFixed(1)}e-3, area fraction ${(s.n * Math.PI * s.r * s.r * 100).toFixed(1)}%`, tx0, ty0 + TH + 45)
}

export function FieldsPdeDemo() {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [n, setN] = useState(300)
  const [init, setInit] = useState<Init>('ring')
  const [running, setRunning] = useState(!reduced)
  const sim = useRef<Sim>(makeSim(300, 'ring'))
  const raf = useRef(0)
  const visible = useRef(true)

  const restart = useCallback((nn: number, ii: Init) => {
    sim.current = makeSim(nn, ii)
    sim.current.H.push({ t: 0, h: hFunction(sim.current) })
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) draw(ctx, sim.current)
  }, [])

  useEffect(() => {
    restart(n, init)
  }, [n, init, restart])

  useEffect(() => {
    const el = canvasRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const advance = useCallback((seconds: number) => {
    const s = sim.current
    const dt = Math.min(1 / 240, (0.5 * s.r) / (2.5 * V0))
    const steps = Math.ceil(seconds / dt)
    for (let k = 0; k < steps; k++) step(s, seconds / steps)
    const last = s.H[s.H.length - 1]
    if (!last || s.t - last.t > 0.1) s.H.push({ t: s.t, h: hFunction(s) })
    if (s.H.length > 1500) s.H = s.H.filter((_, i) => i % 2 === 0)
  }, [])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const frame = (now: number) => {
      const dtWall = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible.current) {
        advance(dtWall)
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) draw(ctx, sim.current)
      }
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf.current)
  }, [running, advance])

  const jump = () => {
    advance(2)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) draw(ctx, sim.current)
  }

  return (
    <div className="demo">
      <h3 className="demo-title">From billiard balls to the Boltzmann equation</h3>
      <p className="demo-hint">
        This is a real hard-disk gas: every collision is an exact elastic bounce, and nothing is
        random after the start. It begins far from equilibrium, with every particle at the same
        speed (a ring in velocity space) or in two opposing beams. Collisions alone push the
        velocities into the Gaussian cloud and the gold Maxwell curve that the Boltzmann equation
        predicts, and H falls. Raise N: the disks shrink as 1/N, the Boltzmann–Grad limit, where
        the equation becomes exact.
      </p>

      <canvas ref={canvasRef} width={W} height={HGT} aria-label="Hard-disk gas simulation with velocity distribution and H-function" />

      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        <button type="button" className="btn" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Run'}
        </button>
        {!running && (
          <button type="button" className="btn btn-ghost" onClick={jump}>
            Step +2 s
          </button>
        )}
        <button type="button" className="btn btn-ghost" aria-pressed={init === 'ring'} style={{ borderColor: init === 'ring' ? 'var(--accent)' : undefined }} onClick={() => (init === 'ring' ? restart(n, 'ring') : setInit('ring'))}>
          Restart: one speed
        </button>
        <button type="button" className="btn btn-ghost" aria-pressed={init === 'beams'} style={{ borderColor: init === 'beams' ? 'var(--accent)' : undefined }} onClick={() => (init === 'beams' ? restart(n, 'beams') : setInit('beams'))}>
          Restart: two beams
        </button>
      </div>
      <div className="controls">
        <label>
          Particles N: <span className="stat">{n}</span> (radius ∝ 1/N, so the mean free path stays fixed)
          <input type="range" min={100} max={900} step={50} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
      </div>

      <p className="demo-callout">
        Deng’s Fields Medal work, with Hani and Ma, proves this passage rigorously for long times:
        in the Boltzmann–Grad limit, hard-sphere dynamics converge to solutions of the Boltzmann
        equation. Related work derives wave kinetic equations from dispersive PDEs. This simulation
        is 2D with finitely many disks, so it illustrates the limit and proves nothing. Pardon,
        the other 2026 medallist in this entry, works on symplectic geometry and is not pictured.
      </p>
    </div>
  )
}
