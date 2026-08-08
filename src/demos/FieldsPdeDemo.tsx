import { useEffect, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

export function FieldsPdeDemo() {
  const [particles, setParticles] = useState(24)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60)
    return () => window.clearInterval(id)
  }, [])

  const pts = Array.from({ length: particles }, (_, i) => {
    const a = (i / particles) * Math.PI * 2 + tick * 0.03
    const r = 40 + 25 * Math.sin(tick * 0.05 + i)
    return { x: 130 + Math.cos(a) * r, y: 120 + Math.sin(a) * r * 0.7 }
  })

  return (
    <div className="demo">
      <h3 className="demo-title">Particles → kinetic continuum</h3>
      <p className="demo-hint">
        Deng’s work justifies kinetic PDEs from microscopic dynamics. Watch many particles smear
        toward a continuum blob — the spirit of Boltzmann / wave-kinetic derivations.
      </p>
      <svg viewBox="0 0 260 240" role="img" aria-label="Particles suggesting a kinetic continuum">
        <ellipse
          cx="130"
          cy="120"
          rx={50 + (tick % 20)}
          ry={35 + (tick % 12)}
          fill="color-mix(in srgb, #2ee6c5 12%, transparent)"
          stroke="#24332e"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={i % 2 ? '#f0c95a' : '#2ee6c5'} />
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Particles" value={particles} min={8} max={48} onChange={setParticles} />
      </div>
      <p className="demo-callout">
        So what: fluid and kinetic models used in physics gain rigorous bridges from particle
        systems — while Pardon’s symplectic side builds the geometry toolkit for curve counts.
      </p>
    </div>
  )
}
