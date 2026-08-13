import { Link } from 'react-router-dom'
import { breakthroughs } from '../data/breakthroughs'
import { openProblems } from '../data/openProblems'

export function Home() {
  return (
    <>
      <h1 className="hero-brand">Deez-MATH</h1>
      <p className="lede">
        Explore major 2026 math breakthroughs — easy explanations first, optional deeper math in the
        header, and demos that show why the ideas matter.
      </p>
      <p className="glance">
        {breakthroughs.length} advances · {openProblems.length} open problems · ranked by importance
      </p>
      <div className="btn-row">
        <Link className="btn" to="/breakthroughs">
          Explore breakthroughs
        </Link>
        <Link className="btn btn-ghost" to="/open-problems">
          Open problems
        </Link>
        <Link className="btn btn-ghost" to="/applications">
          Browse applications
        </Link>
      </div>
      <p className="disclaimer">
        Mix of human Fields/number-theory work and AI-assisted claims (OpenAI Astra, Fable, GPT +
        Lean). Deez-MATH does not verify proofs. Peer review may still be pending — demos are
        intuition tools, not certificates.
      </p>
    </>
  )
}
