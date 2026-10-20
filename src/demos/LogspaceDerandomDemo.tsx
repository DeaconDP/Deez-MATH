import { useState } from 'react'

type Mode = 'coins' | 'replay'

const NODES = [
  { id: 's', x: 36, y: 72 },
  { id: 'u', x: 118, y: 32 },
  { id: 'v', x: 118, y: 112 },
  { id: 't', x: 206, y: 72 },
] as const

const EDGES = [
  { id: 's-u', x1: 50, y1: 64, x2: 104, y2: 38 },
  { id: 's-v', x1: 50, y1: 80, x2: 104, y2: 106 },
  { id: 'u-t', x1: 132, y1: 32, x2: 192, y2: 64 },
  { id: 'v-t', x1: 132, y1: 112, x2: 192, y2: 80 },
] as const

const REPLAY = new Set<string>(['s-v', 'v-t'])

const MODES: { id: Mode; label: string }[] = [
  { id: 'coins', label: 'Coin flips' },
  { id: 'replay', label: 'Deterministic replay' },
]

export function LogspaceDerandomDemo() {
  const [mode, setMode] = useState<Mode>('coins')
  const coins = mode === 'coins'

  return (
    <div className="demo">
      <h3 className="demo-title">Log-space walk</h3>
      <p className="demo-hint">
        Toggle coin flips against deterministic replay. The claimed compiler erases the coins and
        leaves the work tape at two cells.
      </p>
      <div className="btn-row">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? 'btn' : 'btn btn-ghost'}
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 280 168" role="img" aria-label="Tiny log-space walk with optional coins">
        {EDGES.map((e) => {
          const on = coins || REPLAY.has(e.id)
          return (
            <line
              key={e.id}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={on ? (coins ? '#f0c95a' : '#2ee6c5') : '#24332e'}
              strokeWidth={on ? 2.2 : 1.2}
            />
          )
        })}
        {NODES.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="14" fill={n.id === 't' ? '#2ee6c5' : '#121a18'} stroke="#e8f2ef" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill={n.id === 't' ? '#041210' : '#e8f2ef'} fontSize="12" fontFamily="IBM Plex Mono">
              {n.id}
            </text>
          </g>
        ))}
        <text x="16" y="152" fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          {coins ? 'work [pos][step] + coin' : 'work [pos][step]   coins erased'}
        </text>
      </svg>
      <p className="stat">
        {coins
          ? 'Both branches from s are live. The coin sits outside the two work cells.'
          : 'Replay keeps the path s, v, t and still accepts at t. The tape is still two cells.'}
      </p>
      <p className="demo-callout">
        So what: the picture is L = RL = BPL, space-bounded derandomization. It is not P = BPP and
        not P = NP.
      </p>
    </div>
  )
}
