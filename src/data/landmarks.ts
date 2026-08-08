import type { Breakthrough } from './types'

/** Major 2026 breakthroughs beyond the Astra ten — ordered by importance rank. */
export const landmarkBreakthroughs: Breakthrough[] = [
  {
    id: 'jacobian',
    importance: 1,
    series: 'landmark',
    when: 'Jul 2026',
    title: 'Jacobian conjecture falls (dimensions ≥ 3)',
    field: 'Algebraic geometry',
    glance:
      'An 87-year-old conjecture dies in three dimensions and above — with a tiny explicit map.',
    plain: {
      what: 'The Jacobian conjecture said: if a polynomial map from complex n-space to itself has a constant nonzero Jacobian determinant, then it must have a polynomial inverse. In July 2026, Levent Alpöge announced an explicit three-variable counterexample found with Claude Fable 5 — constant Jacobian, but not injective, so no inverse. Padding with identity coordinates kills the conjecture in every dimension n ≥ 3. Dimension 2 remains open.',
      whyItMatters:
        'This was one of the most famous open problems in affine algebraic geometry. A short, checkable counterexample resets decades of “maybe it’s true in all dimensions” intuition and focuses the open case on the plane.',
      result:
        'Explicit Keller map F: ℂ³ → ℂ³ with det Jac = −2 that sends three distinct points to one image; hence the Jacobian conjecture is false for all n ≥ 3.',
    },
    deep: {
      statement:
        'There exists a polynomial map F: ℂ³ → ℂ³ with det Jac F ≡ −2 that is not injective (hence not a polynomial automorphism). Stabilizing by identity coordinates yields counterexamples in every dimension n ≥ 3. The two-dimensional case remains open.',
      notes: [
        'Announced by Alpöge (Jul 2026); question prompted by Akhil Mathew; construction credited to Claude Fable 5.',
        'Independently formalized in Lean 4 and Isabelle/HOL with kernel checks.',
        'Peer review of the broader narrative was still catching up at announcement; the identities themselves are elementary to verify.',
      ],
      jargon: [
        {
          term: 'Keller map',
          def: 'A polynomial self-map whose Jacobian determinant is a nonzero constant.',
        },
        {
          term: 'Polynomial automorphism',
          def: 'A polynomial map with a polynomial inverse — a polynomial change of coordinates.',
        },
      ],
    },
    applications: [
      {
        id: 'affine-geometry',
        title: 'Affine algebraic geometry',
        domain: 'geometry',
        blurb: 'Removes a false global invertibility hope for polynomial maps in high dimension.',
      },
      {
        id: 'cas-search',
        title: 'Computer-algebra search',
        domain: 'complexity',
        blurb: 'Shows short counterexamples can hide in huge polynomial search spaces.',
      },
    ],
    demoId: 'jacobian',
    sources: [
      {
        label: 'Jacobian explained',
        href: 'https://jacobianfun.org/jacobian-explained',
      },
      {
        label: 'ScienceDaily summary',
        href: 'http://www.sciencedaily.com/releases/2026/08/260804034634.htm',
      },
    ],
  },
  {
    id: 'unit-distance',
    importance: 4,
    series: 'landmark',
    when: 'May 2026',
    title: 'Erdős unit-distance conjecture disproved',
    field: 'Discrete geometry',
    glance:
      'You can pack more equal lengths among n points than Erdős thought — a polynomial improvement.',
    plain: {
      what: 'Erdős asked how many pairs among n points in the plane can sit at distance exactly 1. He conjectured the count is at most n^{1+o(1)}. In May 2026 an internal OpenAI model produced a counterexample family with at least n^{1+δ} unit distances for a fixed δ > 0. Human writeups and later work made the exponent explicit (around 1.014).',
      whyItMatters:
        'This is one of the most famous problems in combinatorial geometry. Beating the grid-style lower bound with algebraic number theory tools was widely unexpected.',
      result:
        'Infinite families of n-point sets with ≥ n^{1+δ} unit distances (δ > 0 fixed; later sharpened to an explicit ≈ 0.014).',
    },
    deep: {
      statement:
        'There exists δ > 0 such that for infinitely many n there is a set of n points in ℝ² with at least n^{1+δ} unit-distance pairs, disproving Erdős’s n^{1+o(1)} conjecture. Subsequent work gives an explicit bound of order n^{1.014}.',
      notes: [
        'OpenAI announcement May 2026 with external mathematician commentary.',
        'Uses algebraic number fields / Golod–Shafarevich-style constructions.',
        'Best upper bound remains O(n^{4/3}) (Spencer–Szemerédi–Trotter).',
      ],
      jargon: [
        {
          term: 'Unit distance graph',
          def: 'Graph on a point set with an edge for each pair at Euclidean distance 1.',
        },
        {
          term: 'Golod–Shafarevich',
          def: 'A criterion producing infinite class-field towers / many small-norm primes.',
        },
      ],
    },
    applications: [
      {
        id: 'sensor-networks',
        title: 'Geometric networks',
        domain: 'networks',
        blurb: 'Bounds how often a fixed range can recur in planar point configurations.',
      },
      {
        id: 'discrete-geom-apps',
        title: 'Discrete geometry toolkit',
        domain: 'geometry',
        blurb: 'Forces revised intuitions about extremal distance graphs in the plane.',
      },
    ],
    demoId: 'unit-distance',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/model-disproves-discrete-geometry-conjecture/',
      },
      {
        label: 'Quanta Magazine',
        href: 'https://www.quantamagazine.org/why-the-legendary-erdos-problems-are-falling-to-ai-20260803/',
      },
    ],
  },
  {
    id: 'kakeya-3d',
    importance: 5,
    series: 'landmark',
    when: '2026 Fields',
    title: 'Kakeya & restriction advances (Wang)',
    field: 'Harmonic analysis',
    glance:
      'Major progress on 3D Kakeya and related distance / restriction problems — Fields Medal 2026.',
    plain: {
      what: 'A Kakeya set must contain a unit line segment in every direction. How small can its volume be? Hong Wang’s work (recognized with a 2026 Fields Medal) made major advances on the Kakeya problem in three dimensions, alongside Fourier restriction, Falconer distance sets, and Furstenberg sets.',
      whyItMatters:
        'Kakeya and restriction sit at the heart of modern harmonic analysis and connect to PDEs and geometric measure theory. Progress here reshapes what “thin but direction-rich” sets can look like.',
      result:
        'Major advances on 3D Kakeya and related multiscale / decoupling techniques (Fields Medal citation, ICM 2026).',
    },
    deep: {
      statement:
        'Wang was cited for applications of multiscale and decoupling techniques to local smoothing for the planar wave equation, and major advances in Fourier restriction, Falconer distance sets, Furstenberg sets in the plane, and the Kakeya problem in three dimensions.',
      notes: [
        'Fields Medal awarded July 2026 at ICM Philadelphia.',
        'Builds on a long program in decoupling and multiscale harmonic analysis.',
        'Demo below is 2D intuition for “needle in every direction,” not the 3D theorem.',
      ],
      jargon: [
        {
          term: 'Kakeya set',
          def: 'A set containing a unit segment in every direction.',
        },
        {
          term: 'Decoupling',
          def: 'A Fourier-analytic method controlling how waves in different directions interact.',
        },
      ],
    },
    applications: [
      {
        id: 'wave-imaging',
        title: 'Wave equations & imaging',
        domain: 'analysis',
        blurb: 'Local smoothing / restriction ideas feed PDE and imaging estimates.',
      },
      {
        id: 'gmt',
        title: 'Geometric measure theory',
        domain: 'geometry',
        blurb: 'Controls how thin sets can still point every way.',
      },
    ],
    demoId: 'kakeya',
    sources: [
      {
        label: 'IMU Fields 2026',
        href: 'https://www.mathunion.org/imu-awards/fields-medal/fields-medals-2026',
      },
      {
        label: 'Simons Foundation',
        href: 'https://www.simonsfoundation.org/2026/07/23/2026-fields-medals-awarded-to-four-of-worlds-top-mathematicians/',
      },
    ],
  },
  {
    id: 'andre-oort',
    importance: 6,
    series: 'landmark',
    when: '2026 Fields',
    title: 'O-minimality → arithmetic geometry (Tsimerman)',
    field: 'Arithmetic geometry',
    glance:
      'O-minimal geometry becomes a workhorse for algebraicity theorems — Fields Medal 2026.',
    plain: {
      what: 'Jacob Tsimerman’s program made o-minimality a core method in arithmetic and complex algebraic geometry, playing a decisive role in results such as Griffiths’ conjecture on period maps and the André–Oort conjecture for Siegel modular varieties.',
      whyItMatters:
        'These results control when “special” points and period images are algebraic — deep structure in moduli spaces that number theorists and geometers both need.',
      result:
        'O-minimality recast as a fundamental method; central algebraicity conjectures settled in key cases (Fields citation).',
    },
    deep: {
      statement:
        'Tsimerman was cited for recasting o-minimality as a fundamental method of arithmetic and complex algebraic geometry, including roles in Griffiths’ conjecture on algebraicity of period-map images and André–Oort for Siegel modular varieties.',
      notes: [
        'Fields Medal awarded July 2026.',
        'Often collaborative long-term programs; the medal recognizes cumulative impact.',
      ],
      jargon: [
        {
          term: 'O-minimality',
          def: 'A tameness framework for real geometry that forbids wild oscillations/sets.',
        },
        {
          term: 'André–Oort',
          def: 'Conjecture controlling special points on Shimura varieties / moduli spaces.',
        },
      ],
    },
    applications: [
      {
        id: 'moduli',
        title: 'Moduli & special points',
        domain: 'number-theory',
        blurb: 'Predicts when arithmetic special loci are algebraic rather than transcendental soup.',
      },
      {
        id: 'period-maps',
        title: 'Period maps',
        domain: 'geometry',
        blurb: 'Algebraicity of period images organizes Hodge-theoretic data.',
      },
    ],
    demoId: 'andre-oort',
    sources: [
      {
        label: 'IMU Fields 2026',
        href: 'https://www.mathunion.org/imu-awards/fields-medal/fields-medals-2026',
      },
    ],
  },
  {
    id: 'cohen-lenstra',
    importance: 7,
    series: 'landmark',
    when: 'Aug 2026',
    title: 'Cohen–Lenstra / arithmetic statistics breakthrough',
    field: 'Number theory',
    glance:
      'A new framework advances Gauss-inspired questions about average class-group behavior.',
    plain: {
      what: 'Inspired by Gauss’s composition of quadratic forms, the Cohen–Lenstra heuristics predict average sizes of class groups. Aaron Landesman and Ishan Levy developed a new framework that goes a long way toward proving these statistics, and proved function-field versions of related Poonen–Rains and Malle conjectures.',
      whyItMatters:
        'Arithmetic statistics is becoming central in number theory. Better average predictions for class groups and Galois groups guide what “random” number fields look like — with echoes in cryptography and computational number theory.',
      result:
        'New framework toward Cohen–Lenstra; function-field proofs of Poonen–Rains and Malle-type statements (reported Aug 2026).',
    },
    deep: {
      statement:
        'Landesman–Levy introduce methods that substantially advance the Cohen–Lenstra conjectures on average class-group structure and establish function-field analogues of the Poonen–Rains and Malle conjectures.',
      notes: [
        'Covered in Scientific American (Aug 2026) as a breakthrough on “Gauss’s riddle.”',
        'Human research program — not an AI one-shot claim.',
      ],
      jargon: [
        {
          term: 'Class group',
          def: 'Measures failure of unique factorization in the integers of a number field.',
        },
        {
          term: 'Cohen–Lenstra heuristics',
          def: 'Predicted probability distributions for class-group structures.',
        },
      ],
    },
    applications: [
      {
        id: 'random-fields',
        title: 'Random number fields',
        domain: 'number-theory',
        blurb: 'Predicts typical class-group sizes when sampling fields.',
      },
      {
        id: 'crypto-nt',
        title: 'Computational number theory',
        domain: 'crypto',
        blurb: 'Average-case structure informs hardness and algorithm design intuitions.',
      },
    ],
    demoId: 'cohen-lenstra',
    sources: [
      {
        label: 'Scientific American',
        href: 'https://www.scientificamerican.com/article/mathematicians-make-a-breakthrough-on-gausss-riddle-unsolved-for-200-years/',
      },
    ],
  },
  {
    id: 'erdos-728',
    importance: 16,
    series: 'landmark',
    when: 'Jan 2026',
    title: 'Erdős #728 — first autonomous AI resolve',
    field: 'Combinatorial number theory',
    glance:
      'A factorial-divisibility Erdős problem solved by GPT-5.2 Pro + Lean (Aristotle) with no prior paper.',
    plain: {
      what: 'Erdős problem #728 asks whether factorial divisibility can achieve a logarithmic gap infinitely often under natural size constraints. In January 2026, GPT-5.2 Pro produced a proof that Harmonic’s Aristotle formalized in Lean — widely regarded as the first Erdős problem fully resolved autonomously by AI (not a literature lookup).',
      whyItMatters:
        'Mathematically moderate, historically huge: it marks a shift from “AI finds old papers” to “AI writes new checkable proofs.” Terence Tao emphasized speed/autonomy over raw difficulty.',
      result:
        'For any 0 < C₁ < C₂ and small ε, infinitely many (a,b,n) exist with εn ≤ a,b ≤ (1−ε)n, a! b! | n! (a+b−n)!, and C₁ log n < a+b−n < C₂ log n.',
    },
    deep: {
      statement:
        'A logarithmic-gap phenomenon for factorial divisibility holds: infinitely many triples realize a! b! dividing n! (a+b−n)! with a,b linearly large in n and a+b−n = Θ(log n).',
      notes: [
        'Pipeline: GPT-5.2 Pro → Aristotle (Lean) → human writeups/simplifications.',
        'Problem statement needed clarification (avoid trivial regimes).',
        'See arXiv:2601.07421 writeup of the Lean proof.',
      ],
      jargon: [
        {
          term: 'Kummer’s theorem',
          def: 'Relates the p-adic valuation of binomial coefficients to base-p carries.',
        },
        {
          term: 'Aristotle (Harmonic)',
          def: 'A system that turns informal arguments into Lean certificates.',
        },
      ],
    },
    applications: [
      {
        id: 'formal-proofs',
        title: 'Formal proof pipelines',
        domain: 'foundations',
        blurb: 'Template for AI draft → machine-checked Lean → human exposition.',
      },
      {
        id: 'factorial-div',
        title: 'Factorial / binomial arithmetic',
        domain: 'number-theory',
        blurb: 'Clarifies how large logarithmic gaps can be in divisibility constraints.',
      },
    ],
    demoId: 'erdos-728',
    sources: [
      {
        label: 'Erdős problems #728',
        href: 'https://www.erdosproblems.com/728',
      },
      {
        label: 'arXiv writeup',
        href: 'https://doi.org/10.48550/arxiv.2601.07421',
      },
    ],
  },
  {
    id: 'fields-pde-symplectic',
    importance: 17,
    series: 'landmark',
    when: '2026 Fields',
    title: 'Fields 2026: Deng (PDE) & Pardon (symplectic)',
    field: 'PDE & geometry',
    glance:
      'Kinetic PDE derivations and symplectic / topological machinery recognized at ICM 2026.',
    plain: {
      what: 'Yu Deng was awarded a Fields Medal for rigorous derivations connecting microscopic particle systems to kinetic equations (Boltzmann, wave kinetics) and probabilistic NLS dynamics. John Pardon was recognized for symplectic geometry (virtual cycles, Fukaya categories, holomorphic curves) and topology (3-manifold group actions, knot theory).',
      whyItMatters:
        'These are multi-year structural programs: Deng bridges atoms-to-PDEs; Pardon rebuilds foundations for counting curves and symplectic invariants.',
      result:
        'Fields Medals (Jul 2026) for Deng’s PDE/kinetic work and Pardon’s symplectic geometry & topology.',
    },
    deep: {
      statement:
        'Deng: rigorous derivation of Boltzmann from hard-sphere dynamics, wave kinetic equations from dispersive systems, probabilistic NLS approaches. Pardon: virtual fundamental cycles, Fukaya categories, holomorphic curve counts; plus 3-manifold actions and knot theory.',
      notes: [
        'Career-scale achievements capped in 2026, not single summer AI dumps.',
        'Demo is a glanceable kinetic/symplectic intuition toy, not a proof.',
      ],
      jargon: [
        {
          term: 'Boltzmann equation',
          def: 'A kinetic PDE describing the statistical motion of a rarefied gas.',
        },
        {
          term: 'Fukaya category',
          def: 'A categorical invariant of symplectic manifolds built from Lagrangian intersections.',
        },
      ],
    },
    applications: [
      {
        id: 'fluids-kinetic',
        title: 'Fluids & kinetic theory',
        domain: 'analysis',
        blurb: 'Justifies continuum equations from particle models.',
      },
      {
        id: 'symplectic-invariants',
        title: 'Symplectic invariants',
        domain: 'geometry',
        blurb: 'Tools for counting curves and building topological field-theory data.',
      },
    ],
    demoId: 'fields-pde',
    sources: [
      {
        label: 'IMU Fields 2026',
        href: 'https://www.mathunion.org/imu-awards/fields-medal/fields-medals-2026',
      },
    ],
  },
]
