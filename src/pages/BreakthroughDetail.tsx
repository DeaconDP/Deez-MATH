import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getBreakthrough, SERIES_LABELS } from '../data/breakthroughs'
import { DepthToggle } from '../components/DepthToggle'
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
      <p className="field-tag">
        #{b.importance} · {SERIES_LABELS[b.series]} · {b.when} · {b.field}
      </p>
      <h1 className="page-title">{b.title}</h1>
      <p className="page-sub">{b.glance}</p>

      <div className="btn-row">
        <a className="btn" href="#demo">
          Try the demo
        </a>
      </div>

      <section className="prose" aria-label="Plain explanation">
        <h2 className="h2">In plain words</h2>
        <p>{b.plain.what}</p>
        <h2 className="h2">Why it matters</h2>
        <p>{b.plain.whyItMatters}</p>
        <h2 className="h2">The claimed result</h2>
        <p>{b.plain.result}</p>
      </section>

      <DepthToggle />

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

      <section id="demo" aria-label="Application demo">
        <DemoFor id={b.demoId} />
      </section>

      <h2 className="h2">Applications</h2>
      <ul className="list">
        {b.applications.map((a) => (
          <li key={a.id}>
            <Link className="row" to={`/applications#${a.id}`}>
              <span className="row-num">→</span>
              <span>
                <span className="row-title">{a.title}</span>
                <span className="row-glance">{a.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <details>
        <summary className="back" style={{ cursor: 'pointer', listStyle: 'none' }}>
          Sources
        </summary>
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
