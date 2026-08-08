import { Link } from 'react-router-dom'
import { breakthroughs, SERIES_LABELS, type Series } from '../data/breakthroughs'

const ORDER: Series[] = ['landmark', 'astra']

export function BreakthroughList() {
  return (
    <>
      <h1 className="page-title">2026 breakthroughs</h1>
      <p className="page-sub">
        Ranked by importance. Tap one for the plain story, Go deeper, and a demo.
      </p>
      {ORDER.map((series) => {
        const items = breakthroughs.filter((b) => b.series === series)
        return (
          <section key={series} className="domain-group" aria-labelledby={`series-${series}`}>
            <h2 id={`series-${series}`}>{SERIES_LABELS[series]}</h2>
            <ul className="list">
              {items.map((b) => (
                <li key={b.id}>
                  <Link className="row" to={`/breakthroughs/${b.id}`}>
                    <span className="row-num">{String(b.importance).padStart(2, '0')}</span>
                    <span>
                      <span className="row-field">
                        {b.when} · {b.field}
                      </span>
                      <span className="row-title">{b.title}</span>
                      <span className="row-glance">{b.glance}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
