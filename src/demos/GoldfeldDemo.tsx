import { useEffect, useRef, useState } from 'react'

/*
 * Real computation, small scale. E = 11a1: y² + y = x³ − x² − 10x − 20 (conductor 11, root number +1).
 * Its newform is q·∏(1 − qⁿ)²(1 − q¹¹ⁿ)². For a fundamental discriminant D coprime to 11 the twist E_D has
 * coefficients χ_D(n)·aₙ, conductor 11·D², and root number w = χ_D(−11) = sign(D)·(D/11).
 * w = +1: L(E_D, 1) = 2 Σ χ_D(n) aₙ/n · e^{−2πn/√N}
 * w = −1: L′(E_D, 1) = 2 Σ χ_D(n) aₙ/n · E₁(2πn/√N)
 */

const MAX_ABS_D = 300
const COEF_N = 10500
const ZERO = 0.01 // nonzero values seen here are all well above this

let COEFS: Float64Array | null = null
function coefs() {
  if (COEFS) return COEFS
  const pent: { e: number; s: number }[] = []
  for (let k = 0; ; k++) {
    const e1 = (k * (3 * k - 1)) / 2
    const e2 = (k * (3 * k + 1)) / 2
    if (e1 > COEF_N) break
    const s = k % 2 ? -1 : 1
    pent.push({ e: e1, s })
    if (k > 0 && e2 <= COEF_N) pent.push({ e: e2, s })
  }
  // A = ∏(1 − qⁿ)², B = ∏(1 − q¹¹ⁿ)²
  const A = new Float64Array(COEF_N + 1)
  const B = new Float64Array(COEF_N + 1)
  for (const p of pent)
    for (const q of pent) {
      if (p.e + q.e <= COEF_N) A[p.e + q.e] += p.s * q.s
      if (11 * (p.e + q.e) <= COEF_N) B[11 * (p.e + q.e)] += p.s * q.s
    }
  const a = new Float64Array(COEF_N + 1)
  for (let j = 0; j <= COEF_N; j++) {
    if (!B[j]) continue
    for (let i = 0; i + j + 1 <= COEF_N; i++) if (A[i]) a[i + j + 1] += A[i] * B[j]
  }
  COEFS = a
  return a
}

/** Kronecker symbol (D/n) for n > 0. */
function kron(D: number, n: number) {
  let r = 1
  while (n % 2 === 0) {
    n /= 2
    const m = ((D % 8) + 8) % 8
    if (m % 2 === 0) return 0
    if (m === 3 || m === 5) r = -r
  }
  let x = ((D % n) + n) % n
  let y = n
  while (x) {
    while (x % 2 === 0) {
      x /= 2
      const m = y % 8
      if (m === 3 || m === 5) r = -r
    }
    ;[x, y] = [y, x]
    if (x % 4 === 3 && y % 4 === 3) r = -r
    x %= y
  }
  return y === 1 ? r : 0
}

/** Exponential integral E₁(x), x > 0. */
function E1(x: number) {
  if (x < 1) {
    let s = -0.5772156649015329 - Math.log(x)
    let term = 1
    for (let k = 1; k < 40; k++) {
      term *= -x / k
      s -= term / k
    }
    return s
  }
  let b = x + 1
  let c = 1e300
  let d = 1 / b
  let h = d
  for (let i = 1; i < 200; i++) {
    const an = -i * i
    b += 2
    d = 1 / (an * d + b)
    c = b + an / c
    const del = c * d
    h *= del
    if (Math.abs(del - 1) < 1e-14) break
  }
  return h * Math.exp(-x)
}

const squarefree = (n: number) => {
  for (let p = 2; p * p <= n; p++) if (n % (p * p) === 0) return false
  return true
}

const TWISTS: number[] = []
for (let m = 1; m <= MAX_ABS_D; m++) if (squarefree(m) && m % 11 !== 0) TWISTS.push(m, -m)

type Coin = { d: number; D: number; w: 1 | -1; value: number; rank: 0 | 1 | 2 | 3 }

function compute(d: number): Coin {
  const a = coefs()
  const D = ((d % 4) + 4) % 4 === 1 ? d : 4 * d
  const w = (Math.sign(D) * kron(D, 11)) as 1 | -1
  const sq = Math.sqrt(11) * Math.abs(D)
  const nmax = Math.min(COEF_N, Math.ceil(2.7 * sq))
  let s = 0
  for (let n = 1; n <= nmax; n++) {
    if (!a[n]) continue
    const c = kron(D, n)
    if (!c) continue
    const x = (2 * Math.PI * n) / sq
    s += ((a[n] * c) / n) * (w === 1 ? Math.exp(-x) : E1(x))
  }
  const value = 2 * s
  const zero = Math.abs(value) < ZERO
  const rank = (w === 1 ? (zero ? 2 : 0) : zero ? 3 : 1) as Coin['rank']
  return { d, D, w, value, rank }
}

const COLORS: Record<Coin['rank'], string> = { 0: '#2ee6c5', 1: '#f0c95a', 2: '#c792ff', 3: '#ff6b6b' }
const COLS = 20
const CELL = 20
const GW = COLS * CELL
const GH = Math.ceil(TWISTS.length / COLS) * CELL

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function GoldfeldDemo() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [playing, setPlaying] = useState(false)
  const [pick, setPick] = useState<number | null>(null)
  const coinsRef = useRef<Coin[]>([])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const cur = coinsRef.current
      const next = cur.slice()
      const per = cur.length < 40 ? 1 : 3
      for (let k = 0; k < per && next.length < TWISTS.length; k++) next.push(compute(TWISTS[next.length]))
      coinsRef.current = next
      setCoins(next)
      if (next.length >= TWISTS.length) {
        setPlaying(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  function play() {
    if (coinsRef.current.length >= TWISTS.length) {
      coinsRef.current = []
      setCoins([])
      setPick(null)
    }
    if (reducedMotion()) {
      const all = TWISTS.map(compute)
      coinsRef.current = all
      setCoins(all)
      return
    }
    setPlaying((p) => !p)
  }

  function revealAll() {
    setPlaying(false)
    const cur = coinsRef.current.slice()
    while (cur.length < TWISTS.length) cur.push(compute(TWISTS[cur.length]))
    coinsRef.current = cur
    setCoins(cur)
  }

  function reset() {
    setPlaying(false)
    coinsRef.current = []
    setCoins([])
    setPick(null)
  }

  const n = coins.length
  const r0 = coins.filter((c) => c.rank === 0).length
  const r1 = coins.filter((c) => c.rank === 1).length
  const rHigh = n - r0 - r1
  const mean = n ? coins.reduce((s, c) => s + c.rank, 0) / n : 0

  // running series for the chart
  const series = (() => {
    const f0: string[] = []
    const f1: string[] = []
    const mu: string[] = []
    let a0 = 0
    let a1 = 0
    let sum = 0
    const X = (i: number) => 30 + (i / TWISTS.length) * (GW - 40)
    const Y = (v: number) => 12 + (1 - v) * 116
    coins.forEach((c, i) => {
      if (c.rank === 0) a0++
      if (c.rank === 1) a1++
      sum += c.rank
      const k = i + 1
      const cmd = i ? 'L' : 'M'
      f0.push(`${cmd}${X(k).toFixed(1)},${Y(a0 / k).toFixed(1)}`)
      f1.push(`${cmd}${X(k).toFixed(1)},${Y(a1 / k).toFixed(1)}`)
      mu.push(`${cmd}${X(k).toFixed(1)},${Y(sum / k).toFixed(1)}`)
    })
    return { f0: f0.join(''), f1: f1.join(''), mu: mu.join(''), X, Y }
  })()

  const sel = pick != null ? coins[pick] : null
  const rankText = (c: Coin) => (c.rank === 2 ? '≥ 2' : c.rank === 3 ? '≥ 3' : String(c.rank))

  return (
    <div className="demo">
      <h3 className="demo-title">Flip the twists of one elliptic curve</h3>
      <p className="demo-hint">
        Curve 11a1: y² + y = x³ − x² − 10x − 20. Each coin is its quadratic twist by a signed squarefree d, in
        order of |d| (d = 1, −1, 2, −2, …). Press Play: each coin computes a real L-series. Its sign (root number)
        picks the parity; then L(1) or L′(1) being nonzero gives analytic rank 0 (teal) or 1 (gold). Violet (even) and red
        (odd) coins vanish to higher order.
      </p>
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={`${n} twists computed: ${r0} rank 0, ${r1} rank 1, ${rHigh} higher.`}>
        <style>{`@keyframes gf-flip{0%{transform:scale(0.1) rotateY(90deg);opacity:0}70%{transform:scale(1.25)}100%{transform:scale(1);opacity:1}}.gf-coin{transform-box:fill-box;transform-origin:center;animation:gf-flip 420ms ease-out both}`}</style>
        <defs>
          <filter id="gf-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {TWISTS.map((d, i) => {
          const x = (i % COLS) * CELL + CELL / 2
          const y = Math.floor(i / COLS) * CELL + CELL / 2
          const c = coins[i]
          if (!c) return <circle key={d} cx={x} cy={y} r={6.5} fill="none" stroke="#1c2925" />
          return (
            <g key={d} onClick={() => setPick(i)} style={{ cursor: 'pointer' }}>
              <circle
                className="gf-coin"
                cx={x}
                cy={y}
                r={c.rank >= 2 ? 8 : 7.2}
                fill={COLORS[c.rank]}
                fillOpacity={c.rank >= 2 ? 1 : 0.85}
                stroke={pick === i ? '#ffffff' : '#070b0a'}
                strokeWidth={pick === i ? 2 : 1}
                filter={c.rank >= 2 ? 'url(#gf-glow)' : undefined}
              />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono" fill="#070b0a" pointerEvents="none">
                {c.rank === 3 ? '3+' : c.rank === 2 ? '2+' : c.rank}
              </text>
            </g>
          )
        })}
      </svg>

      <svg viewBox={`0 0 ${GW} 150`} role="img" aria-label={`Running densities: rank 0 ${(r0 / Math.max(1, n)).toFixed(2)}, rank 1 ${(r1 / Math.max(1, n)).toFixed(2)}, mean ${mean.toFixed(2)}.`} style={{ marginTop: 'var(--space-3)' }}>
        <line x1={30} x2={GW - 10} y1={series.Y(0.5)} y2={series.Y(0.5)} stroke="#e8f2ef" strokeOpacity="0.35" strokeDasharray="4 4" />
        <text x={26} y={series.Y(0.5) + 3} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          ½
        </text>
        <text x={26} y={series.Y(1) + 3} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          1
        </text>
        <text x={26} y={series.Y(0) + 3} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          0
        </text>
        <path d={series.f0} fill="none" stroke="#2ee6c5" strokeWidth="1.8" />
        <path d={series.f1} fill="none" stroke="#f0c95a" strokeWidth="1.8" />
        <path d={series.mu} fill="none" stroke="#ffffff" strokeWidth="2.2" />
        <text x={GW - 12} y={144} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          teal: share rank 0 · gold: share rank 1 · white: mean rank
        </text>
      </svg>

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={play}>
          {playing ? 'Pause' : n >= TWISTS.length ? 'Replay' : n ? 'Resume' : 'Play'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={revealAll} disabled={n >= TWISTS.length}>
          Compute all {TWISTS.length}
        </button>
        <button type="button" className="btn btn-ghost" onClick={reset} disabled={!n}>
          Reset
        </button>
      </div>
      <p className="stat" role="status">
        {n} twists · rank 0: {r0} ({n ? ((100 * r0) / n).toFixed(1) : '0'}%) · rank 1: {r1} ({n ? ((100 * r1) / n).toFixed(1) : '0'}%) ·
        higher: {rHigh} · mean analytic rank {mean.toFixed(3)}
      </p>
      <p className="feedback" style={{ color: sel ? (sel.rank >= 2 ? '#c792ff' : 'var(--fg)') : 'var(--muted)', minHeight: '2.4em' }}>
        {sel
          ? `d = ${sel.d} (discriminant ${sel.D}): root number ${sel.w > 0 ? '+1' : '−1'}, ${sel.w > 0 ? 'L(1)' : 'L′(1)'} ≈ ${sel.value.toFixed(4)} → analytic rank ${rankText(sel)}${sel.rank >= 2 ? ' (value numerically zero; rare, and density zero per the claim)' : ''}.`
          : 'Tap any revealed coin to see its root number and L-value.'}
      </p>
      <p className="demo-callout">
        Goldfeld&apos;s conjecture, claimed proved (OpenAI catalog, Oct 2026, not machine-checked): in this ordering,
        half the twists have analytic rank 0, half rank 1, and the mean tends to ½. These ~{TWISTS.length} coins are
        a finite prefix. Here d divisible by 11 is skipped, higher ranks count at their minimum (2 or 3) in the mean, and &quot;zero&quot;
        means |value| &lt; {ZERO} numerically, not proven.
      </p>
    </div>
  )
}
