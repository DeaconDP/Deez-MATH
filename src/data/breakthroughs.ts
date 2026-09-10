import { astraBreakthroughs } from './astraTen'
import { landmarkBreakthroughs } from './landmarks'
import type { Breakthrough } from './types'

export type {
  AppDomain,
  Application,
  Breakthrough,
  DiscovererKind,
  LeanCertificate,
  Series,
} from './types'
export { DOMAIN_LABELS, SERIES_LABELS } from './types'

/** All breakthroughs, sorted by importance (1 = highest). */
export const breakthroughs: Breakthrough[] = [
  ...landmarkBreakthroughs,
  ...astraBreakthroughs,
].sort((a, b) => a.importance - b.importance)

export function getBreakthrough(id: string): Breakthrough | undefined {
  return breakthroughs.find((b) => b.id === id)
}

export function breakthroughsBySeries(series: Breakthrough['series']): Breakthrough[] {
  return breakthroughs.filter((b) => b.series === series)
}

export function allApplications(): (import('./types').Application & {
  breakthroughId: string
  breakthroughTitle: string
})[] {
  return breakthroughs.flatMap((b) =>
    b.applications.map((a) => ({
      ...a,
      breakthroughId: b.id,
      breakthroughTitle: b.title,
    })),
  )
}
