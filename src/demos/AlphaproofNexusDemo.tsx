import { useState } from 'react'
import { DimSlider } from './shared/DimSlider'
import { ProbabilityMeter } from './shared/ProbabilityMeter'

const METERS = [
  { key: 'erdos', label: 'Erdős solved', of: 353, reported: 9 },
  { key: 'oeis', label: 'OEIS proved', of: 492, reported: 44 },
] as const

type MeterKey = (typeof METERS)[number]['key']

export function AlphaproofNexusDemo() {
  const [counts, setCounts] = useState<Record<MeterKey, number>>({ erdos: 9, oeis: 44 })
  const [tier, setTier] = useState(1)

  return (
    <div className="demo">
      <h3 className="demo-title">Reported hit rate</h3>
      <p className="demo-hint">
        Scrub the published counts. The bars show how often the batch hit. This is not a live
        solver, and this app does not re-check the Lean. The cost slider right stop is the
        full-featured agent. Its marker reads a few hundred dollars. The left stop is the basic
        agent, higher cost on the harder Erdős problems.
      </p>
      <div className="controls">
        {METERS.map((meter) => (
          <DimSlider
            key={meter.key}
            label={meter.label}
            value={counts[meter.key]}
            min={0}
            max={meter.reported}
            onChange={(value) => setCounts((prev) => ({ ...prev, [meter.key]: value }))}
            format={(value) => `${value} / ${meter.of}`}
          />
        ))}
        <DimSlider
          label="Cost"
          value={tier}
          min={0}
          max={1}
          onChange={setTier}
          format={(value) => (value >= 1 ? 'a few hundred dollars' : 'higher on the harder ones')}
        />
      </div>
      {METERS.map((meter) => (
        <ProbabilityMeter
          key={meter.key}
          label={`${meter.label}, paper reports ${meter.reported} / ${meter.of}`}
          value={counts[meter.key] / meter.of}
        />
      ))}
      <p className="stat">
        {tier >= 1
          ? 'Full-featured AlphaProof Nexus. Cost marker, a few hundred dollars per problem.'
          : 'Basic agent. Same 9 Erdős problems, higher cost on the harder ones.'}
      </p>
      <p className="demo-callout">
        Most attempts stayed open. The solves that landed are the news. The Lean proofs sit in
        the DeepMind repository. This app does not re-check them.
      </p>
    </div>
  )
}
