import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function log2(n: number) {
  return Math.log(n) / Math.log(2)
}

export function Erdos728Demo() {
  const [n, setN] = useState(64)
  const [c1, setC1] = useState(1)
  const [c2, setC2] = useState(3)

  const gap = useMemo(() => {
    // place a synthetic gap inside (C1 log n, C2 log n)
    const lo = c1 * log2(n)
    const hi = c2 * log2(n)
    const gap = (lo + hi) / 2
    const a = Math.floor(n / 2)
    const b = Math.floor(n / 2 + gap)
    return { lo, hi, gap, a, b, sum: a + b }
  }, [n, c1, c2])

  return (
    <div className="demo">
      <h3 className="demo-title">Logarithmic factorial gap</h3>
      <p className="demo-hint">
        Erdős #728 asks for infinitely many factorial divisibilities with a+b−n stuck in a
        logarithmic window. Tune the window and watch a toy (a,b,n) sit inside it.
      </p>
      <div className="controls">
        <DimSlider label="n" value={n} min={16} max={256} onChange={setN} />
        <DimSlider
          label="C₁"
          value={c1}
          min={0.5}
          max={2.5}
          step={0.1}
          onChange={(v) => {
            setC1(v)
            if (v >= c2) setC2(v + 0.5)
          }}
          format={(v) => v.toFixed(1)}
        />
        <DimSlider
          label="C₂"
          value={c2}
          min={1}
          max={5}
          step={0.1}
          onChange={(v) => {
            setC2(v)
            if (v <= c1) setC1(Math.max(0.5, v - 0.5))
          }}
          format={(v) => v.toFixed(1)}
        />
      </div>
      <p className="stat">
        Window ({gap.lo.toFixed(1)}, {gap.hi.toFixed(1)}) · toy gap ≈ {gap.gap.toFixed(1)} · a≈
        {gap.a}, b≈{gap.b}
      </p>
      <p className={`feedback ok`} role="status">
        Target: a! b! | n! (a+b−n)! with gap = Θ(log n)
      </p>
      <p className="demo-callout">
        So what: the result is a template for AI → Lean pipelines as much as a number-theory
        theorem — autonomy and checkability matter.
      </p>
    </div>
  )
}
