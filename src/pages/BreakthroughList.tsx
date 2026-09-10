import { Link } from 'react-router-dom'
import { breakthroughs } from '../data/breakthroughs'

export function BreakthroughList() {
  return (
    <>
      <h1 className="page-title">2026 breakthroughs</h1>
      <p className="page-sub">Ranked by importance. Tap for the plain story and a demo.</p>
      <ul className="list">
        {breakthroughs.map((b) => (
          <li key={b.id}>
            <Link className="row" to={`/breakthroughs/${b.id}`}>
              <span className="row-num">{String(b.importance).padStart(2, '0')}</span>
              <span>
                <span className="row-title">{b.title}</span>
                <span className={`discoverer discoverer--${b.discoveredBy.kind}`}>
                  {b.discoveredBy.label}
                </span>
                {b.lean ? <span className="lean-chip">Lean</span> : null}
                <span className="row-glance">{b.glance}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
