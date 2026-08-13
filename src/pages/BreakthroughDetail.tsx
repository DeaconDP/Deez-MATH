import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { DOMAIN_LABELS, getBreakthrough, SERIES_LABELS } from '../data/breakthroughs'
import { useDepth } from '../hooks/useDepth'
import { DemoFor } from '../demos'

export function BreakthroughDetail() {
  const { id } = useParams()
  const { hash } = useLocation()
  const b = id ? getBreakthrough(id) : undefined
  const { deep } = useDepth()

  useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, id])

  if (!b) return <Navigate to="/breakthroughs" replace />

  return (
    <>
      <Link className="back" to="/breakthroughs">
        ← All advances
      </Link>
      <h1 className="page-title">{b.title}</h1>
      <p className="page-sub">{b.glance}</p>
      <p className="field-tag">
        {SERIES_LABELS[b.series]} · {b.when} · {b.field}
      </p>
      <p className="discoverer-detail">
        Discovered:{' '}
        <span className={`discoverer discoverer--${b.discoveredBy.kind}`}>
          {b.discoveredBy.label}
        </span>
      </p>

      <section className="prose" aria-label="Plain explanation">
        <h2 className="h2">In plain words</h2>
        <p>{b.plain.what}</p>
        <h2 className="h2">Why it matters</h2>
        <p>{b.plain.whyItMatters}</p>
        <h2 className="h2">The claimed result</h2>
        <p>{b.plain.result}</p>
      </section>

      {deep ? (
        <section className="deep-panel" aria-label="Deeper mathematics">
          <div className="label">Formal flavor</div>
          <p>{b.deep.statement}</p>
          <ul>
            {b.deep.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <ul className="jargon">
            {b.deep.jargon.map((j) => (
              <li key={j.term}>
                <strong>{j.term}</strong> — {j.def}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="btn-row">
        <a className="btn" href="#demo">
          Try the demo
        </a>
      </div>

      <section id="demo" aria-label="Application demo">
        <DemoFor id={b.demoId} />
      </section>

      <section className="apps-section" aria-label="Applications">
        <h2 className="h2">Applications</h2>
        {b.applications.map((a) => (
          <article key={a.id} className="app-block" id={`app-${a.id}`}>
            <h3 className="app-block-title">{a.title}</h3>
            <p className="field-tag">{DOMAIN_LABELS[a.domain]}</p>
            <p className="app-block-detail">{a.detail}</p>
            <p className="app-block-commercial">
              <span className="app-commercial-label">Commercial angle</span>
              {a.commercial}
            </p>
            <Link className="app-block-link" to={`/applications#${a.id}`}>
              See in applications index
            </Link>
          </article>
        ))}
      </section>

      <details>
        <summary className="sources-summary">Sources</summary>
        <ul className="sources">
          {b.sources.map((s) => (
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
