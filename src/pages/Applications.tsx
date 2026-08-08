import { Link } from 'react-router-dom'
import { allApplications, DOMAIN_LABELS, type AppDomain } from '../data/breakthroughs'

const ORDER: AppDomain[] = [
  'geometry',
  'number-theory',
  'analysis',
  'crypto',
  'coding',
  'quantum',
  'networks',
  'optimization',
  'complexity',
  'foundations',
]

export function Applications() {
  const apps = allApplications()
  return (
    <>
      <h1 className="page-title">Applications</h1>
      <p className="page-sub">Where each breakthrough’s ideas show up — jump into the matching demo.</p>
      {ORDER.map((domain) => {
        const items = apps.filter((a) => a.domain === domain)
        if (!items.length) return null
        return (
          <section key={domain} className="domain-group" aria-labelledby={`dom-${domain}`}>
            <h2 id={`dom-${domain}`}>{DOMAIN_LABELS[domain]}</h2>
            <ul className="list">
              {items.map((a) => (
                <li key={a.id} id={a.id}>
                  <Link className="row" to={`/breakthroughs/${a.breakthroughId}#demo`}>
                    <span className="row-num">›</span>
                    <span>
                      <span className="row-field">{a.breakthroughTitle}</span>
                      <span className="row-title">{a.title}</span>
                      <span className="row-glance">{a.blurb}</span>
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
