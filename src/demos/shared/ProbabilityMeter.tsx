type Props = {
  label: string
  value: number
}

export function ProbabilityMeter({ label, value }: Props) {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="pill-inline">{label}</span>
        <span className="stat">{pct.toFixed(2)}%</span>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
