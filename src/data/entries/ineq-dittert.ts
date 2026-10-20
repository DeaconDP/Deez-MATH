import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'ineq-dittert',
  importance: 36,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Dittert strengthenings in dimensions 4 and 5',
  field: 'Inequalities',
  glance:
    'Lean-verified Dittert strengthenings in dimensions 4 and 5, and a Holens–Djokovic (4,4) certificate that implies Merris in dimension 4.',
  discoveredBy: { kind: 'human', label: 'IneqAgent (He et al.)' },
  plain: {
    what: 'Dittert’s conjecture and Merris’s conjecture are classical matrix inequalities. In October 2026, Gaolei He, Jinhui Li, Ruobing Zuo, Xia Zeng, and Zhengfeng Yang described IneqAgent, which pairs a language model with symbolic computation (sum-of-squares, Bernstein, and successive difference substitution) and writes Lean 4 proofs. With DeepSeek-V4-Flash it solved 175 of 186 problems on four benchmarks (94.09%). The new mathematics is narrower than either full conjecture. There are Lean-verified strengthenings of Dittert’s conjecture in dimensions 4 and 5, and a certificate of the Holens–Djokovic (4,4) inequality. That certificate implies Merris’s conjecture in dimension 4.',
    whyItMatters:
      'An inequality argument can look finished and still hide a gap. A Lean 4 proof is a check a kernel can replay. The benchmark score shows the loop clearing known problems. The mathematical news is the dimension-4 and dimension-5 Dittert strengthenings, plus Merris in dimension 4 via Holens–Djokovic (4,4). Dittert’s conjecture in every dimension, and Merris’s conjecture in every dimension, stay open.',
    result:
      '175 of 186 benchmark problems solved (94.09%) with DeepSeek-V4-Flash. Lean-verified strengthenings of Dittert’s conjecture in dimensions 4 and 5. A Holens–Djokovic (4,4) certificate that implies Merris’s conjecture in dimension 4.',
  },
  deep: {
    statement:
      'IneqAgent with DeepSeek-V4-Flash solved 175 of 186 problems on four benchmarks (94.09%). It produced Lean 4 proofs of strengthenings of Dittert’s conjecture in dimensions 4 and 5, and a certificate of the Holens–Djokovic (4,4) inequality. The (4,4) certificate implies Merris’s conjecture in dimension 4. The paper does not claim Dittert’s conjecture in every dimension, and it does not claim Merris’s conjecture in every dimension.',
    notes: [
      'Authors: Gaolei He, Jinhui Li, Ruobing Zuo, Xia Zeng, and Zhengfeng Yang. arXiv:2610.20681 (Oct 2026).',
      'Symbolic engines in the system: sum-of-squares, Bernstein, and successive difference substitution. The reported benchmark model is DeepSeek-V4-Flash.',
      'Certified new cases named here are the Dittert strengthenings in dimensions 4 and 5, and Holens–Djokovic (4,4) implying Merris in dimension 4.',
      'The public repository is code. This entry cites it as a source and does not treat a single file path as a Lean certificate. This app does not re-check Lean.',
    ],
    jargon: [
      {
        term: 'Sum-of-squares',
        def: 'A polynomial identity that writes an expression as a sum of squares of polynomials, which a proof assistant can check.',
      },
      {
        term: 'Holens–Djokovic (4,4)',
        def: 'The (4,4) case of the Holens–Djokovic inequality. IneqAgent’s certificate of it implies Merris’s conjecture in dimension 4.',
      },
    ],
  },
  applications: [
    {
      id: 'checked-inequalities',
      title: 'Machine-checked inequality proofs',
      domain: 'foundations',
      blurb: 'A Lean 4 proof is a replayable check, separate from a benchmark score.',
      detail:
        'Inequality arguments are short to state and easy to mis-sign. IneqAgent asks a model for a strategy, calls sum-of-squares, Bernstein, or successive difference substitution, and emits Lean 4. The reported run with DeepSeek-V4-Flash solved 175 of 186 problems on four benchmarks. A reader still replays the kernel outside this app before trusting a certificate.',
      commercial:
        'Proof-assistant and AI-for-math teams sell checked reasoning. A 94.09% score with named certificates in dimensions 4 and 5, and Holens–Djokovic (4,4), is a concrete demo of that pipeline.',
    },
    {
      id: 'polynomial-certificates',
      title: 'Polynomial inequality certificates',
      domain: 'optimization',
      blurb: 'Sum-of-squares and Bernstein certificates are objects polynomial optimization already consumes.',
      detail:
        'Polynomial optimization tools prove bounds by building sum-of-squares or Bernstein certificates. IneqAgent uses those engines, plus successive difference substitution, as the symbolic half of a search for inequality proofs. The new checked cases are Dittert strengthenings in dimensions 4 and 5, and the Holens–Djokovic (4,4) certificate.',
      commercial:
        'Computer-algebra and optimization vendors who already ship those engines can point at a public agent that emits Lean 4. The product is the certificate for the stated cases.',
    },
  ],
  demoId: 'ineq-dittert',
  sources: [
    {
      label: 'arXiv:2610.20681',
      href: 'https://arxiv.org/abs/2610.20681',
    },
    {
      label: 'IneqAgent code',
      href: 'https://github.com/gaolei-he/IneqAgent',
    },
  ],
}
