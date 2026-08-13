import { Link, Navigate, useParams } from 'react-router-dom'
import { getOpenProblem } from '../data/openProblems'
import { getBreakthrough } from '../data/breakthroughs'
import { useDepth } from '../hooks/useDepth'

export function OpenProblemDetail() {
  const { id } = useParams()
  const p = id ? getOpenProblem(id) : undefined
  const { deep } = useDepth()
  const related = p?.relatedBreakthroughId
    ? getBreakthrough(p.relatedBreakthroughId)
    : undefined

  if (!p) return <Navigate to="/open-problems" replace />

  return (
    <>
      <Link className="back" to="/open-problems">
        ← All open problems
      </Link>
      <p className="field-tag">
        #{p.importance} · {p.field}
        {p.prize === 'millennium' ? ' · Millennium Prize' : ''}
      </p>
      <h1 className="page-title">{p.title}</h1>
      <p className="page-sub">{p.glance}</p>

      <section className="prose" aria-label="Plain explanation">
        <h2 className="h2">In plain words</h2>
        <p>{p.plain.what}</p>
        <h2 className="h2">Why it matters</h2>
        <p>{p.plain.whyItMatters}</p>
        <h2 className="h2">Status</h2>
        <p>{p.plain.status}</p>
      </section>

      {deep ? (
        <section className="deep-panel" aria-label="Deeper mathematics">
          <div className="label">Formal flavor</div>
          <p>{p.deep.statement}</p>
          <ul>
            {p.deep.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <ul className="jargon">
            {p.deep.jargon.map((j) => (
              <li key={j.term}>
                <strong>{j.term}</strong> — {j.def}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related ? (
        <section aria-label="Related breakthrough">
          <h2 className="h2">Related breakthrough</h2>
          <ul className="list">
            <li>
              <Link className="row" to={`/breakthroughs/${related.id}`}>
                <span className="row-num">→</span>
                <span>
                  <span className="row-title">{related.title}</span>
                  <span className="row-glance">{related.glance}</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      <details>
        <summary className="back" style={{ cursor: 'pointer', listStyle: 'none' }}>
          Sources
        </summary>
        <ul className="sources">
          {p.sources.map((s) => (
            <li key={s.href}>
              <a href={s.href} rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  )
}
