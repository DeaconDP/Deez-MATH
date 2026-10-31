import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * Toy model of a multi-agent formalization campaign on a theorem DAG.
 * A node can be proved only after every lemma it uses (its children) is proved.
 * Agents grab ready nodes (longest-remaining-path first). The finish time can never beat
 * max(total work / agents, critical path), which is why adding agents saturates.
 * Top-layer names sketch the classical FLT chain; lower layers are anonymous toy lemmas.
 */

const WIDTHS = [1, 3, 5, 8, 12, 16, 20, 24]
const TOP_NAMES: string[][] = [
  ['Fermat’s Last Theorem (Mathlib statement)'],
  ['Reduce to prime exponents p ≥ 5', 'Frey curve y² = x(x − aᵖ)(x + bᵖ)', 'Exponents 3 and 4'],
  [
    'Ribet: level lowering',
    'Wiles–Taylor: semistable modularity',
    'Mazur: irreducibility mod p',
    'No weight-2 forms of level 2',
    'Frey curve is semistable',
  ],
  [
    'R = T for minimal deformations',
    'Langlands–Tunnell (mod 3)',
    '3–5 switch',
    'Galois deformation rings',
    'Hecke algebras',
    'Modular curves & Jacobians',
    'Tate curves at bad primes',
    'Elliptic curves over ℚ',
  ],
]

type Node = {
  id: number
  layer: number
  x: number
  y: number
  name: string
  work: number
  children: number[]
  parents: number[]
}

function buildDag(seed: number) {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const nodes: Node[] = []
  const layers: number[][] = []
  WIDTHS.forEach((w, L) => {
    const row: number[] = []
    for (let i = 0; i < w; i++) {
      const id = nodes.length
      nodes.push({
        id,
        layer: L,
        x: ((i + 0.5) / w) * 340 + 10,
        y: 22 + L * 34,
        name: TOP_NAMES[L]?.[i] ?? `Lemma ${L}.${i + 1}`,
        work: L === WIDTHS.length - 1 ? 1 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 4),
        children: [],
        parents: [],
      })
      row.push(id)
    }
    layers.push(row)
  })
  for (let L = 0; L < layers.length - 1; L++) {
    const up = layers[L]
    const down = layers[L + 1]
    up.forEach((u, i) => {
      const center = ((i + 0.5) / up.length) * down.length
      const k = 2 + Math.floor(rand() * 2)
      for (let t = 0; t < k; t++) {
        const j = Math.max(0, Math.min(down.length - 1, Math.floor(center - 1.5 + rand() * 3)))
        if (!nodes[u].children.includes(down[j])) nodes[u].children.push(down[j])
      }
    })
    down.forEach((d, j) => {
      if (nodes.some((n) => n.children.includes(d))) return
      const i = Math.min(up.length - 1, Math.floor(((j + 0.5) / down.length) * up.length))
      nodes[up[i]].children.push(d)
    })
  }
  for (const n of nodes) for (const c of n.children) nodes[c].parents.push(n.id)
  // longest remaining path (work) from each node down to the leaves
  const rank = new Array<number>(nodes.length).fill(0)
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]
    rank[i] = n.work + Math.max(0, ...n.children.map((c) => rank[c]))
  }
  return { nodes, rank }
}

type Dag = ReturnType<typeof buildDag>

/** Offline list scheduling: returns makespan for the given number of agents. */
function makespan(dag: Dag, agents: number) {
  const { nodes, rank } = dag
  const remainingKids = nodes.map((n) => n.children.length)
  const ready = nodes.filter((n) => n.children.length === 0).map((n) => n.id)
  const running: { id: number; end: number }[] = []
  let time = 0
  let done = 0
  while (done < nodes.length) {
    ready.sort((a, b) => rank[b] - rank[a])
    while (running.length < agents && ready.length) {
      const id = ready.shift() as number
      running.push({ id, end: time + nodes[id].work })
    }
    running.sort((a, b) => a.end - b.end)
    const next = running.shift()
    if (!next) break
    time = next.end
    done++
    for (const p of nodes[next.id].parents) if (--remainingKids[p] === 0) ready.push(p)
  }
  return time
}

type Status = 'wait' | 'ready' | 'work' | 'done' | 'bad'

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

const AGENT_COLORS = ['#ff8a2b', '#ffb36b', '#ffd09b', '#ff9f5a']

export function FltFormalizationDemo() {
  const dag = useMemo(() => buildDag(20260904), [])
  const { nodes, rank } = dag
  const [agents, setAgents] = useState(12)
  const [falseLemma, setFalseLemma] = useState(false)
  const [weakRoot, setWeakRoot] = useState(false)
  const [running, setRunning] = useState(false)
  const [focus, setFocus] = useState<number | null>(0)
  const [, setTick] = useState(0)
  const reduced = usePrefersReducedMotion()

  const BAD_ID = nodes.findIndex((n) => n.layer === 5 && n.name === 'Lemma 5.7')
  const sim = useRef({
    time: 0,
    status: nodes.map((n) => (n.children.length ? 'wait' : 'ready') as Status),
    progress: nodes.map(() => 0),
    owner: nodes.map(() => -1),
    failures: 0,
    finished: false,
  })

  const reset = () => {
    sim.current = {
      time: 0,
      status: nodes.map((n) => (n.children.length ? 'wait' : 'ready') as Status),
      progress: nodes.map(() => 0),
      owner: nodes.map(() => -1),
      failures: 0,
      finished: false,
    }
    setTick((t) => t + 1)
  }

  const curve = useMemo(() => Array.from({ length: 48 }, (_, i) => makespan(dag, i + 1)), [dag])
  const totalWork = nodes.reduce((s, n) => s + n.work, 0)
  const critical = rank[0]
  const predicted = curve[agents - 1]

  useEffect(() => {
    if (!running) return
    const S = sim.current
    const stepSim = (dt: number) => {
      // assign idle agents to ready nodes
      const busy = S.owner.filter((o) => o >= 0).length
      let free = agents - busy
      if (free > 0) {
        const ready = nodes
          .filter((n) => S.status[n.id] === 'ready')
          .sort((a, b) => rank[b.id] - rank[a.id])
        for (const n of ready) {
          if (free <= 0) break
          const used = new Set(S.owner.filter((o) => o >= 0))
          let a = 0
          while (used.has(a)) a++
          S.owner[n.id] = a
          S.status[n.id] = 'work'
          S.progress[n.id] = 0
          free--
        }
      }
      for (const n of nodes) {
        if (S.status[n.id] !== 'work') continue
        S.progress[n.id] += dt
        if (S.progress[n.id] < n.work) continue
        S.owner[n.id] = -1
        if (falseLemma && n.id === BAD_ID) {
          // kernel rejects: a false statement has no proof, so it bounces back
          S.status[n.id] = 'bad'
          S.failures++
          continue
        }
        S.status[n.id] = 'done'
        for (const p of n.parents) {
          if (nodes[p].children.every((c) => S.status[c] === 'done') && S.status[p] === 'wait') S.status[p] = 'ready'
        }
      }
      // rejected false lemma gets retried after a pause
      for (const n of nodes) if (S.status[n.id] === 'bad' && Math.random() < dt * 0.6) S.status[n.id] = 'ready'
      S.time += dt
      const allDone = S.status[0] === 'done'
      const stuck = falseLemma && S.time > predicted * 2.2 + 6
      if (allDone || stuck) S.finished = true
    }

    if (reduced) {
      let guard = 0
      while (!S.finished && guard++ < 20000) stepSim(0.05)
      setTick((t) => t + 1)
      setRunning(false)
      return
    }
    let raf = 0
    let last = performance.now()
    const speed = Math.max(2, predicted / 7)
    const tickFn = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * speed
      last = now
      const sub = Math.ceil(dt / 0.05)
      for (let i = 0; i < sub && !S.finished; i++) stepSim(dt / sub)
      setTick((t) => t + 1)
      if (S.finished) {
        setRunning(false)
        return
      }
      raf = requestAnimationFrame(tickFn)
    }
    raf = requestAnimationFrame(tickFn)
    return () => cancelAnimationFrame(raf)
  }, [running, agents, falseLemma, nodes, rank, predicted, BAD_ID, reduced])

  const S = sim.current
  const doneCount = S.status.filter((s) => s === 'done').length
  const rootDone = S.status[0] === 'done'
  const busyNow = S.owner.filter((o) => o >= 0).length

  let verdict: { cls: string; text: string }
  if (rootDone && weakRoot)
    verdict = {
      cls: 'err',
      text: 'Kernel: proof checks. Comparator: FAIL — the proved root says “n > 3”, not Mathlib’s FLT. A green kernel on the wrong statement proves nothing about FLT.',
    }
  else if (rootDone)
    verdict = {
      cls: 'ok',
      text: 'Kernel: every node checked, no sorry. Comparator: root matches Mathlib’s FLT statement. (Toy — trust the real kernel and comparator, not this animation.)',
    }
  else if (S.finished && falseLemma)
    verdict = {
      cls: 'err',
      text: `Stuck: ${nodes[BAD_ID].name} is false, the kernel rejected it ${S.failures} times, and everything above it waits forever.`,
    }
  else verdict = { cls: '', text: running ? 'Campaign running…' : 'Press run to start the campaign.' }

  const focusNode = focus != null ? nodes[focus] : null
  const W = 360
  const H = 22 + (WIDTHS.length - 1) * 34 + 22

  // makespan chart
  const CW = 320
  const CH = 110
  const maxT = curve[0]
  const cx = (a: number) => 30 + ((a - 1) / 47) * (CW - 40)
  const cy = (v: number) => CH - 18 - (v / maxT) * (CH - 30)

  return (
    <div className="demo">
      <h3 className="demo-title">Prove the tree, bottom up</h3>
      <p className="demo-hint">
        A formalization is a graph of lemmas. A node can be proved only after every lemma beneath
        it is proved. Agents (orange) grab whatever is ready. Run the campaign, then try more
        agents, a planted false lemma, or a quietly weakened root statement. Tap a node to read it.
      </p>
      <svg viewBox={`0 0 ${W + 20} ${H}`} role="img" aria-label={`Theorem DAG, ${doneCount} of ${nodes.length} nodes proved`}>
        <defs>
          <filter id="flt-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodes.map((n) =>
          n.children.map((c) => {
            const ch = nodes[c]
            const lit = S.status[c] === 'done'
            return (
              <line
                key={`${n.id}-${c}`}
                x1={n.x}
                y1={n.y}
                x2={ch.x}
                y2={ch.y}
                stroke={lit ? '#2ee6c5' : '#24332e'}
                strokeOpacity={lit ? 0.55 : 0.8}
                strokeWidth={lit ? 1.1 : 0.7}
              />
            )
          }),
        )}
        {nodes.map((n) => {
          const st = S.status[n.id]
          const isRoot = n.id === 0
          const r = isRoot ? 9 : n.layer < 4 ? 5.5 : 4
          let fill = '#121a18'
          let stroke = '#3a4d47'
          if (st === 'ready') stroke = '#e8f2ef'
          if (st === 'work') {
            fill = '#3a2410'
            stroke = '#ff8a2b'
          }
          if (st === 'done') {
            fill = '#2ee6c5'
            stroke = '#2ee6c5'
          }
          if (st === 'bad' || (falseLemma && n.id === BAD_ID && st !== 'done')) stroke = '#ff6b6b'
          if (st === 'bad') fill = '#ff6b6b'
          if (isRoot && st === 'done') {
            fill = weakRoot ? '#ff6b6b' : '#f0c95a'
            stroke = fill
          }
          const prog = st === 'work' ? Math.min(1, S.progress[n.id] / n.work) : 0
          const circ = 2 * Math.PI * (r + 3)
          return (
            <g key={n.id} onClick={() => setFocus(n.id)} style={{ cursor: 'pointer' }}>
              <circle cx={n.x} cy={n.y} r={Math.max(r + 4, 9)} fill="transparent" />
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={fill}
                stroke={focus === n.id ? '#ffffff' : stroke}
                strokeWidth={focus === n.id ? 2 : 1.2}
                filter={st === 'done' && (isRoot || n.layer < 2) ? 'url(#flt-glow)' : undefined}
              />
              {st === 'work' && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r + 3}
                  fill="none"
                  stroke={AGENT_COLORS[S.owner[n.id] % AGENT_COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray={`${circ * prog} ${circ}`}
                  transform={`rotate(-90 ${n.x} ${n.y})`}
                  filter="url(#flt-glow)"
                />
              )}
            </g>
          )
        })}
        <text x={W + 16} y={H - 6} fill="#8aa39a" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono">
          t = {S.time.toFixed(1)} · {busyNow}/{agents} agents busy
        </text>
      </svg>
      <p className="stat" style={{ minHeight: '2.6em', fontSize: '0.8rem', margin: '0.5rem 0' }}>
        {focusNode ? (
          <>
            <strong style={{ color: '#f0c95a' }}>{focusNode.name}</strong>
            {focusNode.id === 0 && weakRoot ? ' — weakened to “n > 3” ' : ' '}
            <span style={{ color: '#8aa39a' }}>
              · uses {focusNode.children.length} lemma{focusNode.children.length === 1 ? '' : 's'} · work {focusNode.work} ·{' '}
              {S.status[focusNode.id]}
            </span>
          </>
        ) : (
          'Tap a node.'
        )}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="pill-inline">Nodes kernel-checked</span>
        <span className="stat">
          {doneCount} / {nodes.length}
        </span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(100 * doneCount) / nodes.length}%` }} />
      </div>

      <div className="controls">
        <DimSlider
          label="Agents"
          value={agents}
          min={1}
          max={48}
          onChange={(v) => {
            setAgents(v)
            setRunning(false)
            reset()
          }}
        />
      </div>
      <div style={{ display: 'grid', gap: 4, marginBottom: '0.75rem' }}>
        <label className="pill-inline" style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 36 }}>
          <input
            type="checkbox"
            checked={falseLemma}
            onChange={(e) => {
              setFalseLemma(e.target.checked)
              setRunning(false)
              reset()
            }}
          />
          Plant a false lemma (it has no proof)
        </label>
        <label className="pill-inline" style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 36 }}>
          <input
            type="checkbox"
            checked={weakRoot}
            onChange={(e) => {
              setWeakRoot(e.target.checked)
              setRunning(false)
              reset()
            }}
          />
          Quietly weaken the root to “n &gt; 3”
        </label>
      </div>
      <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          className="btn"
          onClick={() => {
            reset()
            setRunning(true)
          }}
          disabled={running}
        >
          {running ? 'Proving…' : '▶ Run campaign'}
        </button>
      </div>
      <p className={`feedback ${verdict.cls}`} role="status">
        {verdict.text}
      </p>

      <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label="Finish time versus number of agents">
        <line x1={30} x2={CW - 10} y1={CH - 18} y2={CH - 18} stroke="#24332e" />
        <line x1={30} x2={30} y1={10} y2={CH - 18} stroke="#24332e" />
        <line x1={30} x2={CW - 10} y1={cy(critical)} y2={cy(critical)} stroke="#ff6b6b" strokeDasharray="3 3" />
        <text x={CW - 12} y={cy(critical) - 3} fill="#ff6b6b" fontSize="7" textAnchor="end">
          critical path = {critical} (no number of agents beats this)
        </text>
        <path
          d={curve.map((v, i) => `${i ? 'L' : 'M'}${cx(i + 1).toFixed(1)},${cy(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#ff8a2b"
          strokeWidth={1.8}
        />
        <circle cx={cx(agents)} cy={cy(predicted)} r={4} fill="#ffffff" />
        <text x={34} y={16} fill="#8aa39a" fontSize="7">
          finish time vs agents (total work {totalWork})
        </text>
        {[1, 12, 24, 48].map((a) => (
          <text key={a} x={cx(a)} y={CH - 6} fill="#8aa39a" fontSize="7" textAnchor="middle">
            {a}
          </text>
        ))}
      </svg>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        With {agents} agent{agents === 1 ? '' : 's'}: finish ≈ {predicted} time units. Lower bounds: work ÷ agents ={' '}
        {(totalWork / agents).toFixed(1)}, critical path = {critical}.
      </p>
      <p className="demo-callout">
        The real campaign: Claude agents in the Prove2Me harness, a shared lemma DAG, about 13
        million Lean lines in about eleven days, checked by Lean’s kernel, a Mathlib-statement
        comparator and an independent re-checker. The mathematics is Wiles–Taylor’s. This toy
        has {nodes.length} nodes, not tens of thousands, and its clock is not days.
      </p>
    </div>
  )
}
