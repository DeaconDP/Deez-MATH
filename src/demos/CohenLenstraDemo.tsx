import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'
import { ProbabilityMeter } from './shared/ProbabilityMeter'

export function CohenLenstraDemo() {
  const [p, setP] = useState(3)
  const [samples, setSamples] = useState(40)

  const { predicted, empirical } = useMemo(() => {
    // Toy Cohen–Lenstra flavor: ~ 1/p + 1/p²
    const predicted = Math.min(0.95, 1 / p + 1 / p ** 2)
    let hits = 0
    for (let i = 0; i < samples; i++) {
      const u = ((i * 17 + p * 13) % 1000) / 1000
      if (u < predicted) hits++
    }
    return { predicted, empirical: hits / samples }
  }, [p, samples])


  return (
    <div className="demo">
      <h3 className="demo-title">Average class-group odds</h3>
      <p className="demo-hint">
        Cohen–Lenstra heuristics predict how often class groups have certain p-parts. Compare the
        heuristic rate to a toy sampling bar — the 2026 work advances proofs of such averages.
      </p>
      <div className="controls">
        <DimSlider label="Odd prime p" value={p} min={3} max={19} step={2} onChange={setP} />
        <DimSlider label="Toy samples" value={samples} min={10} max={80} onChange={setSamples} />
      </div>
      <div className="controls">
        <ProbabilityMeter label="Heuristic P(p-part nontrivial)" value={predicted} />
        <ProbabilityMeter label="Toy empirical rate" value={empirical} />
      </div>
      <p className="demo-callout">
        So what: average class-group statistics tell you what a “random” number field looks like —
        useful mental model for computational number theory and crypto-adjacent arithmetic.
      </p>
    </div>
  )
}
