import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function squarefree(n: number) {
  for (let p = 2; p * p <= n; p++) {
    if (n % (p * p) === 0) return false
  }
  return true
}

function signedSquarefree(count: number) {
  const ds: number[] = []
  for (let a = 1; ds.length < count; a++) {
    if (!squarefree(a)) continue
    ds.push(a, -a)
  }
  return ds.slice(0, count)
}

function rankAt(i: number): 0 | 1 {
  if (i < 3) return 0
  if (i < 6) return 1
  return i % 2 === 0 ? 0 : 1
}

export function GoldfeldDemo() {
  const [count, setCount] = useState(12)
  const coins = useMemo(
    () => signedSquarefree(count).map((d, i) => ({ d, rank: rankAt(i) })),
    [count],
  )
  const zeros = coins.filter((coin) => coin.rank === 0).length
  const ones = count - zeros
  const mean = (ones / count).toFixed(2)

  return (
    <div className="demo">
      <h3 className="demo-title">Twist coins, half and half</h3>
      <p className="demo-hint">
        Toy illustration. Each coin is a signed squarefree twist, ordered by absolute value. A
        short row is lopsided. Grow it and the toy settles at half analytic rank 0 and half
        analytic rank 1.
      </p>
      <svg
        viewBox={`0 0 ${count * 36} 76`}
        role="img"
        aria-label={`Toy twists. Rank 0: ${zeros}. Rank 1: ${ones}. Mean analytic rank ${mean}.`}
      >
        {coins.map((coin, i) => (
          <g key={coin.d}>
            <circle cx={18 + i * 36} cy={20} r={14} fill={coin.rank === 0 ? 'var(--accent)' : 'var(--accent-2)'} />
            <text x={18 + i * 36} y={24} textAnchor="middle" fill="var(--bg)" fontSize="12" fontFamily="IBM Plex Mono">
              {coin.rank}
            </text>
            <text x={18 + i * 36} y={52} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="IBM Plex Mono">
              {coin.d}
            </text>
          </g>
        ))}
      </svg>
      <div className="controls">
        <DimSlider label="Twists shown" value={count} min={2} max={12} step={2} onChange={setCount} />
      </div>
      <p className="stat">
        Rank 0: {zeros}. Rank 1: {ones}. Mean analytic rank: {mean}.
      </p>
      <p className="demo-callout">
        The claim says a long list of twists, ordered this way, has density 1/2 at analytic rank
        0, density 1/2 at analytic rank 1, and mean analytic rank tending to 1/2.
      </p>
    </div>
  )
}
