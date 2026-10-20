import { useMemo, useState } from 'react'

const STOPS = [0, 1, 2, 4, 9, 19, 49, 99, 249, 499, 999]

function partial(last: number) {
  let sum = 0
  for (let n = 0; n <= last; n++) {
    const odd = 2 * n + 1
    sum += (n % 2 === 0 ? 1 : -1) / (odd * odd)
  }
  const nextOdd = 2 * last + 3
  const nextDen = nextOdd * nextOdd
  const tail = 1 / nextDen
  const nextSign = last % 2 === 0 ? -1 : 1
  const other = sum + nextSign * tail
  return { sum, nextDen, lo: Math.min(sum, other), hi: Math.max(sum, other) }
}

/** Six truncated places. Float matches the exact rational on every stop in STOPS. */
function trunc6(sum: number) {
  return (Math.trunc(sum * 1e6) / 1e6).toFixed(6)
}

function locked(lo: number, hi: number) {
  const whole = Math.floor(lo)
  if (whole !== Math.floor(hi)) return 'none yet'
  let frac = ''
  for (let place = 1; place <= 6; place++) {
    const scale = 10 ** place
    if (Math.floor(lo * scale) !== Math.floor(hi * scale)) break
    frac += String(Math.floor(lo * scale) % 10)
  }
  return frac ? `${whole}.${frac}` : String(whole)
}

export function CatalanConstantDemo() {
  const [step, setStep] = useState(0)
  const n = STOPS[step] ?? 0
  const view = useMemo(() => {
    const { sum, nextDen, lo, hi } = partial(n)
    return { partialText: trunc6(sum), lockedText: locked(lo, hi), nextDen }
  }, [n])

  return (
    <div className="demo">
      <h3 className="demo-title">Alternating odd squares</h3>
      <p className="demo-hint">
        Partial sums of (-1)^n / (2n+1)^2. Step n and watch the running total settle near 0.915.
        Settled digits are only those the next term cannot move.
      </p>
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
        >
          Fewer terms
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setStep((current) => Math.min(STOPS.length - 1, current + 1))}
          disabled={step === STOPS.length - 1}
        >
          More terms
        </button>
      </div>
      <p className="stat" role="status">
        n = {n}. Partial sum {view.partialText}. Settled digits {view.lockedText}. Next term has size
        1/{view.nextDen}.
      </p>
      <p className="demo-callout">
        So what: the running value is the definition of Catalan's constant. Irrationality is a claim
        about that limit. These digits are the partial sum, not a closed form.
      </p>
    </div>
  )
}
