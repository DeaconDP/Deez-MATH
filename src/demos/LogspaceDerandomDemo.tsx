import { useEffect, useMemo, useRef, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/*
 * Toy model of a randomized log-space machine: its configuration graph laid
 * out in layers (one layer per time step, one row per memory state). At each
 * step the machine reads one fresh coin and follows the 0-edge or the 1-edge.
 */

type Machine = {
  w: number
  T: number
  start: number
  next: number[][][] // next[layer][row][coin]
  accept: boolean[]
  mass: number[][] // exact probability of being at [layer][row]
  p: number
}

const T = 11
const CW = 560
const CH = 290
const LEFT = 34
const RIGHT = 120
const TOP = 26

const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

function makeRand(seed: number) {
  let s = (seed * 48271) % 2147483647 || 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function buildMachine(w: number, seed: number): Machine {
  for (let attempt = 0; attempt < 400; attempt++) {
    const rand = makeRand(seed * 1009 + attempt * 7 + w)
    const start = Math.floor(w / 2)
    const next: number[][][] = []
    for (let l = 0; l < T - 1; l++) {
      next.push(
        Array.from({ length: w }, (_, s) => {
          // Mostly local moves, so the graph reads like a walk.
          const step = () => Math.max(0, Math.min(w - 1, s + Math.floor(rand() * 5) - 2))
          let a = step()
          let b = step()
          if (a === b) b = a === 0 ? 1 : a - 1
          return [a, b]
        }),
      )
    }
    const accept = Array.from({ length: w }, () => rand() < 0.5)
    const mass: number[][] = Array.from({ length: T }, () => new Array<number>(w).fill(0))
    mass[0][start] = 1
    for (let l = 0; l < T - 1; l++)
      for (let s = 0; s < w; s++) {
        const m = mass[l][s]
        if (!m) continue
        mass[l + 1][next[l][s][0]] += m / 2
        mass[l + 1][next[l][s][1]] += m / 2
      }
    const p = mass[T - 1].reduce((acc, m, s) => acc + (accept[s] ? m : 0), 0)
    // BPL promise: acceptance probability is at least 2/3 or at most 1/3.
    // Keep it away from 0 and 1 so the coins actually matter.
    if ((p >= 2 / 3 && p <= 0.86) || (p <= 1 / 3 && p >= 0.14)) return { w, T, start, next, accept, mass, p }
  }
  throw new Error('no machine')
}

type Particle = { l: number; s: number; to: number; t: number }
type Burst = { x: number; y: number; age: number; ok: boolean }

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

const bitsFor = (k: number) => Math.max(1, Math.ceil(Math.log2(k)))

export function LogspaceDerandomDemo() {
  const reduced = usePrefersReducedMotion()
  const [w, setW] = useState(6)
  const [seed, setSeed] = useState(3)
  const [mode, setMode] = useState<'coins' | 'sweep'>('coins')
  const [running, setRunning] = useState(!reduced)
  const [tally, setTally] = useState({ acc: 0, tot: 0 })
  const [sweepDone, setSweepDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const machine = useMemo(() => buildMachine(w, seed), [w, seed])
  const drawRef = useRef<(() => void) | null>(null)
  const [replay, setReplay] = useState(0)
  const sim = useRef({ particles: [] as Particle[], bursts: [] as Burst[], spawn: 0, tau: 0, hits: [] as number[], acc: 0, tot: 0 })

  // Reset the simulation whenever the machine or mode changes.
  useEffect(() => {
    sim.current = { particles: [], bursts: [], spawn: 0, tau: reduced ? T - 1 : 0, hits: new Array(machine.w).fill(0), acc: 0, tot: 0 }
    setTally({ acc: 0, tot: 0 })
    setSweepDone(reduced && mode === 'sweep')
  }, [machine, mode, reduced])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = CW * dpr
    canvas.height = CH * dpr
    const M = machine
    const X = (l: number) => LEFT + (l * (CW - LEFT - RIGHT)) / (T - 1)
    const Y = (s: number) => TOP + (s * (CH - TOP * 2)) / Math.max(1, M.w - 1)
    let raf = 0
    let last = performance.now()
    let lastTally = 0

    const draw = () => {
      const S = sim.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#070b0a'
      ctx.fillRect(0, 0, CW, CH)
      const sweepLayer = Math.floor(S.tau)
      const frac = S.tau - sweepLayer

      // Edges
      for (let l = 0; l < T - 1; l++)
        for (let s = 0; s < M.w; s++)
          for (let b = 0; b < 2; b++) {
            const to = M.next[l][s][b]
            ctx.beginPath()
            ctx.moveTo(X(l), Y(s))
            if (mode === 'sweep') {
              const flow = M.mass[l][s] / 2
              if (l < sweepLayer || (l === sweepLayer && frac > 0)) {
                const k = l < sweepLayer ? 1 : frac
                ctx.lineTo(X(l) + (X(l + 1) - X(l)) * k, Y(s) + (Y(to) - Y(s)) * k)
                ctx.strokeStyle = flow > 0 ? `rgba(46,230,197,${0.25 + Math.min(0.75, flow * 2)})` : '#16211e'
                ctx.lineWidth = flow > 0 ? 0.8 + flow * 14 : 0.8
              } else {
                ctx.lineTo(X(l + 1), Y(to))
                ctx.strokeStyle = '#16211e'
                ctx.lineWidth = 0.8
              }
            } else {
              ctx.lineTo(X(l + 1), Y(to))
              ctx.strokeStyle = b === 0 ? 'rgba(126,182,255,0.28)' : 'rgba(240,201,90,0.28)'
              ctx.lineWidth = 1
            }
            ctx.stroke()
          }

      // Nodes
      for (let l = 0; l < T; l++)
        for (let s = 0; s < M.w; s++) {
          const final = l === T - 1
          let r = 4
          let fill = '#121a18'
          if (mode === 'sweep' && l <= sweepLayer && M.mass[l][s] > 0) {
            r = 4 + 13 * Math.sqrt(M.mass[l][s])
            fill = '#2ee6c5'
            ctx.shadowColor = '#2ee6c5'
            ctx.shadowBlur = 12
          }
          ctx.beginPath()
          ctx.arc(X(l), Y(s), r, 0, Math.PI * 2)
          ctx.fillStyle = fill
          ctx.globalAlpha = mode === 'sweep' && l <= sweepLayer ? 0.85 : 1
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.shadowBlur = 0
          if (final) {
            ctx.lineWidth = 2
            ctx.strokeStyle = M.accept[s] ? '#6dffb0' : '#ff6b6b'
            ctx.beginPath()
            ctx.arc(X(l), Y(s), Math.max(r, 7), 0, Math.PI * 2)
            ctx.stroke()
          } else if (l === 0 && s === M.start) {
            ctx.lineWidth = 2
            ctx.strokeStyle = '#e8f2ef'
            ctx.beginPath()
            ctx.arc(X(l), Y(s), 8, 0, Math.PI * 2)
            ctx.stroke()
          }
        }

      // Landing histogram: filled = observed share, tick = exact probability
      const hx = X(T - 1) + 16
      const maxLen = RIGHT - 30
      for (let s = 0; s < M.w; s++) {
        const exact = M.mass[T - 1][s]
        const obs = S.tot ? S.hits[s] / S.tot : 0
        const shown = mode === 'coins' ? obs : sweepLayer >= T - 1 ? exact : 0
        ctx.fillStyle = M.accept[s] ? 'rgba(109,255,176,0.75)' : 'rgba(255,107,107,0.75)'
        ctx.fillRect(hx, Y(s) - 4, shown * maxLen * 1.6, 8)
        if (mode === 'coins') {
          ctx.fillStyle = '#e8f2ef'
          ctx.fillRect(hx + exact * maxLen * 1.6 - 1, Y(s) - 7, 2, 14)
        }
      }
      ctx.font = '10px IBM Plex Mono, monospace'
      ctx.fillStyle = '#8aa39a'
      ctx.fillText('start', X(0) - 14, Y(M.start) - 12)
      ctx.fillText(mode === 'coins' ? 'landed · | exact' : 'exact mass', hx - 2, 14)
      ctx.fillText('time →', X(0), CH - 6)

      // Particles
      for (const p of S.particles) {
        const k = p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2
        const x = X(p.l) + (X(p.l + 1) - X(p.l)) * k
        const y = Y(p.s) + (Y(p.to) - Y(p.s)) * k
        ctx.beginPath()
        ctx.arc(x, y, 3.2, 0, Math.PI * 2)
        ctx.fillStyle = '#f0c95a'
        ctx.shadowColor = '#f0c95a'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
      for (const b of S.bursts) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, 7 + b.age * 26, 0, Math.PI * 2)
        ctx.strokeStyle = b.ok ? `rgba(109,255,176,${1 - b.age})` : `rgba(255,107,107,${1 - b.age})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    const finishWalk = (s: number) => {
      const S = sim.current
      S.hits[s] = (S.hits[s] ?? 0) + 1
      S.tot++
      if (M.accept[s]) S.acc++
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const S = sim.current
      if (mode === 'coins') {
        S.spawn += dt
        while (S.spawn > 0.07) {
          S.spawn -= 0.07
          if (S.particles.length < 70) {
            S.particles.push({ l: 0, s: M.start, to: M.next[0][M.start][Math.random() < 0.5 ? 0 : 1], t: 0 })
          }
        }
        const keep: Particle[] = []
        for (const p of S.particles) {
          p.t += dt * 5.5
          if (p.t >= 1) {
            p.l++
            p.s = p.to
            p.t = 0
            if (p.l === T - 1) {
              finishWalk(p.s)
              S.bursts.push({ x: X(T - 1), y: Y(p.s), age: 0, ok: M.accept[p.s] })
              continue
            }
            p.to = M.next[p.l][p.s][Math.random() < 0.5 ? 0 : 1]
          }
          keep.push(p)
        }
        S.particles = keep
      } else {
        S.tau = Math.min(T - 1, S.tau + dt * 2.2)
        if (S.tau >= T - 1) {
          setSweepDone(true)
          draw()
          return
        }
      }
      for (const b of S.bursts) b.age += dt * 2.2
      S.bursts = S.bursts.filter((b) => b.age < 1)
      if (now - lastTally > 120) {
        lastTally = now
        setTally({ acc: S.acc, tot: S.tot })
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    drawRef.current = draw
    draw()
    if (running && !reduced) raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      drawRef.current = null
    }
  }, [machine, mode, running, reduced, replay])

  function burstWalks(k: number) {
    const S = sim.current
    const M = machine
    for (let i = 0; i < k; i++) {
      let s = M.start
      for (let l = 0; l < T - 1; l++) s = M.next[l][s][Math.random() < 0.5 ? 0 : 1]
      S.hits[s] = (S.hits[s] ?? 0) + 1
      S.tot++
      if (M.accept[s]) S.acc++
    }
    setTally({ acc: S.acc, tot: S.tot })
    drawRef.current?.()
  }

  const est = tally.tot ? tally.acc / tally.tot : 0
  const ci = tally.tot ? 1.96 * Math.sqrt(Math.max(est * (1 - est), 0.0001) / tally.tot) : 0
  const truth = machine.p >= 0.5
  const walkerBits = bitsFor(w) + bitsFor(T)
  const sweepBits = w * T
  const barMax = sweepBits

  return (
    <div className="demo">
      <h3 className="demo-title">Coins vs. one deterministic sweep</h3>
      <p className="demo-hint">
        This is a toy machine&apos;s whole life: columns are time steps, rows are its few possible
        memory states. Each step it flips a coin and follows the blue (0) or gold (1) edge. Green rings
        accept, red rings reject. With coins you sample paths and vote; the sweep instead pushes the
        exact probability through, layer by layer, with no coins at all.
      </p>

      <div className="btn-row" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button
          type="button"
          style={small}
          className={mode === 'coins' ? 'btn' : 'btn btn-ghost'}
          aria-pressed={mode === 'coins'}
          onClick={() => setMode('coins')}
        >
          Flip coins
        </button>
        <button
          type="button"
          style={small}
          className={mode === 'sweep' ? 'btn' : 'btn btn-ghost'}
          aria-pressed={mode === 'sweep'}
          onClick={() => {
            setMode('sweep')
            setRunning(true)
          }}
        >
          Deterministic sweep
        </button>
      </div>

      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Layered configuration graph of width ${w}. Exact acceptance probability ${(machine.p * 100).toFixed(1)} percent.`}
        style={{ aspectRatio: `${CW} / ${CH}` }}
      />

      <div className="btn-row" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        {mode === 'coins' ? (
          <>
            <button type="button" style={small} className="btn btn-ghost" disabled={reduced} onClick={() => setRunning((r) => !r)}>
              {running && !reduced ? 'Pause' : 'Play'}
            </button>
            <button type="button" style={small} className="btn btn-ghost" onClick={() => burstWalks(500)}>
              +500 walks instantly
            </button>
          </>
        ) : (
          <button
            type="button"
            style={small}
            className="btn btn-ghost"
            onClick={() => {
              sim.current.tau = reduced ? T - 1 : 0
              setSweepDone(reduced)
              setRunning(true)
              setReplay((r) => r + 1)
            }}
          >
            Replay sweep
          </button>
        )}
        <button type="button" style={small} className="btn btn-ghost" onClick={() => setSeed((s) => s + 1)}>
          New machine
        </button>
      </div>

      <div className="controls" style={{ marginTop: 0 }}>
        <DimSlider label="Memory states per step (width)" value={w} min={3} max={9} onChange={setW} />
      </div>

      {mode === 'coins' ? (
        <p className="stat" role="status">
          {tally.tot} walks · {tally.acc} accepted · estimate {(est * 100).toFixed(1)}% ± {(ci * 100).toFixed(1)}% ·
          vote says {tally.tot ? (est >= 0.5 ? 'ACCEPT' : 'REJECT') : '…'}
          {tally.tot >= 30 ? (est >= 0.5 === truth ? ' (right so far)' : ' (wrong so far: keep flipping)') : ''}
        </p>
      ) : (
        <p className="stat" role="status">
          {sweepDone
            ? `Exact: Pr[accept] = ${(machine.p * 100).toFixed(2)}% → ${truth ? 'ACCEPT' : 'REJECT'}, with zero randomness and zero error.`
            : 'Pushing probability mass through the layers…'}
        </p>
      )}

      <div style={{ display: 'grid', gap: 6, marginTop: 'var(--space-3)' }}>
        {[
          { label: `Coin walker: state + clock (${walkerBits} bits)`, v: walkerBits, color: '#f0c95a' },
          { label: `Naive sweep: a whole layer of ${T}-bit probabilities (${sweepBits} bits)`, v: sweepBits, color: '#ff6b6b' },
        ].map((b) => (
          <div key={b.label}>
            <span className="pill-inline">{b.label}</span>
            <div className="meter">
              <span style={{ width: `${(b.v / barMax) * 100}%`, background: b.color, transition: 'width 300ms' }} />
            </div>
          </div>
        ))}
      </div>
      <p className="pill-inline" style={{ marginTop: 'var(--space-2)' }}>
        Memory is the catch. The walker remembers only where it is: about log(width) + log(time) bits,
        which is O(log n) for a real machine. The naive sweep stores a probability for every row, and a
        real machine has polynomially many rows, so that is far more than log space. The claimed compiler
        gets the sweep&apos;s certainty while staying in O(log n) bits. Its method is in the preprint and
        is not run here.
      </p>
      <p className="demo-callout">
        The claim is L = RL = BPL: coins never help a log-space machine. That is space-bounded
        derandomization only. It does not say P = BPP, P = NP, or L = NL, and this page does not check
        the proof.
      </p>
    </div>
  )
}
