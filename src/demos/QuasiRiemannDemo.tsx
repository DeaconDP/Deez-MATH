import { useState } from 'react'

const LEFT = 36
const RIGHT = 292
const TOP = 24
const BOTTOM = 148

function xOf(re: number) {
  return LEFT + (RIGHT - LEFT) * re
}
export function QuasiRiemannDemo() {
  const [edge, setEdge] = useState(7 / 8)
  const boundary = xOf(edge)
  const critical = xOf(1 / 2)

  return (
    <div className="demo">
      <h3 className="demo-title">Zero-free half-plane</h3>
      <p className="demo-hint">
        The shaded region is where the claim says zeros are absent. The dashed line at 1/2 is still
        the open Riemann hypothesis.
      </p>
      <svg
        viewBox="0 0 320 172"
        role="img"
        aria-label="Critical strip from real part 0 to 1, dashed open line at one half, shaded zero-free region to the right of the boundary"
      >
        <rect
          x={LEFT}
          y={TOP}
          width={RIGHT - LEFT}
          height={BOTTOM - TOP}
          fill="#121a18"
          stroke="#8aa39a"
        />
        <rect
          x={boundary}
          y={TOP}
          width={RIGHT - boundary}
          height={BOTTOM - TOP}
          fill="#2ee6c5"
          opacity={0.35}
        />
        <line
          x1={critical}
          y1={TOP}
          x2={critical}
          y2={BOTTOM}
          stroke="#f0c95a"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <line x1={boundary} y1={TOP} x2={boundary} y2={BOTTOM} stroke="#2ee6c5" strokeWidth={2} />
        <text x={critical} y={18} textAnchor="middle" fill="#f0c95a" fontSize="11" fontFamily="IBM Plex Mono">1/2 open</text>
        <text x={RIGHT} y={18} textAnchor="end" fill="#2ee6c5" fontSize="11" fontFamily="IBM Plex Mono">zero-free</text>
        <text x={LEFT} y={166} fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">0</text>
        <text x={RIGHT - 8} y={166} fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">1</text>
      </svg>
      <div className="controls">
        <label>
          Zero-free boundary, real part <span className="stat">{edge.toFixed(3)}</span>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.001}
            value={edge}
            onChange={(event) => setEdge(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-ghost" onClick={() => setEdge(7 / 8)}>
          Main claim, 7/8
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setEdge(11 / 12)}>
          Companion, 11/12
        </button>
      </div>
      <p className="stat">Critical line fixed at 1/2. Boundary at real part {edge.toFixed(3)}.</p>
    </div>
  )
}
