import { useState } from 'react'

const PAINTS = ['#2ee6c5', '#f0c95a', '#ff6b6b', '#7aa2ff', '#e28bff']

const NODES = [0, 1, 2, 3, 4, 5].map((i) => {
  const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
  return { x: 120 + Math.cos(angle) * 72, y: 108 + Math.sin(angle) * 72 }
})

function unitToyEdges(): [number, number][] {
  const list: [number, number][] = []
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) list.push([i, j])
  }
  return list
}

const EDGES = unitToyEdges()

export function PlaneFiveColorsDemo() {
  const [brush, setBrush] = useState(0)
  const [color, setColor] = useState([0, 1, 2, 3, 4, 0])

  const paint = (index: number) => {
    setColor((prev) => prev.map((c, i) => (i === index ? brush : c)))
  }

  const mono = EDGES.filter(([i, j]) => color[i] === color[j])

  return (
    <div className="demo">
      <h3 className="demo-title">Five paints on a toy hexagon</h3>
      <p className="demo-hint">
        Intuition, not the proof. Each segment stands in for distance 1. Six dots and five colors
        always put the same color on both ends of some segment.
      </p>
      <svg viewBox="0 0 240 216" role="img" aria-label="Toy hexagon with monochromatic segments marked">
        {EDGES.map(([i, j]) => {
          const bad = color[i] === color[j]
          return (
            <line
              key={`${i}-${j}`}
              x1={NODES[i].x}
              y1={NODES[i].y}
              x2={NODES[j].x}
              y2={NODES[j].y}
              stroke={bad ? '#ffb4b4' : '#2ee6c5'}
              strokeWidth={bad ? 3 : 1}
              opacity={bad ? 1 : 0.28}
            />
          )
        })}
        {NODES.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={13}
            fill={PAINTS[color[i]] ?? PAINTS[0]}
            stroke="#041210"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label={`Dot ${i + 1}, color ${color[i] + 1}. Press to paint with color ${brush + 1}.`}
            onClick={() => paint(i)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              paint(i)
            }}
          />
        ))}
      </svg>
      <div className="btn-row">
        {PAINTS.map((hex, i) => (
          <button
            key={hex}
            type="button"
            className={brush === i ? 'btn' : 'btn btn-ghost'}
            aria-pressed={brush === i}
            onClick={() => setBrush(i)}
          >
            <span
              aria-hidden="true"
              style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '999px',
                background: hex,
                marginRight: '0.4rem',
              }}
            />
            Color {i + 1}
          </button>
        ))}
      </div>
      <p className="stat" role="status">
        Monochromatic segments: {mono.length}. Five colors on six dots always leave at least one.
      </p>
      <p className="demo-callout">
        The whole plane is a different graph. Under the 2026 claim, 6 and 7 colors are still open. A
        classical 7-coloring shows seven suffice.
      </p>
    </div>
  )
}
