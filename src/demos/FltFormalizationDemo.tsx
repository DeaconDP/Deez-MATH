import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

/** Toy view of autoformalization: obligations claimed over campaign days. */
export function FltFormalizationDemo() {
  const [days, setDays] = useState(11)
  const [agents, setAgents] = useState(24)

  const stats = useMemo(() => {
    const theorems = Math.round(29500 * (days / 11) * (0.85 + 0.15 * (agents / 24)))
    const linesM = ((13 * days) / 11).toFixed(1)
    const pct = Math.min(100, Math.round((days / 11) * 100))
    return { theorems, linesM, pct }
  }, [days, agents])

  return (
    <div className="demo">
      <h3 className="demo-title">Autoformalization campaign</h3>
      <p className="demo-hint">
        FLT’s Lean formalization was a multi-agent campaign with a theorem DAG. Stretch the timeline
        and agent count to see how a toy obligation counter scales toward the reported finish.
      </p>
      <div className="controls">
        <DimSlider label="Days" value={days} min={1} max={14} onChange={setDays} />
        <DimSlider label="Agents" value={agents} min={4} max={48} step={2} onChange={setAgents} />
      </div>
      <div
        className="stat"
        style={{
          height: 12,
          borderRadius: 4,
          background: 'color-mix(in srgb, var(--line) 80%, transparent)',
          overflow: 'hidden',
          marginBottom: '0.75rem',
        }}
        role="img"
        aria-label={`Campaign progress ${stats.pct} percent`}
      >
        <div
          style={{
            width: `${stats.pct}%`,
            height: '100%',
            background: 'var(--accent)',
            transition: 'width 180ms ease',
          }}
        />
      </div>
      <p className="stat">
        ~{stats.theorems.toLocaleString()} theorems · ~{stats.linesM}M Lean lines · {stats.pct}% of
        11-day mark
      </p>
      <p className={`feedback ${days >= 11 ? 'ok' : 'err'}`} role="status">
        {days >= 11
          ? 'Root obligation reads PROVED (toy) — still trust the kernel, not the progress bar.'
          : 'Campaign incomplete — open lemmas remain on the DAG.'}
      </p>
      <p className="demo-callout">
        So what: the news is verification at historic scale. The math is Wiles–Taylor; the leap is a
        checkable artifact built in days.
      </p>
    </div>
  )
}
