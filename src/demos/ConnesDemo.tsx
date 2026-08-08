import { useState } from 'react'
import { DimSlider } from './shared/DimSlider'

const GROUPS = ['G₁', 'G₂', 'G₃', 'G₄', 'G₅', 'G₆']

export function ConnesDemo() {
  const [count, setCount] = useState(3)
  const [highlight, setHighlight] = useState(0)

  const visible = GROUPS.slice(0, count)

  return (
    <div className="demo">
      <h3 className="demo-title">Many groups, one algebra</h3>
      <p className="demo-hint">
        Connes rigidity hoped a property-(T) group is unique given its von Neumann algebra. Tap
        different groups — they all map to the same L(G) blob.
      </p>
      <svg viewBox="0 0 320 200" role="img" aria-label="Groups mapping into one algebra">
        <ellipse cx="230" cy="100" rx="70" ry="55" fill="#121a18" stroke="#2ee6c5" strokeWidth="2" />
        <text x="230" y="105" textAnchor="middle" fill="#2ee6c5" fontSize="14" fontFamily="IBM Plex Mono">
          L(G)
        </text>
        {visible.map((g, i) => {
          const y = 30 + i * (140 / Math.max(1, visible.length - 1 || 1))
          const active = i === highlight
          return (
            <g key={g}>
              <line
                x1={70}
                y1={y}
                x2={165}
                y2={100}
                stroke={active ? '#f0c95a' : '#24332e'}
                strokeWidth={active ? 2.5 : 1.2}
              />
              <circle
                cx={50}
                cy={y}
                r={16}
                fill={active ? '#f0c95a' : '#121a18'}
                stroke="#8aa39a"
                style={{ cursor: 'pointer' }}
                onClick={() => setHighlight(i)}
              />
              <text
                x={50}
                y={y + 4}
                textAnchor="middle"
                fill={active ? '#041210' : '#e8f2ef'}
                fontSize="11"
                fontFamily="IBM Plex Mono"
                style={{ pointerEvents: 'none' }}
              >
                {g}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="controls">
        <DimSlider label="Non-isomorphic groups" value={count} min={2} max={6} onChange={setCount} />
      </div>
      <div className="btn-row">
        {visible.map((g, i) => (
          <button
            key={g}
            type="button"
            className={i === highlight ? 'btn' : 'btn btn-ghost'}
            onClick={() => setHighlight(i)}
          >
            Select {g}
          </button>
        ))}
      </div>
      <p className="stat">
        Selected {visible[highlight]} → same algebra L(G). Groups stay non-isomorphic.
      </p>
      <p className="demo-callout">
        So what: in quantum information / classification, algebraic data alone may not recover a
        unique underlying group — finer invariants are needed.
      </p>
    </div>
  )
}
