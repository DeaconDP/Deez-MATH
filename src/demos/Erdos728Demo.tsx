import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

const N_MIN = 10
const N_MAX = 600
const K_CAP = 90

const PRIMES: number[] = []
for (let i = 2; i <= N_MAX; i++) if (PRIMES.every((p) => p * p > i || i % p)) PRIMES.push(i)

/** Legendre: exponent of p in m! */
function vFact(m: number, p: number) {
  let s = 0
  while (m) {
    m = Math.floor(m / p)
    s += m
  }
  return s
}

/** VF[m][i] = exponent of PRIMES[i] in m! */
const VF: Int16Array[] = Array.from({ length: N_MAX + 1 }, (_, m) => Int16Array.from(PRIMES, (p) => vFact(m, p)))

/** Does a! b! divide n! k! (k = a + b − n)? Exact, prime by prime. */
function divides(n: number, a: number, b: number, k: number) {
  const A = VF[a]
  const B = VF[b]
  const Nn = VF[n]
  const Kk = VF[k]
  const top = Math.max(a, b)
  for (let i = 0; i < PRIMES.length && PRIMES[i] <= top; i++) if (Nn[i] + Kk[i] < A[i] + B[i]) return false
  return true
}

function findA(n: number, k: number, eps: number) {
  const lo = Math.ceil(eps * n)
  const hi = Math.floor((1 - eps) * n)
  for (let a = lo; a <= hi; a++) {
    const b = n + k - a
    if (b < a) break
    if (b > hi) continue
    if (divides(n, a, b, k)) return a
  }
  return null
}

type Row = { n: number; k: number; a: number }

function table(eps: number): Row[] {
  const rows: Row[] = []
  for (let n = N_MIN; n <= N_MAX; n++) {
    let best: Row | null = null
    for (let k = 1; k <= Math.min(K_CAP, n); k++) {
      const a = findA(n, k, eps)
      if (a != null) best = { n, k, a }
    }
    if (best) rows.push(best)
  }
  return rows
}

const W = 400
const H = 240
const ML = 34
const MB = 24
const MT = 10
const MR = 10

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function Erdos728Demo() {
  const [eps, setEps] = useState(0.25)
  const [C, setC] = useState(3)
  const [reveal, setReveal] = useState(N_MAX)
  const [sel, setSel] = useState<Row>({ n: 164, k: 28, a: 82 })
  const svgRef = useRef<SVGSVGElement>(null)
  const raf = useRef<number | null>(null)

  const rows = useMemo(() => table(eps), [eps])
  const kMax = Math.max(40, ...rows.map((r) => r.k))

  useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current)
  }, [])

  function replay() {
    if (raf.current != null) cancelAnimationFrame(raf.current)
    if (reducedMotion()) {
      setReveal(N_MAX)
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const n = Math.min(N_MAX, N_MIN + ((now - t0) / 2600) * (N_MAX - N_MIN))
      setReveal(n)
      if (n < N_MAX) raf.current = requestAnimationFrame(tick)
      else raf.current = null
    }
    raf.current = requestAnimationFrame(tick)
  }

  const sx = (n: number) => ML + ((n - N_MIN) / (N_MAX - N_MIN)) * (W - ML - MR)
  const sy = (k: number) => H - MB - (k / kMax) * (H - MB - MT)

  let curve = ''
  for (let n = N_MIN; n <= N_MAX; n += 5) curve += `${n === N_MIN ? 'M' : 'L'}${sx(n).toFixed(1)},${sy(C * Math.log(n)).toFixed(1)}`

  const shown = rows.filter((r) => r.n <= reveal)
  const beat = shown.filter((r) => r.k > C * Math.log(r.n))

  function pick(e: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    let best: Row | null = null
    let bd = Infinity
    for (const r of rows) {
      const d = Math.hypot(sx(r.n) - p.x, (sy(r.k) - p.y) * 0.6)
      if (d < bd) {
        bd = d
        best = r
      }
    }
    if (best) setSel(best)
  }

  // Ledger for the selected triple
  const { n, k, a } = sel
  const b = n + k - a
  const valid = a >= 1 && b >= 1 && b <= N_MAX && k >= 0 && k <= N_MAX
  const ledger = valid
    ? PRIMES.filter((p) => p <= Math.max(a, b)).map((p, i) => ({
        p,
        surplus: VF[n][i] + VF[k][i] - VF[a][i] - VF[b][i],
      }))
    : []
  const blockers = ledger.filter((l) => l.surplus < 0)
  const ok = valid && blockers.length === 0
  const maxAbs = Math.max(3, ...ledger.map((l) => Math.abs(l.surplus)))
  const lo = Math.ceil(eps * n)
  const hi = Math.floor((1 - eps) * n)
  const inRange = a >= lo && a <= hi && b >= lo && b <= hi

  const LW = 400
  const LH = 120
  const bw = ledger.length ? (LW - 20) / ledger.length : 0

  return (
    <div className="demo">
      <h3 className="demo-title">How big can the factorial gap get?</h3>
      <p className="demo-hint">
        Erdős #728: find a, b (both between εn and (1−ε)n) with a!·b! dividing n!·(a+b−n)!. The gap k = a+b−n is
        the prize. Each dot is the <em>largest</em> gap that works for that n, found by exact search. The gold
        curve is C·ln n. Tap a dot to open its prime ledger.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Largest factorial gap for each n up to ${N_MAX}. ${beat.length} values of n beat ${C.toFixed(1)} ln n.`}
        onPointerDown={pick}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <filter id="e728-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="e728-above" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0c95a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f0c95a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 10, 20, 30, 40, 50, 60, 70, 80].filter((t) => t <= kMax).map((t) => (
          <g key={t}>
            <line x1={ML} x2={W - MR} y1={sy(t)} y2={sy(t)} stroke="#16211e" />
            <text x={ML - 5} y={sy(t) + 3} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
              {t}
            </text>
          </g>
        ))}
        {[100, 200, 300, 400, 500, 600].map((t) => (
          <text key={t} x={sx(t)} y={H - 8} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
            n={t}
          </text>
        ))}
        <path d={`${curve} L${sx(N_MAX)},${MT} L${sx(N_MIN)},${MT} Z`} fill="url(#e728-above)" />
        <path d={curve} fill="none" stroke="#f0c95a" strokeWidth="2" strokeDasharray="5 4" />
        <text x={sx(N_MAX) - 4} y={sy(C * Math.log(N_MAX)) - 6} textAnchor="end" fill="#f0c95a" fontSize="10" fontFamily="IBM Plex Mono">
          {C.toFixed(1)}·ln n
        </text>
        {shown.map((r) => {
          const above = r.k > C * Math.log(r.n)
          return (
            <circle
              key={r.n}
              cx={sx(r.n)}
              cy={sy(r.k)}
              r={above ? 2.4 : 1.7}
              fill={above ? '#f0c95a' : '#2ee6c5'}
              opacity={above ? 1 : 0.55}
              filter={above ? 'url(#e728-glow)' : undefined}
            />
          )
        })}
        {reveal < N_MAX ? <line x1={sx(reveal)} x2={sx(reveal)} y1={MT} y2={H - MB} stroke="#2ee6c5" strokeOpacity="0.6" /> : null}
        <circle cx={sx(sel.n)} cy={sy(sel.k)} r={6} fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <text x={ML + 4} y={MT + 12} fill="#8aa39a" fontSize="10" fontFamily="IBM Plex Mono">
          gap k
        </text>
      </svg>

      <div className="controls">
        <DimSlider label="Curve constant C (in C·ln n)" value={C} min={0.5} max={7} step={0.1} onChange={setC} format={(v) => v.toFixed(1)} />
        <DimSlider
          label="ε (a and b must lie in [εn, (1−ε)n])"
          value={eps}
          min={0.1}
          max={0.4}
          step={0.05}
          onChange={(v) => {
            setEps(v)
            setSel((s) => ({ ...s, a: Math.max(Math.ceil(v * s.n), s.a) }))
          }}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn" onClick={replay}>
          Replay the scan
        </button>
      </div>
      <p className="stat">
        n ≤ {Math.floor(reveal)}: the best gap beats {C.toFixed(1)}·ln n for {beat.length} of {shown.length} values of n.
      </p>

      <h4 className="pill-inline" style={{ margin: 'var(--space-4) 0 var(--space-2)', fontSize: '0.8rem' }}>
        Prime ledger for n = {n}, a = {a}, b = {b}, gap k = {k}
      </h4>
      <svg viewBox={`0 0 ${LW} ${LH}`} role="img" aria-label={ok ? 'Every prime has a surplus, so the divisibility holds.' : `Fails at prime ${blockers[0]?.p ?? '?'}.`}>
        <line x1={10} x2={LW - 10} y1={LH / 2} y2={LH / 2} stroke="#24332e" />
        {ledger.map((l, i) => {
          const h = (Math.abs(l.surplus) / maxAbs) * (LH / 2 - 14)
          const x = 10 + i * bw
          return (
            <g key={l.p}>
              <rect
                x={x + bw * 0.15}
                width={Math.max(0.8, bw * 0.7)}
                y={l.surplus >= 0 ? LH / 2 - h : LH / 2}
                height={Math.max(l.surplus === 0 ? 1 : 0, h)}
                fill={l.surplus < 0 ? '#ff6b6b' : l.surplus === 0 ? '#8aa39a' : '#2ee6c5'}
                opacity={l.surplus < 0 ? 1 : 0.8}
              >
                <title>{`p = ${l.p}: surplus ${l.surplus}`}</title>
              </rect>
              {l.surplus < 0 || (i < 6 && bw > 3) ? (
                <text x={x + bw / 2} y={l.surplus < 0 ? LH / 2 + h + 10 : LH / 2 - h - 3} textAnchor="middle" fill={l.surplus < 0 ? '#ff6b6b' : '#8aa39a'} fontSize="8" fontFamily="IBM Plex Mono">
                  {l.p}
                </text>
              ) : null}
            </g>
          )
        })}
        <text x={LW - 12} y={12} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          bar = (power of p in n!·k!) − (power in a!·b!), primes 2…{ledger.length ? ledger[ledger.length - 1].p : ''}
        </text>
      </svg>
      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setSel((s) => ({ ...s, k: s.k + 1 }))} disabled={b + 1 > N_MAX}>
          Gap +1 (b+1)
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSel((s) => ({ ...s, k: Math.max(0, s.k - 1) }))}>
          Gap −1
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSel((s) => ({ ...s, a: Math.min(hi, s.a + 1) }))}>
          a+1
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSel((s) => ({ ...s, a: Math.max(lo, s.a - 1) }))}>
          a−1
        </button>
      </div>
      <p className={`feedback ${ok && inRange ? 'ok' : 'err'}`} role="status">
        {!valid
          ? 'Out of range.'
          : ok
            ? `${a}!·${b}! divides ${n}!·${k}!. Every prime has enough copies on the n!·k! side.${inRange ? '' : ` (But a or b is outside [${lo}, ${hi}], so it does not count.)`}`
            : `Fails: ${n}!·${k}! has too few factors of ${blockers.map((x) => x.p).slice(0, 4).join(', ')}${blockers.length > 4 ? ', …' : ''}.`}
      </p>
      <p className="demo-callout">
        The pattern hugs a logarithm: gaps grow, but only like log n, because each prime&apos;s surplus comes from
        base-p carries (Kummer). A finite plot cannot show &quot;infinitely often&quot;. That needed a proof: in Jan 2026
        GPT-5.2 Pro wrote one and Harmonic&apos;s Aristotle checked it in Lean: infinitely many triples with a, b
        linearly large and gap of order log n.
      </p>
    </div>
  )
}
