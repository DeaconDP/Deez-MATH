import type { Breakthrough } from './types'

export const astraBreakthroughs: Breakthrough[] = [
  {
    id: 'sphere-packing',
    importance: 8,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Tighter high-D sphere packing bounds',
    field: 'High-dimensional geometry',
    glance: 'How densely can equal spheres pack in high dimensions? The bound got sharper.',
    plain: {
      what: 'Imagine packing oranges in a huge box — but in hundreds of dimensions. For decades, the best general upper bounds on how densely equal spheres can pack were stuck. OpenAI’s Astra work tightens the general packing bound and settles the asymptotic strength of the Cohn–Elkies linear program.',
      whyItMatters:
        'Sphere packing is the pure-math cousin of packing signals, materials, and wireless resources. Better bounds tell engineers what density is even possible before they design a scheme.',
      result:
        'An improved general packing bound in high dimensions, pinning the Cohn–Elkies method’s asymptotic strength and settling a related Fourier sign-uncertainty problem.',
    },
    deep: {
      statement:
        'The asymptotic strength of the Cohn–Elkies linear program is determined exactly, yielding an improved general packing bound in high dimensions and settling the corresponding Fourier sign-uncertainty problem asymptotically.',
      notes: [
        'Builds on Fourier-analytic linear programming for packing (Cohn–Elkies).',
        'Connects to modular-bootstrap / conformal-bootstrap intuitions in physics.',
        'Chapter 1 of OpenAI’s ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Cohn–Elkies linear program',
          def: 'An optimization over radial Fourier transforms that upper-bounds packing density.',
        },
        {
          term: 'Packing density',
          def: 'Fraction of space occupied by non-overlapping equal spheres.',
        },
      ],
    },
    applications: [
      {
        id: 'materials-packing',
        title: 'Materials & crystallography',
        domain: 'optimization',
        blurb: 'Know the theoretical ceiling for packing identical particles or grains.',
      },
      {
        id: 'wireless-packing',
        title: 'Wireless resource packing',
        domain: 'coding',
        blurb: 'Intuition for packing signal “balls” so channels interfere less.',
      },
    ],
    demoId: 'sphere-packing',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'codes',
    importance: 9,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Stronger binary & spherical code bounds',
    field: 'Coding theory',
    glance: 'How many codewords can you pack at a fixed distance? Upper bounds improved exponentially.',
    plain: {
      what: 'Error-correcting codes are recipes for writing bits (or points on a sphere) so that small mistakes can be detected or fixed. Classical upper bounds limited how large such codes can be. Astra reports exponentially improved upper bounds for binary and spherical codes at any prescribed minimum distance.',
      whyItMatters:
        'Tighter upper bounds tell storage and communications designers when a proposed code is already near the theoretical limit — or still has headroom.',
      result:
        'Classical fixed-distance upper bounds improved by exponential factors for all parameters; spherical constructions also recover the sphere-packing exponent of Chapter 1.',
    },
    deep: {
      statement:
        'Classical upper bounds for fixed-distance binary and spherical codes are improved by exponential factors for all parameters.',
      notes: [
        'Improves MRRW-style Fourier / Delsarte linear programming bounds.',
        'Spherical-code improvements connect back to high-D packing.',
        'Chapter 2 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Minimum distance',
          def: 'Smallest Hamming (or angular) separation between distinct codewords.',
        },
        {
          term: 'MRRW bound',
          def: 'A classic asymptotic upper bound on binary code rate vs distance.',
        },
      ],
    },
    applications: [
      {
        id: 'storage-codes',
        title: 'Reliable storage',
        domain: 'coding',
        blurb: 'Know how many distinct blocks you can store while surviving bit flips.',
      },
      {
        id: 'qr-comms',
        title: 'QR & communications',
        domain: 'coding',
        blurb: 'Distance between patterns is what makes smudged codes still readable.',
      },
    ],
    demoId: 'codes',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'non-sofic',
    importance: 2,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'First explicit non-sofic group',
    field: 'Group theory',
    glance: 'Not every infinite group can be approximated by finite permutations — here is one that cannot.',
    plain: {
      what: 'Sofic groups are those that can be approximated by finite permutation groups. Since Gromov (1999), mathematicians asked whether every countable group is sofic. Astra constructs an explicit non-sofic group (via the binary Leavitt algebra and property-(T) expanders), answering that some groups refuse finite approximation.',
      whyItMatters:
        'Soficity was a “all groups look finite from afar” hope used across dynamics and operator algebras. A counterexample redraws which theorems can assume soficity.',
      result:
        'An explicit non-sofic group exists; finitely presented non-sofic groups follow from the construction.',
    },
    deep: {
      statement:
        'An explicit non-sofic group is constructed (unit group of the binary Leavitt algebra / related presentation), resolving whether every countable group admits finite permutation approximations.',
      notes: [
        'Uses property-(T) expanders and Leavitt-path algebra structure.',
        'Headline result of the collection; large Lean formalization released.',
        'Chapter 3 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Sofic group',
          def: 'A group approximable by finite symmetric groups with controlled multiplication errors.',
        },
        {
          term: 'Property (T)',
          def: 'A rigidity property of groups: unitary reps with almost-invariant vectors have true invariants.',
        },
      ],
    },
    applications: [
      {
        id: 'ergodic-foundations',
        title: 'Ergodic theory foundations',
        domain: 'foundations',
        blurb: 'Marks which dynamical results cannot silently assume soficity.',
      },
      {
        id: 'symbolic-dynamics',
        title: 'Symbolic dynamics',
        domain: 'foundations',
        blurb: 'Separates groups that behave like finite models from those that do not.',
      },
    ],
    demoId: 'non-sofic',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'connes',
    importance: 3,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Connes rigidity disproved',
    field: 'Operator algebras',
    glance: 'Different rigid groups can share the same von Neumann algebra — uniqueness fails.',
    plain: {
      what: 'Connes asked whether an ICC property-(T) group is uniquely determined by its group von Neumann algebra. Astra constructs infinitely many pairwise non-isomorphic property-(T) groups with the same group von Neumann algebra, disproving the conjecture and answering a related finite-to-one question of Popa.',
      whyItMatters:
        'Von Neumann algebras encode quantum measurement algebras. If the group is not unique, “read the group from the algebra” strategies fail — important for classification programs.',
      result:
        'Infinitely many non-isomorphic property-(T) groups can share one group von Neumann algebra.',
    },
    deep: {
      statement:
        'Infinitely many pairwise nonisomorphic property-(T) groups are constructed with the same group von Neumann algebra, disproving Connes’s rigidity conjecture.',
      notes: [
        'Uses torsion-free ICC property-(T) actions and Fourier duality techniques.',
        'Chapter 4 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Group von Neumann algebra L(G)',
          def: 'Weak-operator closure of the left-regular representation of G.',
        },
        {
          term: 'ICC',
          def: 'Infinite conjugacy class: every non-identity conjugacy class is infinite.',
        },
      ],
    },
    applications: [
      {
        id: 'qi-uniqueness',
        title: 'Quantum information uniqueness myths',
        domain: 'quantum',
        blurb: 'Shows algebraic data may not pin down a unique underlying group.',
      },
      {
        id: 'classification',
        title: 'Operator-algebra classification',
        domain: 'foundations',
        blurb: 'Forces finer invariants when classifying II₁ factors from groups.',
      },
    ],
    demoId: 'connes',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'permanent',
    importance: 10,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Harder permanent circuit lower bounds',
    field: 'Arithmetic circuit complexity',
    glance: 'Computing the permanent needs more circuit / formula size than we could prove before.',
    plain: {
      what: 'The permanent looks like the determinant but is believed much harder. New lower bounds say division-free arithmetic circuits for the permanent need Ω(n² log log n) gates, and formulas need Ω(n⁴ / log n) leaves — stronger evidence that shortcuts are limited.',
      whyItMatters:
        'Lower bounds are rare. Stronger permanent bounds mark a hard target in algebraic complexity and clarify why some counting problems stay expensive.',
      result:
        'Improved circuit and formula size lower bounds for the permanent.',
    },
    deep: {
      statement:
        'For the permanent, division-free circuits require Ω(n² log log n) gates, while formulas require Ω(n⁴ / log n) leaves.',
      notes: [
        'Formula bounds exploit tree structure (no reuse) via influence packing.',
        'Chapter 5 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Permanent',
          def: 'Like determinant without sign flips: sum over permutations of products of entries.',
        },
        {
          term: 'Arithmetic formula',
          def: 'A circuit that is a tree — intermediate values cannot be reused.',
        },
      ],
    },
    applications: [
      {
        id: 'hard-counting',
        title: 'Hard counting problems',
        domain: 'complexity',
        blurb: 'Explains why counting matchings / permanents resists tiny circuits.',
      },
      {
        id: 'compiler-limits',
        title: 'Compiler & algorithm limits',
        domain: 'complexity',
        blurb: 'Guides when algebraic shortcuts are unlikely to exist.',
      },
    ],
    demoId: 'permanent',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'quantum-repetition',
    importance: 11,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Exponential quantum parallel repetition',
    field: 'Quantum complexity',
    glance: 'Repeat a quantum game enough times and the cheating win rate collapses exponentially.',
    plain: {
      what: 'In interactive proofs, you amplify soundness by repeating a game. Classically this is well understood; for entangled two-player quantum games it was harder. Astra proves exponential parallel repetition for every finite two-player entangled game.',
      whyItMatters:
        'Soundness amplification is how cryptographic and complexity protocols become reliable. Exponential decay means few repetitions suffice in theory.',
      result:
        'Exponential parallel repetition for every finite two-player entangled game.',
    },
    deep: {
      statement:
        'Exponential parallel repetition is proved for every finite two-player entangled game, extending classical repetition beyond previously treated special classes.',
      notes: [
        'Earlier general work had polynomial decay; exponential results were special-case.',
        'Chapter 6 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Parallel repetition',
          def: 'Playing many independent copies of a game and requiring all to be won.',
        },
        {
          term: 'Entangled game',
          def: 'Players may share quantum entanglement but cannot communicate during play.',
        },
      ],
    },
    applications: [
      {
        id: 'quantum-proofs',
        title: 'Quantum interactive proofs',
        domain: 'quantum',
        blurb: 'Amplify soundness so a dishonest prover almost never fools the verifier.',
      },
      {
        id: 'device-independence',
        title: 'Device-independent protocols',
        domain: 'quantum',
        blurb: 'Supports security arguments that rely on game hardness under entanglement.',
      },
    ],
    demoId: 'quantum-repetition',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'cvp',
    importance: 12,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Stronger CVP hardness of approximation',
    field: 'Lattice cryptography',
    glance: 'Finding the closest lattice point stays hard even with a polynomial approximation factor.',
    plain: {
      what: 'The closest vector problem (CVP) asks for the lattice point nearest a target. A direct 3SAT reduction shows Euclidean CVP is NP-hard to approximate within n^(1/400), with related hardness for binary decoding and other norms — tightening foundations under lattice-based (post-quantum) crypto.',
      whyItMatters:
        'Modern post-quantum schemes lean on lattice hardness. Stronger approximation hardness supports “even approximate solvers are hard” security stories.',
      result:
        'n^(1/400)-factor hardness of approximation for Euclidean CVP via a direct 3SAT reduction (plus related decoding hardness).',
    },
    deep: {
      statement:
        'A direct reduction from 3SAT gives n^(1/400)-factor hardness for Euclidean CVP, with related consequences for binary nearest-codeword and ℓ_p norms.',
      notes: [
        'Relevant to post-quantum cryptography assumptions.',
        'Chapter 7 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Lattice',
          def: 'Discrete grid of points generated by integer combinations of basis vectors.',
        },
        {
          term: 'CVP',
          def: 'Closest Vector Problem: find lattice point nearest a given target.',
        },
      ],
    },
    applications: [
      {
        id: 'pqc',
        title: 'Post-quantum cryptography',
        domain: 'crypto',
        blurb: 'Backs hardness stories for lattice schemes against approximate attacks.',
      },
      {
        id: 'coding-decode',
        title: 'Hard decoding',
        domain: 'coding',
        blurb: 'Nearest-codeword hardness informs secure / robust coding design.',
      },
    ],
    demoId: 'cvp',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'ehrhart',
    importance: 13,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Ehrhart volume conjecture proved',
    field: 'Geometry of numbers',
    glance: 'A sharp volume bound for convex bodies with one interior lattice point — now proved in every dimension.',
    plain: {
      what: 'Ehrhart conjectured a sharp upper bound on volume for convex bodies whose barycenter is their only interior lattice point: (n+1)^n / n!. Astra proves this in every dimension.',
      whyItMatters:
        'Volume vs lattice-point constraints show up in integer programming and discrete optimization — sharp bounds limit how “fat” a feasible region can be.',
      result: 'The sharp bound (n+1)^n / n! holds in every dimension.',
    },
    deep: {
      statement:
        'The sharp bound (n+1)^n / n! is proved in every dimension for convex bodies whose barycenter is their only interior lattice point.',
      notes: [
        'Classical geometry-of-numbers / Ehrhart theory connection.',
        'Chapter 8 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Lattice point',
          def: 'A point with integer coordinates.',
        },
        {
          term: 'Barycenter',
          def: 'The center of mass of the body (uniform density).',
        },
      ],
    },
    applications: [
      {
        id: 'integer-prog',
        title: 'Integer programming bounds',
        domain: 'optimization',
        blurb: 'Limits volume of regions with sparse interior integer points.',
      },
      {
        id: 'discrete-geom',
        title: 'Discrete geometry tooling',
        domain: 'optimization',
        blurb: 'Gives a sharp constant for lattice-point constrained bodies.',
      },
    ],
    demoId: 'ehrhart',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Manuscript PDF',
        href: 'https://cdn.openai.com/pdf/ten-proofs-oai.pdf',
      },
    ],
  },
  {
    id: 'ramsey',
    importance: 14,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Multicolor Ramsey Rₖ(3) = k^Θ(k)',
    field: 'Extremal combinatorics',
    glance: 'In multicolor “friendship” graphs, guaranteed monochromatic triangles appear only after a tower-ish / k^Θ(k) blow-up — lower bound settled.',
    plain: {
      what: 'Ramsey theory asks: how large must a gathering be before some pattern is unavoidable? For multicolor triangle Ramsey numbers, Astra proves a superexponential lower bound showing R_k(3) = k^Θ(k), resolving Erdős problem 183.',
      whyItMatters:
        'Ramsey numbers quantify unavoidable structure in networks. Lower bounds show how large systems can grow before a monochromatic triangle is forced.',
      result: 'A superexponential lower bound proving R_k(3) = k^Θ(k).',
    },
    deep: {
      statement: 'A superexponential lower bound proves R_k(3) = k^Θ(k), resolving Erdős problem 183.',
      notes: [
        'Classic party problem generalized to k edge colors.',
        'Chapter 9 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'R_k(3)',
          def: 'Smallest n such that any k-edge-coloring of K_n contains a monochromatic triangle.',
        },
        {
          term: 'Superexponential',
          def: 'Grows faster than any fixed-base exponential in k (here k^Θ(k)).',
        },
      ],
    },
    applications: [
      {
        id: 'network-conflict',
        title: 'Network conflict guarantees',
        domain: 'networks',
        blurb: 'Shows when some conflict triangle becomes unavoidable under many labels.',
      },
      {
        id: 'combinatorial-search',
        title: 'Combinatorial search limits',
        domain: 'complexity',
        blurb: 'Illustrates how large search spaces can dodge structure until enormous size.',
      },
    ],
    demoId: 'ramsey',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Erdős problems',
        href: 'https://www.erdosproblems.com/',
      },
    ],
  },
  {
    id: 'extremal',
    importance: 15,
    series: 'astra' as const,
    when: 'Aug 2026',
    title: 'Compactness & degeneracy counterexamples',
    field: 'Extremal graph theory',
    glance: 'Two tidy conjectures about sparse / degenerate graphs fail — explicit counterexamples.',
    plain: {
      what: 'Extremal graph theory studies how dense a graph can be while avoiding a pattern. Astra gives counterexamples to compactness and degeneracy conjectures, resolving Erdős problems 146 and 180.',
      whyItMatters:
        'Conjectures that fail change which sparsity heuristics you can trust when designing networks or analyzing large graphs.',
      result:
        'Separate counterexamples refuting compactness and degeneracy conjectures (Erdős 146 & 180).',
    },
    deep: {
      statement:
        'Results on the compactness and degeneracy conjectures in extremal graph theory resolve Erdős problems 146 and 180 via counterexamples.',
      notes: [
        'Shows local-to-global compactness hopes and degeneracy heuristics can fail.',
        'Chapter 10 of the ten-proofs manuscript.',
      ],
      jargon: [
        {
          term: 'Degeneracy',
          def: 'A sparsity measure: every subgraph has a vertex of small degree.',
        },
        {
          term: 'Compactness (extremal)',
          def: 'Hope that global extremal behavior is controlled by finite / local checks.',
        },
      ],
    },
    applications: [
      {
        id: 'network-design',
        title: 'Network design caution',
        domain: 'networks',
        blurb: 'Do not assume local sparsity rules always lift to the whole graph.',
      },
      {
        id: 'sparse-limits',
        title: 'Sparse-graph algorithms',
        domain: 'networks',
        blurb: 'Counterexamples mark where degeneracy-based shortcuts break.',
      },
    ],
    demoId: 'extremal',
    sources: [
      {
        label: 'OpenAI announcement',
        href: 'https://openai.com/index/ten-advances-in-mathematics/',
      },
      {
        label: 'Erdős problems',
        href: 'https://www.erdosproblems.com/',
      },
    ],
  },
]
