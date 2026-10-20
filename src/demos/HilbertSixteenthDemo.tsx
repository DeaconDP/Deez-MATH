import { useState } from 'react'

const MIN_DEGREE = 2
const MAX_DEGREE = 8

/** Degree 5 draws the quintic Liénard cap of 2. Other degrees draw an unnumbered sketch. */
export function HilbertSixteenthDemo() {
  const [degree, setDegree] = useState(5)
  const quintic = degree === 5
  const loops = quintic ? [48, 86] : [40, 68, 96]

  return (
    <div className="demo">
      <h3 className="demo-title">Limit cycles by degree</h3>
      <p className="demo-hint">
        Step the degree. Degree 5 is the classical quintic Liénard toy, capped at two isolated
        cycles. Every other degree only claims some finite cap depending only on degree.
      </p>
      <svg
        viewBox="0 0 280 200"
        role="img"
        aria-label={
          quintic
            ? 'Two nested cycles for the quintic Liénard toy'
            : 'A few nested loops. The drawing is not the bound.'
        }
      >
        {loops.map((rx, i) => (
          <ellipse
            key={rx}
            cx="140"
            cy="100"
            rx={rx}
            ry={rx * 0.62}
            fill="none"
            stroke={i % 2 === 0 ? '#2ee6c5' : '#f0c95a'}
            strokeWidth="1.5"
          />
        ))}
        <circle cx="140" cy="100" r="3" fill="#e8f2ef" />
      </svg>
      <div className="controls">
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-ghost"
            aria-label="Lower degree"
            disabled={degree <= MIN_DEGREE}
            onClick={() => setDegree((d) => Math.max(MIN_DEGREE, d - 1))}
          >
            Lower
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            aria-label="Raise degree"
            disabled={degree >= MAX_DEGREE}
            onClick={() => setDegree((d) => Math.min(MAX_DEGREE, d + 1))}
          >
            Raise
          </button>
        </div>
      </div>
      <p className="stat" role="status">
        Degree {degree}.{' '}
        {quintic
          ? 'Quintic Liénard toy. At most 2 isolated cycles, and 2 is achieved.'
          : 'The claim is some finite cap depending only on degree. The loops above are not that number.'}
      </p>
    </div>
  )
}
