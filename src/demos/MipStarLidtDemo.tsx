import { useState } from 'react'

type AnswerMode = 'consistent' | 'drift'

const HONEST = [
  { x: 78, y: 132 },
  { x: 128, y: 108 },
  { x: 178, y: 90 },
  { x: 228, y: 78 },
]
const DRIFT = [
  { x: 78, y: 132 },
  { x: 128, y: 124 },
  { x: 178, y: 64 },
  { x: 228, y: 116 },
]

export function MipStarLidtDemo() {
  const [mode, setMode] = useState<AnswerMode>('consistent')
  const bob = mode === 'consistent' ? HONEST : DRIFT
  const pass = mode === 'consistent'

  return (
    <div className="demo">
      <h3 className="demo-title">Low-degree check, two silent provers</h3>
      <p className="demo-hint">
        Intuition for LIDT, not a proof of MIP*. Alice and Bob cannot message each other. The
        referee accepts only when both answers sit on one low-degree line. This page does not
        re-run Lean.
      </p>
      <svg
        viewBox="0 0 320 188"
        role="img"
        aria-label={
          pass
            ? 'Alice and Bob both answer on one low-degree line. The referee accepts.'
            : 'Alice stays on the line. Bob drifts off it. The referee rejects.'
        }
      >
        <text x="16" y="20" fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          Alice
        </text>
        <text x="118" y="20" fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          no channel
        </text>
        <text x="252" y="20" fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
          Bob
        </text>
        <polyline
          points={HONEST.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#2ee6c5"
          strokeWidth="1.5"
        />
        {HONEST.map((p, i) => (
          <circle key={`a${i}`} cx={p.x - 14} cy={p.y} r="5" fill="#2ee6c5" />
        ))}
        {bob.map((p, i) => (
          <circle key={`b${i}`} cx={p.x + 14} cy={p.y} r="5" fill={pass ? '#2ee6c5' : '#f0c95a'} />
        ))}
        <text x="16" y="172" fill="#e8f2ef" fontSize="12" fontFamily="IBM Plex Mono">
          Referee {pass ? 'accepts' : 'rejects'}
        </text>
      </svg>
      <div className="btn-row">
        <button
          type="button"
          className={pass ? 'btn' : 'btn btn-ghost'}
          aria-pressed={pass}
          onClick={() => setMode('consistent')}
        >
          Consistent answers
        </button>
        <button
          type="button"
          className={pass ? 'btn btn-ghost' : 'btn'}
          aria-pressed={!pass}
          onClick={() => setMode('drift')}
        >
          Drift
        </button>
      </div>
      <p className={`feedback ${pass ? 'ok' : 'err'}`} role="status">
        {pass ? 'Both answers match one low-degree line.' : 'Bob leaves the line, so the check fails.'}
      </p>
    </div>
  )
}
