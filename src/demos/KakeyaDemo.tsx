import { useEffect, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

export function KakeyaDemo() {
  const [dirs, setDirs] = useState(12)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 80)
    return () => window.clearInterval(id)
  }, [])

  const cx = 130
  const cy = 120
  const len = 70

  return (
    <div className="demo">
      <h3 className="demo-title">Needle in every direction</h3>
      <p className="demo-hint">
        A Kakeya set contains a unit segment in every direction. Watch segments cover directions —
        the 3D question is how thin such a set can be (Wang’s Fields work).
      </p>
      <svg viewBox="0 0 260 240" role="img" aria-label="Rotating unit segments in many directions">
        {Array.from({ length: dirs }, (_, i) => {
          const a = (i / dirs) * Math.PI + (tick % 200) * 0.002
          const x1 = cx - Math.cos(a) * len
          const y1 = cy - Math.sin(a) * len
          const x2 = cx + Math.cos(a) * len
          const y2 = cy + Math.sin(a) * len
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? '#2ee6c5' : '#f0c95a'}
              strokeWidth="2"
              opacity={0.55}
            />
          )
        })}
        <circle cx={cx} cy={cy} r={3} fill="#e8f2ef" />
      </svg>
      <div className="controls">
        <DimSlider label="Directions" value={dirs} min={4} max={24} onChange={setDirs} />
      </div>
      <p className="demo-callout">
        So what: harmonic analysis needs sharp control on sets that are “direction-complete” yet
        possibly tiny — feeding PDE estimates and geometric measure theory.
      </p>
    </div>
  )
}
