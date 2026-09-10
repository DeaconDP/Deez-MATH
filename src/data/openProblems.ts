import type { OpenProblem } from './types'

export type { OpenProblem, OpenProblemPrize } from './types'

/** Famous unsolved problems, sorted by importance (1 = highest). */
export const openProblems: OpenProblem[] = [
  {
    id: 'riemann',
    importance: 1,
    title: 'Riemann hypothesis',
    field: 'Number theory',
    prize: 'millennium' as const,
    glance: 'Do the special zeros that control primes all sit on one straight line?',
    plain: {
      what: 'A special complex function encodes how primes are spaced. Riemann guessed that its important zeros all sit on one vertical line. Billions of zeros have been checked; a proof (or a counterexample) is still missing.',
      whyItMatters:
        'A proof would lock in sharp error terms for counting primes and reshape large parts of number theory. Many theorems today assume the guess and would become unconditional.',
      status:
        'Still open as a full statement — Clay Millennium Prize ($1M). Aug 2026 breakthrough (see related advance): unconditionally more than two-thirds of nontrivial zeros are simple and on the critical line, with a Lean-checked argument. That is major partial progress, not a proof of RH.',
    },
    deep: {
      statement:
        'Every nontrivial zero of the Riemann zeta function ζ(s) has real part equal to 1/2.',
      notes: [
        'Trivial zeros at negative even integers are well understood; the conjecture concerns zeros in the critical strip 0 < Re(s) < 1.',
        'Equivalent formulations exist via the Liouville function, Möbius sums, and random-matrix statistics of zeros.',
        'Clay Millennium Prize Problem; see Clay Math Institute statement.',
        'Related 2026 advance: >2/3 of zeros simple and on the line (Alpöge–Furman / Claude; arXiv:2608.13637).',
      ],
      jargon: [
        {
          term: 'Zeta function',
          def: 'ζ(s) = ∑ n^{-s} (for Re(s) > 1), analytically continued to a meromorphic function on ℂ.',
        },
        {
          term: 'Critical line',
          def: 'The line Re(s) = 1/2 in the complex plane where RH places all nontrivial zeros.',
        },
      ],
    },
    relatedBreakthroughId: 'riemann-zeros',
    sources: [
      {
        label: 'Clay Math — Riemann hypothesis',
        href: 'https://www.claymath.org/millennium/riemann-hypothesis/',
      },
      {
        label: 'arXiv:2608.13637 — >2/3 on the line',
        href: 'https://arxiv.org/abs/2608.13637',
      },
      {
        label: 'Wikipedia — Riemann hypothesis',
        href: 'https://en.wikipedia.org/wiki/Riemann_hypothesis',
      },
    ],
  },
  {
    id: 'p-vs-np',
    importance: 2,
    title: 'P versus NP',
    field: 'Complexity theory',
    prize: 'millennium' as const,
    glance: 'If a yes/no answer is easy to check, is it also easy to find?',
    plain: {
      what: 'Some problems computers can solve quickly. Others only promise that a proposed answer can be checked quickly. Almost everyone expects those two classes to differ — hard search should stay hard — but nobody has proved the split (or a collapse).',
      whyItMatters:
        'Cryptography, scheduling, and countless “find the needle” tasks lean on the belief that checking is easier than solving. Settling this would rewrite theoretical computer science and practical security assumptions.',
      status:
        'Still open. Clay Millennium Prize Problem. Almost all experts guess the two classes differ; no accepted proof either way.',
    },
    deep: {
      statement:
        'Is P = NP? Equivalently: does every language decidable in nondeterministic polynomial time also lie in deterministic polynomial time?',
      notes: [
        'NP-complete problems (SAT, TSP decision versions, etc.) are polynomial-time equivalent for the P vs NP question.',
        'Barriers (relativization, natural proofs, algebrization) block many proof strategies.',
        'Clay Millennium Prize Problem.',
      ],
      jargon: [
        {
          term: 'P',
          def: 'Languages decidable by a deterministic Turing machine in time polynomial in the input size.',
        },
        {
          term: 'NP',
          def: 'Languages with short, efficiently verifiable certificates for yes-instances.',
        },
      ],
    },
    sources: [
      {
        label: 'Clay Math — P vs NP',
        href: 'https://www.claymath.org/millennium/p-vs-np/',
      },
      {
        label: 'Wikipedia — P versus NP',
        href: 'https://en.wikipedia.org/wiki/P_versus_NP_problem',
      },
    ],
  },
  {
    id: 'navier-stokes',
    importance: 3,
    title: 'Navier–Stokes existence and smoothness',
    field: 'Analysis & PDE',
    prize: 'millennium' as const,
    glance: 'Do the equations for sticky fluids always stay smooth in 3D?',
    plain: {
      what: 'The Navier–Stokes equations model how sticky fluids move. In three dimensions we still do not know whether a smooth starting flow always stays smooth forever, or whether it can “blow up” into a singularity.',
      whyItMatters:
        'These equations underpin weather, aircraft design, and blood flow models. A blow-up would mean the continuum model fails at some scale; forever-smooth solutions would underwrite a century of applied use.',
      status:
        'Still open in 3D (Clay formulation). The 2D story is settled; 3D has partial and conditional results only.',
    },
    deep: {
      statement:
        'For the 3D incompressible Navier–Stokes equations on ℝ³ (or the torus), do smooth, divergence-free initial data of finite energy always yield a unique smooth solution for all positive times?',
      notes: [
        'Clay asks for a proof of global regularity or a finite-time blow-up example under specified conditions.',
        'Weak solutions (Leray) exist; uniqueness and smoothness are the hard parts.',
        'Clay Millennium Prize Problem.',
      ],
      jargon: [
        {
          term: 'Incompressible',
          def: 'Density is constant; the velocity field is divergence-free (∇ · u = 0).',
        },
        {
          term: 'Blow-up',
          def: 'A solution whose derivatives become unbounded in finite time.',
        },
      ],
    },
    sources: [
      {
        label: 'Clay Math — Navier–Stokes',
        href: 'https://www.claymath.org/millennium/navier-stokes-equation/',
      },
      {
        label: 'Wikipedia — Navier–Stokes existence and smoothness',
        href: 'https://en.wikipedia.org/wiki/Navier%E2%80%93Stokes_existence_and_smoothness',
      },
    ],
  },
  {
    id: 'yang-mills',
    importance: 4,
    title: 'Yang–Mills existence and mass gap',
    field: 'Mathematical physics',
    prize: 'millennium' as const,
    glance: 'Can the math of nuclear forces be built rigorously — with a lowest particle mass?',
    plain: {
      what: 'Yang–Mills theory is the math behind the strong and weak nuclear forces. Physicists use it daily; mathematicians still lack a fully rigorous 4D construction that proves a strictly positive lowest particle mass (a “mass gap”).',
      whyItMatters:
        'A solution would put the Standard Model’s force theories on firm axiomatic ground and explain why the strong force has a mass gap (no free massless gluons in nature).',
      status:
        'Still open. Clay Millennium Prize Problem. Physics and lattice simulations support a mass gap; a mathematical existence proof is missing.',
    },
    deep: {
      statement:
        'Prove that for any compact simple gauge group G, a nontrivial quantum Yang–Mills theory exists on ℝ⁴ and has a mass gap Δ > 0.',
      notes: [
        'Requires constructing a quantum field theory satisfying Wightman (or equivalent) axioms with the stated gap.',
        'Related to confinement and the spectrum of the Hamiltonian in QCD.',
        'Clay Millennium Prize Problem.',
      ],
      jargon: [
        {
          term: 'Mass gap',
          def: 'A positive lower bound on the mass of the lightest excitation above the vacuum.',
        },
        {
          term: 'Gauge group',
          def: 'The Lie group of local symmetries of the field theory (e.g. SU(3) for QCD).',
        },
      ],
    },
    sources: [
      {
        label: 'Clay Math — Yang–Mills',
        href: 'https://www.claymath.org/millennium/yang-mills-the-maths-of-the-strong-force/',
      },
      {
        label: 'Wikipedia — Yang–Mills existence and mass gap',
        href: 'https://en.wikipedia.org/wiki/Yang%E2%80%93Mills_existence_and_mass_gap',
      },
    ],
  },
  {
    id: 'bsd',
    importance: 5,
    title: 'Birch and Swinnerton-Dyer conjecture',
    field: 'Number theory',
    prize: 'millennium' as const,
    glance: 'Does the number of independent rational points on an elliptic curve match how flat a related formula is?',
    plain: {
      what: 'Elliptic curves are equations like y² = x³ + ax + b. Their rational points form a group, and “rank” counts how many independent infinite-order generators you need. The conjecture says that rank equals how flat a related analytic formula is at a special point.',
      whyItMatters:
        'It links algebra (points on curves) to analysis (those formulas). Proved cases already power cryptography intuition and arithmetic geometry; the full conjecture remains a North Star.',
      status:
        'Still open in general. Many low-rank cases are settled under extra hypotheses; higher rank is wide open. Clay Millennium Prize Problem.',
    },
    deep: {
      statement:
        'For an elliptic curve E/ℚ, the rank of E(ℚ) equals the order of vanishing of L(E, s) at s = 1; a full form also predicts the leading Taylor coefficient via Sha, periods, and Tamagawa numbers.',
      notes: [
        'Gross–Zagier, Kolyvagin, and later work settle many rank ≤ 1 cases.',
        'The Tate–Shafarevich group’s finiteness is entangled with the full conjecture.',
        'Clay Millennium Prize Problem.',
      ],
      jargon: [
        {
          term: 'Elliptic curve',
          def: 'A smooth genus-1 curve with a rational point; its rational points form an abelian group.',
        },
        {
          term: 'L-function',
          def: 'A complex function built from the curve’s reductions modulo primes; analytic continuation is known for elliptic curves over ℚ.',
        },
      ],
    },
    sources: [
      {
        label: 'Clay Math — Birch–Swinnerton-Dyer',
        href: 'https://www.claymath.org/millennium/birch-and-swinnerton-dyer-conjecture/',
      },
      {
        label: 'Wikipedia — Birch and Swinnerton-Dyer conjecture',
        href: 'https://en.wikipedia.org/wiki/Birch_and_Swinnerton-Dyer_conjecture',
      },
    ],
  },
  {
    id: 'hodge',
    importance: 6,
    title: 'Hodge conjecture',
    field: 'Algebraic geometry',
    prize: 'millennium' as const,
    glance: 'Do certain topological “shape labels” always come from real algebraic pieces?',
    plain: {
      what: 'Inside a complex geometric space, some topological labels look like they come from actual algebraic pieces cut out by equations. Hodge guessed that every rational label of the right type really does come from such pieces.',
      whyItMatters:
        'It is a bridge between topology/analysis and algebraic geometry. A proof would organize which shapes can be cut out by polynomial equations inside complicated spaces.',
      status:
        'Still open in general. Known in special cases (some low dimensions and restricted families). Clay Millennium Prize Problem.',
    },
    deep: {
      statement:
        'On a non-singular complex projective variety, every rational Hodge class is a rational linear combination of classes of algebraic cycles.',
      notes: [
        'The integral Hodge conjecture can fail; the Clay problem is the rational version.',
        'Closely related to motives and periods.',
        'Clay Millennium Prize Problem.',
      ],
      jargon: [
        {
          term: 'Hodge class',
          def: 'A cohomology class in H^{2k} that lies in the (k,k) piece of the Hodge decomposition.',
        },
        {
          term: 'Algebraic cycle',
          def: 'A formal combination of subvarieties — shapes cut out by polynomial equations.',
        },
      ],
    },
    sources: [
      {
        label: 'Clay Math — Hodge conjecture',
        href: 'https://www.claymath.org/millennium/hodge-conjecture/',
      },
      {
        label: 'Wikipedia — Hodge conjecture',
        href: 'https://en.wikipedia.org/wiki/Hodge_conjecture',
      },
    ],
  },
  {
    id: 'goldbach',
    importance: 7,
    title: 'Goldbach conjecture',
    field: 'Number theory',
    glance: 'Is every even integer greater than 2 the sum of two primes?',
    plain: {
      what: 'Christian Goldbach suggested (in modern form) that every even number bigger than 2 is two primes added together — 10 = 3+7, 28 = 11+17, and so on. Computers have checked enormous ranges; a proof for all even numbers is still missing.',
      whyItMatters:
        'It is one of the oldest easy-to-state prime puzzles. Near-miss theorems (every large even number is a prime plus a nearly-prime; every large odd is three primes) show how far “almost” versions have come.',
      status:
        'Still open for even numbers as two primes. The three-prime version for odds is proved. Verified by computer to very large bounds.',
    },
    deep: {
      statement:
        'Every even integer n > 2 can be written as p + q with primes p and q.',
      notes: [
        'Vinogradov / Helfgott settle the ternary (weak) Goldbach problem.',
        'Chen: every large even integer is p + P₂ (prime or semiprime).',
        'Not a Millennium Prize problem; famous for elementary statement vs deep difficulty.',
      ],
      jargon: [
        {
          term: 'Binary Goldbach',
          def: 'The even-number = two-primes form stated above.',
        },
        {
          term: 'Weak Goldbach',
          def: 'Every odd integer greater than 5 is a sum of three primes.',
        },
      ],
    },
    sources: [
      {
        label: 'Wikipedia — Goldbach conjecture',
        href: 'https://en.wikipedia.org/wiki/Goldbach%27s_conjecture',
      },
    ],
  },
  {
    id: 'twin-primes',
    importance: 8,
    title: 'Twin prime conjecture',
    field: 'Number theory',
    glance: 'Are there infinitely many prime pairs that differ by 2?',
    plain: {
      what: 'Primes that sit two apart — (3,5), (11,13), (17,19) — are twin primes. The conjecture says you never run out of them, no matter how far you go. We still lack a proof of infinitely many.',
      whyItMatters:
        'It is a flagship question about prime gaps. Recent breakthroughs show some bounded gaps keep appearing forever — but the exact gap-of-2 case remains open.',
      status:
        'Still open. Infinitely many prime pairs with gap at most 246 are known; gap exactly 2 is still unproved.',
    },
    deep: {
      statement:
        'There are infinitely many primes p such that p + 2 is also prime.',
      notes: [
        'Zhang (2013) proved liminf (p_{n+1} − p_n) < ∞; Polymath lowered the bound.',
        'Maynard–Tao methods give m-tuples of primes in bounded diameter under suitable admissible sets.',
        'Twin primes would follow from strong forms of Hardy–Littlewood conjectures.',
      ],
      jargon: [
        {
          term: 'Prime gap',
          def: 'The difference between consecutive primes.',
        },
        {
          term: 'Admissible tuple',
          def: 'A finite set of offsets that is not blocked from all being prime by a fixed modulus.',
        },
      ],
    },
    sources: [
      {
        label: 'Wikipedia — Twin prime',
        href: 'https://en.wikipedia.org/wiki/Twin_prime',
      },
    ],
  },
  {
    id: 'collatz',
    importance: 9,
    title: 'Collatz conjecture',
    field: 'Dynamical systems',
    glance: 'Does every positive integer eventually reach 1 under half-or-triple-plus-one?',
    plain: {
      what: 'Pick any positive integer. If it is even, halve it; if odd, replace it by 3n+1. Repeat. The Collatz conjecture says you always eventually hit the cycle 4 → 2 → 1. It is trivial to run and infamous to prove.',
      whyItMatters:
        'It is a stress test for reasoning about simple recursive processes. Huge computer checks and some “almost all numbers” results exist; a full proof would be a landmark.',
      status:
        'Still open. Verified for enormous starting values; some almost-all results; no complete proof.',
    },
    deep: {
      statement:
        'For every positive integer n, iterated application of T(n) = n/2 (n even) or 3n+1 (n odd) eventually reaches 1.',
      notes: [
        'Equivalent formulations use the accelerated map on odds only.',
        'Terras, Korec, and others prove almost-all integers have finite stopping time under various measures.',
        'Often cited as a problem that looks recreational but resists standard tools.',
      ],
      jargon: [
        {
          term: 'Hailstone sequence',
          def: 'The orbit of n under the Collatz map — values tend to rise and fall before descending.',
        },
        {
          term: 'Stopping time',
          def: 'Steps until the orbit first drops below the starting value (or reaches 1).',
        },
      ],
    },
    sources: [
      {
        label: 'Wikipedia — Collatz conjecture',
        href: 'https://en.wikipedia.org/wiki/Collatz_conjecture',
      },
    ],
  },
  {
    id: 'jacobian-dim-2',
    importance: 10,
    title: 'Jacobian conjecture (dimension 2)',
    field: 'Algebraic geometry',
    glance: 'In the plane, does a constant nonzero stretch factor still force a polynomial inverse?',
    plain: {
      what: 'The old invertibility guess asked whether a polynomial map with constant nonzero stretch factor must have a polynomial inverse. In 2026 that failed in every dimension 3 and up via an explicit counterexample. The two-variable (plane) case is still open.',
      whyItMatters:
        'Dimension 2 is now the only surviving case of a classical invertibility hope. Settling it would finish a story that shaped this area for decades.',
      status:
        'Still open in dimension 2. False for all dimensions 3 and up after the 2026 Alpöge / Claude Fable 5 counterexample — see the related breakthrough in this app.',
    },
    deep: {
      statement:
        'If F: ℂ² → ℂ² is a polynomial map with det Jac F a nonzero constant, must F be a polynomial automorphism?',
      notes: [
        'Equivalent formulations exist over any characteristic-zero field.',
        'Many special cases (e.g. low degree, Keller maps with extra structure) are known in dim 2.',
        'Cross-link: 2026 counterexamples kill n ≥ 3; only the plane remains.',
      ],
      jargon: [
        {
          term: 'Keller map',
          def: 'A polynomial self-map whose Jacobian determinant is a nonzero constant.',
        },
        {
          term: 'Polynomial automorphism',
          def: 'A polynomial map with a polynomial inverse.',
        },
      ],
    },
    relatedBreakthroughId: 'jacobian',
    sources: [
      {
        label: 'Wikipedia — Jacobian conjecture',
        href: 'https://en.wikipedia.org/wiki/Jacobian_conjecture',
      },
    ],
  },
].sort((a, b) => a.importance - b.importance)

export function getOpenProblem(id: string): OpenProblem | undefined {
  return openProblems.find((p) => p.id === id)
}

export function openProblemsByPrize(prize: NonNullable<OpenProblem['prize']>): OpenProblem[] {
  return openProblems.filter((p) => p.prize === prize)
}

export function openProblemsOther(): OpenProblem[] {
  return openProblems.filter((p) => !p.prize)
}
