import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'logspace-derandom',
  importance: 25,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'L = RL = BPL',
  field: 'Computational complexity',
  glance:
    'Randomized log-space deciders, one-sided or two-sided error, compile down to deterministic log space.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'L is the class of languages a deterministic machine decides with only a logarithmic amount of extra memory. RL is that same space budget in polynomial time with one-sided error. BPL allows two-sided error, still in polynomial time and logarithmic space. On 6 Oct 2026 the OpenAI math catalog published a claim that the three classes are equal. An effective compiler rewrites each randomized machine as a deterministic logarithmic-space decider and comes with explicit polynomial time bounds. The claim is space-bounded derandomization. It does not say P = BPP, and it does not say P = NP.',
    whyItMatters:
      'Logarithmic space is the memory budget for procedures that cannot store the whole input. If the claim holds, every language an RL or BPL machine decides already has a deterministic log-space decider. The rewrite is an effective compiler with explicit polynomial time bounds. Polynomial-time randomness and NP stay open.',
    result:
      'L = RL = BPL. Each randomized polynomial-time logarithmic-space decider with one-sided or two-sided error becomes a deterministic logarithmic-space decider, with explicit polynomial time bounds.',
  },
  deep: {
    statement:
      'Every language decided by a randomized polynomial-time logarithmic-space machine with one-sided error (RL) or two-sided error (BPL) belongs to deterministic logarithmic space (L). The translation is effective and supplies explicit polynomial time bounds, yielding L = RL = BPL.',
    notes: [
      'Public in the OpenAI math catalog on 6 Oct 2026, credited to an OpenAI internal frontier model. The preprint directory name in openai/math carries the date 23 Sep 2026.',
      'Simons examination on 15 Oct 2026. Catalog formalization review is unchecked. This app does not machine-check the argument, and no Lean certificate is attached.',
      'The equality is space-bounded derandomization. This entry does not claim P = BPP, P = NP, or L = NL.',
    ],
    jargon: [
      {
        term: 'L',
        def: 'Languages decided by a deterministic Turing machine that uses O(log n) work space.',
      },
      {
        term: 'RL',
        def: 'Languages decided in logarithmic space and polynomial time by a randomized machine with one-sided error.',
      },
      {
        term: 'BPL',
        def: 'Languages decided in logarithmic space and polynomial time by a randomized machine with two-sided error.',
      },
    ],
  },
  applications: [
    {
      id: 'logspace-deciders',
      title: 'Deterministic log-space deciders',
      domain: 'complexity',
      blurb: 'An RL or BPL decider picks up a deterministic rewrite that stays in logarithmic space.',
      detail:
        'Graph passes and streaming procedures that already fit in logarithmic work space sometimes decide a language by flipping coins, with one-sided or two-sided error. The claimed compiler replaces that machine with a deterministic logarithmic-space decider and names polynomial time bounds. The space budget does not grow. The result applies only to machines that were already in RL or BPL.',
      commercial:
        'Libraries that ship log-space graph and streaming routines can drop the coin source and offer a deterministic build with a stated polynomial time bound. Buyers are paying for a smaller trusted base inside logarithmic space, not for a settlement of BPP.',
    },
    {
      id: 'effective-simulator',
      title: 'Effective simulation',
      domain: 'foundations',
      blurb: 'The collapse is a compiler, so a simulator can run the deterministic machine.',
      detail:
        'The catalog claim supplies a compiler from each randomized polynomial-time logarithmic-space machine to a concrete deterministic decider. Explicit polynomial time bounds let a simulator promise a runtime. The numerical bounds stay in the preprint. This entry does not copy them.',
      commercial:
        'Teaching and verification tools can offer a no-coins replay of an RL or BPL machine and point at the catalog compiler for the real translation. This app only draws a toy walk. It does not run that compiler.',
    },
  ],
  demoId: 'logspace-derandom',
  sources: [
    {
      label: 'OpenAI, sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'openai/math',
      href: 'https://github.com/openai/math',
    },
    {
      label: 'Preprint PDF (L = RL = BPL)',
      href: 'https://github.com/openai/math/blob/main/preprints/Exact-Derandomization-of-Logarithmic-Space-L-equals-RL-equals-BPL-September-23-2026/paper.pdf',
    },
  ],
}
