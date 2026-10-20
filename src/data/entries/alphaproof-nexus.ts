import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'alphaproof-nexus',
  importance: 34,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'AlphaProof Nexus batch on open problems',
  field: 'Formal methods',
  glance:
    'A full-featured DeepMind agent solved 9 of 353 open Erdős problems it tried, and proved 44 of 492 open OEIS conjectures.',
  discoveredBy: { kind: 'deepmind', label: 'AlphaProof Nexus' },
  plain: {
    what: 'AlphaProof Nexus is a full-featured agent from Google DeepMind. Science published the batch on 8 Oct 2026. An arXiv version appeared earlier in 2026. The agent autonomously solved 9 of 353 open Erdős problems it attempted, including two questions open for 56 years, at a few hundred dollars per problem. It proved 44 of 492 open OEIS conjectures. It resolved a 15-year-old open question on Hilbert functions, improved an open bound in convex optimization with a new parameter schedule, found misformalizations, and helped on a problem from the Ben Green list. A basic agent, language-model drafts checked in Lean, also solved those same 9 Erdős problems, at higher cost on the harder ones. Erdős #728 and #1196 already in this catalog come from other efforts. This DeepMind sweep is a separate batch, and this entry does not treat those two ids as part of it.',
    whyItMatters:
      'Nine solves out of 353 Erdős attempts, and 44 proofs out of 492 OEIS conjectures, is a low hit rate with a few old questions among the hits. One Hilbert-function question had been open for 15 years. The public Lean repository is where a reader checks the proofs. This app does not re-check the Lean.',
    result:
      'The Lean proofs are in the AlphaProof Nexus results repository. This app only links that repository. It does not re-check the proofs.',
  },
  deep: {
    statement:
      'AlphaProof Nexus autonomously solved 9 of 353 open Erdős problems it attempted, including two questions open for 56 years, at a few hundred dollars per problem, and proved 44 of 492 open OEIS conjectures. The batch also resolved a 15-year-old open question on Hilbert functions, improved an open bound in convex optimization with a new parameter schedule, found misformalizations, and helped on a problem from the Ben Green list. A basic agent with language-model drafts and Lean checks solved the same 9 Erdős problems at higher cost on the harder ones.',
    notes: [
      'Science, 8 Oct 2026. An arXiv preprint appeared earlier in 2026.',
      'Separate DeepMind sweep from Erdős #728 and #1196, which other efforts already placed in this catalog. This entry does not name the nine solved Erdős problems.',
      'This app does not re-check the Lean. The proofs are in the repository linked on this entry.',
    ],
    jargon: [
      {
        term: 'Erdős problems',
        def: 'Problems posed by Paul Erdős on a public list. Many remain open.',
      },
      {
        term: 'OEIS conjecture',
        def: 'An open claim about a sequence in the On-Line Encyclopedia of Integer Sequences.',
      },
      {
        term: 'Misformalization',
        def: 'A formal statement that does not match the mathematics it was meant to say.',
      },
    ],
  },
  applications: [
    {
      id: 'nexus-erdos-oeis',
      title: 'Open-problem formal search',
      domain: 'number-theory',
      blurb: 'Lean-checked hits on open Erdős problems and OEIS conjectures.',
      detail:
        'A research group can aim a formal agent at a public list and keep the runs Lean accepts. In this batch the full-featured agent solved 9 of 353 open Erdős problems it attempted, including two questions open for 56 years, and proved 44 of 492 open OEIS conjectures. It also found misformalizations and helped on a problem from the Ben Green list. This app does not re-check those proofs.',
      commercial:
        'Labs can pay for formal-proof search at a few hundred dollars per problem, the cost reported for the full-featured Erdős run. There is no consumer app in this result. A basic draft-and-check agent solved the same 9 Erdős problems at higher cost on the harder ones.',
    },
    {
      id: 'nexus-convex-bound',
      title: 'Convex optimization bound',
      domain: 'optimization',
      blurb: 'A new parameter schedule improved an open bound in convex optimization.',
      detail:
        'The same batch improved an open bound in convex optimization with a new parameter schedule. This entry does not name the bound or the schedule. The writeup points at the public Lean repository. This app does not re-check that proof.',
      commercial:
        'The schedule is a research result. The paid offer beside it is formal-proof search for labs, at a few hundred dollars per problem on the Erdős batch. There is no consumer optimizer here.',
    },
  ],
  demoId: 'alphaproof-nexus',
  lean: {
    label: 'AlphaProof Nexus Lean proofs',
    href: 'https://github.com/google-deepmind/alphaproof-nexus-results',
  },
  sources: [
    {
      label: 'arXiv 2605.22763',
      href: 'https://arxiv.org/abs/2605.22763',
    },
    {
      label: 'Science, 8 Oct 2026',
      href: 'https://www.science.org/doi/10.1126/science.aej2213',
    },
  ],
}
