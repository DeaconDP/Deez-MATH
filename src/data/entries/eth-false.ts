import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'eth-false',
  importance: 37,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Exponential Time Hypothesis claimed false',
  field: 'Computational complexity',
  glance:
    'A claimed algorithm counts the solutions of 3-SAT faster than any exponential. If it holds up, a standard assumption in complexity theory falls.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: '3-SAT asks whether a list of three-variable rules can all be true at once. The Exponential Time Hypothesis, or ETH, says no algorithm can always answer that much faster than trying every assignment: some exponential cost 2^(cn) is unavoidable. On 26 Oct 2026 OpenAI published a manuscript titled “The Exponential Time Hypothesis is False.” It claims a deterministic algorithm that exactly counts the satisfying assignments of any fixed-width CNF formula in subexponential time and polynomial space. The 3-SAT case would refute ETH. The running time is still superpolynomial, so this is not a claim that P = NP.',
    whyItMatters:
      'Hundreds of hardness results are proved by assuming ETH. They say “this problem needs exponential time unless ETH fails.” A confirmed refutation would remove that foundation, and researchers would have to rebuild those results on other assumptions. Ryan Williams of MIT said a confirmed refutation would be a major development and would have no short-term real-world applications. A working group led by Russell Impagliazzo, Ramamohan Paturi and Ryan Williams is examining the proof. Impagliazzo and Paturi proposed ETH in the late 1990s.',
    result:
      'For every fixed k ≥ 2, one deterministic machine exactly counts the satisfying assignments of k-CNF formulas on n variables in time roughly 2^(n/√log n), up to log-log and polynomial factors, using polynomial space. The k = 3 case contradicts ETH.',
  },
  deep: {
    statement:
      'For every fixed k ≥ 2 there is a deterministic algorithm that, given a k-CNF formula F on n variables, outputs the exact number of satisfying assignments of F in time poly(|F|) · 2^{O_k(n · polyloglog(n) / √log n)} and polynomial space. In particular 3-SAT is solvable in time 2^{o(n)}, which contradicts the Exponential Time Hypothesis.',
    notes: [
      'OpenAI posted the manuscript, dated 25 Oct 2026, in its public math repository on 26 Oct 2026, together with a Lean formalization.',
      'The Lean comparator statement (SubexponentialSAT) asks for one fixed machine that counts, decides, meets the square-root-logarithmic time bound, and stays within polynomially many visited tape cells.',
      'Lean checks that the formal statement is proved. It does not check that the formal statement says what the paper claims. Experts still have to compare the two.',
      'The verification group asked for the materials to be made public immediately, so others can check them too. As of 31 Oct 2026 the group had published no verdict.',
      'A subexponential algorithm says nothing about P versus NP. That problem stays in the Open problems list.',
    ],
    jargon: [
      {
        term: 'CNF formula',
        def: 'An AND of clauses, each clause an OR of variables or their negations. Fixed width k means each clause has at most k literals.',
      },
      {
        term: 'Exponential Time Hypothesis',
        def: 'The assumption that 3-SAT on n variables needs time at least 2^(cn) for some constant c > 0.',
      },
      {
        term: 'Subexponential',
        def: 'Smaller than 2^(cn) for every c > 0, such as 2^(n/√log n). Still far slower than any polynomial.',
      },
    ],
  },
  applications: [
    {
      id: 'eth-hardness-web',
      title: 'Rebuilding conditional hardness',
      domain: 'complexity',
      blurb: 'Lower bounds proved “assuming ETH” would need a new foundation.',
      detail:
        'Fine-grained complexity uses ETH to say many problems cannot be solved much faster than brute force. Examples include graph coloring, clique and many parameterized problems. If ETH is false, those statements lose their premise. Some of them survive under the Strong ETH variants or other assumptions, and some do not. Sorting that out would be a large research program.',
      commercial:
        'No product changes on day one. The exponent saving is tiny at practical sizes. The nearest commercial edge is SAT and model-counting tools, which might borrow the new technique once it is understood.',
    },
    {
      id: 'model-counting',
      title: 'Exact counting of solutions',
      domain: 'optimization',
      blurb: 'The algorithm counts every solution, which is harder than finding one.',
      detail:
        'Counting satisfying assignments (#SAT) drives probabilistic inference, reliability analysis and some verification tasks. The claimed method counts exactly in polynomial space. Any practical gain would depend on constants the manuscript does not optimize.',
      commercial:
        'Model counters ship inside verification and probabilistic-programming tools. Vendors would wait for an independent reimplementation before relying on it.',
    },
  ],
  demoId: 'eth-false',
  lean: {
    label: 'openai/math · SubexponentialSAT comparator',
    href: 'https://github.com/openai/math/blob/main/lean/ComparatorChallenges/SubexponentialSAT.lean',
  },
  sources: [
    {
      label: 'openai/math release history (26 Oct 2026)',
      href: 'https://github.com/openai/math/blob/main/history.md',
    },
    {
      label: 'The Exponential Time Hypothesis is False (preprint)',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/paper.pdf',
    },
    {
      label: 'Al Jazeera, AI makes discoveries in math, CS, physics (27 Oct 2026)',
      href: 'https://www.aljazeera.com/economy/2026/10/27/ai-makes-discoveries-in-mathematics-computer-science-physics-openai-says',
    },
  ],
}
