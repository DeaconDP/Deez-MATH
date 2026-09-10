import type { Breakthrough } from './types'

export const astraBreakthroughs: Breakthrough[] = [
  {
    id: 'sphere-packing',
    importance: 10,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Tighter high-D sphere packing bounds',
    field: 'High-dimensional geometry',
    glance: 'How tightly can equal balls pack in many dimensions? The ceiling got sharper.',
    plain: {
      what: 'Imagine packing oranges in a huge box — but in hundreds of dimensions. For a long time, the best general ceiling on how densely equal balls can pack barely budged. This work proves a tighter ceiling and settles how strong one standard packing method can ever be.',
      whyItMatters:
        'The same packing idea shows up when packing signals, materials, or wireless resources. A sharper ceiling tells engineers what density is even possible before they design a scheme.',
      result:
        'A sharper general packing ceiling in high dimensions, plus a settled answer about the limits of a classic packing method.',
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
        title: 'Materials & particle packing',
        domain: 'optimization',
        blurb: 'A sharper ceiling on how densely identical balls can pack in high dimension.',
        detail:
          'Packing identical particles or grains is an optimization problem with a hard mathematical ceiling. Sharper high-dimensional bounds tell researchers what density is even possible before they invent a packing scheme. Crystallography and materials science mostly live in low dimensions, but the same packing language and Fourier methods travel — and the new ceiling is the reference point for high-D theory.',
        commercial:
          'High-dimensional packing is the theory behind vector quantization — the trick used to compress ML embeddings and vector-database indexes. A sharper ceiling tells those engineering teams how much compression is even possible.',
      },
      {
        id: 'wireless-packing',
        title: 'Wireless signal packing',
        domain: 'coding',
        blurb: 'Pack signal “balls” so channels interfere less — denser is not always possible.',
        detail:
          'Communications engineers often think of signals as balls that must not overlap too much, or interference rises. Sphere-packing ceilings translate into how densely you can place those signals. A tighter mathematical bound does not ship a new modem by itself, but it tells designers when a constellation is near the limit versus still having room to grow.',
        commercial:
          'Modem and 6G R&D groups design signal constellations against exactly these ceilings. A sharper bound is a budget signal: it says when a design is near-optimal and further optimization spend is wasted.',
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
    importance: 11,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Stronger binary & spherical code bounds',
    field: 'Coding theory',
    glance: 'How many reliable codewords fit at a fixed separation? The ceiling jumped by huge factors.',
    plain: {
      what: 'Error-correcting codes are recipes for writing bits (or points on a sphere) so small mistakes can be spotted or fixed. Older math put a hard ceiling on how large such codes can be. This work raises that ceiling by enormous factors for both bit codes and sphere codes, at any chosen separation.',
      whyItMatters:
        'A tighter ceiling tells storage and communications designers when a code is already near the limit — or still has room to grow.',
      result:
        'Much stronger ceilings for fixed-separation codes of every size; the sphere-code gains also reconnect to the packing story above.',
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
        title: 'Reliable storage codes',
        domain: 'coding',
        blurb: 'Raises the proven ceiling on how many blocks survive a fixed number of bit flips.',
        detail:
          'Error-correcting codes for disks and memory ask: how many distinct blocks can you store if you still want to survive a given number of flipped bits? Stronger upper bounds tell you when a candidate code is already near the mathematical limit. Storage designers use that as a stop/go signal for research effort — not as a drop-in encoding format.',
        commercial:
          'SSD-controller makers, cloud cold-storage teams, and DNA-storage startups all buy better codes. Sharper ceilings tell their R&D when a code is close enough to the limit to stop optimizing and ship.',
      },
      {
        id: 'qr-comms',
        title: 'Readable codes under noise',
        domain: 'coding',
        blurb: 'Separation between patterns is what keeps smudged codes readable.',
        detail:
          'QR codes, radio packets, and spherical codes all rely on enough distance between patterns so noise does not confuse them. Improving classical ceilings for fixed-distance codes (binary and spherical) redraws how large such codebooks can be in theory. That guides communications research about rate versus robustness tradeoffs.',
        commercial:
          'Telecom standards work (5G/6G), satellite links, and barcode/RFID vendors all trade data rate against robustness. Revised ceilings redraw that commercial tradeoff curve for the next standards cycle.',
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
    importance: 4,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'First explicit non-sofic group',
    field: 'Group theory',
    glance: 'Not every infinite symmetry group can be faked by finite shuffle rules — here is one that cannot.',
    plain: {
      what: 'Many infinite groups can be approximated by finite “shuffle” rules that nearly multiply the same way. For decades people hoped every countable group worked that way. This work builds a concrete group that refuses any such finite approximation.',
      whyItMatters:
        'A lot of theorems quietly assumed every group looks finite from afar. A counterexample redraws which results are safe and which need extra hypotheses.',
      result:
        'An explicit group that cannot be approximated by finite permutations; related finitely presented examples follow.',
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
        {
          term: 'Leavitt algebra',
          def: 'An algebra used in the construction of the explicit non-sofic example.',
        },
      ],
    },
    applications: [
      {
        id: 'ergodic-foundations',
        title: 'Dynamics without silent soficity',
        domain: 'foundations',
        blurb: 'Marks which dynamical theorems cannot quietly assume every group is sofic.',
        detail:
          'Many ergodic-theory results were proved under the assumption that every countable group looks “finite from afar” (sofic). An explicit counterexample means those proofs do not cover every group: some theorems need an extra hypothesis, and some hoped-for corollaries are false in general. Foundations work now splits into sofic and non-sofic regimes instead of one blanket story.',
        commercial:
          'Honestly none today — this is pure foundations. Its commercial footprint is indirect: the large Lean formalization released with it feeds the verified-proof tooling market.',
      },
      {
        id: 'symbolic-dynamics',
        title: 'Finite models of infinite groups',
        domain: 'foundations',
        blurb: 'Separates groups that admit finite shuffle approximations from those that do not.',
        detail:
          'Symbolic dynamics and group theory often approximate infinite symmetries by finite permutation rules. Soficity is exactly that approximation property. Knowing a concrete group that refuses every finite model tells researchers where finite-model techniques stop — useful when designing computer experiments or proving approximation theorems.',
        commercial:
          'No product depends on soficity. The transferable lesson — finite simulations cannot faithfully approximate every infinite system — is a caution for anyone selling simulation fidelity, nothing more.',
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
    importance: 5,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Connes rigidity disproved',
    field: 'Operator algebras',
    glance: 'Different rigid groups can share the same quantum algebra — uniqueness fails.',
    plain: {
      what: 'A famous question asked whether a rigid infinite group is uniquely determined by a certain quantum algebra built from it. This work builds infinitely many different rigid groups that all produce the same algebra — so you cannot read the group back uniquely.',
      whyItMatters:
        'Those algebras encode quantum measurement data. If the group is not unique, “recover the group from the algebra” strategies fail — important for classification programs.',
      result:
        'Infinitely many different rigid groups can share one group quantum algebra.',
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
        title: 'Non-unique quantum algebras',
        domain: 'quantum',
        blurb: 'The same group algebra can come from many different rigid groups.',
        detail:
          'Some quantum-information and operator-algebra strategies hope to recover a unique underlying group from algebraic measurement data. Connes rigidity failing means that hope is false for the group von Neumann algebra: infinitely many rigid groups can share one algebra. Recovery protocols need finer invariants than that algebra alone.',
        commercial:
          'Niche, research-grade impact. Quantum firms that model measurements with operator algebras get a warning — algebraic data alone cannot identify the underlying symmetry group — but no product changes hands over it yet.',
      },
      {
        id: 'classification',
        title: 'Classifying group factors',
        domain: 'foundations',
        blurb: 'Forces finer invariants when sorting II₁ factors built from groups.',
        detail:
          'Operator-algebraists classify von Neumann algebras (including II₁ factors) coming from groups. If many groups yield the same algebra, classification charts must track extra structure. The counterexamples redraw which invariants are complete and which only give a coarser partition of examples.',
        commercial:
          'No direct commercial use — classification of von Neumann algebras is pure research infrastructure.',
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
    importance: 12,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Harder permanent circuit lower bounds',
    field: 'Arithmetic circuit complexity',
    glance: 'Counting with the permanent needs bigger circuits than we could prove before.',
    plain: {
      what: 'The permanent looks like the familiar determinant, but it is believed much harder to compute. New proofs show that any shortcut-free arithmetic circuit (or formula) for the permanent must be larger than older lower bounds allowed — stronger evidence that easy shortcuts are limited.',
      whyItMatters:
        'Lower bounds are rare. Stronger permanent bounds mark a hard target and help explain why some counting problems stay expensive.',
      result:
        'Stronger proven size floors for circuits and formulas that compute the permanent.',
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
        title: 'Hard counting (permanents)',
        domain: 'complexity',
        blurb: 'Stronger proof that counting with the permanent needs large circuits.',
        detail:
          'Counting perfect matchings and related permanent-style tasks are classic hard counting problems. Larger proven circuit and formula lower bounds explain why tiny algebraic circuits cannot compute them. Complexity researchers use the permanent as a hard target; stronger floors tighten that benchmark.',
        commercial:
          'The permanent is the exact quantity behind boson-sampling “quantum advantage” claims. Hardness floors like these are what quantum-computing companies cite when marketing that classical machines cannot keep up.',
      },
      {
        id: 'compiler-limits',
        title: 'Limits of algebraic shortcuts',
        domain: 'complexity',
        blurb: 'Guides when clever algebraic rewrites are unlikely to shrink the work.',
        detail:
          'Algorithm designers sometimes hope a clever rewrite will make a hard counting formula cheap. Lower bounds say: for the permanent, division-free circuits and formulas must still be large. That steers effort away from impossible micro-optimizations and toward approximation, randomness, or different problem formulations.',
        commercial:
          'A proven “don’t bother” boundary for compiler and chip-design optimization teams: no clever algebraic rewrite makes permanent-style counting cheap, so budget goes to approximation or specialized hardware instead.',
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
    importance: 13,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Exponential quantum parallel repetition',
    field: 'Quantum complexity',
    glance: 'Repeat a quantum game enough times and a cheater’s win rate collapses exponentially.',
    plain: {
      what: 'In interactive proofs, you make a protocol safer by repeating a challenge game. For ordinary games this is well understood; for two-player quantum games with shared entanglement it was harder. This work proves that for every finite such game, enough parallel repeats make cheating chance fall exponentially.',
      whyItMatters:
        'That kind of amplification is how cryptographic and complexity protocols become reliable. Exponential decay means few repeats suffice in theory.',
      result:
        'For every finite two-player entangled game, parallel repeats drive the cheating win rate down exponentially.',
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
        blurb: 'Repeating a quantum game drives a cheater’s win rate down exponentially.',
        detail:
          'Interactive proofs become trustworthy by repeating challenges until a dishonest prover almost never fools the verifier. For two-player games with entanglement, exponential parallel repetition was the missing general theorem. Protocol designers can now cite that soundness amplification works for every finite entangled game — fewer repeats in theory for the same security.',
        commercial:
          'Certified-randomness services and quantum-verification startups sell products whose security rests on entangled-game soundness. A general exponential theorem strengthens the fine print those products ship with.',
      },
      {
        id: 'device-independence',
        title: 'Device-independent security',
        domain: 'quantum',
        blurb: 'Supports security arguments that rely on game hardness under entanglement.',
        detail:
          'Device-independent crypto and certification often reduce security to winning probabilities in entangled games. Parallel repetition is how those probabilities are driven down. A general exponential theorem strengthens those reductions: hardness for one copy lifts cleanly to many parallel copies.',
        commercial:
          'Quantum key distribution is a small but real market (ID Quantique, Toshiba QKD units). Amplification theorems like this are what let device-independent vendors promise security without asking customers to trust the hardware.',
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
    importance: 14,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Stronger CVP hardness of approximation',
    field: 'Lattice cryptography',
    glance: 'Finding the nearest lattice point stays hard even if you only need a rough answer.',
    plain: {
      what: 'Imagine a grid of points in many dimensions. Given a target, find the nearest grid point. This work proves that even finding a roughly nearest point is extremely hard, with related hardness for decoding noisy binary codes — tightening foundations under lattice-based (post-quantum) crypto.',
      whyItMatters:
        'Modern post-quantum schemes lean on lattice hardness. Stronger “even approximate answers are hard” results support those security stories.',
      result:
        'A proven hardness-of-approximation result for nearest lattice points (plus related decoding hardness).',
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
        title: 'Post-quantum lattice crypto',
        domain: 'crypto',
        blurb: 'Even a rough nearest lattice point stays hard — good news for lattice schemes.',
        detail:
          'Many post-quantum schemes lean on lattice problems: finding a nearby lattice point should stay hard even approximately. Stronger hardness-of-approximation for CVP backs that story. It does not replace cryptanalysis of a specific cipher, but it thickens the theoretical floor those designs sit on.',
        commercial:
          'The most directly commercial result in the set: lattice schemes like Kyber and Dilithium already ship in browsers, VPNs, and HSMs. Stronger CVP hardness is a free security-margin upgrade every post-quantum vendor can cite.',
      },
      {
        id: 'coding-decode',
        title: 'Hard nearest-codeword decoding',
        domain: 'coding',
        blurb: 'Nearest-codeword hardness informs secure and robust coding design.',
        detail:
          'Related reductions hit binary nearest-codeword problems: recovering the closest codeword under noise can be hard even approximately. Coding theorists use that when arguing about secure sketches, robust decoding, and when “good enough” approximate decoding is still intractable.',
        commercial:
          'Biometric template protection and “fuzzy extractor” products lean on nearest-codeword hardness. Proofs that even approximate decoding stays hard are what back those vendors’ security claims.',
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
    importance: 15,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Ehrhart volume conjecture proved',
    field: 'Geometry of numbers',
    glance: 'A sharp volume ceiling for shapes with one interior grid point — now proved in every dimension.',
    plain: {
      what: 'Take a convex shape whose center of mass is its only interior grid point. An old conjecture gave a sharp ceiling on how large its volume can be. This work proves that ceiling in every dimension.',
      whyItMatters:
        'Volume versus grid-point constraints show up in integer programming and discrete optimization — a sharp ceiling limits how “fat” a feasible region can be.',
      result: 'The sharp volume ceiling holds in every dimension.',
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
        {
          term: 'Ehrhart volume conjecture',
          def: 'The sharp bound (n+1)^n / n! for convex bodies whose barycenter is the only interior lattice point.',
        },
      ],
    },
    applications: [
      {
        id: 'integer-prog',
        title: 'Integer programming regions',
        domain: 'optimization',
        blurb: 'Caps how fat a convex region can be with only one interior grid point.',
        detail:
          'Integer programs care about feasible regions and lattice points inside them. The Ehrhart volume theorem gives a sharp ceiling on volume when the barycenter is the only interior grid point. That limits how “fat” such a region can be — a clean constant for geometry-of-numbers arguments used in discrete optimization.',
        commercial:
          'Commercial mixed-integer solvers (Gurobi, CPLEX class) monetize exactly this geometry: lattice-point-versus-volume constants feed the cutting-plane and branching theory those engines are built on.',
      },
      {
        id: 'discrete-geom',
        title: 'Lattice-point volume bounds',
        domain: 'optimization',
        blurb: 'A sharp constant for convex bodies constrained by interior lattice points.',
        detail:
          'Discrete geometers repeatedly need volume-versus-lattice-point inequalities. Proving the sharp bound in every dimension turns a long-standing conjecture into a usable theorem: citations can quote an exact constant instead of a dimensional caveat. Tooling for geometry of numbers gets a cleaner primitive.',
        commercial:
          'Indirect: a cleaner constant in the geometry-of-numbers toolbox that optimization software and lattice-crypto analysis quietly reuse. No standalone product, but a shared primitive got sharper.',
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
    importance: 16,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Multicolor Ramsey Rₖ(3) = k^Θ(k)',
    field: 'Extremal combinatorics',
    glance: 'In many-colored “friendship” graphs, forced same-color triangles only appear after a huge blow-up.',
    plain: {
      what: 'Ramsey theory asks: how large must a gathering be before some pattern is unavoidable? For parties with many edge colors, this work proves you need a huge number of people before a same-color triangle is forced — settling a famous Erdős question.',
      whyItMatters:
        'These numbers quantify unavoidable structure in networks. Lower bounds show how large systems can grow before a same-color triangle is forced.',
      result: 'A huge lower bound showing the multicolor triangle threshold grows like k to a power about k.',
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
        title: 'Unavoidable conflict triangles',
        domain: 'networks',
        blurb: 'With many edge labels, a same-color triangle can be delayed until huge size.',
        detail:
          'Ramsey numbers quantify when some conflict pattern becomes unavoidable in a network with many relationship labels (edge colors). The multicolor triangle threshold growing like k^Θ(k) means systems can get enormous before a monochromatic triangle is forced. That is a theoretical guarantee about structure — useful for extremal network reasoning, not a day-to-day routing rule.',
        commercial:
          'Near zero direct. Frequency-assignment and conflict-free scheduling tools use Ramsey-flavored reasoning, but this threshold lives far beyond any deployed system’s size.',
      },
      {
        id: 'combinatorial-search',
        title: 'Huge structure-free search spaces',
        domain: 'complexity',
        blurb: 'Shows how large a search space can grow before forced structure appears.',
        detail:
          'Combinatorial search and property testing care about the size at which structure is unavoidable. A huge lower bound for multicolor triangles shows you can dodge that structure until the instance is enormous. Researchers use it as a caution: “eventual structure” can arrive far later than intuition suggests.',
        commercial:
          'Mostly a research caution. If anything, it warns optimization and SAT-solver vendors that “structure will eventually save us” arguments cannot be assumed at commercial problem sizes.',
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
    importance: 17,
    series: 'astra' as const,
    discoveredBy: { kind: 'openai' as const, label: 'OpenAI Astra' },
    when: 'Aug 2026',
    title: 'Compactness & degeneracy counterexamples',
    field: 'Extremal graph theory',
    glance: 'Two tidy guesses about sparse graphs fail — with explicit counterexamples.',
    plain: {
      what: 'Extremal graph theory studies how dense a network can be while avoiding a pattern. This work builds counterexamples to two tidy sparsity conjectures, settling a pair of Erdős problems.',
      whyItMatters:
        'When those conjectures fail, you learn which sparsity shortcuts you can trust when designing networks or analyzing large graphs.',
      result:
        'Separate counterexamples that kill both the compactness and degeneracy conjectures.',
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
        title: 'Local sparsity ≠ global control',
        domain: 'networks',
        blurb: 'Local sparsity checks do not always decide the whole graph’s extremal behavior.',
        detail:
          'Network designers and theorists sometimes hope that finite local checks control global extremal behavior (compactness). Explicit counterexamples show that hope can fail: a graph can look fine locally and still violate the global pattern you cared about. Treat “local implies global” as a conjecture to verify, not a free lunch.',
        commercial:
          'A QA warning for graph-analytics and network-planning products: local audits can pass while global properties fail. Vendors selling guarantees built on local checks should re-verify what those checks actually imply.',
      },
      {
        id: 'sparse-limits',
        title: 'Degeneracy shortcut limits',
        domain: 'networks',
        blurb: 'Marks where degeneracy-based sparsity shortcuts break.',
        detail:
          'Many sparse-graph algorithms lean on degeneracy: every subgraph has a low-degree vertex. Counterexamples to tidy degeneracy conjectures mark regimes where those shortcuts are unsafe. Algorithm designers should check whether their sparsity measure actually implies the property they need — the counterexamples are the warning labels.',
        commercial:
          'Graph databases and social-graph analytics sell performance promises built on degeneracy-style sparsity. These counterexamples mark where such promises need re-verification before they go in a contract.',
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
