import { useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function formatCount(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}

export function MatrixMultDemo() {
  const [n, setN] = useState(4)
  const school = n ** 3
  const nineFourths = n ** (9 / 4)

  return (
    <div className="demo">
      <h3 className="demo-title">Toy counts, n^3 versus n^2.25</h3>
      <p className="demo-hint">
        Slide n from 2 to 8. Schoolbook multiplication of two n by n matrices uses n^3 arithmetic
        operations. 9/4 equals 2.25, so the headline exponent is the toy count n^2.25. These powers
        are a toy count, not a benchmark of a program.
      </p>
      <div className="controls">
        <DimSlider label="Matrix size n" value={n} min={2} max={8} onChange={setN} />
      </div>
      <p className="stat">Schoolbook n^3 = {formatCount(school)}</p>
      <p className="stat">Headline n^2.25 = {formatCount(nineFourths)}</p>
      <p className="stat">Toy ratio n^3 / n^2.25 = {(school / nineFourths).toFixed(2)}</p>
      <p className="demo-callout">
        The catalog claim is O(n^2.25+ε) over the complex numbers. The ε and the leading constant
        are absent from these toy powers.
      </p>
    </div>
  )
}
