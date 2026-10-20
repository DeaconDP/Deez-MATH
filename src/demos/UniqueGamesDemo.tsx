import { useState } from 'react'
import { DimSlider } from './shared/DimSlider'

const NODES = [
  { name: 'A', x: 64, y: 52, label: 0 },
  { name: 'B', x: 196, y: 52, label: 0 },
  { name: 'C', x: 196, y: 156, label: 0 },
  { name: 'D', x: 64, y: 156, label: 0 },
] as const

/** Closing edge flips. One partner label per edge, and the loop cannot be fully happy. */
const EDGES = [
  { a: 0, b: 1, shift: 0, lx: 130, ly: 36 },
  { a: 1, b: 2, shift: 0, lx: 222, ly: 108 },
  { a: 2, b: 3, shift: 0, lx: 130, ly: 178 },
  { a: 3, b: 0, shift: 1, lx: 28, ly: 108 },
] as const

const HAPPY = EDGES.map((e) => NODES[e.b].label === (NODES[e.a].label + e.shift) % 2)
const MET = HAPPY.filter(Boolean).length

export function UniqueGamesDemo() {
  const [demand, setDemand] = useState(3)
  const gap = demand > MET

  return (
    <div className="demo">
      <h3 className="demo-title">Almost-unique labels</h3>
      <p className="demo-hint">
        Each edge allows one partner label. This labeling satisfies three edges. Slide the demand
        to four and the same picture is a hard gap.
      </p>
      <svg
        viewBox="0 0 250 200"
        role="img"
        aria-label={
          gap
            ? 'Four nodes labeled 0. The flip constraint breaks, so demand 4 is impossible.'
            : 'Four nodes labeled 0. Three of four unique constraints hold.'
        }
      >
        {EDGES.map((e, i) => (
          <g key={e.a}>
            <line x1={NODES[e.a].x} y1={NODES[e.a].y} x2={NODES[e.b].x} y2={NODES[e.b].y} stroke={HAPPY[i] ? '#2ee6c5' : '#ff6b6b'} strokeWidth="2.2" />
            <text x={e.lx} y={e.ly} textAnchor="middle" fill={HAPPY[i] ? '#2ee6c5' : '#ff6b6b'} fontSize="11" fontFamily="IBM Plex Mono">
              {e.shift ? 'flip' : 'same'}
            </text>
          </g>
        ))}
        {NODES.map((n) => (
          <g key={n.name}>
            <circle cx={n.x} cy={n.y} r="18" fill="#121a18" stroke="#e8f2ef" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#e8f2ef" fontSize="11" fontFamily="IBM Plex Mono">
              {n.name} {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Constraints demanded" value={demand} min={1} max={4} onChange={setDemand} format={(v) => `${v} of 4`} />
      </div>
      <p className="stat" role="status">
        {gap
          ? 'Hard gap. No labeling satisfies 4 of 4. The best is 3.'
          : `Almost satisfied. 3 of 4 unique constraints hold, which meets a demand of ${demand}.`}
      </p>
    </div>
  )
}
