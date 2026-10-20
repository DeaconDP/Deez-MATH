import { useState } from 'react'
import { Toggle } from '../components/Toggle'

const toys = {
  short: {
    nums: [2, 4, 5, 8, 11],
    ap: [2, 5, 8],
  },
  odds: {
    nums: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
    ap: [5, 11, 17],
  },
} as const

type ToyId = keyof typeof toys

function reciprocalSum(nums: readonly number[]) {
  return nums.reduce((sum, n) => sum + 1 / n, 0)
}

/** Intuition toy: a 3-term progression, and a larger reciprocal sum on the odds. */
export function ErdosReciprocalDemo() {
  const [toyId, setToyId] = useState<ToyId>('short')
  const toy = toys[toyId]
  const sum = reciprocalSum(toy.nums)
  const shortSum = reciprocalSum(toys.short.nums)

  return (
    <div className="demo">
      <h3 className="demo-title">Intuition</h3>
      <p className="demo-hint">
        A short set still contains a 3-term progression. Switch on the primes-or-odds toy, drawn
        here as the first odds, and the reciprocal sum grows. This picture does not check the
        proof.
      </p>
      <Toggle
        id="erdos-reciprocal-toy"
        checked={toyId === 'odds'}
        onChange={(on) => setToyId(on ? 'odds' : 'short')}
        label="Primes-or-odds toy"
        hint="Odds stand in for a set whose reciprocals pile up."
      />
      <p className="stat">
        {toy.nums.map((n) => {
          const inAp = toy.ap.some((term) => term === n)
          return (
            <span
              key={n}
              style={{ color: inAp ? '#f0c95a' : '#e8f2ef', marginRight: '0.65rem' }}
            >
              {n}
            </span>
          )
        })}
      </p>
      <p className="stat" role="status">
        Reciprocal sum is {sum.toFixed(3)}
        {toyId === 'odds' ? `, above the short set at ${shortSum.toFixed(3)}` : ''}.
      </p>
      <p className="feedback ok">
        The terms {toy.ap.join(', ')} form a 3-term progression.
      </p>
    </div>
  )
}
