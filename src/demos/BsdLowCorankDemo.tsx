import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Four classic curves y² + a1xy + a3y = x³ + a2x² + a4x + a6         */
/*  (Cremona labels; ranks 0, 1, 2, 3).                                */
/* ------------------------------------------------------------------ */

type Curve = {
  label: string
  a: [number, number, number, number, number]
  rank: number
  P: [number, number] // a rational point (torsion for 11a1, infinite order otherwise)
  view: { x0: number; x1: number; y0: number; y1: number }
  color: string
  eq: string
}

const CURVES: Curve[] = [
  { label: '11a1', a: [0, -1, 1, -10, -20], rank: 0, P: [5, 5], view: { x0: -3, x1: 19, y0: -75, y1: 75 }, color: '#7eb6ff', eq: 'y² + y = x³ − x² − 10x − 20' },
  { label: '37a1', a: [0, 0, 1, -1, 0], rank: 1, P: [0, 0], view: { x0: -1.6, x1: 3.4, y0: -5, y1: 5 }, color: '#2ee6c5', eq: 'y² + y = x³ − x' },
  { label: '389a1', a: [0, 1, 1, -2, 0], rank: 2, P: [-1, 1], view: { x0: -3, x1: 4, y0: -8, y1: 8 }, color: '#f0c95a', eq: 'y² + y = x³ + x² − 2x' },
  { label: '5077a1', a: [0, 0, 1, -7, 6], rank: 3, P: [2, 0], view: { x0: -4, x1: 6, y0: -14, y1: 14 }, color: '#ff8a2b', eq: 'y² + y = x³ − 7x + 6' },
]

/* ---------- exact rational arithmetic for the group law ---------- */

type Q = [bigint, bigint]
const babs = (a: bigint) => (a < 0n ? -a : a)
function gcd(a: bigint, b: bigint) {
  a = babs(a)
  b = babs(b)
  while (b) [a, b] = [b, a % b]
  return a
}
function q(n: bigint, d: bigint = 1n): Q {
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1n
  return [n / g, d / g]
}
const qa = (a: Q, b: Q) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const qs = (a: Q, b: Q) => q(a[0] * b[1] - b[0] * a[1], a[1] * b[1])
const qm = (a: Q, b: Q) => q(a[0] * b[0], a[1] * b[1])
const qd = (a: Q, b: Q) => q(a[0] * b[1], a[1] * b[0])
const qn = (a: Q) => Number(a[0]) / Number(a[1])
const qi = (v: number): Q => [BigInt(v), 1n]

type Pt = [Q, Q] | null

/** Chord-and-tangent addition on a long Weierstrass model. */
function addPts(c: Curve, P: Pt, R: Pt): { sum: Pt; slope: Q | null } {
  if (!P) return { sum: R, slope: null }
  if (!R) return { sum: P, slope: null }
  const [a1, a2, a3, a4] = c.a.map(qi)
  const [x1, y1] = P
  const [x2, y2] = R
  let l: Q
  if (x1[0] === x2[0] && x1[1] === x2[1]) {
    const s = qa(qa(y1, y2), qa(qm(a1, x1), a3))
    if (s[0] === 0n) return { sum: null, slope: null }
    const num = qs(qa(qa(qm(qi(3), qm(x1, x1)), qm(qm(qi(2), a2), x1)), a4), qm(a1, y1))
    const den = qa(qa(qm(qi(2), y1), qm(a1, x1)), a3)
    l = qd(num, den)
  } else {
    l = qd(qs(y2, y1), qs(x2, x1))
  }
  const x3 = qs(qs(qs(qa(qm(l, l), qm(a1, l)), a2), x1), x2)
  const nu = qs(y1, qm(l, x1))
  const y3 = qs(qs(qm(qs(qi(0), qa(l, a1)), x3), nu), a3)
  return { sum: [x3, y3], slope: l }
}

/* ---------- real locus ---------- */

function realLocus(c: Curve, samples = 700) {
  const [a1, a2, a3, a4, a6] = c.a
  const disc = (x: number) => (a1 * x + a3) ** 2 + 4 * (x ** 3 + a2 * x * x + a4 * x + a6)
  const segs: [number, number][][] = []
  let upper: [number, number][] = []
  let lower: [number, number][] = []
  const flush = () => {
    if (upper.length) segs.push([...lower.reverse(), ...upper])
    upper = []
    lower = []
  }
  const edge = (xa: number, xb: number) => {
    for (let k = 0; k < 40; k++) {
      const m = (xa + xb) / 2
      if ((disc(m) >= 0) === (disc(xa) >= 0)) xa = m
      else xb = m
    }
    return (xa + xb) / 2
  }
  const { x0, x1 } = c.view
  let prevX = x0
  let prevIn = disc(x0) >= 0
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples
    const d = disc(x)
    const inside = d >= 0
    if (inside !== prevIn && i > 0) {
      const xe = edge(prevX, x)
      const ye = -(a1 * xe + a3) / 2
      upper.push([xe, ye])
      lower.push([xe, ye])
      if (!inside) flush()
    }
    if (inside) {
      const s = Math.sqrt(d)
      const base = -(a1 * x + a3)
      upper.push([x, (base + s) / 2])
      lower.push([x, (base - s) / 2])
    }
    prevX = x
    prevIn = inside
  }
  flush()
  return segs
}

/* ---------- point counts mod p and the BSD Euler product ---------- */

function shortModel(c: Curve) {
  const [a1, a2, a3, a4, a6] = c.a
  const b2 = a1 * a1 + 4 * a2
  const b4 = 2 * a4 + a1 * a3
  const b6 = a3 * a3 + 4 * a6
  const c4 = b2 * b2 - 24 * b4
  const c6 = -(b2 ** 3) + 36 * b2 * b4 - 216 * b6
  return { A: -27 * c4, B: -54 * c6, disc: (c4 ** 3 - c6 ** 2) / 1728 }
}

/** #E(F_p) including the point at infinity, for p ≥ 5 of good reduction. */
function countPoints(A: number, B: number, p: number) {
  const chi = new Int8Array(p).fill(-1)
  chi[0] = 0
  for (let y = 1; y < p; y++) chi[(y * y) % p] = 1
  const Am = ((A % p) + p) % p
  const Bm = ((B % p) + p) % p
  let N = 1
  for (let x = 0; x < p; x++) N += 1 + chi[((((x * x) % p) * x) % p + Am * x + Bm) % p]
  return N
}

const P_MAX = 20000
const PRIMES = (() => {
  const s = new Uint8Array(P_MAX + 1)
  const out: number[] = []
  for (let i = 2; i <= P_MAX; i++) {
    if (s[i]) continue
    out.push(i)
    for (let j = i * i; j <= P_MAX; j += i) s[j] = 1
  }
  return out.filter((p) => p >= 5)
})()

const BW = 640
const BH = 260
const B_L = 40
const B_R = 80
const LL0 = Math.log(Math.log(5))
const LL1 = Math.log(Math.log(P_MAX))
const bx = (p: number) => B_L + ((Math.log(Math.log(p)) - LL0) / (LL1 - LL0)) * (BW - B_L - B_R)
const by = (v: number) => 16 + ((7.5 - v) / 9) * (BH - 40)

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

function describeX(x: Q) {
  const s = `${x[0]}/${x[1]}`
  if (s.length <= 22) return x[1] === 1n ? `${x[0]}` : s
  const nd = babs(x[0]).toString().length
  const dd = x[1].toString().length
  return `≈ ${qn(x).toPrecision(4)}  (${nd}-digit / ${dd}-digit fraction)`
}

const VW = 320
const VH = 280

export function BsdLowCorankDemo() {
  const reduced = useReducedMotion()
  const [ci, setCi] = useState(1)
  const curve = CURVES[ci]
  const [multiples, setMultiples] = useState<{ n: number; pt: Pt; slope: Q | null }[]>(() => [
    { n: 1, pt: [qi(CURVES[1].P[0]), qi(CURVES[1].P[1])], slope: null },
  ])

  const locus = useMemo(() => realLocus(curve), [curve])
  const { x0, x1, y0, y1 } = curve.view
  const vx = (x: number) => ((x - x0) / (x1 - x0)) * VW
  const vy = (y: number) => VH - ((y - y0) / (y1 - y0)) * VH

  const pickCurve = (i: number) => {
    setCi(i)
    const c = CURVES[i]
    setMultiples([{ n: 1, pt: [qi(c.P[0]), qi(c.P[1])], slope: null }])
  }

  const addP = () => {
    setMultiples((ms) => {
      if (ms.length >= 14) return ms
      const last = ms[ms.length - 1]
      const P: Pt = [qi(curve.P[0]), qi(curve.P[1])]
      const { sum, slope } = addPts(curve, last.pt, P)
      return [...ms, { n: last.n + 1, pt: sum, slope }]
    })
  }

  const last = multiples[multiples.length - 1]
  const prev = multiples.length > 1 ? multiples[multiples.length - 2] : null

  // chord through (n−1)P and P, for the latest step
  const chord = useMemo(() => {
    if (!prev || !prev.pt || !last.pt || !last.slope) return null
    const l = qn(last.slope)
    const xa = qn(prev.pt[0])
    const ya = qn(prev.pt[1])
    const third: [number, number] = [qn(last.pt[0]), -qn(last.pt[1]) - curve.a[0] * qn(last.pt[0]) - curve.a[2]]
    return { l, xa, ya, third }
  }, [prev, last, curve])

  /* ---------- BSD experiment ---------- */
  const raf = useRef(0)
  const bsd = useRef({ idx: 0, sums: CURVES.map(() => 0), paths: CURVES.map(() => [] as [number, number][]) })
  const [, setTick] = useState(0)
  const [running, setRunning] = useState(false)
  const models = useMemo(() => CURVES.map(shortModel), [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const runBsd = useCallback(() => {
    cancelAnimationFrame(raf.current)
    bsd.current = { idx: 0, sums: CURVES.map(() => 0), paths: CURVES.map(() => []) }
    setRunning(true)
    const budget = reduced ? 5000 : 8
    const frame = () => {
      const st = bsd.current
      const t0 = performance.now()
      while (st.idx < PRIMES.length && performance.now() - t0 < budget) {
        const p = PRIMES[st.idx++]
        models.forEach((m, k) => {
          if (m.disc % p === 0) return
          const N = countPoints(m.A, m.B, p)
          st.sums[k] += Math.log(N / p)
          const path = st.paths[k]
          if (st.idx < 60 || st.idx % 6 === 0 || st.idx === PRIMES.length) path.push([p, st.sums[k]])
        })
      }
      setTick((t) => t + 1)
      if (st.idx < PRIMES.length) raf.current = requestAnimationFrame(frame)
      else setRunning(false)
    }
    raf.current = requestAnimationFrame(frame)
  }, [models, reduced])

  const st = bsd.current
  const curP = st.idx ? PRIMES[Math.min(st.idx, PRIMES.length) - 1] : 0
  const inside = curve.rank <= 1

  return (
    <div className="demo">
      <h3 className="demo-title">Rational points, rank, and the BSD experiment</h3>
      <p className="demo-hint">
        Four classic elliptic curves, with ranks 0, 1, 2 and 3. Pick one, then keep adding its
        point P to itself with the chord-and-tangent rule. Every step is exact rational
        arithmetic. When the rank is 0, the points cycle back. When the rank is positive, the
        fractions blow up forever.
      </p>

      <div className="btn-row" role="group" aria-label="Elliptic curve" style={{ marginBottom: 'var(--space-3)' }}>
        {CURVES.map((c, i) => (
          <button
            key={c.label}
            type="button"
            className={i === ci ? 'btn' : 'btn btn-ghost'}
            aria-pressed={i === ci}
            onClick={() => pickCurve(i)}
            style={i === ci ? { background: c.color, borderColor: c.color } : { color: c.color }}
          >
            {c.label} · rank {c.rank}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-3)', alignItems: 'start' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Real points of ${curve.label} with multiples of P`}>
          <defs>
            <clipPath id="bsd-clip">
              <rect width={VW} height={VH} />
            </clipPath>
          </defs>
          <line x1={vx(0)} x2={vx(0)} y1={0} y2={VH} stroke="#24332e" />
          <line x1={0} x2={VW} y1={vy(0)} y2={vy(0)} stroke="#24332e" />
          <g clipPath="url(#bsd-clip)">
            {locus.map((seg, i) => (
              <path
                key={i}
                d={seg.map(([x, y], k) => `${k ? 'L' : 'M'}${vx(x).toFixed(1)} ${vy(y).toFixed(1)}`).join('')}
                fill="none"
                stroke={curve.color}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 4px ${curve.color}88)` }}
              />
            ))}
            {chord && (
              <g opacity={0.8}>
                <line
                  x1={vx(x0)}
                  y1={vy(chord.ya + chord.l * (x0 - chord.xa))}
                  x2={vx(x1)}
                  y2={vy(chord.ya + chord.l * (x1 - chord.xa))}
                  stroke="#e8f2ef"
                  strokeOpacity={0.45}
                  strokeDasharray="4 3"
                />
                <line
                  x1={vx(chord.third[0])}
                  y1={vy(chord.third[1])}
                  x2={vx(chord.third[0])}
                  y2={vy(qn(last.pt![1]))}
                  stroke="#f0c95a"
                  strokeOpacity={0.6}
                  strokeDasharray="2 3"
                />
                <circle cx={vx(chord.third[0])} cy={vy(chord.third[1])} r={3.5} fill="none" stroke="#e8f2ef" />
              </g>
            )}
            {multiples.map((m, i) => {
              if (!m.pt) return null
              const x = qn(m.pt[0])
              const y = qn(m.pt[1])
              const isLast = i === multiples.length - 1
              return (
                <g key={m.n}>
                  <circle cx={vx(x)} cy={vy(y)} r={isLast ? 6 : 4} fill={isLast ? '#ffffff' : curve.color} stroke="#070b0a" strokeWidth={1.5} />
                  <text x={vx(x) + 7} y={vy(y) - 6} fontSize="10" fill="#e8f2ef">
                    {m.n === 1 ? 'P' : `${m.n}P`}
                  </text>
                </g>
              )
            })}
          </g>
          <text x={6} y={14} fontSize="10" fill="#8aa39a">
            {curve.eq}
          </text>
        </svg>

        <div>
          <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
            <button type="button" className="btn" onClick={addP} disabled={multiples.length >= 14}>
              Add P (chord + reflect)
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => pickCurve(ci)}>
              Reset
            </button>
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', display: 'grid', gap: 2 }}>
            {multiples.map((m) => (
              <li key={m.n} className="stat" style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: curve.color, minWidth: 30 }}>{m.n === 1 ? 'P' : `${m.n}P`}</span>
                <span style={{ wordBreak: 'break-all' }}>
                  {m.pt ? `x = ${describeX(m.pt[0])}` : 'O, the identity: back to the start'}
                </span>
              </li>
            ))}
          </ol>
          <p className="pill-inline" style={{ marginTop: 'var(--space-2)' }}>
            {curve.rank === 0
              ? 'P = (5, 5) has order 5. Rank 0 means only finitely many rational points.'
              : 'P has infinite order. The digit counts grow roughly like n², the quadratic growth of height.'}
          </p>
        </div>
      </div>

      <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)', fontSize: '0.9rem' }}>
        Birch and Swinnerton-Dyer’s original experiment
      </h4>
      <p className="demo-hint">
        In the 1960s Birch and Swinnerton-Dyer counted N_p, the number of points on each curve mod
        p, and multiplied the ratios N_p / p. More rational points means more points mod p, so the
        product grows like (log X)^rank. Plotted against log log X, the slope estimates the rank.
        This run counts points mod every prime up to {P_MAX.toLocaleString()} for all four curves.
      </p>
      <svg viewBox={`0 0 ${BW} ${BH}`} role="img" aria-label="log of the product of N_p over p against log log X for four curves">
        {[0, 2, 4, 6].map((v) => (
          <g key={v}>
            <line x1={B_L} x2={BW - B_R} y1={by(v)} y2={by(v)} stroke="#24332e" strokeDasharray="2 4" />
            <text x={B_L - 6} y={by(v) + 3} fontSize="9.5" fill="#8aa39a" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {[10, 100, 1000, 10000].map((p) => (
          <text key={p} x={bx(p)} y={BH - 8} fontSize="9.5" fill="#8aa39a" textAnchor="middle">
            X = {p.toLocaleString()}
          </text>
        ))}
        <text x={B_L + 4} y={12} fontSize="9.5" fill="#8aa39a">
          log ∏ N_p / p (p ≤ X), x-axis log log X
        </text>
        {CURVES.map((c, k) => {
          const path = st.paths[k]
          if (!path.length) return null
          const on = k === ci
          const d = path.map(([p, v], i) => `${i ? 'L' : 'M'}${bx(p).toFixed(1)} ${by(v).toFixed(1)}`).join('')
          const end = path[path.length - 1]
          return (
            <g key={c.label} opacity={on ? 1 : 0.55}>
              <path d={d} fill="none" stroke={c.color} strokeWidth={on ? 2.4 : 1.4} style={{ filter: on ? `drop-shadow(0 0 4px ${c.color})` : undefined }} />
              <circle cx={bx(end[0])} cy={by(end[1])} r={on ? 4 : 2.5} fill={c.color} />
              {st.idx >= PRIMES.length && (
                <text x={BW - B_R + 6} y={by(end[1]) + 4} fontSize="10" fill={c.color}>
                  {c.label} r={c.rank}
                </text>
              )}
            </g>
          )
        })}
        {!st.paths[0].length && (
          <text x={BW / 2} y={BH / 2} fontSize="12" fill="#8aa39a" textAnchor="middle">
            Press “Run the experiment”
          </text>
        )}
      </svg>
      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        <button type="button" className="btn" onClick={runBsd} disabled={running}>
          {running ? `Counting points mod p = ${curP.toLocaleString()}…` : st.idx ? 'Run again' : 'Run the experiment'}
        </button>
      </div>

      <div
        role="status"
        style={{
          padding: 'var(--space-3)',
          border: `1px solid ${inside ? 'var(--accent)' : 'var(--danger)'}`,
          borderRadius: 'var(--radius)',
          background: inside ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'color-mix(in srgb, var(--danger) 8%, transparent)',
          fontSize: '0.8rem',
        }}
      >
        <strong style={{ color: inside ? 'var(--accent)' : 'var(--danger)' }}>
          {curve.label}: {inside ? 'inside the October 2026 claim' : 'outside the October 2026 claim'}
        </strong>
        <div style={{ color: 'var(--muted)', marginTop: 4 }}>
          {inside
            ? `Rank ${curve.rank}, and its Selmer corank is ${curve.rank} for some prime p. The manuscript claims the full leading-term BSD formula here, with a finite obstruction group (Sha).`
            : `Rank ${curve.rank}. The p-power Selmer corank is at least the rank for every p, so it is never 0 or 1. The manuscript says nothing about this curve.`}
        </div>
      </div>

      <p className="demo-callout">
        The slopes are noisy estimates. Primes up to 20,000 give a feel for the rank, not a proof.
        The October 2026 manuscript claims the exact BSD formula only when some p-power Selmer
        corank is 0 or 1. It is not machine-checked here. BSD for every curve, including rank 2
        and rank 3 curves like the last two, is still a Millennium problem.
      </p>
    </div>
  )
}
