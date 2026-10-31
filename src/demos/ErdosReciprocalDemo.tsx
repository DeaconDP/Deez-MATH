import { useEffect, useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * Erdős: if Σ 1/a diverges over A, then A contains arithmetic progressions of every length.
 * Five sets, two pictures: the longest progression found in A ∩ [1, N] (drawn as equal
 * arcs), and the partial sums Σ_{a ≤ X} 1/a out to X = 10^6.
 * Divergence or convergence of each sum is a known theorem; the curves are just evidence.
 */

const X_MAX = 1_000_000

type FamId = 'primes' | 'random' | 'squares' | 'pow2' | 'greedy'

type Fam = {
  id: FamId
  name: string
  color: string
  diverges: boolean
  note: string
}

const FAMS: Fam[] = [
  {
    id: 'primes',
    name: 'Primes',
    color: '#2ee6c5',
    diverges: true,
    note: 'Σ 1/p diverges (Euler), very slowly. Green and Tao proved in 2004 that the primes hold progressions of every length; the new theorem covers every set this large.',
  },
  {
    id: 'random',
    name: 'Random, prime-sized',
    color: '#7eb6ff',
    diverges: true,
    note: 'Each n is kept with chance 1/ln n: as many members as the primes, but no arithmetic structure. Its sum diverges too, so the theorem says it must hold progressions of every length.',
  },
  {
    id: 'squares',
    name: 'Squares',
    color: '#b28bff',
    diverges: false,
    note: 'Σ 1/n² = π²/6 converges, so the theorem says nothing. Squares do have 3-term progressions (1, 25, 49) but never 4 (Fermat, proved by Euler).',
  },
  {
    id: 'pow2',
    name: 'Powers of 2',
    color: '#ff8a5b',
    diverges: false,
    note: 'Σ 1/2^k = 2 converges. No three powers of 2 are ever in progression.',
  },
  {
    id: 'greedy',
    name: 'Greedy, no 3-term AP',
    color: '#f0c95a',
    diverges: false,
    note: 'Built by adding n unless it completes a 3-term progression (1, 2, 4, 5, 10, 11, …). It dodges every progression, so by the theorem its sum must converge, and it does.',
  },
]

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/** Membership arrays up to X_MAX for every family (computed once). */
function buildMembers() {
  const sieve = new Uint8Array(X_MAX + 1)
  for (let i = 2; i * i <= X_MAX; i++) if (!sieve[i]) for (let j = i * i; j <= X_MAX; j += i) sieve[j] = 1
  const r = rng(31337)
  const m: Record<FamId, Uint8Array> = {
    primes: new Uint8Array(X_MAX + 1),
    random: new Uint8Array(X_MAX + 1),
    squares: new Uint8Array(X_MAX + 1),
    pow2: new Uint8Array(X_MAX + 1),
    greedy: new Uint8Array(X_MAX + 1),
  }
  for (let n = 2; n <= X_MAX; n++) if (!sieve[n]) m.primes[n] = 1
  for (let n = 3; n <= X_MAX; n++) if (r() < 1 / Math.log(n)) m.random[n] = 1
  for (let k = 1; k * k <= X_MAX; k++) m.squares[k * k] = 1
  for (let k = 1; k <= X_MAX; k *= 2) m.pow2[k] = 1
  for (let n = 1; n <= X_MAX; n++) {
    let v = n - 1
    let ok = true
    while (v > 0) {
      if (v % 3 === 2) {
        ok = false
        break
      }
      v = Math.floor(v / 3)
    }
    if (ok) m.greedy[n] = 1
  }
  return m
}

const CHECKPOINTS = Array.from({ length: 121 }, (_, i) => Math.round(10 ** (i / 20)))

function partialSums(mem: Uint8Array) {
  const out: number[] = []
  let s = 0
  let c = 0
  for (let n = 1; n <= X_MAX; n++) {
    if (mem[n]) s += 1 / n
    while (c < CHECKPOINTS.length && CHECKPOINTS[c] === n) {
      out.push(s)
      c++
    }
  }
  return out
}

function longestAP(members: number[], mem: Uint8Array) {
  let best: number[] = members.length ? [members[0]] : []
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]
      const d = members[j] - a
      const last = members[members.length - 1]
      if (a + best.length * d > last) break
      if (a - d >= 1 && mem[a - d]) continue // not the start of its progression
      const run = [a, members[j]]
      let x = members[j] + d
      while (x <= last && mem[x]) {
        run.push(x)
        x += d
      }
      if (run.length > best.length) best = run
    }
  }
  return best
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

export function ErdosReciprocalDemo() {
  const [famId, setFamId] = useState<FamId>('primes')
  const [N, setN] = useState(1000)
  const [playing, setPlaying] = useState(false)
  const reduced = usePrefersReducedMotion()

  const members = useMemo(buildMembers, [])
  const sums = useMemo(() => {
    const out = {} as Record<FamId, number[]>
    for (const f of FAMS) out[f.id] = partialSums(members[f.id])
    return out
  }, [members])
  const harmonic = useMemo(() => CHECKPOINTS.map((x) => Math.log(x) + 0.5772156649 + 1 / (2 * x)), [])

  const fam = FAMS.find((f) => f.id === famId) ?? FAMS[0]
  const mem = members[famId]
  const inRange = useMemo(() => {
    const out: number[] = []
    for (let n = 1; n <= N; n++) if (mem[n]) out.push(n)
    return out
  }, [mem, N])
  const ap = useMemo(() => longestAP(inRange, mem), [inRange, mem])
  const sumN = inRange.reduce((s, a) => s + 1 / a, 0)

  useEffect(() => {
    if (!playing) return
    if (reduced) {
      setN(1000)
      setPlaying(false)
      return
    }
    let n = 10
    setN(n)
    const id = window.setInterval(() => {
      n = Math.min(1000, Math.round(n * 1.045 + 1))
      setN(n)
      if (n >= 1000) {
        window.clearInterval(id)
        setPlaying(false)
      }
    }, 70)
    return () => window.clearInterval(id)
  }, [playing, reduced])

  // number line
  const LW = 360
  const LH = 120
  const base = 92
  const lx = (n: number) => 10 + ((n - 1) / Math.max(1, N - 1)) * (LW - 20)
  const d = ap.length > 1 ? ap[1] - ap[0] : 0

  // sums chart
  const CW = 360
  const CH = 170
  const Y_MAX = 4
  const cx = (i: number) => 30 + (i / (CHECKPOINTS.length - 1)) * (CW - 64)
  const cy = (v: number) => CH - 20 - (Math.min(v, Y_MAX + 0.4) / Y_MAX) * (CH - 34)
  const path = (vals: number[]) =>
    vals
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => v <= Y_MAX + 0.4)
      .map(({ v, i }, k) => `${k ? 'L' : 'M'}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`)
      .join(' ')
  const nIdx = Math.max(0, Math.min(CHECKPOINTS.length - 1, Math.round(Math.log10(N) * 20)))

  return (
    <div className="demo">
      <h3 className="demo-title">Big enough to be forced into line</h3>
      <p className="demo-hint">
        Pick a set. Top: its members up to N, with the longest arithmetic progression found drawn
        as equal arcs. Bottom: the running total of 1/a out to a million. Sets whose total grows
        without bound must contain progressions of every length. Sets that avoid progressions are
        forced to stay small.
      </p>
      <div className="btn-row" style={{ marginBottom: '0.75rem', gap: '0.4rem' }}>
        {FAMS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`btn ${f.id === famId ? '' : 'btn-ghost'}`}
            aria-pressed={f.id === famId}
            onClick={() => setFamId(f.id)}
            style={{
              padding: '0 0.75rem',
              fontSize: '0.76rem',
              ...(f.id === famId ? { background: f.color, borderColor: f.color } : { borderColor: f.color + '66' }),
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${LW} ${LH}`} role="img" aria-label={`${fam.name} up to ${N}; longest progression has ${ap.length} terms`}>
        <defs>
          <filter id="erec-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line x1={10} x2={LW - 10} y1={base} y2={base} stroke="#24332e" />
        {inRange.map((n) => (
          <circle key={n} cx={lx(n)} cy={base} r={inRange.length > 120 ? 1.3 : 2} fill={fam.color} opacity={0.55} />
        ))}
        {ap.length > 1 &&
          ap.slice(0, -1).map((a, i) => {
            const x1 = lx(a)
            const x2 = lx(ap[i + 1])
            const h = Math.min(70, (x2 - x1) * 0.6 + 6)
            return (
              <path
                key={a}
                d={`M${x1},${base} C${x1},${base - h} ${x2},${base - h} ${x2},${base}`}
                fill="none"
                stroke="#f0c95a"
                strokeWidth={1.6}
                filter="url(#erec-glow)"
              />
            )
          })}
        {ap.map((a) => (
          <g key={a}>
            <circle cx={lx(a)} cy={base} r={3.4} fill="#ffffff" filter="url(#erec-glow)" />
            {ap.length <= 9 && (
              <text x={lx(a)} y={base + 13} fill="#e8f2ef" fontSize="7" textAnchor="middle">
                {a}
              </text>
            )}
          </g>
        ))}
        <text x={10} y={12} fill="#8aa39a" fontSize="8" fontFamily="IBM Plex Mono">
          1 … {N}
        </text>
        <text x={LW - 10} y={12} fill="#f0c95a" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">
          longest progression: {ap.length} term{ap.length === 1 ? '' : 's'}
          {d ? `, step ${d}` : ''}
        </text>
      </svg>

      <div className="controls">
        <DimSlider label="Look up to N" value={N} min={10} max={1000} step={1} onChange={setN} />
      </div>
      <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
        <button type="button" className="btn" onClick={() => setPlaying(true)} disabled={playing}>
          {playing ? 'Growing…' : '▶ Grow N from 10 to 1000'}
        </button>
      </div>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        {inRange.length} members up to {N}. Σ 1/a = {sumN.toFixed(3)}.{' '}
        {ap.length >= 3 ? (
          <span style={{ color: '#f0c95a' }}>{ap.join(', ')}</span>
        ) : (
          <span style={{ color: 'var(--danger)' }}>No 3-term progression here.</span>
        )}
      </p>

      <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label="Partial reciprocal sums up to one million">
        <line x1={30} x2={CW - 34} y1={CH - 20} y2={CH - 20} stroke="#24332e" />
        <line x1={30} x2={30} y1={12} y2={CH - 20} stroke="#24332e" />
        {[0, 1, 2, 3, 4].map((v) => (
          <g key={v}>
            <line x1={30} x2={CW - 34} y1={cy(v)} y2={cy(v)} stroke="#24332e" strokeOpacity={0.35} />
            <text x={26} y={cy(v) + 3} fill="#8aa39a" fontSize="7" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {[0, 2, 4, 6].map((e) => (
          <text key={e} x={cx(e * 20)} y={CH - 8} fill="#8aa39a" fontSize="7" textAnchor="middle">
            10^{e}
          </text>
        ))}
        <path d={path(harmonic)} fill="none" stroke="#e8f2ef" strokeOpacity={0.35} strokeDasharray="3 2" />
        <text x={cx(28)} y={cy(Y_MAX) + 4} fill="#e8f2ef" fillOpacity={0.5} fontSize="7">
          all integers ↑ ∞
        </text>
        <line x1={cx(nIdx)} x2={cx(nIdx)} y1={12} y2={CH - 20} stroke="#ffffff" strokeOpacity={0.18} />
        {FAMS.map((f) => (
          <path
            key={f.id}
            d={path(sums[f.id])}
            fill="none"
            stroke={f.color}
            strokeWidth={f.id === famId ? 2.4 : 1}
            strokeOpacity={f.id === famId ? 1 : 0.4}
            filter={f.id === famId ? 'url(#erec-glow)' : undefined}
          />
        ))}
        {FAMS.map((f) => {
          const v = sums[f.id][CHECKPOINTS.length - 1]
          return (
            <text key={f.id} x={CW - 31} y={cy(v) + 3} fill={f.color} fontSize="6.5" textAnchor="start" opacity={f.id === famId ? 1 : 0.6}>
              {v.toFixed(2)}
            </text>
          )
        })}
      </svg>
      <p className={`feedback ${fam.diverges ? 'ok' : 'err'}`} role="status" style={{ fontSize: '0.8rem' }}>
        {fam.diverges ? 'Sum diverges → theorem applies: every length is forced. ' : 'Sum converges → theorem is silent. '}
        <span style={{ color: 'var(--fg)' }}>{fam.note}</span>
      </p>
      <p className="demo-callout">
        Divergence is a weak size condition: the primes’ total is still under 3 at a million and
        passes 4 only near 10^18. The 2026 manuscript claims that even this much size forces every
        progression length, plus a cap of N·exp(−c(log N)^c) on progression-free subsets of
        {' {1, …, N}'}. A picture up to a million checks nothing about infinity, and this app does
        not check the proof.
      </p>
    </div>
  )
}
