import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'plane-five-colors',
  importance: 30,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'The Euclidean plane is not 5-colorable',
  field: 'Discrete geometry',
  glance:
    'Every 5-coloring of the plane is claimed to hide two points of the same color at distance 1. The chromatic number is still 6 or 7.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'The Hadwiger–Nelson problem asks how many colors paint the Euclidean plane so that no two points at distance exactly 1 share a color. On 6 Oct 2026 OpenAI published a claim from an internal frontier model that five colors are not enough. Every 5-coloring has a monochromatic pair at distance one. A classical 7-coloring of the plane is already known, so under this claim the chromatic number of the plane is 6 or 7.',
    whyItMatters:
      'This is the famous coloring problem for the plane. If the claim holds, five colors are gone and only the last two candidates remain. The problem is not finished, and the chromatic number is not a single known integer.',
    result:
      'Claim: every 5-coloring of the Euclidean plane has two points of the same color at distance 1. With the classical 7-coloring, only 6 and 7 remain possible.',
  },
  deep: {
    statement:
      'Every 5-coloring of the Euclidean plane admits a monochromatic pair at distance 1. Together with a 7-coloring of the plane, the chromatic number of the plane is 6 or 7. The claim does not decide which.',
    notes: [
      'Public writeup on 6 Oct 2026. The preprint path in openai/math is dated 23 Sep 2026.',
      'Formalization review for this catalog entry is unchecked. This app does not machine-check the argument.',
      'On 15 Oct 2026 OpenAI announced funding, managed by the Simons Foundation, for programs in which mathematicians examine AI-produced results, including this release. This catalog records no verdict from that examination.',
    ],
    jargon: [
      {
        term: 'Chromatic number of the plane',
        def: 'The smallest number of colors for the Euclidean plane so that distance 1 never joins two points of the same color.',
      },
      {
        term: 'Hadwiger–Nelson problem',
        def: 'The question of that chromatic number. A 7-coloring is classical. This claim would leave 6 and 7.',
      },
    ],
  },
  applications: [
    {
      id: 'plane-coloring',
      title: 'Coloring the plane',
      domain: 'geometry',
      blurb: 'Five colors are claimed to be too few for distance 1 in the plane.',
      detail:
        'Discrete geometers know a 7-coloring of the plane and study how few colors can still separate every unit pair. If every 5-coloring of the whole plane has a monochromatic unit pair, later work can spend its effort on whether six colors suffice. The number itself stays unresolved at 6 or 7 under the claim.',
      commercial:
        'No product ships from this claim. Survey articles and geometry software that quote the chromatic number of the plane would carry the status 6 or 7 while the claim stands.',
    },
    {
      id: 'unit-distance-conflicts',
      title: 'Unit-distance conflict graphs',
      domain: 'networks',
      blurb: 'A fixed range is an edge, and a coloring is a way to keep both ends different.',
      detail:
        'Points of the plane with an edge at distance 1 form an infinite conflict graph. The claim says that graph needs more than five colors. Finite networks that forbid one exact range, such as channels that clash at a set distance, can cite the infinite template when they argue about how many labels a large piece might need.',
      commercial:
        'Fixed-range radio and sensor planners already pay for finite graph-coloring solvers. This claim is a bound on the infinite template those finite graphs sample.',
    },
  ],
  demoId: 'plane-five-colors',
  sources: [
    {
      label: 'OpenAI, sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'openai/math',
      href: 'https://github.com/openai/math',
    },
    {
      label: 'Preprint PDF, 23 Sep 2026 path',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Euclidean-plane-is-not-five-colorable-September-23-2026/paper.pdf',
    },
  ],
}
