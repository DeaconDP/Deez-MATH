import { useEffect, useMemo, useRef, useState } from 'react'

type Letter = [0 | 1, 1 | -1] // generator (0 = a, 1 = b), exponent
type Word = Letter[]
type GroupId = 'z2' | 'bs' | 'astra'
type Perms = { p: [Int32Array, Int32Array]; inv: [Int32Array, Int32Array] }

const A = 0
const B = 1
const GEN_COLOR = ['#2ee6c5', '#7eb6ff']

const GROUPS: Record<Exclude<GroupId, 'astra'>, { name: string; pres: string; rel: Word; tests: Word[]; testNames: string[] }> = {
  z2: {
    name: 'ℤ² (commuting pair)',
    pres: '⟨a, b | a b a⁻¹ b⁻¹ = 1⟩',
    rel: [[A, 1], [B, 1], [A, -1], [B, -1]],
    tests: [[[A, 1]], [[B, 1]], [[A, 1], [B, 1]], [[A, 1], [B, -1]], [[A, 1], [A, 1], [B, 1]]],
    testNames: ['a', 'b', 'ab', 'ab⁻¹', 'a²b'],
  },
  bs: {
    name: 'BS(1,2) (doubling)',
    pres: '⟨a, b | b⁻¹ a b a⁻² = 1⟩',
    rel: [[B, -1], [A, 1], [B, 1], [A, -1], [A, -1]],
    tests: [[[A, 1]], [[B, 1]], [[A, 1], [B, 1]], [[B, 1], [A, -1]], [[A, 1], [A, 1]]],
    testNames: ['a', 'b', 'ab', 'ba⁻¹', 'a²'],
  },
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function invert(p: Int32Array) {
  const q = new Int32Array(p.length)
  for (let i = 0; i < p.length; i++) q[p[i]] = i
  return q
}
function make(a: Int32Array, b: Int32Array): Perms {
  return { p: [a, b], inv: [invert(a), invert(b)] }
}
function walk(m: Perms, x: number, w: Word) {
  let y = x
  for (const [g, e] of w) y = e === 1 ? m.p[g][y] : m.inv[g][y]
  return y
}
function walkPath(m: Perms, x: number, w: Word) {
  const out = [x]
  let y = x
  for (const [g, e] of w) {
    y = e === 1 ? m.p[g][y] : m.inv[g][y]
    out.push(y)
  }
  return out
}

function structured(group: Exclude<GroupId, 'astra'>, n: number): Perms {
  const a = new Int32Array(n)
  const b = new Int32Array(n)
  const k = Math.max(2, Math.round(Math.sqrt(n)))
  for (let x = 0; x < n; x++) {
    a[x] = (x + 1) % n
    b[x] = group === 'z2' ? (x + k) % n : (2 * x) % n // n odd, so doubling is a bijection
  }
  return make(a, b)
}
function randomPerm(n: number, rnd: () => number) {
  const p = new Int32Array(n)
  for (let i = 0; i < n; i++) p[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  return p
}
function identity(n: number) {
  const p = new Int32Array(n)
  for (let i = 0; i < n; i++) p[i] = i
  return p
}

function score(m: Perms, rel: Word, tests: Word[]) {
  const n = m.p[0].length
  let relOk = 0
  const ok = new Uint8Array(n)
  for (let x = 0; x < n; x++) {
    if (walk(m, x, rel) === x) {
      relOk++
      ok[x] = 1
    }
  }
  let moved = 0
  for (const w of tests) for (let x = 0; x < n; x++) if (walk(m, x, w) !== x) moved++
  return { rel: relOk / n, distinct: moved / (n * tests.length), ok }
}

function mulberry(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CX = 118
const CY = 122
const R = 96
const PL = 262 // plane panel
const PT = 34
const PS = 146

export function NonSoficDemo() {
  const [group, setGroup] = useState<GroupId>('z2')
  const [n, setN] = useState(25)
  const [model, setModel] = useState<Perms>(() => structured('z2', 25))
  const [label, setLabel] = useState('Clever shuffle')
  const [trail, setTrail] = useState<[number, number][]>([])
  const [annealing, setAnnealing] = useState(false)
  const [sel, setSel] = useState(0)
  const [phase, setPhase] = useState(0)
  const seed = useRef(7)
  const modelRef = useRef(model)
  useEffect(() => {
    modelRef.current = model
  }, [model])

  const g = group === 'astra' ? GROUPS.z2 : GROUPS[group]
  const sc = useMemo(() => score(model, g.rel, g.tests), [model, g])

  const load = (m: Perms, name: string) => {
    setAnnealing(false)
    setModel(m)
    setLabel(name)
    const s = score(m, g.rel, g.tests)
    setTrail([[s.rel, s.distinct]])
    setSel((v) => Math.min(v, m.p[0].length - 1))
  }

  // Tracer animation along the relation word from the selected point.
  useEffect(() => {
    if (group === 'astra' || reducedMotion()) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      setPhase(((now - t0) / 650) % (g.rel.length + 1.5))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [group, g])

  // Simulated annealing on the two permutations.
  useEffect(() => {
    if (!annealing || group === 'astra') return
    const rnd = mulberry(seed.current++)
    const cur = modelRef.current
    const m: Perms = {
      p: [Int32Array.from(cur.p[0]), Int32Array.from(cur.p[1])],
      inv: [Int32Array.from(cur.inv[0]), Int32Array.from(cur.inv[1])],
    }
    const size = m.p[0].length
    const costOf = () => {
      const s = score(m, g.rel, g.tests)
      return { c: (1 - s.rel) * size + (1 - s.distinct) * size * 1.5, s }
    }
    let { c } = costOf()
    let frame = 0
    let raf = 0
    const swap = (gen: 0 | 1, i: number, j: number) => {
      const p = m.p[gen]
      const t = p[i]
      p[i] = p[j]
      p[j] = t
      m.inv[gen][p[i]] = i
      m.inv[gen][p[j]] = j
    }
    const tick = () => {
      const T = 1.6 * Math.pow(0.988, frame)
      for (let it = 0; it < 220; it++) {
        const gen = (rnd() < 0.5 ? 0 : 1) as 0 | 1
        const i = Math.floor(rnd() * size)
        const j = Math.floor(rnd() * size)
        if (i === j) continue
        swap(gen, i, j)
        const next = costOf().c
        if (next <= c || rnd() < Math.exp((c - next) / Math.max(T, 1e-3))) c = next
        else swap(gen, i, j)
      }
      frame++
      const snap: Perms = {
        p: [Int32Array.from(m.p[0]), Int32Array.from(m.p[1])],
        inv: [Int32Array.from(m.inv[0]), Int32Array.from(m.inv[1])],
      }
      const s = score(snap, g.rel, g.tests)
      setModel(snap)
      setTrail((tr) => [...tr.slice(-120), [s.rel, s.distinct]])
      if (c < 1e-9 || frame > 420) setAnnealing(false)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [annealing, group, g])

  const pts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const t = (i / n) * Math.PI * 2 - Math.PI / 2
        return [CX + Math.cos(t) * R, CY + Math.sin(t) * R] as const
      }),
    [n],
  )

  const tracer = useMemo(() => (group === 'astra' ? [] : walkPath(model, sel, g.rel)), [model, sel, g, group])
  const closes = tracer.length > 0 && tracer[tracer.length - 1] === sel
  const shownSteps = reducedMotion() ? g.rel.length : Math.min(g.rel.length, phase)

  const px = (v: number) => PL + v * PS
  const py = (v: number) => PT + (1 - v) * PS

  const changeGroup = (id: GroupId) => {
    setGroup(id)
    setAnnealing(false)
    if (id === 'astra') return
    const m = structured(id, n)
    setModel(m)
    setLabel('Clever shuffle')
    const s = score(m, GROUPS[id].rel, GROUPS[id].tests)
    setTrail([[s.rel, s.distinct]])
  }
  const changeN = (v: number) => {
    setN(v)
    setSel(0)
    if (group === 'astra') return
    const m = structured(group, v)
    setAnnealing(false)
    setModel(m)
    setLabel('Clever shuffle')
    const s = score(m, g.rel, g.tests)
    setTrail([[s.rel, s.distinct]])
  }

  const astra = group === 'astra'

  return (
    <div className="demo">
      <h3 className="demo-title">Faking an infinite group with finite shuffles</h3>
      <p className="demo-hint">
        Give a and b as two shuffles of n dots. A good fake needs two things at once. The rule must
        hold, so walking the relation word from a dot returns to that dot. Nontrivial words must
        also actually move dots. Tap a dot to trace the rule from it. Try the shuffles below, or let
        the search improve a random one, and watch the dot travel in the plane on the right.
      </p>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        {(['z2', 'bs', 'astra'] as const).map((id) => (
          <button key={id} type="button" className={group === id ? 'btn' : 'btn btn-ghost'} onClick={() => changeGroup(id)}>
            {id === 'astra' ? 'Non-sofic (2026)' : GROUPS[id].name}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 420 236" role="img" aria-label="Two permutations drawn as chords on a circle of dots, and a plane plotting rule accuracy against how much the shuffles move points">
        <defs>
          <filter id="ns-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="ns-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#ff6b6b" strokeWidth="2" opacity="0.55" />
          </pattern>
        </defs>

        <g opacity={astra ? 0.15 : 1}>
          {[0, 1].map((gen) =>
            pts.map((p, i) => {
              const j = model.p[gen][i]
              if (j === i || j === undefined) return null
              const q = pts[j]
              if (!q) return null
              return (
                <line key={`${gen}-${i}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={GEN_COLOR[gen]} strokeWidth="0.8" opacity={0.32} />
              )
            }),
          )}
          {!astra &&
            tracer.slice(0, Math.ceil(shownSteps) + 1).map((x, i) => {
              if (i === 0) return null
              const from = pts[tracer[i - 1]]
              const to = pts[x]
              const frac = Math.min(1, shownSteps - (i - 1))
              const [gen] = g.rel[i - 1]
              return (
                <line
                  key={`t-${i}`}
                  x1={from[0]}
                  y1={from[1]}
                  x2={from[0] + (to[0] - from[0]) * frac}
                  y2={from[1] + (to[1] - from[1]) * frac}
                  stroke={GEN_COLOR[gen]}
                  strokeWidth="2.6"
                  filter="url(#ns-glow)"
                />
              )
            })}
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={i === sel ? 6 : n > 40 ? 3.2 : 4.2}
              fill={sc.ok[i] ? '#6dffb0' : '#ff6b6b'}
              stroke={i === sel ? '#f0c95a' : 'none'}
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
              onClick={() => setSel(i)}
            />
          ))}
          {!astra && (
            <text x={CX} y={CY + 4} textAnchor="middle" fill={closes ? '#6dffb0' : '#ff6b6b'} fontSize="11" fontFamily="IBM Plex Mono">
              {shownSteps >= g.rel.length ? (closes ? 'loop closes ✓' : 'loop breaks ✗') : 'tracing…'}
            </text>
          )}
        </g>
        {astra && (
          <text x={CX} y={CY} textAnchor="middle" fill="#e8f2ef" fontSize="10.5" fontFamily="IBM Plex Mono">
            <tspan x={CX} dy="-0.6em">no finite model</tspan>
            <tspan x={CX} dy="1.3em">can be drawn here</tspan>
          </text>
        )}
        <text x={8} y={14} fill="#8aa39a" fontSize="9.5" fontFamily="IBM Plex Mono">
          <tspan fill={GEN_COLOR[0]}>— a</tspan>
          <tspan dx="8" fill={GEN_COLOR[1]}>— b</tspan>
          <tspan dx="8">n = {n}</tspan>
        </text>

        {/* approximation plane */}
        <rect x={PL} y={PT} width={PS} height={PS} fill="#0b1210" stroke="#24332e" />
        {[0.25, 0.5, 0.75].map((t) => (
          <g key={t}>
            <line x1={px(t)} y1={PT} x2={px(t)} y2={PT + PS} stroke="#24332e" strokeWidth="0.6" />
            <line x1={PL} y1={py(t)} x2={PL + PS} y2={py(t)} stroke="#24332e" strokeWidth="0.6" />
          </g>
        ))}
        <rect
          x={px(0.82)}
          y={py(1)}
          width={px(1) - px(0.82)}
          height={py(0.82) - py(1)}
          fill={astra ? 'url(#ns-hatch)' : 'none'}
          stroke={astra ? '#ff6b6b' : '#24332e'}
          strokeDasharray={astra ? undefined : '3 3'}
        />
        <text x={PL + PS / 2} y={PT - 18} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          approximation plane
        </text>
        <text x={PL + PS / 2} y={PT + PS + 13} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          rule holds →
        </text>
        <text x={PL - 6} y={PT + PS / 2} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono" transform={`rotate(-90 ${PL - 6} ${PT + PS / 2})`}>
          words move dots →
        </text>
        <text x={px(1)} y={PT - 5} textAnchor="end" fill={astra ? '#ff6b6b' : '#f0c95a'} fontSize="9" fontFamily="IBM Plex Mono">
          {astra ? 'unreachable corner' : 'goal corner ★'}
        </text>
        {!astra && trail.length > 1 && (
          <polyline
            points={trail.map(([r, d]) => `${px(r).toFixed(1)},${py(d).toFixed(1)}`).join(' ')}
            fill="none"
            stroke="#f0c95a"
            strokeWidth="1"
            opacity={0.5}
          />
        )}
        {!astra && <circle cx={px(sc.rel)} cy={py(sc.distinct)} r={6} fill="#f0c95a" filter="url(#ns-glow)" />}
        {astra && (
          <text x={PL + PS / 2} y={PT + PS / 2 + 30} textAnchor="middle" fill="#ff6b6b" fontSize="9" fontFamily="IBM Plex Mono">
            <tspan x={PL + PS / 2}>for every n, every shuffle</tspan>
            <tspan x={PL + PS / 2} dy="1.25em">lands outside the red box</tspan>
            <tspan x={PL + PS / 2} dy="1.25em" fill="#8aa39a">(box size schematic)</tspan>
          </text>
        )}
      </svg>

      {astra ? (
        <p className="stat" role="status" style={{ fontSize: '0.8rem', marginTop: 'var(--space-3)' }}>
          The 2026 group is built from units of the binary Leavitt algebra. Its rules force a fixed
          gap: some finite list of relations, and some margin, that no permutations of any size can
          meet at once. This is proved in the paper, not simulated here.
        </p>
      ) : (
        <>
          <div className="controls">
            <label>
              Dots n: <span className="stat">{n}</span>
              <input type="range" min={9} max={61} step={2} value={n} onChange={(e) => changeN(Number(e.target.value))} />
            </label>
          </div>
          <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => load(structured(group, n), 'Clever shuffle')}>
              Clever shuffle
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const rnd = mulberry(seed.current++ * 7919)
                load(make(randomPerm(n, rnd), randomPerm(n, rnd)), 'Random shuffle')
              }}
            >
              Random
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => load(make(identity(n), identity(n)), 'Do nothing (cheat)')}>
              Do nothing
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (annealing) {
                  setAnnealing(false)
                  return
                }
                setLabel('Search')
                setAnnealing(true)
              }}
            >
              {annealing ? 'Stop search' : 'Search from here'}
            </button>
          </div>
          <p className="stat" role="status" style={{ fontSize: '0.8rem' }}>
            {label} for {g.pres}: rule holds at {(sc.rel * 100).toFixed(0)}% of dots. Test words{' '}
            {g.testNames.join(', ')} move {(sc.distinct * 100).toFixed(0)}% of dots.
            {label === 'Do nothing (cheat)' && ' The rule holds trivially, but nothing moves. That fails the second test.'}
          </p>
        </>
      )}
      <p className="demo-callout">
        Sofic means that for any finite list of rules you can push the dot into the goal corner by
        taking n large. ℤ² and BS(1,2) are sofic, and the clever shuffles show it exactly. For
        decades no group was known to fail. The 2026 Astra group fails. Theorems that assumed
        "every group is sofic" now need that as a hypothesis. The search here is a toy heuristic.
      </p>
    </div>
  )
}
