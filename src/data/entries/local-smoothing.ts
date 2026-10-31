import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'local-smoothing',
  importance: 38,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Local smoothing for waves in every dimension',
  field: 'Harmonic analysis',
  glance:
    'Sogge’s 1991 local smoothing conjecture is claimed in every dimension. The same proof is claimed to give Kakeya in every dimension.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'A wave spreading out from rough initial data stays rough at each single moment. Averaged over a short time window, it gets a little smoother. Christopher Sogge conjectured in 1991 exactly how much smoother. Before 2026 the conjecture was proved only in two space dimensions (Guth, Wang and Zhang, 2019). On 26 Oct 2026 OpenAI published a manuscript claiming it in every space dimension of at least two. The claimed proof uses a new auxiliary partial differential equation. The release says the proof also gives the Kakeya maximal and dimension conjectures in every dimension, and Stein’s spherical restriction estimates throughout the interior of the conjectured range. OpenAI released the model output directly, without an expert shepherd group.',
    whyItMatters:
      'Local smoothing sits on top of a chain of famous problems. A proof in every dimension would imply the Kakeya conjecture in every dimension. Wang and Zahl proved the three-dimensional case in 2025, and that case is part of the Hong Wang Fields entry in this catalog. Alex Iosevich of the University of Rochester called it a “historic development.” His PhD adviser formulated the conjecture. Experts had not finished checking the proof as of 31 Oct 2026.',
    result:
      'For every spatial dimension n ≥ 2, solutions of the Euclidean wave equation satisfy Sogge’s conjectured local smoothing estimates. As consequences, Kakeya sets in ℝ^n have full Hausdorff dimension, the Kakeya maximal conjecture holds, and Stein’s spherical restriction estimates hold in the open conjectured range.',
  },
  deep: {
    statement:
      'For n ≥ 2 and p > 2n/(n−1), the wave propagator e^{it√−Δ} satisfies ‖e^{it√−Δ}f‖_{L^p(ℝ^n × [1,2])} ≲ ‖f‖_{W^{σ,p}} for every σ > (n−1)(1/2 − 1/p) − 1/p. That is a gain of almost 1/p derivatives over the fixed-time estimate. Claimed corollaries are the Kakeya maximal and set conjectures in ℝ^n and Stein’s spherical restriction conjecture in the interior of its range.',
    notes: [
      'OpenAI posted the manuscript, dated 25 Oct 2026, in its public math repository on 26 Oct 2026. The release notes say the model found the argument on 18 Oct and the Lean formalization was completed by 19 Oct.',
      'The Lean comparator file (LocalSmoothing) states separate targets for Euclidean local smoothing, Bochner–Riesz, spherical restriction, Kakeya maximal and Kakeya set dimension.',
      'The 6 Oct release already contained critical local smoothing in three dimensions and Kakeya in four dimensions. This release claims the general case.',
      'The catalog’s Hong Wang entry covers three-dimensional Kakeya and the Fields citation. This entry is the claimed all-dimension extension. It does not replace that entry.',
      'Independent expert verification was still underway on 31 Oct 2026. This app does not machine-check the argument.',
    ],
    jargon: [
      {
        term: 'Local smoothing',
        def: 'Averaging a wave over a short time interval gains regularity that no single time slice has.',
      },
      {
        term: 'Kakeya set',
        def: 'A set containing a unit line segment in every direction. The conjecture says it must have full Hausdorff dimension.',
      },
      {
        term: 'Restriction estimate',
        def: 'A bound on how much of a function’s Fourier transform can concentrate on a curved surface such as a sphere.',
      },
    ],
  },
  applications: [
    {
      id: 'wave-estimates',
      title: 'Sharper wave-equation estimates',
      domain: 'analysis',
      blurb: 'The sharp time-averaged regularity of waves in every dimension.',
      detail:
        'Nonlinear wave equations and dispersive PDE use local smoothing as an input for well-posedness and for controlling energy concentration. A sharp estimate in every dimension would tighten many of those arguments at once.',
      commercial:
        'Acoustic and seismic simulation software rests on wave PDE theory, but it does not run this proof. The value is in theory that numerical analysts quote.',
    },
    {
      id: 'kakeya-all-dims',
      title: 'Kakeya in every dimension',
      domain: 'geometry',
      blurb: 'Needle-in-every-direction sets would have full dimension in every ℝ^n.',
      detail:
        'Kakeya-type bounds control how thin a direction-rich set can be. They feed into restriction theory, additive combinatorics and some randomness-extractor constructions in computer science. An all-dimension result would settle a benchmark problem the field has worked on for decades.',
      commercial:
        'No direct product. Kakeya-style ideas appear in pseudorandomness and extractor research. Those constructions use finite-field versions, which were already known.',
    },
  ],
  demoId: 'local-smoothing',
  lean: {
    label: 'openai/math · LocalSmoothing comparator',
    href: 'https://github.com/openai/math/blob/main/lean/ComparatorChallenges/LocalSmoothing.lean',
  },
  sources: [
    {
      label: 'openai/math release history (26 Oct 2026)',
      href: 'https://github.com/openai/math/blob/main/history.md',
    },
    {
      label: 'Local smoothing for the Euclidean wave equation (preprint)',
      href: 'https://github.com/openai/math/blob/main/preprints/Local-smoothing-for-the-Euclidean-wave-equation-October-25-2026/paper.pdf',
    },
    {
      label: 'Al Jazeera, AI makes discoveries in math, CS, physics (27 Oct 2026)',
      href: 'https://www.aljazeera.com/economy/2026/10/27/ai-makes-discoveries-in-mathematics-computer-science-physics-openai-says',
    },
  ],
}
