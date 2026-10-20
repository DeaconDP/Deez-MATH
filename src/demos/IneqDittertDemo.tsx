import { useState } from 'react'

const DITTERT_DIMS = [4, 5] as const
type DittertDim = (typeof DITTERT_DIMS)[number]

export function IneqDittertDemo() {
  const [dim, setDim] = useState<DittertDim>(4)

  return (
    <div className="demo">
      <h3 className="demo-title">Certified Dittert cases</h3>
      <p className="demo-hint">
        The Lean-verified strengthenings of Dittert’s conjecture are the dimension 4 case and the
        dimension 5 case. Those two are the certified cases. Pick one to mark it.
      </p>
      <div className="btn-row" role="group" aria-label="Dittert dimension">
        {DITTERT_DIMS.map((n) => (
          <button
            key={n}
            type="button"
            className={n === dim ? 'btn' : 'btn btn-ghost'}
            aria-pressed={n === dim}
            onClick={() => setDim(n)}
          >
            Dimension {n}
          </button>
        ))}
      </div>
      <p className="stat" role="status">
        Dimension {dim} is one of the two certified Dittert strengthenings.
      </p>
      <p>
        <span className="lean-chip">Holens–Djokovic (4,4)</span>
      </p>
      <p className="demo-hint">
        The (4,4) certificate implies Merris’s conjecture in dimension 4.
      </p>
    </div>
  )
}
