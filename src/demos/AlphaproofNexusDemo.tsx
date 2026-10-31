import { useEffect, useMemo, useState } from 'react'

/**
 * Replays the published counts of the AlphaProof Nexus batch as a waffle chart:
 * 353 open Erdős problems attempted (9 solved), 492 open OEIS conjectures (44 proved).
 * Every cell is one attempt. WHICH cells light up is illustrative: the entry does not name
 * the solved problems. The counts are the paper's; nothing here re-runs or re-checks Lean.
 */

const GROUPS = [
  { key: 'erdos', label: 'Open Erdős problems', total: 353, hits: 9, cols: 24, verb: 'solved' },
  { key: 'oeis', label: 'Open OEIS conjectures', total: 492, hits: 44, cols: 24, verb: 'proved' },
] as const

const EXTRAS = [
  'A 15-year-old question on Hilbert functions, resolved',
  'An open convex-optimization bound improved (new parameter schedule)',
  'Misformalizations caught in problem statements',
  'Help on a problem from the Ben Green list',
]

const DEEPMIND = '#7eb6ff'

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function pickHits(total: number, hits: number, seed: number) {
  const r = rng(seed)
  const set = new Set<number>()
  while (set.size < hits) set.add(Math.floor(r() * total))
  return set
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

const CELL = 12
const FLICKER = 14 // attempts that stay "in progress" at once

export function AlphaproofNexusDemo() {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(Infinity)
  const [running, setRunning] = useState(false)
  const [picked, setPicked] = useState<{ g: number; i: number } | null>(null)

  const data = useMemo(() => {
    const hits = GROUPS.map((g, gi) => pickHits(g.total, g.hits, 4242 + gi * 97))
    // the two 56-year-old Erdős questions: first two hits, for highlighting
    const oldest = new Set([...hits[0]].slice(0, 2))
    // random attempt order across both lists
    const all: { g: number; i: number }[] = []
    GROUPS.forEach((g, gi) => {
      for (let i = 0; i < g.total; i++) all.push({ g: gi, i })
    })
    const r = rng(777)
    for (let k = all.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1))
      ;[all[k], all[j]] = [all[j], all[k]]
    }
    const order = GROUPS.map((g) => new Array<number>(g.total).fill(0))
    all.forEach((c, pos) => {
      order[c.g][c.i] = pos
    })
    return { hits, oldest, order, totalAttempts: all.length }
  }, [])

  useEffect(() => {
    if (!running) return
    if (reduced) {
      setProgress(Infinity)
      setRunning(false)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const DURATION = 7000
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / DURATION)
      const eased = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2
      setProgress(eased * (data.totalAttempts + FLICKER))
      if (f < 1) raf = requestAnimationFrame(tick)
      else {
        setProgress(Infinity)
        setRunning(false)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, reduced, data.totalAttempts])

  const statusOf = (g: number, i: number): 'idle' | 'trying' | 'open' | 'hit' => {
    const pos = data.order[g][i]
    if (pos > progress) return 'idle'
    if (progress - pos < FLICKER) return 'trying'
    return data.hits[g].has(i) ? 'hit' : 'open'
  }

  const counts = GROUPS.map((g, gi) => {
    let tried = 0
    let hit = 0
    for (let i = 0; i < g.total; i++) {
      const s = statusOf(gi, i)
      if (s === 'open' || s === 'hit') tried++
      if (s === 'hit') hit++
    }
    return { tried, hit }
  })
  const finished = progress === Infinity

  // layout: two waffles stacked
  const W = GROUPS[0].cols * CELL
  const blocks = GROUPS.map((g) => Math.ceil(g.total / g.cols) * CELL)
  const offsets = [22, 22 + blocks[0] + 28]
  const H = offsets[1] + blocks[1] + 6

  const detail = (() => {
    if (!picked) return 'Tap any cell to see what that attempt produced.'
    const g = GROUPS[picked.g]
    const s = statusOf(picked.g, picked.i)
    const name = `${g.key === 'erdos' ? 'Erdős' : 'OEIS'} attempt #${picked.i + 1}`
    if (s === 'idle' || s === 'trying') return `${name}: not finished yet.`
    if (s === 'hit')
      return `${name}: ${g.verb}. Lean proof in the public repository (this app does not re-check it).${
        picked.g === 0 && data.oldest.has(picked.i) ? ' One of the two questions open for 56 years.' : ''
      }`
    return `${name}: still open. No accepted Lean proof, so nothing is claimed.`
  })()

  return (
    <div className="demo">
      <h3 className="demo-title">845 attempts, one kernel</h3>
      <p className="demo-hint">
        Each square is one open problem the agent tried. Press run: the agent drafts, Lean either
        accepts the proof or it does not. Only accepted proofs light up. The counts are the
        published ones; the positions of the lit squares are illustrative.
      </p>

      <svg viewBox={`-2 0 ${W + 4} ${H}`} role="img" aria-label="Waffle chart of attempted problems and Lean-checked solves">
        <defs>
          <filter id="apn-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {GROUPS.map((g, gi) => (
          <g key={g.key} transform={`translate(0 ${offsets[gi]})`}>
            <text x={0} y={-8} fill="#e8f2ef" fontSize="9" fontFamily="IBM Plex Mono">
              {g.label}
            </text>
            <text x={W} y={-8} fill={DEEPMIND} fontSize="9" fontFamily="IBM Plex Mono" textAnchor="end">
              {counts[gi].hit} {g.verb} / {counts[gi].tried} tried
            </text>
            {Array.from({ length: g.total }, (_, i) => {
              const s = statusOf(gi, i)
              const x = (i % g.cols) * CELL
              const y = Math.floor(i / g.cols) * CELL
              const sel = picked?.g === gi && picked.i === i
              let fill = '#0b100f'
              let op = 1
              if (s === 'trying') {
                fill = '#e8f2ef'
                op = 0.25 + 0.6 * Math.abs(Math.sin((progress - data.order[gi][i]) * 1.3))
              } else if (s === 'open') fill = '#1c2a26'
              else if (s === 'hit') fill = DEEPMIND
              return (
                <rect
                  key={i}
                  x={x + 1}
                  y={y + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={2}
                  fill={fill}
                  opacity={op}
                  stroke={sel ? '#ffffff' : s === 'hit' && gi === 0 && data.oldest.has(i) ? '#f0c95a' : 'none'}
                  strokeWidth={sel ? 1.6 : 1.2}
                  filter={s === 'hit' ? 'url(#apn-glow)' : undefined}
                  onClick={() => setPicked({ g: gi, i })}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
          </g>
        ))}
      </svg>
      <p className="stat" style={{ fontSize: '0.8rem', minHeight: '2.6em', margin: '0.5rem 0' }}>
        {detail}
      </p>

      <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setProgress(0)
            setRunning(true)
          }}
          disabled={running}
        >
          {running ? 'Attempting…' : '▶ Run the batch'}
        </button>
      </div>

      {GROUPS.map((g, gi) => {
        const pct = (100 * counts[gi].hit) / g.total
        return (
          <div key={g.key} style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="pill-inline">
                {g.label}: hit rate (paper: {g.hits} / {g.total})
              </span>
              <span className="stat">{pct.toFixed(1)}%</span>
            </div>
            <div className="meter" aria-hidden="true">
              <span
                style={{
                  width: `${Math.min(100, pct * 5)}%`,
                  background: `linear-gradient(90deg, #3b6aa8, ${DEEPMIND})`,
                }}
              />
            </div>
          </div>
        )
      })}
      <p className="pill-inline" style={{ marginTop: 0 }}>
        Bars are stretched 5× so a few percent is visible.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
        {EXTRAS.map((e, i) => (
          <span
            key={e}
            style={{
              fontSize: '0.72rem',
              padding: '0.3rem 0.55rem',
              borderRadius: 999,
              border: `1px solid ${finished ? DEEPMIND : 'var(--line)'}`,
              color: finished ? '#e8f2ef' : 'var(--muted)',
              background: finished ? 'color-mix(in srgb, #7eb6ff 12%, transparent)' : 'transparent',
              transition: `all 400ms ease ${i * 120}ms`,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      <p className="stat" style={{ fontSize: '0.8rem' }}>
        Gold outline: the two Erdős questions that had been open for 56 years. Cost: a few hundred
        dollars per Erdős problem for the full agent. A basic draft-and-check agent solved the same
        9 Erdős problems, at higher cost on the harder ones.
      </p>
      <p className="demo-callout">
        Most squares stay dark, and that is fine: a failed attempt claims nothing. Every lit square
        is a proof Lean’s kernel accepted, which a reader can re-check in the public repository.
        This app does not re-check them.
      </p>
    </div>
  )
}
