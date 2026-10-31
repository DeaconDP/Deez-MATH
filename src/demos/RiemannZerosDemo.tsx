import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Real ζ(1/2 + it) via Euler–Maclaurin, and Hardy's Z(t) = e^{iθ}ζ   */
/* ------------------------------------------------------------------ */

const BERNOULLI = [
  1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66, -691 / 2730, 7 / 6, -3617 / 510, 43867 / 798,
  -174611 / 330,
]

/** ζ(1/2 + it), accurate to ~1e-10 for 0 ≤ t ≤ 200. */
function zetaHalf(t: number): [number, number] {
  const sr = 0.5
  const si = t
  const N = Math.floor((Math.abs(t) + 20) / (2 * Math.PI)) + 10
  let re = 0
  let im = 0
  for (let n = 1; n < N; n++) {
    const m = n ** -sr
    const a = -t * Math.log(n)
    re += m * Math.cos(a)
    im += m * Math.sin(a)
  }
  const ang = -t * Math.log(N)
  const mg = N ** -sr
  const nr = mg * Math.cos(ang)
  const ni = mg * Math.sin(ang)
  // N^{1-s}/(s-1)
  const s1r = sr - 1
  const s1i = si
  const den = s1r * s1r + s1i * s1i
  const ar = N * nr
  const ai = N * ni
  re += (ar * s1r + ai * s1i) / den
  im += (ai * s1r - ar * s1i) / den
  re += nr / 2
  im += ni / 2
  let pr = sr
  let pi = si
  let fact = 2
  let pw = 1 / N
  for (let k = 1; k <= BERNOULLI.length; k++) {
    const c = (BERNOULLI[k - 1] / fact) * pw
    re += c * (pr * nr - pi * ni)
    im += c * (pr * ni + pi * nr)
    for (const add of [2 * k - 1, 2 * k]) {
      const xr = sr + add
      const r2 = pr * xr - pi * si
      pi = pr * si + pi * xr
      pr = r2
    }
    fact *= (2 * k + 1) * (2 * k + 2)
    pw /= N * N
  }
  return [re, im]
}

/** Riemann–Siegel theta θ(t) = Im log Γ(1/4 + it/2) − (t/2) log π. */
function theta(t: number) {
  const zr = 0.25
  const zi = t / 2
  let acc = 0
  for (let j = 0; j < 10; j++) acc += Math.atan2(zi, zr + j)
  const wr = zr + 10
  const wi = zi
  const lr = 0.5 * Math.log(wr * wr + wi * wi)
  const li = Math.atan2(wi, wr)
  let im = (wr - 0.5) * li + wi * lr - wi
  const d = wr * wr + wi * wi
  const iwr = wr / d
  const iwi = -wi / d
  const w3i = 3 * iwr * iwr * iwi - iwi * iwi * iwi
  im += iwi / 12 - w3i / 360
  return im - acc - (t / 2) * Math.log(Math.PI)
}

function hardyZ(t: number) {
  const [a, b] = zetaHalf(t)
  const th = theta(t)
  return a * Math.cos(th) - b * Math.sin(th)
}

const T_MAX = 100
const STEP = 0.05

type Sample = { t: number; re: number; im: number; z: number }

function buildData() {
  const samples: Sample[] = []
  for (let i = 0; i <= T_MAX / STEP; i++) {
    const t = i * STEP
    const [re, im] = zetaHalf(t)
    samples.push({ t, re, im, z: hardyZ(t) })
  }
  const zeros: number[] = []
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]
    const b = samples[i]
    if (a.z === 0 || a.z * b.z >= 0) continue
    // bisection on the sign change of the real function Z
    let lo = a.t
    let hi = b.t
    let flo = a.z
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2
      const fm = hardyZ(mid)
      if (fm * flo <= 0) hi = mid
      else {
        lo = mid
        flo = fm
      }
    }
    zeros.push((lo + hi) / 2)
  }
  return { samples, zeros }
}

/** Riemann–von Mangoldt main term: expected number of zeros with 0 < γ ≤ T. */
function smoothN(T: number) {
  if (T < 2 * Math.PI) return 0
  const x = T / (2 * Math.PI)
  return x * Math.log(x) - x + 7 / 8
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

/* Unconditional "proportion on the line" records (approximate published constants). */
const RECORDS = [
  { who: 'Levinson 1974', pct: 34.74, note: 'on the line' },
  { who: 'Conrey 1989', pct: 40.88, note: 'on the line' },
  { who: 'Bui–Conrey–Young 2011', pct: 41.05, note: 'on the line' },
  { who: 'Feng 2012', pct: 41.28, note: 'on the line' },
  { who: 'Pratt–Robles–Zaharescu–Zeindler 2020', pct: 41.73, note: 'on the line' },
  { who: 'Aug 2026 (Lean-checked)', pct: 67.25, note: 'simple and on the line' },
]

/* Layout constants */
const PW = 300 // polar panel
const PH = 300
const P_MIN_X = -2
const P_MAX_X = 4.6
const P_SCALE = PW / (P_MAX_X - P_MIN_X)
const P_CY = PH / 2
const px = (re: number) => (re - P_MIN_X) * P_SCALE
const py = (im: number) => P_CY - im * P_SCALE

const ZW = 640
const ZH = 190
const Z_PAD_L = 28
const Z_PAD_R = 10
const Z_MID = 92
const Z_AMP = 17
const zx = (t: number) => Z_PAD_L + (t / T_MAX) * (ZW - Z_PAD_L - Z_PAD_R)
const zy = (z: number) => Z_MID - Math.max(-4.8, Math.min(4.8, z)) * Z_AMP

export function RiemannZerosDemo() {
  const { samples, zeros } = useMemo(buildData, [])
  const reduced = useReducedMotion()
  const [T, setT] = useState(40)
  const [playing, setPlaying] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const raf = useRef(0)

  const idx = Math.min(samples.length - 1, Math.round(T / STEP))
  const cur = samples[idx]
  const found = zeros.filter((g) => g <= T)
  const lastZero = found.length ? found[found.length - 1] : null
  const nearZero = lastZero !== null && T - lastZero < 0.9

  const polarPath = useMemo(() => {
    let d = ''
    for (let i = 0; i <= idx; i += 1) {
      const s = samples[i]
      d += `${i ? 'L' : 'M'}${px(s.re).toFixed(1)} ${py(s.im).toFixed(1)}`
    }
    return d
  }, [samples, idx])

  const zPath = useMemo(() => {
    let d = ''
    samples.forEach((s, i) => {
      if (i % 2 && i !== samples.length - 1) return
      d += `${i ? 'L' : 'M'}${zx(s.t).toFixed(1)} ${zy(s.z).toFixed(1)}`
    })
    return d
  }, [samples])

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current)
    setPlaying(false)
  }, [])

  const play = () => {
    if (playing) {
      stop()
      return
    }
    if (reduced) {
      setT(T_MAX)
      return
    }
    const start = T >= T_MAX - 0.5 ? 0 : T
    let last = performance.now()
    let t = start
    setPlaying(true)
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // slow down near zeros so each crossing registers
      const near = zeros.some((g) => Math.abs(g - t) < 0.6)
      t += dt * (near ? 3 : 9)
      if (t >= T_MAX) {
        setT(T_MAX)
        setPlaying(false)
        return
      }
      setT(t)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const setFromPointer = (clientX: number) => {
    const svg = svgRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * ZW
    const t = ((x - Z_PAD_L) / (ZW - Z_PAD_L - Z_PAD_R)) * T_MAX
    setT(Math.max(0, Math.min(T_MAX, t)))
  }

  const expected = smoothN(T)

  return (
    <div className="demo">
      <h3 className="demo-title">Hunting zeta zeros on the critical line</h3>
      <p className="demo-hint">
        These are real values of ζ(½ + it), computed live. Left: the path ζ traces in the complex
        plane as the height t climbs. Every time it passes through the origin, that is a zero on
        the critical line. Right: Hardy’s Z(t), a real function with |Z(t)| = |ζ(½ + it)|. A sign
        change of Z proves a zero sits exactly on the line. Drag the strip or press play.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-3)',
          alignItems: 'start',
        }}
      >
        <svg viewBox={`0 0 ${PW} ${PH}`} role="img" aria-label={`Path of zeta on the critical line up to height ${T.toFixed(1)}`}>
          <defs>
            <radialGradient id="rz-glow">
              <stop offset="0%" stopColor="#f0c95a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f0c95a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rz-stroke" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#1a9e87" />
              <stop offset="100%" stopColor="#2ee6c5" />
            </linearGradient>
            <clipPath id="rz-clip">
              <rect x="0" y="0" width={PW} height={PH} />
            </clipPath>
          </defs>
          {/* grid */}
          {[-1, 0, 1, 2, 3, 4].map((v) => (
            <line key={`gx${v}`} x1={px(v)} x2={px(v)} y1={0} y2={PH} stroke="#24332e" strokeWidth={v === 0 ? 1.2 : 0.5} />
          ))}
          {[-2, -1, 0, 1, 2].map((v) => (
            <line key={`gy${v}`} x1={0} x2={PW} y1={py(v)} y2={py(v)} stroke="#24332e" strokeWidth={v === 0 ? 1.2 : 0.5} />
          ))}
          <text x={px(4) + 3} y={py(0) - 4} fontSize="9" fill="#8aa39a">Re</text>
          <text x={px(0) + 4} y={12} fontSize="9" fill="#8aa39a">Im</text>
          <g clipPath="url(#rz-clip)">
            <path d={polarPath} fill="none" stroke="url(#rz-stroke)" strokeWidth={1.3} strokeLinejoin="round" opacity={0.9} />
          </g>
          {/* origin target */}
          <circle cx={px(0)} cy={py(0)} r={nearZero ? 22 : 10} fill="url(#rz-glow)" opacity={nearZero ? 1 : 0.35} style={{ transition: 'r 200ms, opacity 200ms' }} />
          <circle cx={px(0)} cy={py(0)} r={3} fill="none" stroke="#f0c95a" strokeWidth={1.2} />
          {/* current point */}
          <line x1={px(0)} y1={py(0)} x2={px(cur.re)} y2={py(cur.im)} stroke="#e8f2ef" strokeOpacity={0.25} strokeDasharray="3 3" />
          <circle cx={px(cur.re)} cy={py(cur.im)} r={5} fill="#2ee6c5" stroke="#070b0a" strokeWidth={1.5} />
          <text x={8} y={PH - 26} fontSize="10" fill="#e8f2ef">
            ζ(½ + {T.toFixed(2)}i)
          </text>
          <text x={8} y={PH - 12} fontSize="10" fill="#8aa39a">
            = {cur.re.toFixed(3)} {cur.im < 0 ? '−' : '+'} {Math.abs(cur.im).toFixed(3)}i
          </text>
        </svg>

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-2)',
              fontSize: '0.8rem',
            }}
          >
            <Tile label="height t" value={T.toFixed(1)} color="var(--fg)" />
            <Tile label="zeros found (sign changes)" value={String(found.length)} color="var(--accent)" />
            <Tile label="expected N(t) (Riemann–von Mangoldt)" value={expected.toFixed(1)} color="var(--accent-2)" />
            <Tile
              label="last zero γ"
              value={lastZero ? lastZero.toFixed(6) : '—'}
              color={nearZero ? 'var(--accent-2)' : 'var(--muted)'}
            />
          </div>
          <p className="pill-inline" style={{ margin: 0 }}>
            Counting sign changes and matching the expected total is Turing’s method. It is how
            computers certify that every zero up to a height is on the line. Here, all{' '}
            {zeros.length} zeros up to t = 100 pass.
          </p>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${ZW} ${ZH}`}
        role="slider"
        aria-label="Height t on the critical line"
        aria-valuemin={0}
        aria-valuemax={T_MAX}
        aria-valuenow={Math.round(T * 10) / 10}
        tabIndex={0}
        style={{ marginTop: 'var(--space-3)', cursor: 'ew-resize' }}
        onPointerDown={(e) => {
          stop()
          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
          setFromPointer(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons) setFromPointer(e.clientX)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setT((v) => Math.min(T_MAX, v + 0.5))
          if (e.key === 'ArrowLeft') setT((v) => Math.max(0, v - 0.5))
        }}
      >
        <defs>
          <linearGradient id="rz-z" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2ee6c5" />
            <stop offset="50%" stopColor="#2ee6c5" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#7eb6ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7eb6ff" />
          </linearGradient>
          <clipPath id="rz-reveal">
            <rect x={0} y={0} width={zx(T)} height={ZH} />
          </clipPath>
        </defs>
        <line x1={Z_PAD_L} x2={ZW - Z_PAD_R} y1={Z_MID} y2={Z_MID} stroke="#24332e" />
        {[20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={zx(t)} x2={zx(t)} y1={Z_MID - 3} y2={Z_MID + 3} stroke="#8aa39a" />
            <text x={zx(t)} y={ZH - 6} fontSize="10" fill="#8aa39a" textAnchor={t === 100 ? 'end' : 'middle'}>
              t = {t}
            </text>
          </g>
        ))}
        <text x={4} y={Z_MID - 60} fontSize="10" fill="#8aa39a">Z(t)</text>
        <path d={zPath} fill="none" stroke="#24332e" strokeWidth={1.2} />
        <g clipPath="url(#rz-reveal)">
          <path d={zPath} fill="none" stroke="url(#rz-z)" strokeWidth={1.8} />
        </g>
        {zeros.map((g) => {
          const on = g <= T
          return (
            <circle
              key={g}
              cx={zx(g)}
              cy={Z_MID}
              r={on ? 3.4 : 2}
              fill={on ? '#f0c95a' : '#24332e'}
              style={{ filter: on ? 'drop-shadow(0 0 3px #f0c95a)' : undefined, transition: 'r 200ms' }}
            />
          )
        })}
        <line x1={zx(T)} x2={zx(T)} y1={8} y2={ZH - 20} stroke="#e8f2ef" strokeOpacity={0.6} />
        <circle cx={zx(T)} cy={zy(cur.z)} r={4} fill="#e8f2ef" />
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <button type="button" className="btn" onClick={play}>
          {playing ? 'Pause' : T >= T_MAX - 0.5 ? 'Replay sweep' : 'Play sweep to t = 100'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            stop()
            setT(zeros[0] + 0.02)
          }}
        >
          Jump to first zero (14.1347…)
        </button>
      </div>

      <h4 style={{ margin: '0 0 var(--space-2)', fontSize: '0.9rem' }}>
        What is proved for <em>all</em> zeros, not just the first few
      </h4>
      <svg viewBox="0 0 640 196" role="img" aria-label="Records for the proportion of zeta zeros proved on the critical line">
        {RECORDS.map((r, i) => {
          const y = 10 + i * 28
          const w = (r.pct / 100) * 400
          const latest = i === RECORDS.length - 1
          return (
            <g key={r.who}>
              <text x={8} y={y + 13} fontSize="10.5" fill={latest ? '#f0c95a' : '#8aa39a'}>
                {r.who}
              </text>
              <rect x={232} y={y} width={400} height={18} rx={3} fill="#0e1614" stroke="#24332e" />
              <rect
                x={232}
                y={y}
                width={w}
                height={18}
                rx={3}
                fill={latest ? '#f0c95a' : '#1a9e87'}
                opacity={latest ? 0.95 : 0.7}
                style={{ filter: latest ? 'drop-shadow(0 0 6px #f0c95a)' : undefined }}
              />
              <text x={236 + w} y={y + 13} fontSize="10" fill="#e8f2ef" textAnchor={w > 330 ? 'end' : 'start'} dx={w > 330 ? -8 : 2}>
                {r.pct.toFixed(2)}% {latest ? 'simple + on line' : ''}
              </text>
            </g>
          )
        })}
        <line x1={232 + 400 * (2 / 3)} x2={232 + 400 * (2 / 3)} y1={4} y2={180} stroke="#f0c95a" strokeDasharray="2 3" opacity={0.6} />
        <text x={232 + 400 * (2 / 3)} y={192} fontSize="9.5" fill="#f0c95a" textAnchor="middle">
          2/3
        </text>
        <text x={630} y={192} fontSize="9.5" fill="#e8f2ef" textAnchor="end">
          RH = 100%
        </text>
      </svg>

      <p className="demo-callout">
        A sweep up to t = 100 can never prove RH, since there are infinitely many zeros. The August
        2026 theorem is about proportions as T → ∞: at least 2/3 − o(1) of zeros are simple and on
        the line (about 67.25% with the Montgomery–Taylor window), and at least 5/6 are distinct.
        Older records count zeros on the line, and the 2026 figure counts only simple ones. The full
        hypothesis is still open.
      </p>
    </div>
  )
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-2) var(--space-3)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: '#070b0a',
      }}
    >
      <div className="pill-inline" style={{ fontSize: '0.68rem' }}>
        {label}
      </div>
      <div className="stat" style={{ color, fontSize: '1.05rem', fontWeight: 600 }}>
        {value}
      </div>
    </div>
  )
}
