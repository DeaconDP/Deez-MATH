import { useState } from 'react'

const ORDER = ['simplex', 'rounder'] as const
type Kind = (typeof ORDER)[number]

const TOYS: Record<Kind, { label: string; points: string; intuition: number }> = {
  simplex: {
    label: 'Simplex',
    points: '110,22 28,142 192,142',
    intuition: 36,
  },
  rounder: {
    label: 'Rounder body',
    points: '168,84 139,134 81,134 52,84 81,34 139,34',
    intuition: 72,
  },
}

export function MahlerDemo() {
  const [kind, setKind] = useState<Kind>('simplex')
  const toy = TOYS[kind]

  return (
    <div className="demo">
      <h3 className="demo-title">Volume times polar volume</h3>
      <p className="demo-hint">
        Intuition, not a computed Mahler volume. In this nonsymmetric toy the simplex keeps the
        shorter bar. A rounder body reads taller.
      </p>
      <div className="btn-row" role="group" aria-label="Toy convex body">
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={id === kind ? 'btn' : 'btn btn-ghost'}
            aria-pressed={id === kind}
            onClick={() => setKind(id)}
          >
            {TOYS[id].label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 220 160" role="img" aria-label={toy.label}>
        <polygon
          points={toy.points}
          fill="color-mix(in srgb, #2ee6c5 18%, transparent)"
          stroke="#2ee6c5"
          strokeWidth="2"
        />
      </svg>
      <p className="stat">volume × polar volume, intuition only</p>
      <div
        className="meter"
        role="img"
        aria-label={`${toy.label} intuition bar. Shortest for the simplex.`}
      >
        <span style={{ width: `${toy.intuition}%` }} />
      </div>
      <p className="demo-callout">
        So what: the general Mahler claim says simplices minimize volume times polar volume. This
        bar only sketches that ordering.
      </p>
    </div>
  )
}
