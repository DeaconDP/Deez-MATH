export type AppDomain =
  | 'crypto'
  | 'coding'
  | 'quantum'
  | 'networks'
  | 'optimization'
  | 'foundations'
  | 'complexity'
  | 'geometry'
  | 'number-theory'
  | 'analysis'

export type Series = 'landmark' | 'astra'

export type Application = {
  id: string
  title: string
  domain: AppDomain
  blurb: string
}

export type Breakthrough = {
  id: string
  /** Display rank by importance (1 = highest). */
  importance: number
  title: string
  field: string
  series: Series
  when: string
  glance: string
  plain: {
    what: string
    whyItMatters: string
    result: string
  }
  deep: {
    statement: string
    notes: string[]
    jargon: { term: string; def: string }[]
  }
  applications: Application[]
  demoId: string
  sources: { label: string; href: string }[]
}

export const DOMAIN_LABELS: Record<AppDomain, string> = {
  crypto: 'Cryptography',
  coding: 'Coding & storage',
  quantum: 'Quantum',
  networks: 'Networks & graphs',
  optimization: 'Optimization',
  foundations: 'Foundations',
  complexity: 'Complexity',
  geometry: 'Geometry',
  'number-theory': 'Number theory',
  analysis: 'Analysis & PDE',
}

export const SERIES_LABELS: Record<Series, string> = {
  landmark: '2026 landmark',
  astra: 'OpenAI Astra',
}
