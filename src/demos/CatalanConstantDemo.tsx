import { useEffect, useMemo, useRef, useState } from 'react'

/** Reference value of Catalan's constant (used only to place the funnel plot). */
const G = 0.915965594177219
const N_MAX = 20000
const LOG_FLOOR = -10 // funnel x-axis: |S_n - G| from 1e-10 to 1

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** n from a 0..1 slider position, logarithmic so early terms get room. */
function nFromU(u: number) {
  return Math.round((N_MAX + 1) ** u - 1)
}
function uFromN(n: number) {
  return Math.log(n + 1) / Math.log(N_MAX + 1)
}

// Funnel panel geometry
const FX = 222
const FW = 196
const FY = 22
const FH = 180
const mid = FX + FW / 2
function xOf(d: number) {
  const mag = Math.max(LOG_FLOOR, Math.log10(Math.max(Math.abs(d), 1e-16)))
  const r = (mag - LOG_FLOOR) / -LOG_FLOOR
  return mid + Math.sign(d) * r * (FW / 2)
}
function yOf(k: number) {
  return FY + (Math.log(k + 1) / Math.log(N_MAX + 1)) * FH
}
function funnelPath(n: number, sums: Float64Array) {
  const ks: number[] = []
  for (let k = 0; k <= Math.min(n, 300); k++) ks.push(k)
  if (n > 300) {
    let last = 300
    for (let i = 1; i <= 160; i++) {
      const k = Math.round(300 * (n / 300) ** (i / 160))
      if (k <= last) continue
      ks.push(k)
      if (k + 1 <= n) ks.push(k + 1)
      last = ks[ks.length - 1]
    }
  }
  return ks.map((k, i) => `${i === 0 ? 'M' : 'L'}${xOf(sums[k] - G).toFixed(1)},${yOf(k).toFixed(1)}`).join(' ')
}
/** Band |S_k - G| <= 1/(2k+3)^2 that the alternating series guarantees. */
function funnelEnvelope() {
  const left: string[] = []
  const right: string[] = []
  for (let i = 0; i <= 60; i++) {
    const k = Math.round((N_MAX + 1) ** (i / 60) - 1)
    const odd = 2 * k + 3
    const w = 1 / (odd * odd)
    left.push(`${xOf(-w).toFixed(1)},${yOf(k).toFixed(1)}`)
    right.push(`${xOf(w).toFixed(1)},${yOf(k).toFixed(1)}`)
  }
  return [...left, ...right.reverse()].join(' ')
}

/** Simplest fraction p/q strictly inside (lo, hi), 0 < lo < hi (continued-fraction descent). */
function simplest(lo: number, hi: number, depth = 0): [number, number] {
  const f = Math.floor(lo)
  if (f + 1 < hi) return [f + 1, 1]
  if (depth > 40 || hi - lo < 1e-14) return [Math.round(lo * 1e9), 1e9]
  const [p, q] = simplest(1 / (hi - f), 1 / (lo - f), depth + 1)
  return [f * p + q, p]
}

/** Count leading decimal places shared by every number in [lo, hi]. */
function settledPlaces(lo: number, hi: number) {
  let places = 0
  for (let k = 1; k <= 12; k++) {
    const s = 10 ** k
    if (Math.floor(lo * s) !== Math.floor(hi * s)) break
    places = k
  }
  return places
}

export function CatalanConstantDemo() {
  const [n, setN] = useState(3)
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)
  const nRef = useRef(n)
  useEffect(() => {
    nRef.current = n
  }, [n])

  /** S[k] = sum_{j<=k} (-1)^j/(2j+1)^2 */
  const sums = useMemo(() => {
    const s = new Float64Array(N_MAX + 2)
    let acc = 0
    for (let k = 0; k <= N_MAX + 1; k++) {
      const odd = 2 * k + 1
      acc += (k % 2 === 0 ? 1 : -1) / (odd * odd)
      s[k] = acc
    }
    return s
  }, [])

  useEffect(() => {
    if (!playing) return
    if (reducedMotion()) {
      setN(N_MAX)
      setPlaying(false)
      return
    }
    const startU = nRef.current >= N_MAX ? 0 : uFromN(nRef.current)
    const t0 = performance.now()
    const dur = 7000 * (1 - startU)
    const tick = (now: number) => {
      const u = Math.min(1, startU + ((now - t0) / Math.max(dur, 1)) * (1 - startU))
      setN(nFromU(u))
      if (u < 1) raf.current = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing])

  const sn = sums[n]
  const snext = sums[n + 1]
  const lo = Math.min(sn, snext)
  const hi = Math.max(sn, snext)
  const places = settledPlaces(lo, hi)
  const shown = sn.toFixed(10)
  const settledText = shown.slice(0, 2 + places)
  const restText = shown.slice(2 + places)
  const [p, q] = useMemo(() => simplest(lo, hi), [lo, hi])
  const nextOdd = 2 * n + 3

  // ---------- nested squares panel ----------
  const SQ = 180
  const sqX = 14
  const sqY = 22
  const squares = []
  const visible = Math.min(n, 80)
  for (let k = 0; k <= visible; k++) {
    const side = SQ / (2 * k + 1)
    const plus = k % 2 === 0
    squares.push(
      <rect
        key={k}
        x={sqX}
        y={sqY + SQ - side}
        width={side}
        height={side}
        fill={plus ? `hsl(${168 - Math.min(k, 30) * 1.5} 78% ${54 - Math.min(k, 30) * 0.4}%)` : '#070b0a'}
        stroke={k === n ? '#f0c95a' : 'none'}
        strokeWidth={k === n ? 1.5 : 0}
      />,
    )
  }

  const path = useMemo(() => funnelPath(n, sums), [n, sums])
  const envelope = useMemo(() => funnelEnvelope(), [])

  return (
    <div className="demo">
      <h3 className="demo-title">Catalan's constant: squares that add and subtract</h3>
      <p className="demo-hint">
        G = 1 − 1/3² + 1/5² − 1/7² + … Left: nested squares of side 1/(2k+1). Odd-numbered
        bands are cut out, so the colored area is exactly the partial sum. Right: each partial sum's
        distance from G on a log scale. The zigzag pinches toward G. Press play or drag the slider.
      </p>
      <svg viewBox="0 0 430 236" role="img" aria-label="Nested alternating squares and a funnel plot of partial sums converging to Catalan's constant">
        <defs>
          <filter id="cat-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="cat-funnel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2ee6c5" stopOpacity="0.18" />
            <stop offset="1" stopColor="#f0c95a" stopOpacity="0.28" />
          </linearGradient>
        </defs>
        <text x={sqX} y={14} fill="#8aa39a" fontSize="9.5" fontFamily="IBM Plex Mono">
          colored area = S_{n} = {sn.toFixed(6)}
        </text>
        <rect x={sqX} y={sqY} width={SQ} height={SQ} fill="none" stroke="#24332e" />
        {squares}
        <text x={sqX + SQ - 4} y={sqY + SQ + 13} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          side 1
        </text>
        <text x={sqX} y={sqY + SQ + 13} fill={n % 2 === 0 ? '#2ee6c5' : '#ff6b6b'} fontSize="9" fontFamily="IBM Plex Mono">
          last move: {n % 2 === 0 ? '+' : '−'}1/{2 * n + 1}²
        </text>

        <text x={FX} y={14} fill="#8aa39a" fontSize="9.5" fontFamily="IBM Plex Mono">
          S_k − G (log scale), k ↓
        </text>
        <polygon points={envelope} fill="url(#cat-funnel)" />
        <line x1={mid} y1={FY} x2={mid} y2={FY + FH} stroke="#f0c95a" strokeDasharray="3 3" strokeWidth="1" />
        <path d={path} fill="none" stroke="#2ee6c5" strokeWidth="1.3" strokeLinejoin="round" filter="url(#cat-glow)" />
        <circle cx={xOf(sn - G)} cy={yOf(n)} r={4} fill="#f0c95a" filter="url(#cat-glow)" />
        <text x={mid} y={FY + FH + 13} textAnchor="middle" fill="#f0c95a" fontSize="9" fontFamily="IBM Plex Mono">
          G
        </text>
        <text x={FX} y={FY + FH + 13} fill="#8aa39a" fontSize="8.5" fontFamily="IBM Plex Mono">
          −1
        </text>
        <text x={FX + FW} y={FY + FH + 13} textAnchor="end" fill="#8aa39a" fontSize="8.5" fontFamily="IBM Plex Mono">
          +1
        </text>
        <text x={mid + 4} y={FY + FH + 26} textAnchor="middle" fill="#8aa39a" fontSize="8" fontFamily="IBM Plex Mono">
          center = within 10⁻¹⁰
        </text>
      </svg>

      <div
        role="status"
        style={{
          margin: 'var(--space-3) 0',
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(1.1rem, 4.6vw, 1.6rem)',
          letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span style={{ color: 'var(--accent-2)', textShadow: '0 0 12px color-mix(in srgb, var(--accent-2) 55%, transparent)' }}>
          {settledText}
        </span>
        <span style={{ color: 'var(--muted)', opacity: 0.55 }}>{restText}</span>
        <span className="pill-inline" style={{ marginLeft: 10 }}>
          {places} settled
        </span>
      </div>

      <div className="controls">
        <label>
          Terms added: <span className="stat">n = {n.toLocaleString()}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={uFromN(n)}
            onChange={(e) => {
              setPlaying(false)
              setN(nFromU(Number(e.target.value)))
            }}
          />
        </label>
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={() => setPlaying((v) => !v)}>
          {playing ? 'Pause' : n >= N_MAX ? 'Replay' : 'Play'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setPlaying(false); setN((v) => Math.min(N_MAX, v + 1)) }}>
          +1 term
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setPlaying(false); setN(0) }}>
          Reset
        </button>
      </div>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        G is trapped between S_n and S_(n+1), a bracket of width 1/{nextOdd}² ≈{' '}
        {(1 / (nextOdd * nextOdd)).toExponential(1)}. Simplest fraction still inside the bracket:{' '}
        <span style={{ color: 'var(--accent)' }}>
          {p.toLocaleString()}/{q.toLocaleString()}
        </span>
        .
      </p>
      <p className="demo-callout">
        Every bracket, however thin, still contains fractions. The simplest one just needs a bigger
        denominator as the bracket shrinks. That trend fits irrationality but proves nothing. The
        October 2026 claim, unchecked here, is that the limit G itself is not p/q for any integers.
        Digits shown are partial sums. G has no known closed form.
      </p>
    </div>
  )
}
