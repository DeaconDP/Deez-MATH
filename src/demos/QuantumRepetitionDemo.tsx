import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'
import { ProbabilityMeter } from './shared/ProbabilityMeter'

export function QuantumRepetitionDemo() {
  const [baseWin, setBaseWin] = useState(0.72)
  const [rounds, setRounds] = useState(4)

  const { classicalStyle, exponential } = useMemo(() => {
    // Independent-ish classical: p^k
    const classicalStyle = baseWin ** rounds
    // Exponential parallel repetition narrative: roughly (1 - c(1-p))^k style compression
    const gap = 1 - baseWin
    const exponential = Math.exp(-1.4 * gap * rounds)
    return { classicalStyle, exponential }
  }, [baseWin, rounds])

  return (
    <div className="demo">
      <h3 className="demo-title">Parallel repetition decay</h3>
      <p className="demo-hint">
        A single quantum game may be winnable with entangled strategies. Require winning every copy —
        watch soundness collapse as rounds increase.
      </p>
      <div className="controls">
        <DimSlider
          label="Single-copy win rate"
          value={baseWin}
          min={0.5}
          max={0.95}
          step={0.01}
          onChange={setBaseWin}
          format={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <DimSlider label="Parallel copies" value={rounds} min={1} max={12} onChange={setRounds} />
      </div>
      <div className="controls">
        <ProbabilityMeter label="Naive product pᵏ" value={classicalStyle} />
        <ProbabilityMeter label="Exponential repetition story" value={exponential} />
      </div>
      <p className="demo-callout">
        So what: interactive proofs and device-independent protocols need soundness amplification.
        Exponential decay means few repetitions can crush a cheater’s win rate.
      </p>
    </div>
  )
}
