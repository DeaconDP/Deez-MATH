import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function det2(a: number[][]) {
  return a[0][0] * a[1][1] - a[0][1] * a[1][0]
}
function per2(a: number[][]) {
  return a[0][0] * a[1][1] + a[0][1] * a[1][0]
}

function circuitLower(n: number) {
  return n * n * Math.log2(Math.log2(n + 3) + 1)
}
function formulaLower(n: number) {
  return (n ** 4) / Math.log2(n + 1)
}

export function PermanentDemo() {
  const [n, setN] = useState(4)
  const [a, setA] = useState([
    [2, 3],
    [1, 4],
  ])

  const d = useMemo(() => det2(a), [a])
  const p = useMemo(() => per2(a), [a])

  function setEntry(i: number, j: number, v: number) {
    setA((prev) => {
      const next = prev.map((row) => [...row])
      next[i][j] = v
      return next
    })
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Determinant vs permanent</h3>
      <p className="demo-hint">
        Edit a 2×2 matrix. Determinant cancels with signs; permanent adds. Then scale n to see how
        claimed circuit / formula lower bounds grow.
      </p>
      <div className="controls">
        {[0, 1].map((i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[0, 1].map((j) => (
              <label key={j}>
                a[{i + 1},{j + 1}]
                <input
                  type="range"
                  min={0}
                  max={9}
                  value={a[i][j]}
                  onChange={(e) => setEntry(i, j, Number(e.target.value))}
                />
                <span className="stat">{a[i][j]}</span>
              </label>
            ))}
          </div>
        ))}
        <DimSlider label="Matrix size n (bound story)" value={n} min={2} max={20} onChange={setN} />
      </div>
      <p className="stat">
        det = {d} · per = {p}
      </p>
      <p className="stat">
        Toy circuit lower ~ Ω({circuitLower(n).toFixed(1)}) · formula lower ~ Ω(
        {formulaLower(n).toFixed(0)})
      </p>
      <p className="demo-callout">
        So what: stronger permanent lower bounds are evidence that certain counting problems resist
        tiny arithmetic circuits — useful when deciding where not to hunt for magical shortcuts.
      </p>
    </div>
  )
}
