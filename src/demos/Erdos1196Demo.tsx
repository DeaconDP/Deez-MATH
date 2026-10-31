import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * Primitive sets and the "a chain meets an antichain at most once" principle.
 * A walker starts at 1 and keeps multiplying by a random prime, so the numbers it visits
 * form a divisibility chain 1 | p₁ | p₁p₂ | …. A primitive set is an antichain, so each
 * walker can hit it at most once, and the visit probabilities over the set add up to ≤ 1.
 * The proof of Erdős #1196 runs a carefully weighted (von Mangoldt) chain downward instead;
 * this toy chain uses weights ∝ log p / p and is only there to show the principle.
 */

const MAXN = 120
const COLS = 12
const CELL = 30

const PRIMES = (() => {
  const out: number[] = []
  for (let k = 2; k <= MAXN; k++) {
    let prime = true
    for (let d = 2; d * d <= k; d++)
      if (k % d === 0) {
        prime = false
        break
      }
    if (prime) out.push(k)
  }
  return out
})()

const WEIGHTS = (() => {
  const raw = PRIMES.map((p) => Math.log(p) / p)
  const z = raw.reduce((a, b) => a + b, 0)
  return raw.map((r) => r / z)
})()

/** Exact probability that the walk ever visits n (n ≤ MAXN). */
const VISIT = (() => {
  const v = new Float64Array(MAXN + 1)
  v[1] = 1
  for (let n = 2; n <= MAXN; n++) {
    let s = 0
    PRIMES.forEach((p, i) => {
      if (n % p === 0) s += v[n / p] * WEIGHTS[i]
    })
    v[n] = s
  }
  return v
})()

function bigOmega(n: number) {
  let k = 0
  for (const p of PRIMES) {
    while (n % p === 0) {
      n /= p
      k++
    }
    if (n === 1) break
  }
  return k
}

function samplePath(rand: () => number): number[] {
  const path = [1]
  let cur = 1
  for (;;) {
    let r = rand()
    let p = PRIMES[PRIMES.length - 1]
    for (let i = 0; i < PRIMES.length; i++) {
      r -= WEIGHTS[i]
      if (r <= 0) {
        p = PRIMES[i]
        break
      }
    }
    const next = cur * p
    if (next > MAXN) {
      path.push(-1) // leaves the window
      return path
    }
    path.push(next)
    cur = next
  }
}

const cellPos = (n: number) => ({
  x: ((n - 1) % COLS) * CELL + CELL / 2,
  y: Math.floor((n - 1) / COLS) * CELL + CELL / 2,
})

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

type Walker = { id: number; path: number[]; t: number; hits: number; color: string }
type Burst = { n: number; age: number; bad: boolean }

export function Erdos1196Demo() {
  const [x, setX] = useState(5)
  const [set, setSet] = useState<Set<number>>(() => new Set(PRIMES.filter((p) => p >= 5)))
  const [breakRule, setBreakRule] = useState(false)
  const [running, setRunning] = useState(false)
  const [tally, setTally] = useState({ walks: 0, once: 0, multi: 0 })
  const [shake, setShake] = useState<number | null>(null)
  const [, setFrame] = useState(0)
  const reduced = usePrefersReducedMotion()
  const walkers = useRef<Walker[]>([])
  const bursts = useRef<Burst[]>([])
  const setRef = useRef(set)
  useEffect(() => {
    setRef.current = set
  }, [set])

  const blocked = useMemo(() => {
    const b = new Set<number>()
    for (let n = 2; n <= MAXN; n++) {
      if (set.has(n)) continue
      for (const a of set) if (n % a === 0 || a % n === 0) b.add(n)
    }
    return b
  }, [set])
  const conflicts = useMemo(() => {
    const arr = [...set]
    let k = 0
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++) if (arr[i] % arr[j] === 0 || arr[j] % arr[i] === 0) k++
    return k
  }, [set])

  const weight = [...set].reduce((s, a) => s + 1 / (a * Math.log(a)), 0)
  const expected = [...set].reduce((s, a) => s + VISIT[a], 0)

  const toggle = (n: number) => {
    if (n < Math.max(2, x)) return
    if (!set.has(n) && blocked.has(n) && !breakRule) {
      setShake(n)
      window.setTimeout(() => setShake(null), 400)
      return
    }
    const next = new Set(set)
    if (next.has(n)) next.delete(n)
    else next.add(n)
    setSet(next)
    setTally({ walks: 0, once: 0, multi: 0 })
  }

  const applyPreset = (kind: 'primes' | 'dyadic' | 'semi' | 'clear') => {
    const next = new Set<number>()
    for (let n = Math.max(2, x); n <= MAXN; n++) {
      if (kind === 'primes' && bigOmega(n) === 1) next.add(n)
      if (kind === 'dyadic' && n < 2 * x) next.add(n)
      if (kind === 'semi' && bigOmega(n) === 2) next.add(n)
    }
    setSet(next)
    setTally({ walks: 0, once: 0, multi: 0 })
  }

  // walker animation
  useEffect(() => {
    if (!running) return
    let seed = 12345 + Math.floor(Math.random() * 1e6)
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    let nextId = 0
    let launched = 0
    const LIMIT = 300
    const colors = ['#2ee6c5', '#7eb6ff', '#e8f2ef', '#b28bff']

    const finish = (w: Walker) => {
      setTally((t) => ({
        walks: t.walks + 1,
        once: t.once + (w.hits === 1 ? 1 : 0),
        multi: t.multi + (w.hits > 1 ? 1 : 0),
      }))
    }

    if (reduced) {
      // no animation: just run the walks
      let once = 0
      let multi = 0
      for (let i = 0; i < LIMIT; i++) {
        const path = samplePath(rand)
        const h = path.filter((n) => n > 0 && setRef.current.has(n)).length
        if (h === 1) once++
        if (h > 1) multi++
      }
      setTally((t) => ({ walks: t.walks + LIMIT, once: t.once + once, multi: t.multi + multi }))
      setRunning(false)
      return
    }

    let raf = 0
    let last = performance.now()
    let spawnClock = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      spawnClock += dt
      const speed = 4.5 // hops per second
      while (spawnClock > 0.09 && launched < LIMIT) {
        spawnClock -= 0.09
        walkers.current.push({
          id: nextId++,
          path: samplePath(rand),
          t: 0,
          hits: 0,
          color: colors[launched % colors.length],
        })
        launched++
      }
      const alive: Walker[] = []
      for (const w of walkers.current) {
        const before = Math.floor(w.t)
        w.t += dt * speed
        const after = Math.floor(w.t)
        for (let s = before + 1; s <= Math.min(after, w.path.length - 1); s++) {
          const n = w.path[s]
          if (n > 0 && setRef.current.has(n)) {
            w.hits++
            bursts.current.push({ n, age: 0, bad: w.hits > 1 })
          }
        }
        if (w.t >= w.path.length - 1) finish(w)
        else alive.push(w)
      }
      walkers.current = alive
      for (const b of bursts.current) b.age += dt
      bursts.current = bursts.current.filter((b) => b.age < 0.6)
      setFrame((f) => f + 1)
      if (launched >= LIMIT && alive.length === 0) {
        setRunning(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      walkers.current = []
      bursts.current = []
    }
  }, [running, reduced])

  const W = COLS * CELL
  const Hh = Math.ceil(MAXN / COLS) * CELL
  const ok = conflicts === 0

  const walkerPos = (w: Walker) => {
    const i = Math.min(Math.floor(w.t), w.path.length - 2)
    const f = w.t - i
    const a = cellPos(w.path[i])
    const bn = w.path[i + 1]
    const b = bn > 0 ? cellPos(bn) : { x: a.x + 18, y: Hh + 20 }
    const e = f * f * (3 - 2 * f)
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e - Math.sin(Math.PI * f) * 10 }
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Build a primitive set, then send walkers through it</h3>
      <p className="demo-hint">
        Tap numbers ≥ x to build a set where no member divides another. Numbers that would break
        the rule go dark. Then release walkers: each starts at 1 (teal) and multiplies by random primes,
        so it climbs a divisibility chain. Watch: no walker can hit your set twice.
      </p>

      <svg viewBox={`-4 -4 ${W + 8} ${Hh + 30}`} role="img" aria-label={`Number grid 1 to ${MAXN} with a set of ${set.size} numbers`}>
        <defs>
          <filter id="e1196-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: MAXN }, (_, i) => i + 1).map((n) => {
          const { x: cx, y: cy } = cellPos(n)
          const inSet = set.has(n)
          const below = n < Math.max(2, x)
          const isBlocked = blocked.has(n)
          let fill = '#0e1614'
          let stroke = '#24332e'
          let text = '#8aa39a'
          if (n === 1) {
            fill = '#13201d'
            stroke = '#2ee6c5'
            text = '#2ee6c5'
          } else if (inSet) {
            fill = '#f0c95a'
            stroke = '#f0c95a'
            text = '#1a1305'
          } else if (below) {
            fill = '#070b0a'
            text = '#33443f'
          } else if (isBlocked) {
            fill = '#0a0f0e'
            text = '#3e504a'
          } else {
            stroke = '#2ee6c5'
            text = '#e8f2ef'
          }
          const shaking = shake === n
          return (
            <g
              key={n}
              onClick={() => toggle(n)}
              style={{ cursor: below || n === 1 ? 'default' : 'pointer' }}
            >
              <rect
                x={cx - CELL / 2 + 1.5}
                y={cy - CELL / 2 + 1.5}
                width={CELL - 3}
                height={CELL - 3}
                rx={4}
                fill={fill}
                stroke={shaking ? '#ff6b6b' : stroke}
                strokeOpacity={inSet || n === 1 ? 1 : below ? 0.2 : isBlocked ? 0.25 : 0.45}
                strokeWidth={shaking ? 2 : 1}
                filter={inSet ? 'url(#e1196-glow)' : undefined}
              />
              <text
                x={cx}
                y={cy + 3.5}
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="IBM Plex Mono"
                fill={text}
                fontWeight={inSet ? 700 : 400}
                textDecoration={isBlocked && !inSet && !below ? 'line-through' : undefined}
                style={{ pointerEvents: 'none' }}
              >
                {n}
              </text>
            </g>
          )
        })}
        {bursts.current.map((b, i) => {
          const p = cellPos(b.n)
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={6 + b.age * 40}
              fill="none"
              stroke={b.bad ? '#ff6b6b' : '#f0c95a'}
              strokeWidth={b.bad ? 3 : 2}
              opacity={1 - b.age / 0.6}
            />
          )
        })}
        {walkers.current.map((w) => {
          const p = walkerPos(w)
          return (
            <circle
              key={w.id}
              cx={p.x}
              cy={p.y}
              r={w.hits > 1 ? 4.5 : 3.2}
              fill={w.hits > 1 ? '#ff6b6b' : w.hits === 1 ? '#f0c95a' : w.color}
              filter="url(#e1196-glow)"
            />
          )
        })}
        <text x={W / 2} y={Hh + 18} textAnchor="middle" fontSize="8" fill="#8aa39a" fontFamily="IBM Plex Mono">
          walkers whose next product passes {MAXN} leave through the bottom
        </text>
      </svg>

      <div className="btn-row" style={{ margin: '0.75rem 0', gap: '0.4rem' }}>
        <button type="button" className="btn" onClick={() => setRunning(true)} disabled={running}>
          {running ? 'Walking…' : '▶ Release 300 walkers'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => applyPreset('primes')}>
          Primes ≥ x
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => applyPreset('semi')}>
          Semiprimes ≥ x
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => applyPreset('dyadic')}>
          [x, 2x)
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => applyPreset('clear')}>
          Clear
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.6rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="pill-inline">Walkers that hit the set twice or more</span>
            <span className="stat" style={{ color: tally.multi ? 'var(--danger)' : 'var(--ok)' }}>
              {tally.multi} of {tally.walks}
            </span>
          </div>
          <div className="meter" aria-hidden="true">
            <span
              style={{
                width: `${tally.walks ? (100 * tally.once) / tally.walks : 0}%`,
                background: 'linear-gradient(90deg, #b8932e, #f0c95a)',
              }}
            />
          </div>
          <p className="pill-inline" style={{ margin: '4px 0 0' }}>
            Gold bar: walkers that hit exactly once ({tally.once}). Exact hit chance for this walk:{' '}
            <span className="stat">{(expected * 100).toFixed(1)}%</span>
            {expected > 1 ? ' — above 100% is only possible because the set is not primitive' : ''}
          </p>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="pill-inline">Σ 1/(a log a) over your set (numbers ≤ {MAXN} only)</span>
            <span className="stat" style={{ color: 'var(--accent)' }}>
              {weight.toFixed(4)}
            </span>
          </div>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${Math.min(100, weight * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="controls">
        <DimSlider
          label="Threshold x (set must live in [x, ∞))"
          value={x}
          min={2}
          max={40}
          onChange={(v) => {
            setX(v)
            setSet((s) => new Set([...s].filter((a) => a >= v)))
            setTally({ walks: 0, once: 0, multi: 0 })
          }}
        />
      </div>
      <label className="pill-inline" style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 44 }}>
        <input type="checkbox" checked={breakRule} onChange={(e) => setBreakRule(e.target.checked)} />
        Let me break the rule (allow a divisor and its multiple)
      </label>
      <p className={`feedback ${ok ? 'ok' : 'err'}`} role="status">
        {ok
          ? `Primitive: ${set.size} numbers, no member divides another, so every walker hits at most once.`
          : `Not primitive: ${conflicts} divisor pair${conflicts === 1 ? '' : 's'}. A walker can now climb through both members and hit twice (red).`}
      </p>
      <p className="demo-callout">
        The proof of Erdős #1196 runs a sharper version of this idea. Its walk goes down through
        divisors with von Mangoldt weights, tuned so the chance of passing through a is tied to
        1/(a log a) for a ≥ x. A chain meets a primitive set at most once, so those chances add up
        to at most 1. That gives ∑ 1/(a log a) ≤ 1 + O(1/log x). Our walk uses simpler weights,
        so its numbers differ; it shows the principle, and the Lean proof (math-inc/Erdos1196)
        holds the certificate.
      </p>
    </div>
  )
}
