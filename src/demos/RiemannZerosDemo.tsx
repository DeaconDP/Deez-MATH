import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'
import { ProbabilityMeter } from './shared/ProbabilityMeter'

/** Fraction of zeros forced onto the critical line (toy meter). */
export function RiemannZerosDemo() {
  const [window, setWindow] = useState(1)
  const frac = useMemo(() => {
    // window 0 → classical ~0.417 toy, window 1 → ~0.6725 Montgomery–Taylor
    const base = 0.417
    const best = 0.6725
    return base + (best - base) * window
  }, [window])
  const distinct = useMemo(() => 0.5 * (1 + frac), [frac])

  return (
    <div className="demo">
      <h3 className="demo-title">Zeros on the critical line</h3>
      <p className="demo-hint">
        RH says 100% of nontrivial zeros sit on the line. Unconditional theorems only pin a
        fraction. Sweep the analytic window toward the 2026 bound.
      </p>
      <div className="controls">
        <DimSlider
          label="Window strength"
          value={window}
          min={0}
          max={1}
          step={0.01}
          onChange={setWindow}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <ProbabilityMeter value={frac} label="Simple & on the line (toy)" />
      <p className="stat">
        Distinct zeros (toy) ≥ {(distinct * 100).toFixed(1)}% · RH still asks for 100%
      </p>
      <p className={`feedback ${frac >= 0.66 ? 'ok' : 'err'}`} role="status">
        {frac >= 0.66
          ? 'Past the two-thirds mark — strongest unconditional scoreboard to date (toy).'
          : 'Below two-thirds — older unconditional territory.'}
      </p>
      <p className="demo-callout">
        So what: a measurable chunk of RH is now theorem, not conjecture — the full line remains
        open.
      </p>
    </div>
  )
}
