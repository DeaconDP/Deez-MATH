import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/** Toy non-injective map spirit: collapse three inputs toward one output. */
export function JacobianDemo() {
  const [spread, setSpread] = useState(1)
  const inputs = useMemo(
    () => [
      { x: 40, y: 40, label: 'p₁' },
      { x: 40, y: 160, label: 'p₂' },
      { x: 40, y: 100, label: 'p₃' },
    ],
    [],
  )
  const out = { x: 220, y: 100 }
  const mid = inputs.map((p, i) => ({
    x: p.x + (out.x - p.x) * (0.55 + 0.15 * spread),
    y: p.y + (out.y - p.y) * (0.55 + 0.1 * ((i % 3) - 1) * (2 - spread)),
  }))

  return (
    <div className="demo">
      <h3 className="demo-title">Non-injective Keller map</h3>
      <p className="demo-hint">
        The counterexample has constant Jacobian (locally invertible flavor) but three distinct
        inputs share one output — so no global inverse. Drag collapse to see the collision.
      </p>
      <svg viewBox="0 0 280 200" role="img" aria-label="Three inputs mapping to one output">
        {inputs.map((p, i) => (
          <g key={p.label}>
            <line
              x1={p.x}
              y1={p.y}
              x2={mid[i].x}
              y2={mid[i].y}
              stroke="#2ee6c5"
              strokeWidth="1.5"
              opacity={0.7}
            />
            <line
              x1={mid[i].x}
              y1={mid[i].y}
              x2={out.x}
              y2={out.y}
              stroke="#f0c95a"
              strokeWidth="1.5"
              opacity={0.85}
            />
            <circle cx={p.x} cy={p.y} r={8} fill="#121a18" stroke="#e8f2ef" />
            <text x={p.x - 18} y={p.y + 4} fill="#8aa39a" fontSize="11" fontFamily="IBM Plex Mono">
              {p.label}
            </text>
          </g>
        ))}
        <circle cx={out.x} cy={out.y} r={10} fill="#f0c95a" />
        <text x={out.x + 14} y={out.y + 4} fill="#f0c95a" fontSize="11" fontFamily="IBM Plex Mono">
          F(p)=q
        </text>
        <text x={100} y={24} fill="#2ee6c5" fontSize="11" fontFamily="IBM Plex Mono">
          det Jac ≈ const ≠ 0
        </text>
      </svg>
      <div className="controls">
        <DimSlider
          label="Collapse"
          value={spread}
          min={0.2}
          max={1.8}
          step={0.05}
          onChange={setSpread}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <p className="stat">Local invertibility ≠ global polynomial inverse when fibers collide.</p>
      <p className="demo-callout">
        So what: in dimensions ≥ 3, constant Jacobian no longer guarantees a polynomial inverse —
        computer-algebra and affine geometry must treat that hope as false.
      </p>
    </div>
  )
}
