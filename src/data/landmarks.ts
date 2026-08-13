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
      'An 87-year-old invertibility guess dies in three dimensions and above — with a tiny explicit map.',
    discoveredBy: { kind: 'claude', label: 'Claude Fable 5' },
    plain: {
      what: 'The old guess said: if a polynomial map from complex n-space to itself has a constant nonzero “stretch factor,” then it must have a polynomial inverse. In July 2026, Levent Alpöge announced a tiny three-variable counterexample found with Claude Fable 5 — constant stretch factor, but two different inputs share an output, so no inverse. Padding with unused coordinates kills the guess in every dimension 3 and up. The plane case is still open.',
      whyItMatters:
        'This was one of the most famous open problems about polynomial maps. A short, checkable counterexample resets decades of “maybe it’s true in all dimensions” intuition and focuses the open case on the plane.',
      result:
        'An explicit three-variable polynomial map with constant nonzero stretch factor that is not one-to-one — so the conjecture is false for all dimensions 3 and up.',
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
        title: 'Polynomial maps & invertibility',
        domain: 'geometry',
        blurb: 'Polynomial maps in 3+ dimensions can look invertible and still collide.',
        detail:
          'Geometers and computer-algebra users often ask when a polynomial change of coordinates has a polynomial inverse — a clean “undo” button. For decades, a constant nonzero stretch factor looked like a promising shortcut to that answer in every dimension. The counterexample kills that shortcut above the plane: constant stretch no longer guarantees a unique inverse, so tools and proofs that leaned on the old hope need a different test.',
        commercial:
          'Computer-algebra vendors (Mathematica, Maple, and open-source rivals with paid support) sell symbolic invertibility and change-of-coordinate tooling. Their invertibility checks can no longer lean on the dead shortcut — an update they can now advertise as machine-verified.',
      },
      {
        id: 'cas-search',
        title: 'Computer-algebra search',
        domain: 'complexity',
        blurb: 'Tiny counterexamples can hide in huge spaces of polynomial maps.',
        detail:
          'Finding the three-variable map meant searching a vast space of coefficients for a short witness that humans had missed for decades. That is a template for hard search: the “interesting” object can be tiny while the search space is enormous. It nudges tool-builders to mix clever prompting, machine search, and machine-checked verification rather than assuming short answers are easy to spot by hand.',
        commercial:
          'AI-for-math companies sell exactly this loop — model-driven search plus machine-checked verification — and a famous 87-year-old scalp is their best sales demo. Expect it in every pitch deck for verified-reasoning tooling.',
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
      'You can pack more equal lengths among n points than Erdős thought — a real polynomial improvement.',
    discoveredBy: { kind: 'openai', label: 'OpenAI (internal)' },
    plain: {
      what: 'Erdős asked how many pairs among n points in the plane can sit at distance exactly 1. He guessed the count stays barely above linear in n. In May 2026 an internal OpenAI model found infinite families with a lasting power-law boost above linear. Human writeups later made the boost explicit (about n to the 1.014).',
      whyItMatters:
        'This is one of the most famous problems in combinatorial geometry. Beating the old grid-style constructions was widely unexpected.',
      result:
        'Infinite families of n-point sets with more than n^{1+δ} equal-length pairs for a fixed positive δ (later sharpened to about 0.014).',
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
        title: 'Fixed-range point networks',
        domain: 'networks',
        blurb: 'Equal-distance pairs can be denser among planar points than old guesses allowed.',
        detail:
          'Think of sensors, radio links, or robots that care about a fixed range: how many pairs among n points can sit at that exact distance? The old Erdős guess said “barely more than linear.” The new constructions show a lasting power-law boost is possible, so planners and theorists cannot treat near-linear as the extremal story. Upper bounds still exist, but the floor on “how crowded equal ranges can get” moved up.',
        commercial:
          'Planning software for fixed-range radios, sensor grids, and drone swarms prices in how many exact-range pairs can coexist. The new density floor feeds those worst-case interference and capacity models — a quiet input, not a shipped feature.',
      },
      {
        id: 'discrete-geom-apps',
        title: 'Extremal distance graphs',
        domain: 'geometry',
        blurb: 'Revises how dense equal-length graphs can be in the plane.',
        detail:
          'Discrete geometers use unit-distance graphs as a basic stress test for point configurations. Beating the old constructions forces rewritten intuition about extremal examples and which algebraic tricks can create many equal lengths. Later work that cites unit-distance bounds now has a higher constructive baseline to compare against.',
        commercial:
          'No direct product yet. The nearest commercial edge is computational-geometry libraries and layout tools whose worst-case guarantees quote distance-graph bounds.',
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
      'Major progress on thin 3D sets that still point every way — Fields Medal 2026.',
    discoveredBy: { kind: 'human', label: 'Hong Wang' },
    plain: {
      what: 'Imagine a set that contains a unit needle in every direction. How small can its volume be? Hong Wang’s work (recognized with a 2026 Fields Medal) made major advances on that question in three dimensions, along with related problems about distances and how waves concentrate.',
      whyItMatters:
        'These questions sit at the heart of modern harmonic analysis and connect to wave equations and geometric measure theory. Progress reshapes what “thin but direction-rich” sets can look like.',
      result:
        'Major advances on the 3D needle-in-every-direction problem and related wave / distance techniques (Fields Medal, ICM 2026).',
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
        title: 'Waves & imaging estimates',
        domain: 'analysis',
        blurb: 'Tools that control waves also sharpen PDE and imaging bounds.',
        detail:
          'Local smoothing and Fourier restriction estimates feed into wave equations and imaging: how energy concentrates, how singularities propagate, and what resolution you can hope for. Wang’s program advances those analytic levers, so researchers modeling waves or reconstructing from limited measurements inherit sharper structural bounds — not a new consumer scanner overnight, but better math under the hood.',
        commercial:
          'Upstream R&D for industries that pay for resolution: medical ultrasound, seismic imaging in energy exploration, and radar. Sharper wave-concentration estimates shape what reconstruction guarantees those vendors can honestly claim.',
      },
      {
        id: 'gmt',
        title: 'Thin sets that point every way',
        domain: 'geometry',
        blurb: 'Limits how small a set can be while still covering every direction.',
        detail:
          'Kakeya-type questions ask how thin a set can be while still containing a needle in every direction. That geometry sits next to geometric measure theory and distance problems. Progress redraws what “thin but direction-rich” can look like in three dimensions, which cascades into related packing, distance, and fractal questions mathematicians use as benchmarks.',
        commercial:
          'Little direct commercial use — this is core research infrastructure. Its value reaches industry indirectly, through the wave and imaging estimates above.',
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
      'A “tame geometry” toolkit becomes a workhorse for algebraicity theorems — Fields Medal 2026.',
    discoveredBy: { kind: 'human', label: 'Jacob Tsimerman' },
    plain: {
      what: 'Jacob Tsimerman’s program made a tame real-geometry toolkit a core method in number theory and complex geometry. It played a decisive role in proving when certain “special” points and period images must be algebraic, including key cases of long-open algebraicity conjectures.',
      whyItMatters:
        'These results control when special points and period images stay algebraic — deep structure in moduli spaces that number theorists and geometers both need.',
      result:
        'Tame geometry recast as a fundamental method; central algebraicity conjectures settled in key cases (Fields citation).',
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
        title: 'Special points on moduli spaces',
        domain: 'number-theory',
        blurb: 'Tells when arithmetic “special” loci must be algebraic, not wild.',
        detail:
          'Number theorists study moduli spaces that package families of geometric objects and ask which special points stay algebraic. Tame-geometry methods give a workhorse for proving those algebraicity statements in key cases. Practically, that means clearer predictions about which arithmetic loci behave rigidly — and fewer places where transcendental chaos was still plausible.',
        commercial:
          'Mostly pre-commercial. The nearest edge is computational number theory software (Magma licenses, SageMath support) and crypto research labs that compute with special points on elliptic-curve moduli.',
      },
      {
        id: 'period-maps',
        title: 'Period maps & Hodge data',
        domain: 'geometry',
        blurb: 'Organizes when period images stay algebraic.',
        detail:
          'Period maps package Hodge-theoretic data about families of varieties. Knowing when their images are algebraic is a structural filter for geometers: which data can be captured by algebraic equations, and which cannot. The tame-geometry toolkit turned those filters into theorems in central cases, tightening how researchers classify and compute with that data.',
        commercial:
          'No direct commercial use today — this is classification infrastructure for pure geometry. Honest answer: the payoff horizon is measured in decades, not quarters.',
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
      'A new framework advances Gauss-inspired questions about typical number-field behavior.',
    discoveredBy: { kind: 'human', label: 'Human research' },
    plain: {
      what: 'Inspired by Gauss, number theorists have long guessed how “typical” number fields behave — especially how often unique factorization fails. Aaron Landesman and Ishan Levy developed a new framework that goes a long way toward proving those average statistics, and proved related statements in the function-field setting.',
      whyItMatters:
        'Average predictions for number fields guide what “random” arithmetic looks like — with echoes in cryptography and computational number theory.',
      result:
        'A new framework toward the classic average class-group guesses, plus function-field proofs of related statistical conjectures (reported Aug 2026).',
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
        {
          term: 'Poonen–Rains / Malle',
          def: 'Related conjectures about average Galois and Selmer-type statistics; function-field cases proved in this work.',
        },
      ],
    },
    applications: [
      {
        id: 'random-fields',
        title: 'Typical number fields',
        domain: 'number-theory',
        blurb: 'Predicts how class groups behave for a “random” number field.',
        detail:
          'When you sample many number fields, how often does unique factorization fail, and how large are the class groups? Cohen–Lenstra-style averages are the standard guess. A stronger framework toward those averages (and related function-field proofs) gives mathematicians a firmer picture of typical arithmetic — the baseline they compare rare examples against.',
        commercial:
          'Average-case class-group behavior feeds parameter choices in number-theoretic cryptography — the kind of analysis standards bodies and security consultancies pay specialists to produce.',
      },
      {
        id: 'crypto-nt',
        title: 'Computational number theory',
        domain: 'crypto',
        blurb: 'Average-case field structure guides hardness and algorithm intuition.',
        detail:
          'Cryptographers and computational number theorists care about average-case structure: what happens for typical inputs, not only worst-case monsters. Better statistical control of class groups and related Galois data informs which algorithms look promising and which hardness stories are plausible. This is guidance for research design, not a drop-in cipher change.',
        commercial:
          'Cryptanalysis teams and HSM vendors track average-case structure results when judging which number-theoretic assumptions are safe to build products on. This sharpens that judgment; it does not change any shipped cipher.',
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
      'A factorial-divisibility Erdős puzzle solved by GPT-5.2 Pro + Lean with no prior paper.',
    discoveredBy: { kind: 'openai', label: 'GPT-5.2 Pro + Lean' },
    plain: {
      what: 'Erdős problem #728 asks whether certain factorial divisibility patterns can leave a logarithmic-sized gap infinitely often. In January 2026, GPT-5.2 Pro produced a proof that Harmonic’s Aristotle checked in Lean — widely regarded as the first Erdős problem fully resolved by AI without looking up an old paper.',
      whyItMatters:
        'Mathematically moderate, historically huge: it marks a shift from “AI finds old papers” to “AI writes new checkable proofs.” Terence Tao emphasized speed and autonomy over raw difficulty.',
      result:
        'Infinitely many triples of sizes where the factorial divisibility holds with a logarithmic-sized gap in the middle — under natural size constraints.',
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
        title: 'AI → Lean proof pipelines',
        domain: 'foundations',
        blurb: 'A working template: AI draft, machine check, then human writeup.',
        detail:
          'The #728 pipeline — model draft, Lean certificate, human exposition — is a reusable pattern for research tooling. Teams building theorem-proving stacks can treat it as a reference: clarify the statement, demand a kernel check, then simplify for humans. The math difficulty is moderate; the process lesson is the lasting application.',
        commercial:
          'Verified proof pipelines are already a business: Harmonic sells Aristotle, and chip, avionics, and crypto firms pay for machine-checked correctness. #728 is that market’s public proof-of-concept.',
      },
      {
        id: 'factorial-div',
        title: 'Factorial divisibility gaps',
        domain: 'number-theory',
        blurb: 'Shows logarithmic gaps can recur in factorial divisibility patterns.',
        detail:
          'Combinatorial number theory cares how often factorial and binomial divisibility constraints leave room in the middle. The result pins down an infinite family with a logarithmic-sized gap under natural size constraints. That sharpens the landscape of related Erdős-style questions about how sparse or dense such patterns can be.',
        commercial:
          'Essentially none — the divisibility result itself is a curiosity. The commercial story of #728 is the proof pipeline, not the theorem.',
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
      'Particle-to-fluid derivations and curve-counting geometry recognized at ICM 2026.',
    discoveredBy: { kind: 'human', label: 'Deng & Pardon' },
    plain: {
      what: 'Yu Deng earned a Fields Medal for rigorous bridges from microscopic particle systems to continuum kinetic equations and related wave models. John Pardon was recognized for rebuilding foundations that count curves in symplectic geometry, plus topology results on 3-manifolds and knots.',
      whyItMatters:
        'These are multi-year structural programs: Deng bridges atoms to continuum equations; Pardon rebuilds tools for counting curves and geometric invariants.',
      result:
        'Fields Medals (Jul 2026) for Deng’s kinetic PDE work and Pardon’s symplectic geometry and topology.',
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
        title: 'Particles to fluid equations',
        domain: 'analysis',
        blurb: 'Justifies continuum kinetic equations from microscopic particle models.',
        detail:
          'Kinetic theory asks when a cloud of colliding particles is well described by continuum equations like Boltzmann. Deng’s program supplies rigorous bridges from hard-sphere dynamics and related wave models to those equations. Modelers in math and physics get a clearer warrant for when the continuum approximation is more than a convenient fiction.',
        commercial:
          'Kinetic and rarefied-gas solvers are commercial software in aerospace (re-entry, satellites), semiconductor vacuum processing, and plasma equipment. Rigorous derivations tell those vendors when their continuum models are trustworthy — and when they are not.',
      },
      {
        id: 'symplectic-invariants',
        title: 'Counting curves in geometry',
        domain: 'geometry',
        blurb: 'Rebuilds tools that count curves and feed topological invariants.',
        detail:
          'Symplectic geometers count holomorphic curves to build invariants used across geometry and topology. Pardon’s foundational work (virtual cycles, Fukaya categories, and related topology) makes those counts more reliable and usable. The application is to research infrastructure: better foundations for the invariants others compute with.',
        commercial:
          'No direct product — this is foundations for the geometry that theoretical physics and topology tooling build on. Any commercial payoff routes through those fields first.',
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
