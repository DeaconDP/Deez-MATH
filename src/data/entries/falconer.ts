import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'falconer',
  importance: 32,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Falconer distance conjecture in every dimension',
  field: 'Geometric measure theory',
  glance:
    'For every dimension d ≥ 2, a compact set thicker than d/2 determines a positive-measure set of distances.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'Falconer asked when a compact set in Euclidean space must determine many distances. The claimed answer, for every dimension d ≥ 2, is a Hausdorff-dimension cutoff at d/2. Above that cutoff, the set of Euclidean distances has positive Lebesgue measure. OpenAI posted the argument in its public math catalog on 6 Oct 2026. This entry is the continuous Falconer problem. Catalog entry unit-distance counts exact length-1 pairs in a finite point set. Those questions stay separate, and this claim leaves the discrete count untouched.',
    whyItMatters:
      'A single cutoff in every dimension would settle a central conjecture about how large a set must be before its distances spread out. The discrete unit-distance problem already has its own catalog entry. This result does not replace that entry.',
    result:
      'For every integer d ≥ 2, every compact subset of ℝ^d with Hausdorff dimension greater than d/2 has a Euclidean distance set of positive Lebesgue measure.',
  },
  deep: {
    statement:
      'For every integer d ≥ 2 and every compact E ⊂ ℝ^d, if the Hausdorff dimension of E is greater than d/2, then the distance set {|x − y| : x, y ∈ E} has positive one-dimensional Lebesgue measure.',
    notes: [
      'OpenAI published the manuscript in the public math catalog on 6 Oct 2026. The preprint directory name is dated 23 September 2026.',
      'The catalog formalization review for this result is unchecked. This app does not machine-check the argument.',
      'On 15 Oct 2026 OpenAI announced a Simons Foundation initiative, with $5 million in funding, so mathematicians can examine results from that release. The announcement states no verdict on this manuscript.',
      'Catalog entry unit-distance counts pairs at distance exactly 1 among finitely many planar points. A positive-measure distance set for a compact set answers a different question.',
    ],
    jargon: [
      {
        term: 'Hausdorff dimension',
        def: 'A scale-sensitive size that can fall between integers, used for sets that may be fractal.',
      },
      {
        term: 'Distance set',
        def: 'The set of all Euclidean distances realized by pairs of points in the set.',
      },
      {
        term: 'Lebesgue measure',
        def: 'Ordinary length on the line. Positive measure means the distances are not confined to a zero-length set.',
      },
    ],
  },
  applications: [
    {
      id: 'distance-threshold',
      title: 'When a shape determines many lengths',
      domain: 'geometry',
      blurb: 'Hausdorff dimension above d/2 forces the distance set to have positive length.',
      detail:
        'Geometric measure theory asks how large a compact set must be before the lengths it realizes stop being sparse. The claimed cutoff is half the ambient dimension, in every dimension d ≥ 2. A compact set above that line must carry a positive-measure set of Euclidean distances. The manuscript states the threshold. It does not hand over a dimension estimator.',
      commercial:
        'Imaging and materials tools already estimate fractal dimension of scans and microstructures. Those estimates can be compared with the cutoff d/2. The paper itself is not a product feature.',
    },
    {
      id: 'analysis-distance-sets',
      title: 'Distance sets in analysis',
      domain: 'analysis',
      blurb: 'One Hausdorff-dimension test for a large distance set, in every dimension.',
      detail:
        'Harmonic analysis often needs a set to determine a large collection of distances. The claim gives one test, half the ambient dimension, for every d ≥ 2. Anyone quoting it still has to accept an argument this app does not check.',
      commercial:
        'No product runs the proof. The nearest commercial edge is scientific software whose geometric guarantees quote distance-set theorems.',
    },
  ],
  demoId: 'falconer',
  sources: [
    {
      label: 'OpenAI, Sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'openai/math catalog',
      href: 'https://github.com/openai/math',
    },
    {
      label: 'Falconer distance conjecture preprint',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Falconer-distance-conjecture-in-all-dimensions-September-23-2026/paper.pdf',
    },
  ],
}
