import { useState } from 'react'

type Corank = 0 | 1

const CORANKS: readonly Corank[] = [0, 1]

const CLAIM: Record<Corank, string> = {
  0: 'Corank 0 is inside the claim. The curve is said to have only finitely many rational points. The related formula is nonzero at its special point, and that value is the leading term. The usual obstruction group is finite.',
  1: 'Corank 1 is inside the claim. The curve is said to have exactly one independent rational point of infinite order. The related formula vanishes at its special point, and the first nonzero term is the leading term. The usual obstruction group is finite.',
}

export function BsdLowCorankDemo() {
  const [corank, setCorank] = useState<Corank>(0)

  return (
    <div className="demo">
      <h3 className="demo-title">Leading term at corank 0 or 1</h3>
      <p className="demo-hint">
        Pick corank 0 or corank 1. In both cases the leading-term formula is the claim. Corank 2
        and higher stays open, and the problem for every elliptic curve stays open too.
      </p>
      <div className="btn-row">
        {CORANKS.map((value) => (
          <button
            key={value}
            type="button"
            className={value === corank ? 'btn' : 'btn btn-ghost'}
            aria-pressed={value === corank}
            aria-controls="bsd-corank-status"
            onClick={() => setCorank(value)}
          >
            Corank {value}
          </button>
        ))}
      </div>
      <p id="bsd-corank-status" className="stat" aria-live="polite">
        {CLAIM[corank]}
      </p>
      <p className="demo-callout">
        Corank 2 and higher is not on this control. The claim does not cover it.
      </p>
    </div>
  )
}
