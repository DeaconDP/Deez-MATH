import { Link } from 'react-router-dom'
import {
  openProblemsByPrize,
  openProblemsOther,
  type OpenProblem,
} from '../data/openProblems'

function ProblemRows({ items }: { items: OpenProblem[] }) {
  return (
    <ul className="list">
      {items.map((p) => (
        <li key={p.id}>
          <Link className="row" to={`/open-problems/${p.id}`}>
            <span className="row-num">{String(p.importance).padStart(2, '0')}</span>
            <span>
              <span className="row-field">{p.field}</span>
              <span className="row-title">{p.title}</span>
              <span className="row-glance">{p.glance}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function OpenProblemList() {
  const millennium = openProblemsByPrize('millennium')
  const other = openProblemsOther()

  return (
    <>
      <h1 className="page-title">Open problems</h1>
      <p className="page-sub">
        Still unsolved. Ranked by cultural importance — plain story first; turn on Go deeper in the
        header for formal math. No demos here.
      </p>
      <section className="domain-group" aria-labelledby="open-millennium">
        <h2 id="open-millennium">Millennium Prize</h2>
        <ProblemRows items={millennium} />
      </section>
      <section className="domain-group" aria-labelledby="open-other">
        <h2 id="open-other">Other famous opens</h2>
        <ProblemRows items={other} />
      </section>
    </>
  )
}
