import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'goldfeld',
  importance: 28,
  series: 'landmark',
  when: 'Oct 2026',
  title: "Goldfeld's conjecture for twist ranks",
  field: 'Number theory',
  glance:
    'Quadratic twists of every elliptic curve over the rationals are claimed to split evenly between analytic ranks 0 and 1.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'Start with an elliptic curve over the rational numbers and form its quadratic twists by signed squarefree integers. Line those twists up by the absolute value of the twist parameter. Goldfeld conjectured that analytic rank 0 and analytic rank 1 each have density 1/2 in that line, and that the average analytic rank tends to 1/2. On 6 Oct 2026 the OpenAI math catalog published an argument for that conjecture from an internal frontier model.',
    whyItMatters:
      'Analytic rank is the order of vanishing of the L-function at its central point. In the absolute-value ordering, the claim puts density 1/2 on rank 0, density 1/2 on rank 1, and sends the average to 1/2. That average is taken over the twists of one curve.',
    result:
      'For the quadratic twists of every elliptic curve over the rationals, ordered by absolute value of the signed squarefree twist parameter, analytic ranks 0 and 1 each have density 1/2, and the mean analytic rank tends to 1/2. This app does not check the argument.',
  },
  deep: {
    statement:
      'Let E be an elliptic curve over the rationals. Order its quadratic twists by the absolute value of the signed squarefree twist parameter. In that order, analytic rank 0 has density 1/2, analytic rank 1 has density 1/2, and the mean analytic rank tends to 1/2.',
    notes: [
      'OpenAI posted the claim on 6 Oct 2026 in its public math catalog. An internal frontier model produced the argument.',
      'A sibling catalog entry covers low-corank BSD for individual curves. This entry records average analytic rank across the quadratic twists of a curve.',
      'Simons examination on 15 Oct 2026. Catalog formalization review is unchecked. This app does not machine-check the argument.',
    ],
    jargon: [
      {
        term: 'Analytic rank',
        def: 'The order of vanishing of the L-function of E at the central point s = 1.',
      },
      {
        term: 'Quadratic twist',
        def: 'The elliptic curve obtained from E by scaling its coefficients by powers of a signed squarefree integer.',
      },
    ],
  },
  applications: [
    {
      id: 'twist-densities',
      title: 'Densities of ranks 0 and 1',
      domain: 'number-theory',
      blurb: 'Ordered by absolute twist size, analytic ranks 0 and 1 should each fill half the list.',
      detail:
        'Computational number theorists list analytic ranks of the quadratic twists of one curve. The claim says to sort those twists by the absolute value of the signed squarefree parameter. In that sort, rank 0 and rank 1 each have density 1/2. A finite table is a prefix of the same list, so a long prefix should sit near that split.',
      commercial:
        'Magma sells rank computations, and Sage is the usual free tool for the same tables. The claim is a density those printouts can be compared with.',
    },
    {
      id: 'mean-analytic-rank',
      title: 'Mean analytic rank',
      domain: 'number-theory',
      blurb: 'The average analytic rank along the ordered twists tends to 1/2.',
      detail:
        'The claim says the mean analytic rank tends to 1/2 in the same absolute-value ordering, for every elliptic curve over the rationals. A running average of analytic ranks along that list is the quantity that should approach 1/2. Short prefixes can sit away from 1/2. The limit is about the whole ordered family.',
      commercial:
        'The number 1/2 is a benchmark inside papers and inside long rank tables.',
    },
  ],
  demoId: 'goldfeld',
  sources: [
    {
      label: 'OpenAI, sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'OpenAI math catalog',
      href: 'https://github.com/openai/math',
    },
    {
      label: "Preprint, Goldfeld's analytic density conjecture",
      href: 'https://github.com/openai/math/blob/main/preprints/Goldfelds-analytic-density-conjecture-and-the-2-converse-for-elliptic-curves-October-7-2026/paper.pdf',
    },
  ],
}
