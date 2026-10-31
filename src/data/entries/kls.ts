import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'kls',
  importance: 39,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'KLS conjecture proved',
  field: 'High-dimensional convex geometry',
  glance:
    'The best flat cut of a convex shape is within a fixed factor of the best cut of any shape, in every dimension. Three independent proofs appeared in October.',
  discoveredBy: { kind: 'human', label: 'Zhao Song & Xinzhi Zhang (human-directed AI)' },
  plain: {
    what: 'Take a convex shape, or any log-concave probability distribution, in n dimensions, and try to cut it into two big pieces along the smallest possible boundary. Kannan, Lovász and Simonovits conjectured in 1995 that a flat cut by a hyperplane is always within a constant factor of the best possible cut, and that the constant does not grow with the dimension. Before 2026 the best bounds let the factor grow slowly with n. Zhao Song and Xinzhi Zhang (Microsoft Research) posted a proof of a dimension-free constant on 4 Oct 2026. Their key criterion was then used by two more groups to give independent proofs within days. The authors say AI agents explored more than 100 candidate approaches and carried out long tensor calculations. The humans chose the directions, assembled the argument and checked it.',
    whyItMatters:
      'KLS is a hub. It implies the slicing (Bourgain) conjecture and the thin-shell conjecture. It also controls how fast random walks mix inside convex bodies, which sets the speed of algorithms that sample points or estimate volume. Several independent proofs plus a public Lean formalization make this the best-checked result in the October batch.',
    result:
      'There is a universal constant C such that every isotropic log-concave probability measure on ℝ^n, in every dimension n, has Cheeger constant at least 1/C. Equivalently, its Poincaré constant is bounded by a universal constant.',
  },
  deep: {
    statement:
      'There is an absolute constant C > 0 such that for every n and every isotropic log-concave probability measure μ on ℝ^n, the KLS constant satisfies ψ_n ≤ C. Equivalently, the Poincaré constant C_P(μ) ≤ C′ for an absolute C′.',
    notes: [
      'arXiv 2610.01447, “An O(1) Bound for the KLS Constant,” Song and Zhang. Version 1 was posted on 1 Oct 2026 and the dimension-free version 2 on 4 Oct 2026. A September Microsoft Research version gave an O(4^{log* n}) bound.',
      'arXiv 2610.05474 by Bizeul, Klartag and Lehec presents a proof built on the Song–Zhang criterion (Theorem 5.1), which it calls the crucial step. arXiv 2610.07728 gives a third proof using a closely related idea.',
      'HongruZhao/KLS500 is a Lean 4 formalization of a dimension-free Poincaré constant of at most 500. The Song–Zhang team says it has a shorter Lean-verified proof that it will release after final review.',
      'Peer review was still pending as of 31 Oct 2026.',
    ],
    jargon: [
      {
        term: 'Log-concave',
        def: 'A distribution whose density’s logarithm is concave. Uniform measure on a convex body and Gaussians are examples.',
      },
      {
        term: 'Isotropic',
        def: 'Normalized to mean zero and identity covariance, so every direction has the same spread.',
      },
      {
        term: 'Cheeger constant',
        def: 'The smallest ratio of boundary size to the smaller piece’s mass over all ways to cut the distribution in two.',
      },
    ],
  },
  applications: [
    {
      id: 'convex-sampling',
      title: 'Faster sampling and volume estimation',
      domain: 'optimization',
      blurb: 'Dimension-free isoperimetry tightens mixing-time bounds for random walks in convex bodies.',
      detail:
        'Algorithms such as ball walk and hit-and-run sample from convex bodies and log-concave distributions, and their mixing time depends on the KLS constant. A universal constant removes a dimension-dependent factor from those analyses. Volume estimation and some Bayesian samplers inherit cleaner guarantees.',
      commercial:
        'Bayesian inference and risk-simulation tools sample log-concave posteriors every day. This result makes their worst-case guarantees cleaner. It does not change their code.',
    },
    {
      id: 'slicing-thin-shell',
      title: 'Slicing and thin-shell conjectures',
      domain: 'geometry',
      blurb: 'KLS implies the slicing and thin-shell conjectures in convex geometry.',
      detail:
        'The thin-shell conjecture says most of the mass of a high-dimensional convex body sits near one radius. The slicing conjecture says every convex body of volume one has a hyperplane section of constant area. Klartag and Lehec had already settled slicing up to constants in 2024–25. KLS gives both as consequences in one stroke.',
      commercial:
        'This is mostly theory. The nearest commercial edge is high-dimensional statistics and machine learning, where concentration bounds like thin-shell appear in generalization arguments.',
    },
  ],
  demoId: 'kls',
  lean: {
    label: 'HongruZhao/KLS500',
    href: 'https://github.com/HongruZhao/KLS500',
  },
  sources: [
    {
      label: 'Song & Zhang, An O(1) Bound for the KLS Constant (arXiv 2610.01447)',
      href: 'https://arxiv.org/abs/2610.01447',
    },
    {
      label: 'Bizeul, Klartag & Lehec (arXiv 2610.05474)',
      href: 'https://arxiv.org/abs/2610.05474',
    },
    {
      label: 'Microsoft Research blog, Solving a 31-year-old grand challenge (21 Oct 2026)',
      href: 'https://www.microsoft.com/en-us/research/blog/solving-a-31-year-old-grand-challenge-in-mathematics-the-kls-conjecture/',
    },
  ],
}
