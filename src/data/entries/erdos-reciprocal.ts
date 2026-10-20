import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'erdos-reciprocal',
  importance: 31,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Erdős reciprocal-sum conjecture and quasipolynomial Szemerédi bounds',
  field: 'Combinatorial number theory',
  glance:
    'A divergent sum of reciprocals forces arithmetic progressions of every finite length, with a quasipolynomial cap on progression-free sets.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'Erdős asked whether every set of positive integers whose reciprocals sum to infinity must contain an arithmetic progression of every finite length. The Szemerédi theorem already forces those progressions from positive density. A divergent reciprocal sum is a weaker size condition than positive density, and it still includes thin sets such as the primes. On 6 Oct 2026 OpenAI published a manuscript in its public math catalog, produced with an internal frontier model, presenting a proof of the conjecture and a quasipolynomial upper bound on progression-free subsets of {1, …, N}.',
    whyItMatters:
      'The qualitative statement is a classical Erdős conjecture in additive combinatorics. The bound limits how large a subset of {1, …, N} can be when it avoids a fixed progression length. This entry is not Erdős problem 728, 1196, 146, 180, or 183.',
    result:
      'Every set of positive integers with a divergent reciprocal sum contains arithmetic progressions of every finite length. For each fixed k ≥ 3, a subset of {1, …, N} with no nonconstant k-term progression has size at most C N exp[−c (log N)^c], with positive constants that depend only on k.',
  },
  deep: {
    statement:
      'If A is a set of positive integers and the sum of 1/a over a in A diverges, then A contains a nonconstant arithmetic progression of every finite length. Quantitatively, for each fixed integer k ≥ 3, the largest subset of {1, …, N} with no nonconstant k-term progression has size at most C N exp[−c (log N)^c], where the positive constants depend only on k. The overview writes the exponential factor as exp[−c (log N)^c].',
    notes: [
      'Public on 6 Oct 2026 in the OpenAI math catalog. The preprint file is Quasipolynomial Bounds for Arithmetic Progressions, dated 23 Sep 2026.',
      'The manuscript map writes the size bound as C_k N exp[−c_k (log N)^{ε_k}] with three positive constants depending only on k. This entry assigns none of them a numerical value.',
      'Separate from the already catalogued Erdős problems 728, 1196, 146, 180, and 183.',
      'On 15 Oct 2026 OpenAI said it is contributing $5 million to a Simons Foundation initiative so mathematicians can examine results from this release.',
      'This app does not machine-check the argument. Formalization review for this catalog entry is unchecked.',
    ],
    jargon: [
      {
        term: 'Reciprocal sum',
        def: 'The sum of 1/n over the integers n in the set. The harmonic series is the reciprocal sum of all positive integers, and it diverges.',
      },
      {
        term: 'Nonconstant progression',
        def: 'An arithmetic progression whose common difference is a positive integer. Repeating one number does not count.',
      },
    ],
  },
  applications: [
    {
      id: 'rk-bounds',
      title: 'Caps on progression-free sets',
      domain: 'number-theory',
      blurb: 'A quasipolynomial cap on subsets of {1, …, N} with no k-term progression.',
      detail:
        'Additive combinatorics tracks r_k(N), the largest subset of {1, …, N} with no nonconstant k-term arithmetic progression. The Szemerédi theorem says this count is o(N). The catalog bound multiplies N by a factor exp[−c (log N)^c], with positive constants that depend only on k and are not given as numbers here. People who cite upper bounds for progression-free sets get a sharper reference.',
      commercial:
        'No product ships the bound. The commercial edge is the citation itself for mathematicians and research software that already quote r_k(N).',
    },
    {
      id: 'reciprocal-test',
      title: 'Divergence as a progression test',
      domain: 'foundations',
      blurb: 'A divergent reciprocal sum is enough to force every finite progression length.',
      detail:
        'If the reciprocals in the set sum to infinity, the set contains a 3-term progression, a 4-term progression, and so on for every finite length. That is the same divergence test as the harmonic series. The primes are one set the statement covers, because the sum of 1/p diverges. Green-Tao already proved that special case. This manuscript is the general reciprocal-sum statement.',
      commercial:
        'The theorem does not change a cipher or a solver. AI-for-math groups can cite the public catalog when they show a model-written manuscript on a named conjecture.',
    },
  ],
  demoId: 'erdos-reciprocal',
  sources: [
    {
      label: 'OpenAI, Sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'OpenAI math catalog',
      href: 'https://github.com/openai/math',
    },
    {
      label: 'Quasipolynomial bounds preprint',
      href: 'https://github.com/openai/math/blob/main/preprints/Quasipolynomial-Bounds-for-Arithmetic-Progressions-September-23-2026/paper.pdf',
    },
  ],
}
