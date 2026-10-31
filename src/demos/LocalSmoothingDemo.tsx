import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * A real computation of the half-wave propagator e^{it√−Δ} in the plane (n = 2) on
 * radial data. Frequencies |ξ| ∈ [N, 2N] get phases tuned so the wave is a thin ring at
 * t = 0 that focuses to a point at t = R. Radial symmetry turns the 2D inverse Fourier
 * transform into a Hankel transform:  u(r,t) = ∫ φ(ρ/N) e^{i(R−t)ρ} J₀(rρ) ρ dρ,
 * evaluated by quadrature. This focusing example is the classic case where the fixed-time
 * loss (n−1)(1/2 − 1/p) is sharp, and where averaging in time wins back 1/p.
 */

const R = 1.2 // focus time
const T_END = 2 * R
const R_MAX = 1.6
const NR = 320
const NT = 161
const WIN: [number, number] = [R - 0.5, R + 0.5] // a unit time window containing the focus
const SCALE_NS = [8, 11, 15, 20, 27, 36]

function bessJ0(x: number) {
  const ax = Math.abs(x)
  if (ax < 8) {
    const y = x * x
    const a1 = 57568490574.0 + y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))))
    const a2 = 57568490411.0 + y * (1029532985.0 + y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y))))
    return a1 / a2
  }
  const z = 8 / ax
  const y = z * z
  const xx = ax - 0.785398164
  const a1 = 1 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)))
  const a2 = -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)))
  return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * a1 - z * Math.sin(xx) * a2)
}

const RS = Float64Array.from({ length: NR }, (_, i) => ((i + 0.5) * R_MAX) / NR)

/** Returns re/im of u(r_i, t_k) for the given times. */
function solve(N: number, times: number[]) {
  const J = Math.ceil(N * 2.5) + 40
  const rho = new Float64Array(J)
  const w = new Float64Array(J)
  for (let j = 0; j < J; j++) {
    const s = 1 + (j + 0.5) / J
    rho[j] = N * s
    w[j] = Math.sin(Math.PI * (s - 1)) ** 2 * N * s * (N / J)
  }
  const tab = new Float64Array(NR * J)
  for (let i = 0; i < NR; i++) for (let j = 0; j < J; j++) tab[i * J + j] = bessJ0(RS[i] * rho[j])
  const re = new Float32Array(NR * times.length)
  const im = new Float32Array(NR * times.length)
  const c = new Float64Array(J)
  const sn = new Float64Array(J)
  times.forEach((t, k) => {
    const s = R - t
    for (let j = 0; j < J; j++) {
      c[j] = w[j] * Math.cos(s * rho[j])
      sn[j] = w[j] * Math.sin(s * rho[j])
    }
    for (let i = 0; i < NR; i++) {
      let a = 0
      let b = 0
      const off = i * J
      for (let j = 0; j < J; j++) {
        const v = tab[off + j]
        a += c[j] * v
        b += sn[j] * v
      }
      re[k * NR + i] = a
      im[k * NR + i] = b
    }
  })
  return { re, im }
}

/** ‖u(t_k)‖_p^p in the plane (radial measure 2πr dr). */
function powP(re: Float32Array, im: Float32Array, k: number, p: number) {
  let s = 0
  const dr = R_MAX / NR
  for (let i = 0; i < NR; i++) {
    const m = Math.hypot(re[k * NR + i], im[k * NR + i])
    s += m ** p * 2 * Math.PI * RS[i] * dr
  }
  return s
}

function slope(xs: number[], ys: number[]) {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length
  let num = 0
  let den = 0
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my)
    den += (x - mx) ** 2
  })
  return num / den
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

const PIX = 260

export function LocalSmoothingDemo() {
  const [N, setN] = useState(20)
  const [p, setP] = useState(6)
  const [dim, setDim] = useState(3)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(true)
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const plotRef = useRef<SVGSVGElement | null>(null)

  const times = useMemo(() => Array.from({ length: NT }, (_, k) => (k * T_END) / (NT - 1)), [])
  const field = useMemo(() => solve(N, times), [N, times])
  const peakAbs = useMemo(() => {
    let m = 0
    for (let i = 0; i < field.re.length; i++) m = Math.max(m, Math.hypot(field.re[i], field.im[i]))
    return m
  }, [field])

  // ‖u(t)‖_p / ‖f‖_p over time for the displayed N
  const curve = useMemo(() => {
    const f = powP(field.re, field.im, 0, p) ** (1 / p)
    return times.map((_, k) => powP(field.re, field.im, k, p) ** (1 / p) / f)
  }, [field, times, p])
  const winStats = useMemo(() => {
    let peak = 0
    let acc = 0
    let cnt = 0
    times.forEach((t, k) => {
      if (t < WIN[0] - 1e-9 || t > WIN[1] + 1e-9) return
      peak = Math.max(peak, curve[k])
      acc += curve[k] ** p
      cnt++
    })
    return { peak, avg: (acc / cnt) ** (1 / p) }
  }, [curve, times, p])

  // scaling study: magnitudes on a fine time grid inside the window, for several N
  const scaleFields = useMemo(() => {
    const fine = [0, ...Array.from({ length: 201 }, (_, k) => WIN[0] + (k * (WIN[1] - WIN[0])) / 200)]
    return SCALE_NS.map((n) => solve(n, fine))
  }, [])
  const scaling = useMemo(() => {
    const rows = scaleFields.map((fld, idx) => {
      const f = powP(fld.re, fld.im, 0, p) ** (1 / p)
      let peak = 0
      let acc = 0
      for (let k = 1; k <= 201; k++) {
        const v = powP(fld.re, fld.im, k, p)
        peak = Math.max(peak, v)
        acc += v / 201
      }
      return { N: SCALE_NS[idx], fixed: peak ** (1 / p) / f, avg: acc ** (1 / p) / f }
    })
    const lx = rows.map((r) => Math.log(r.N))
    return {
      rows,
      sFixed: slope(lx, rows.map((r) => Math.log(r.fixed))),
      sAvg: slope(lx, rows.map((r) => Math.log(r.avg))),
    }
  }, [scaleFields, p])

  // animation
  useEffect(() => {
    if (!playing || reduced) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const tick = (now: number) => {
      acc += (now - last) / 1000
      last = now
      const step = 1 / 40
      if (acc >= step) {
        const adv = Math.floor(acc / step)
        acc -= adv * step
        setFrame((f) => (f + adv) % NT)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, reduced])

  // per-pixel radius index
  const pixIndex = useMemo(() => {
    const idx = new Int16Array(PIX * PIX)
    const half = PIX / 2
    for (let y = 0; y < PIX; y++)
      for (let x = 0; x < PIX; x++) {
        const r = (Math.hypot(x + 0.5 - half, y + 0.5 - half) / half) * R_MAX
        idx[y * PIX + x] = r >= R_MAX ? -1 : Math.min(NR - 1, Math.floor((r / R_MAX) * NR))
      }
    return idx
  }, [])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(PIX, PIX)
    const base = frame * NR
    const d = img.data
    for (let q = 0; q < PIX * PIX; q++) {
      const i = pixIndex[q]
      const o = q * 4
      d[o + 3] = 255
      if (i < 0) {
        d[o] = 7
        d[o + 1] = 11
        d[o + 2] = 10
        continue
      }
      const re = field.re[base + i]
      const mag = Math.hypot(re, field.im[base + i])
      const m = Math.min(1, (mag / peakAbs) ** 0.45)
      // brightness = envelope |u|; hue = sign of the oscillating real part
      const tint = mag > 0 ? 0.5 + 0.5 * (re / mag) : 0.5
      const hot = m ** 4
      d[o] = 7 + m * (46 * tint + 240 * (1 - tint)) + 150 * hot
      d[o + 1] = 11 + m * (230 * tint + 201 * (1 - tint)) + 40 * hot
      d[o + 2] = 10 + m * (197 * tint + 90 * (1 - tint)) + 80 * hot
    }
    ctx.putImageData(img, 0, 0)
  }, [frame, field, peakAbs, pixIndex])

  // time plot geometry
  const PW = 320
  const PH = 130
  const yMax = Math.max(...curve) * 1.08
  const px = (t: number) => 26 + (t / T_END) * (PW - 34)
  const py = (v: number) => PH - 18 - (v / yMax) * (PH - 30)
  const path = curve.map((v, k) => `${k ? 'L' : 'M'}${px(times[k]).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
  const t = times[frame]

  const scrub = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return
    const svg = plotRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const xx = ((e.clientX - r.left) / r.width) * PW
    const tt = Math.max(0, Math.min(T_END, ((xx - 26) / (PW - 34)) * T_END))
    setPlaying(false)
    setFrame(Math.round((tt / T_END) * (NT - 1)))
  }

  // scaling plot geometry
  const SW = 320
  const SH = 140
  const allV = scaling.rows.flatMap((r) => [r.fixed, r.avg])
  const vMin = Math.log(Math.min(...allV) * 0.9)
  const vMax = Math.log(Math.max(...allV) * 1.1)
  const sx = (n: number) => 30 + ((Math.log(n) - Math.log(8)) / (Math.log(36) - Math.log(8))) * (SW - 50)
  const sy = (v: number) => SH - 20 - ((Math.log(v) - vMin) / (vMax - vMin)) * (SH - 34)
  const predFixed = 0.5 - 1 / p
  const predAvg = Math.max(0, 0.5 - 2 / p)

  const crit = (2 * dim) / (dim - 1)
  const fixedN = (dim - 1) * (0.5 - 1 / p)

  return (
    <div className="demo">
      <h3 className="demo-title">A wave that focuses for an instant</h3>
      <p className="demo-hint">
        A real computation of a 2D wave. It starts as a ring, rushes inward, spikes to a point
        at t = {R}, then spreads out again. Measured in L^p at that one moment, it looks rough. Averaged over a
        time window, the spike barely counts, because it lasts only about 1/N. That gap is local
        smoothing. Drag on the graph to scrub time.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.75rem' }}>
        <canvas
          ref={canvasRef}
          width={PIX}
          height={PIX}
          role="img"
          aria-label={`Wave field at time ${t.toFixed(2)}, frequency ${N}`}
          style={{ maxWidth: 300, margin: '0 auto', imageRendering: 'auto', borderRadius: '50%' }}
        />
        <svg
          ref={plotRef}
          viewBox={`0 0 ${PW} ${PH}`}
          role="img"
          aria-label="L^p size of the wave over time"
          onPointerDown={scrub}
          onPointerMove={scrub}
          style={{ cursor: 'ew-resize' }}
        >
          <defs>
            <filter id="ls-glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="1.8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect x={px(WIN[0])} y={10} width={px(WIN[1]) - px(WIN[0])} height={PH - 28} fill="#2ee6c5" opacity={0.07} />
          <text x={(px(WIN[0]) + px(WIN[1])) / 2} y={PH - 22} textAnchor="middle" fill="#2ee6c5" fontSize="7" opacity={0.8}>
            time window (length 1)
          </text>
          <line x1={26} x2={PW - 8} y1={PH - 18} y2={PH - 18} stroke="#24332e" />
          <line x1={26} x2={26} y1={10} y2={PH - 18} stroke="#24332e" />
          {[0, R, T_END].map((v) => (
            <text key={v} x={px(v)} y={PH - 7} textAnchor="middle" fill="#8aa39a" fontSize="7">
              t={v.toFixed(1)}
            </text>
          ))}
          <line x1={px(WIN[0])} x2={px(WIN[1])} y1={py(winStats.peak)} y2={py(winStats.peak)} stroke="#f0c95a" strokeDasharray="3 2" />
          <text x={px(WIN[1]) + 3} y={py(winStats.peak) + 3} fill="#f0c95a" fontSize="7">
            worst moment ×{winStats.peak.toFixed(2)}
          </text>
          <line x1={px(WIN[0])} x2={px(WIN[1])} y1={py(winStats.avg)} y2={py(winStats.avg)} stroke="#2ee6c5" strokeWidth={1.5} />
          <text x={px(WIN[1]) + 3} y={py(winStats.avg) + 3} fill="#2ee6c5" fontSize="7">
            window average ×{winStats.avg.toFixed(2)}
          </text>
          <path d={path} fill="none" stroke="#e8f2ef" strokeWidth={1.6} filter="url(#ls-glow)" />
          <line x1={px(t)} x2={px(t)} y1={10} y2={PH - 18} stroke="#ffffff" strokeOpacity={0.5} />
          <circle cx={px(t)} cy={py(curve[frame])} r={3.5} fill="#ffffff" filter="url(#ls-glow)" />
          <text x={30} y={14} fill="#8aa39a" fontSize="7">
            ‖u(t)‖_p / ‖u(0)‖_p
          </text>
        </svg>
      </div>

      <div className="controls">
        <DimSlider label="Frequency N (data lives at |ξ| ≈ N to 2N)" value={N} min={8} max={36} onChange={setN} />
        <DimSlider label="Exponent p" value={p} min={2.5} max={12} step={0.5} onChange={setP} format={(v) => v.toFixed(1)} />
      </div>
      <div className="btn-row" style={{ marginBottom: '1rem' }}>
        <button type="button" className="btn" onClick={() => setPlaying((v) => !v)} disabled={reduced}>
          {playing && !reduced ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setPlaying(false)
            setFrame(Math.round((R / T_END) * (NT - 1)))
          }}
        >
          Jump to the focus
        </button>
      </div>

      <p className="demo-hint" style={{ marginBottom: '0.5rem' }}>
        Now raise the frequency. Each dot below is a separate run at that N. The slopes are the
        derivative losses. The teal line rises more slowly than the gold one, and the gap is the
        1/p gain.
      </p>
      <svg viewBox={`0 0 ${SW} ${SH}`} role="img" aria-label="Log-log growth of fixed-time and time-averaged norms against frequency">
        <line x1={30} x2={SW - 20} y1={SH - 20} y2={SH - 20} stroke="#24332e" />
        <line x1={30} x2={30} y1={12} y2={SH - 20} stroke="#24332e" />
        {SCALE_NS.map((n) => (
          <text key={n} x={sx(n)} y={SH - 8} textAnchor="middle" fill="#8aa39a" fontSize="7">
            N={n}
          </text>
        ))}
        <path
          d={scaling.rows.map((r, i) => `${i ? 'L' : 'M'}${sx(r.N)},${sy(r.fixed)}`).join(' ')}
          fill="none"
          stroke="#f0c95a"
          strokeWidth={1.4}
        />
        <path
          d={scaling.rows.map((r, i) => `${i ? 'L' : 'M'}${sx(r.N)},${sy(r.avg)}`).join(' ')}
          fill="none"
          stroke="#2ee6c5"
          strokeWidth={1.4}
        />
        {scaling.rows.map((r) => (
          <g key={r.N}>
            <circle cx={sx(r.N)} cy={sy(r.fixed)} r={r.N === N ? 4.5 : 3} fill="#f0c95a" />
            <circle cx={sx(r.N)} cy={sy(r.avg)} r={r.N === N ? 4.5 : 3} fill="#2ee6c5" />
          </g>
        ))}
        <text x={36} y={18} fill="#f0c95a" fontSize="7.5">
          worst moment: slope {scaling.sFixed.toFixed(2)} (theory {predFixed.toFixed(2)})
        </text>
        <text x={36} y={29} fill="#2ee6c5" fontSize="7.5">
          time-averaged: slope {scaling.sAvg.toFixed(2)} (theory {predAvg.toFixed(2)})
        </text>
      </svg>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        Measured gain {(scaling.sFixed - scaling.sAvg).toFixed(2)} derivatives; 1/p = {(1 / p).toFixed(2)}.
        {p <= 4
          ? ' Below p = 4 (the 2D critical exponent) this example has no averaged loss at all, so the gap is smaller than 1/p.'
          : ''}
      </p>

      <div className="controls">
        <DimSlider label="Formula in dimension n" value={dim} min={2} max={10} onChange={setDim} />
      </div>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        ℝ^{dim}: fixed-time loss (n−1)(1/2 − 1/p) = {fixedN.toFixed(3)}. Conjectured time-averaged
        loss {p > crit ? (fixedN - 1 / p).toFixed(3) : '—'}
        {p > crit ? '' : ` (needs p > 2n/(n−1) = ${crit.toFixed(2)})`}.
      </p>
      <p className="demo-callout">
        The simulation is in the plane, where Guth, Wang and Zhang proved the conjecture in 2019, and
        on one family of data (finite-precision quadrature, small N). The 26 Oct 2026 manuscript
        claims the sharp estimate for every dimension n ≥ 2, and with it Kakeya in every dimension.
        It was still under expert review on 31 Oct 2026.
      </p>
    </div>
  )
}
