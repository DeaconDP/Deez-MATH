import { Link } from 'react-router-dom'
import { DepthToggle } from '../components/DepthToggle'
import { breakthroughs } from '../data/breakthroughs'

export function Home() {
  const landmarks = breakthroughs.filter((b) => b.series === 'landmark').length
  const astra = breakthroughs.filter((b) => b.series === 'astra').length

  return (
    <>
      <h1 className="hero-brand">Deez-MATH</h1>
      <p className="lede">
        Explore major 2026 math breakthroughs — plain language, deeper math, and demos that show why
        the ideas matter.
      </p>
      <p className="glance">
        {breakthroughs.length} advances · {landmarks} landmarks · {astra} Astra · ranked by importance
      </p>
      <div className="btn-row">
        <Link className="btn" to="/breakthroughs">
          Explore breakthroughs
        </Link>
        <Link className="btn btn-ghost" to="/applications">
          Browse applications
        </Link>
      </div>
      <DepthToggle />
      <p className="disclaimer">
        Mix of human Fields/number-theory work and AI-assisted claims (OpenAI Astra, Fable, GPT +
        Lean). Deez-MATH does not verify proofs. Peer review may still be pending — demos are
        intuition tools, not certificates.
      </p>
    </>
  )
}
