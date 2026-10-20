import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'unique-games',
  importance: 24,
  series: 'landmark',
  when: 'Oct 2026',
  title: "Khot's Unique Games Conjecture proved",
  field: 'Computational complexity',
  glance:
    'Almost-satisfiable unique label puzzles are claimed NP-hard to tell from puzzles that leave a real gap.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'A unique game gives every vertex a label and every edge one allowed partner label. Given the label on one end, the other end has only one legal choice. The Unique Games Conjecture says it is NP-hard to tell instances where almost every edge can be satisfied from instances where every labeling leaves a large unsatisfied share. On 6 Oct 2026 the OpenAI math catalog published a claim that this conjecture is proved. An internal frontier model produced the argument.',
    whyItMatters:
      'The conjecture says how hard it is to approximate certain problems. The same public materials also claim direct NP-hardness on unweighted graphs for Max-Cut past the Goemans-Williamson ratio, Vertex Cover below factor two, and Min-UnCut and directed feedback vertex set within any fixed constant factor. Those direct proofs use established PCP and Label Cover hardness.',
    result:
      'The catalog claims the Unique Games Conjecture as proved, and claims those approximation lower bounds on unweighted graphs. Catalog formalization review is unchecked. This app does not machine-check the proof.',
  },
  deep: {
    statement:
      'It is NP-hard to distinguish unique-label graphs that are almost satisfiable from unique-label graphs where every labeling satisfies only a small fraction of the edges. The catalog claims this statement is proved. It also claims NP-hardness on unweighted graphs for Max-Cut past the Goemans-Williamson ratio, Vertex Cover below factor two, and Min-UnCut and directed feedback vertex set within any fixed constant factor.',
    notes: [
      'Public in the OpenAI math catalog on 6 Oct 2026, credited to an OpenAI internal frontier model. The preprint directory name in openai/math carries the date 23 Sep 2026.',
      'A Simons examination was announced on 15 Oct 2026. Catalog formalization review is unchecked. This app does not machine-check the argument, and no Lean certificate is attached.',
      'Independent direct reductions claim the Max-Cut, Vertex Cover, Min-UnCut, and directed feedback vertex set bounds on unweighted graphs. Those proofs use established PCP and Label Cover hardness. This entry does not claim P = NP or P ≠ NP.',
    ],
    jargon: [
      {
        term: 'Unique constraint',
        def: 'An edge rule that, given the label on one endpoint, allows exactly one label on the other.',
      },
      {
        term: 'Gap',
        def: 'The distance between instances that are almost satisfiable and instances where no labeling satisfies more than a bounded fraction of the edges.',
      },
      {
        term: 'PCP and Label Cover',
        def: 'Established hardness for proof checking and for label constraints. The direct approximation proofs reduce from them.',
      },
    ],
  },
  applications: [
    {
      id: 'max-cut-ratio',
      title: 'Max-Cut past Goemans-Williamson',
      domain: 'optimization',
      blurb: 'Beating that cut ratio is claimed NP-hard on unweighted graphs.',
      detail:
        'Max-Cut asks for a split of the vertices that crosses as many edges as possible. The Goemans-Williamson algorithm is the guarantee later algorithms get measured against. The catalog claims that beating that ratio is NP-hard even when every edge has the same weight. The argument is a direct reduction from established PCP and Label Cover hardness.',
      commercial:
        'Cut and quadratic-optimization solvers quote the Goemans-Williamson ratio as their worst-case benchmark. They cannot promise a better guarantee on every unweighted graph under this claim.',
    },
    {
      id: 'cover-and-cleanup',
      title: 'Vertex cover and cycle cleanup',
      domain: 'networks',
      blurb: 'Beating factor two on Vertex Cover, or any fixed constant on two cleanup problems, is claimed NP-hard.',
      detail:
        'Vertex Cover hits every edge with a small set of vertices. Min-UnCut deletes as few edges as possible so the rest of the graph is bipartite. Directed feedback vertex set hits vertices until a directed graph has no cycle. The catalog claims NP-hardness on unweighted graphs below factor two for Vertex Cover, and within any fixed constant factor for the other two.',
      commercial:
        'Network tools that approximate vertex cover and feedback vertex set already ship factor-two and constant-factor heuristics. The claim says those guarantees are the worst-case ceiling on unweighted instances.',
    },
  ],
  demoId: 'unique-games',
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
      label: 'Unique Games preprint PDF',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Unique-Games-Theorem-September-23-2026/paper.pdf',
    },
  ],
}
