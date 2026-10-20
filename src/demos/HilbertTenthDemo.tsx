import { useState } from 'react'

const EXAMPLES = [
  {
    id: 'has-root',
    label: '2x - 1',
    equation: '2x - 1 = 0',
    tone: 'ok',
    verdict: 'This one does. x = 1/2 is a rational root.',
  },
  {
    id: 'no-root',
    label: 'x² + 1',
    equation: 'x² + 1 = 0',
    tone: 'err',
    verdict: 'This one does not. x² + 1 is at least 1 for every real x.',
  },
] as const

export function HilbertTenthDemo() {
  const [index, setIndex] = useState(0)
  const [asked, setAsked] = useState(false)
  const example = EXAMPLES[index]

  return (
    <div className="demo">
      <h3 className="demo-title">Rational root?</h3>
      <p className="demo-hint">
        Two integer polynomials. One obviously has a rational root, and one obviously does not.
        A uniform algorithm would have to answer the same question for every integer polynomial
        in any number of variables.
      </p>
      <div className="btn-row" role="group" aria-label="Example polynomial">
        {EXAMPLES.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={i === index ? 'btn' : 'btn btn-ghost'}
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i)
              setAsked(false)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="stat">{example.equation}</p>
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => setAsked(true)}>
          Rational root?
        </button>
      </div>
      {asked ? (
        <>
          <p className={`feedback ${example.tone}`}>{example.verdict}</p>
          <p className="demo-callout" role="status">
            No general procedure is claimed to exist. These two cases are easy, which is why one
            procedure for every integer polynomial would be valuable.
          </p>
        </>
      ) : null}
    </div>
  )
}
