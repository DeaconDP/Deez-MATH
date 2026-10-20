import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'catalan-constant',
  importance: 27,
  series: 'landmark',
  when: 'Oct 2026',
  title: "Catalan's constant is irrational",
  field: 'Analytic number theory',
  glance:
    "Catalan's constant, the alternating sum of reciprocal odd squares, is claimed irrational. No closed form, and no transcendence claim.",
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: "Catalan's constant G adds reciprocal odd squares with alternating signs: 1 - 1/9 + 1/25 - 1/49, and so on. OpenAI's math catalog, public on 6 Oct 2026, claims G is irrational. The claim comes from an internal frontier model. The preprint in the openai/math repository is dated 24 Sep 2026 by its path.",
    whyItMatters:
      'G is a classical named constant, and whether it is a ratio of two integers had stayed open. The catalog claims it is not. This entry does not give a closed form for G, and it does not claim that G is transcendental. This app does not machine-check the argument.',
    result:
      'G is claimed irrational. Formalization review in the catalog is unchecked.',
  },
  deep: {
    statement:
      'G is the sum of (-1)^n / (2n+1)^2 for n = 0, 1, 2, and so on. The claim is that G is irrational. The claim does not include a closed form, and it does not include transcendence.',
    notes: [
      'Public in the OpenAI math catalog on 6 Oct 2026. The preprint path is dated 24 Sep 2026.',
      'Catalog formalization review is unchecked. This app does not machine-check the argument, and it attaches no Lean certificate.',
      'Simons examination, 15 Oct 2026. No verdict is stated here.',
    ],
    jargon: [
      {
        term: "Catalan's constant",
        def: 'The sum of (-1)^n / (2n+1)^2 for n = 0, 1, 2, and so on.',
      },
      {
        term: 'Irrational',
        def: 'Not equal to a ratio of two integers.',
      },
    ],
  },
  applications: [
    {
      id: 'constant-tables',
      title: 'Named-constant tables',
      domain: 'analysis',
      blurb: 'A simplifier can refuse to rewrite G as a ratio of integers.',
      detail:
        "Computer-algebra systems already print Catalan's constant as the name of this alternating series. If the claim holds, those systems can stop looking for a rational value. They still have no closed form to substitute, because the claim does not give one.",
      commercial:
        'Mathematica, Maple, and supported Sage stacks sell constant recognition. Labeling G irrational is a table change they can ship after examination. This catalog has not checked a formalization, so the label is still a claim.',
    },
    {
      id: 'alternating-squares',
      title: 'Partial sums of the defining series',
      domain: 'number-theory',
      blurb: 'The series people already use for G now has an irrationality claim on its limit.',
      detail:
        'High-precision libraries evaluate G by adding (-1)^n / (2n+1)^2. Irrationality does not change those partial sums. It is a claim about the number the sums approach. That limit is not a ratio of two integers.',
      commercial:
        'Arbitrary-precision libraries already ship G as a built-in constant. The nearest product change is a documentation line, and only after the examination. There is no faster series in the claim.',
    },
  ],
  demoId: 'catalan-constant',
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
      label: 'Preprint PDF, 24 Sep 2026',
      href: 'https://github.com/openai/math/blob/main/preprints/Catalans-constant-is-irrational-September-24-2026/paper.pdf',
    },
  ],
}
