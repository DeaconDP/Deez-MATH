import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/** Toy reciprocal-log weight of a primitive set above x. */
export function Erdos1196Demo() {
  const [logX, setLogX] = useState(4)
  const [terms, setTerms] = useState(6)

  const sum = useMemo(() => {
    const x = Math.exp(logX)
    // pretend first `terms` primes-ish above x contribute 1/(a log a)
    let s = 0
    let a = Math.ceil(x)
    for (let i = 0; i < terms; i++) {
      const la = Math.log(Math.max(a, 3))
      s += 1 / (a * la)
      a = Math.ceil(a * 1.35) + 1
    }
    const cap = 1 + 0.2 / logX
    return { s, cap, x }
  }, [logX, terms])

  const ok = sum.s <= sum.cap + 1e-9

  return (
    <div className="demo">
      <h3 className="demo-title">Primitive-set weight above x</h3>
      <p className="demo-hint">
        Erdős #1196 bounds ∑ 1/(a log a) for primitive sets supported on [x, ∞). Grow x and the
        number of toy terms; watch the sum sit under 1 + O(1/log x).
      </p>
      <div className="controls">
        <DimSlider
          label="log x"
          value={logX}
          min={2}
          max={8}
          step={0.1}
          onChange={setLogX}
          format={(v) => v.toFixed(1)}
        />
        <DimSlider label="Toy terms" value={terms} min={2} max={12} onChange={setTerms} />
      </div>
      <p className="stat">
        x≈{sum.x.toFixed(0)} · sum≈{sum.s.toFixed(3)} · cap≈{sum.cap.toFixed(3)}
      </p>
      <p className={`feedback ${ok ? 'ok' : 'err'}`} role="status">
        {ok ? 'Toy sum respects 1 + O(1/log x).' : 'Toy sum exceeds the schematic cap — add larger x.'}
      </p>
      <p className="demo-callout">
        So what: a 1960s Erdős–Sárközy–Szemerédi question now has an AI-drafted, human-digested,
        Lean-checked answer.
      </p>
    </div>
  )
}
