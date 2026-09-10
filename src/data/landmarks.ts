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
    lean: {
      label: 'Lean 4 counterexample (Mathlib PR)',
      href: 'https://github.com/leanprover-community/mathlib4/pull/42116',
    },
    sources: [
      {
        label: 'Jacobian explained',
        href: 'https://jacobianfun.org/jacobian-explained',
      },
      {
        label: 'ScienceDaily summary',
        href: 'http://www.sciencedaily.com/releases/2026/08/260804034634.htm',
      },
      {
        label: 'Independent Lean verify (Zenodo)',
        href: 'https://zenodo.org/records/21514514',
      },
    ],
  },
  {
    id: 'flt-formalization',
    importance: 2,
    series: 'landmark',
    when: 'Sep 2026',
    title: 'Fermat’s Last Theorem formalized in Lean',
    field: 'Number theory / formal methods',
    glance:
      'Wiles–Taylor’s proof of FLT becomes a 13-million-line, kernel-checked Lean artifact — in eleven days.',
    discoveredBy: { kind: 'claude', label: 'Claude (Prove2Me / Fable-class)' },
    plain: {
      what: 'Fermat’s Last Theorem — no positive integers a, b, c satisfy aⁿ + bⁿ = cⁿ for n > 2 — was proved by Wiles and Taylor in the 1990s. Turning that argument into a form a computer can check was expected to take years. In September 2026 Anthropic reported that Claude, driven through the Prove2Me multi-agent harness, produced the first end-to-end Lean formalization in about eleven days: roughly 13 million lines and tens of thousands of intermediate theorems.',
      whyItMatters:
        'This is a verification milestone, not a new mathematical idea. As AI systems emit more purported proofs, autoformalization is how the community keeps trust without waiting years of human referee time. FLT is the stress test that shows the pipeline can swallow a modern, deep argument.',
      result:
        'A public Lean 4 development that proves Mathlib’s statement of FLT from Lean’s three standard axioms, with comparator and independent-kernel checks reported by the authors — still not a substitute for human-readable exposition.',
    },
    deep: {
      statement:
        'There do not exist positive integers a, b, c and an integer n > 2 such that aⁿ + bⁿ = cⁿ. The formalization follows a Darmon–Diamond–Taylor presentation of the Wiles–Taylor modularity argument and is checked in Lean 4.',
      notes: [
        'Announced by Anthropic (4 Sep 2026); human direction by Tianyi Peng and collaborators; mathematical credit remains with Wiles, Taylor, and the classical chain (Frey, Serre, Ribet, Mazur, Langlands–Tunnell, …).',
        'Authors report kernel check, Mathlib-statement comparator, and nanoda re-check; the release claims no sorry / native_decide in the proved tree. Peer review and community digestion of the mega-artifact are ongoing.',
        'Trail of Bits separately showed a Lean model/runtime string-extract bug that can fake FLT via native_decide on older toolchains — a reminder to read axioms, not headlines.',
      ],
      jargon: [
        {
          term: 'Autoformalization',
          def: 'Translating a human mathematical argument into a proof-assistant script a kernel can check.',
        },
        {
          term: 'Comparator',
          def: 'A check that the proved theorem statement matches a trusted target (here Mathlib’s FLT) rather than a quieter substitute.',
        },
      ],
    },
    applications: [
      {
        id: 'referee-load',
        title: 'Referee load & trust pipelines',
        domain: 'foundations',
        blurb: 'Machine-checked formalizations can shrink the human cost of trusting long proofs.',
        detail:
          'Journals and arXiv-scale AI output collide: reading every line of a megaproof is impossible. A Lean certificate does not replace exposition, but it can certify that a claimed theorem follows from stated axioms once the statement is pinned. FLT shows that scale is no longer a hard stop for that pipeline.',
        commercial:
          'Proof-assistant vendors, formal-methods consultancies, and AI-for-math platforms sell “checkable by default” workflows. A famous theorem done end-to-end is the demo that closes enterprise and grant pitches.',
      },
      {
        id: 'agent-harness',
        title: 'Multi-agent proof harnesses',
        domain: 'complexity',
        blurb: 'Coordinated agents plus a theorem DAG beat a single long chat for huge formalizations.',
        detail:
          'Prove2Me kept a DAG of obligations so many Claude agents could claim lemmas without losing the campaign state. That pattern — shared plan graph, separated statements vs proofs, search over natural-language lemma glosses — is reusable beyond FLT.',
        commercial:
          'Agent-orchestration and scientific-workflow vendors can productize the harness: billed token campaigns with a kernel gate at the end, sold to labs that cannot staff a ten-year formalization team.',
      },
    ],
    demoId: 'flt-formalization',
    lean: {
      label: 'anthropics/fermats-last-theorem',
      href: 'https://github.com/anthropics/fermats-last-theorem',
    },
    sources: [
      {
        label: 'Anthropic — Formalizing FLT',
        href: 'https://www.anthropic.com/research/formalizing-fermats-last-theorem',
      },
      {
        label: 'Nature news',
        href: 'https://www.nature.com/articles/d41586-026-02822-9',
      },
      {
        label: 'Trail of Bits — Lean native_decide caveat',
        href: 'https://blog.trailofbits.com/2026/09/09/a-proof-of-fermats-last-theorem-that-fits-the-margin/',
      },
    ],
  },
  {
    id: 'riemann-zeros',
    importance: 3,
    series: 'landmark',
    when: 'Aug 2026',
    title: 'More than 2/3 of zeta zeros on the critical line',
    field: 'Analytic number theory',
    glance:
      'Unconditionally, over two-thirds of nontrivial zeta zeros are simple and on the critical line — with a Lean check.',
    discoveredBy: { kind: 'claude', label: 'Claude (Alpöge–Furman verify)' },
    plain: {
      what: 'The Riemann hypothesis says every important zero of the zeta function sits on one vertical line. Nobody has proved that for all zeros, but one can still ask what fraction must already be on the line. In August 2026 an Anthropic research Claude run produced an argument — verified by Alpöge and Furman and formalized in Lean — that more than two-thirds of the nontrivial zeros are simple and on the critical line, and at least five-sixths are distinct. A shorter human rewrite followed in early September.',
      whyItMatters:
        'This is the strongest unconditional “most zeros are well-behaved” theorem of its kind, and it removes a classical reliance on assuming RH inside Montgomery-style pair-correlation arguments. The full hypothesis stays open; the partial scoreboard just jumped.',
      result:
        'As T → ∞, at least 2/3 − o(1) of zeros up to height T are simple and on Re(s)=1/2 (about 67.25% with the Montgomery–Taylor window), and at least 5/6 − o(1) are distinct (~83.62% with that window).',
    },
    deep: {
      statement:
        'Unconditionally, N₀ˢ(T,2T) ≥ (2/3 − o(1)) N(T,2T) and Nᵈ(T,2T) ≥ (5/6 − o(1)) N(T,2T); with the Montgomery–Taylor window the constants improve to ≈0.6725 and ≈0.8362. The argument replaces RH-dependent positivity by a rank–trace / inertia bound on a compression of Weil’s Hermitian form.',
      notes: [
        'AI-authored argument verified by Alpöge and Furman; Lean 4 formalization in anthropics/formal-math (zeta23/). github.com/anthropics/zeta-23-lean redirects there.',
        'A conceptually shorter proof appears as arXiv:2609.02882 (2 Sep 2026).',
        'Previous unconditional records were far weaker (~41.7% on the line in classical Levinson–Conrey-style counts; ~66% distinct in prior work). This is progress toward RH, not a proof of RH.',
        'Related open problem entry: Riemann hypothesis remains a Clay Millennium Problem.',
      ],
      jargon: [
        {
          term: 'Critical line',
          def: 'The line Re(s) = 1/2 where RH places all nontrivial zeros of ζ.',
        },
        {
          term: 'Pair correlation',
          def: 'Montgomery’s statistical model for spacings of zeta zeros; classical deductions often assumed RH to read sums as positive.',
        },
      ],
    },
    applications: [
      {
        id: 'prime-error',
        title: 'Prime-counting error terms',
        domain: 'number-theory',
        blurb: 'More zeros pinned to the line tightens average-case control on primes.',
        detail:
          'Zero-free and zero-density information feeds error terms in the prime-number theorem and related averages. Knowing a large explicit fraction of zeros are simple and on the line strengthens unconditional analytic number theory even while RH itself stays open.',
        commercial:
          'Mostly research infrastructure — CAS libraries, cryptographic parameter reviews, and academic tooling — rather than a consumer product. Vendors of high-assurance math libraries can still cite the Lean artifact as a trust badge.',
      },
      {
        id: 'rh-scoreboard',
        title: 'RH progress scoreboard',
        domain: 'foundations',
        blurb: 'Partial unconditional theorems keep the Millennium problem honest and measurable.',
        detail:
          'Public “progress toward RH” claims are easy to hype. A quantified fraction with a Lean certificate is a scoreboard the community can audit, and it pairs cleanly with the still-open full conjecture in the open-problems catalog.',
        commercial:
          'Science-communication and AI-lab brand value: a measurable RH-adjacent win without claiming the million-dollar prize.',
      },
    ],
    demoId: 'riemann-zeros',
    lean: {
      label: 'anthropics/formal-math · zeta23',
      href: 'https://github.com/anthropics/formal-math/tree/main/zeta23',
    },
    sources: [
      {
        label: 'arXiv:2608.13637',
        href: 'https://arxiv.org/abs/2608.13637',
      },
      {
        label: 'Shorter proof arXiv:2609.02882',
        href: 'https://arxiv.org/abs/2609.02882',
      },
      {
        label: 'Lean certificate (zeta23)',
        href: 'https://github.com/anthropics/formal-math/tree/main/zeta23',
      },
    ],
  },
  {
    id: 'erdos-1196',
    importance: 18,
    series: 'landmark',
    when: 'May 2026',
    title: 'Erdős #1196 — primitive sets above x',
    field: 'Number theory / combinatorics',
    glance:
      'Every primitive set of large integers has a bounded reciprocal-log weight — proved, digested, and Lean-checked.',
    discoveredBy: { kind: 'openai', label: 'GPT-5.4 Pro (Price) + Math Inc. Lean' },
    plain: {
      what: 'A primitive set of integers is one where no element divides another. Erdős, Sárközy, and Szemerédi asked whether every primitive set made of integers at least x has reciprocal-log weight at most 1 + o(1) as x grows. In 2026 an AI-assisted proof (GPT-5.4 Pro prompted by Liam Price, then refined with Tao and coauthors) settled a sharp form of the conjecture; Math Inc. formalized the main bound in Lean.',
      whyItMatters:
        'It closes a 1960s conjecture in the Erdős catalog and showcases the new loop: model draft → human digestion → machine-checked certificate. It sits beside Erdős #728 as another autonomous-AI-to-Lean story, this time in multiplicative number theory.',
      result:
        'For every primitive A ⊆ ℕ ∩ [x, ∞), ∑_{a∈A} 1/(a log a) ≤ 1 + O(1/log x) as x → ∞, implying the original 1+o(1) conjecture.',
    },
    deep: {
      statement:
        'Every primitive set supported on [x, ∞) satisfies ∑ 1/(a log a) ≤ 1 + O(1/log x). The argument develops a downwards von Mangoldt Markov chain on the divisibility poset; see Alexeev–Barreto–Li–Lichtman–Price–Shah–Tang–Tao.',
      notes: [
        'Listed PROVED (LEAN) on erdosproblems.com/#1196. Formalization: math-inc/Erdos1196 (PrimitiveSetsAboveX.mainTheorem).',
        'Human “digestion” paper on arXiv:2605.00301 and Tao’s blog explain the Markov-chain viewpoint after the AI draft.',
        'Related: Erdős #728 in this catalog (factorial divisibility gaps).',
      ],
      jargon: [
        {
          term: 'Primitive set',
          def: 'A set of positive integers in which no element divides another distinct element.',
        },
        {
          term: 'von Mangoldt chain',
          def: 'A Markov chain on the divisibility poset with visit weights tied to Λ(n)/n-type factors, used to control reciprocal-log sums.',
        },
      ],
    },
    applications: [
      {
        id: 'multiplicative-sets',
        title: 'Structure of multiplicative sets',
        domain: 'number-theory',
        blurb: 'Sharp weight bounds control how dense “no-one-divides-another” sets can be.',
        detail:
          'Primitive sets appear wherever divisibility forbids chains — sieve theory, dense multiplicative bases, and combinatorial number theory. A clean asymptotic weight cap is a reusable lemma for those arguments.',
        commercial:
          'Narrow commercial edge: research libraries and educational CAS demos. The sellable artifact is the AI→Lean pipeline story more than a product feature.',
      },
      {
        id: 'erdos-pipeline',
        title: 'Erdős-catalog AI pipelines',
        domain: 'foundations',
        blurb: 'Another catalog problem with a public Lean bridge theorem.',
        detail:
          'Open problem lists become agent curricula. #1196 shows a full loop: model proof, expert rewrite, formal-conjectures-shaped Lean theorem. That loop is what labs productize next.',
        commercial:
          'Same buyers as other formal-proof pipelines — AI labs and proof-assistant platforms packaging “Erdős problem resolved + certificate” case studies.',
      },
    ],
    demoId: 'erdos-1196',
    lean: {
      label: 'math-inc/Erdos1196',
      href: 'https://github.com/math-inc/Erdos1196',
    },
    sources: [
      {
        label: 'Erdős Problems #1196',
        href: 'https://www.erdosproblems.com/1196',
      },
      {
        label: 'arXiv:2605.00301',
        href: 'https://arxiv.org/abs/2605.00301',
      },
      {
        label: 'Tao blog — digestion',
        href: 'https://terrytao.wordpress.com/2026/05/03/primitive-sets-and-von-mangoldt-chains-erdos-problem-1196-and-beyond/',
      },
    ],
  },
  {
    id: 'unit-distance',
    importance: 6,
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
    importance: 7,
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
    importance: 8,
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
    importance: 9,
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
    importance: 19,
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
    importance: 20,
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
