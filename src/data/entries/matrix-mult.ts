import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'matrix-mult',
  importance: 26,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Matrix multiplication exponent at most 9/4',
  field: 'Algebraic complexity',
  glance:
    'Over ℂ, the catalog claims ω ≤ 9/4, so square matrix multiplication is O(n^{2.25+ε}). The schoolbook count is n^3.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'The schoolbook way to multiply two n by n matrices uses n^3 arithmetic operations. On 6 Oct 2026 the OpenAI math catalog published a claim that the matrix multiplication exponent satisfies ω ≤ 9/4 over the complex numbers, so the same product uses O(n^{9/4+ε}) arithmetic operations. 9/4 equals 2.25. That sits under the classical range people may remember, ω < 2.372.',
    whyItMatters:
      'Algebraic algorithms often state their cost as a power of ω. A ceiling of 2.25 over ℂ lowers those stated costs relative to the remembered range ω < 2.372. The same announcement claims a near-quadratic rectangular product for some inner dimension above 0.465, in characteristic zero, and weaker square ceilings over other fields. The figures are asymptotic arithmetic-operation counts. A numerical library keeps the matrix kernel it already ships.',
    result:
      'ω ≤ 9/4 over ℂ, hence O(n^{9/4+ε}) arithmetic operations for square multiplication. Some inner dimension α > 0.465 permits n^{2+o(1)} rectangular multiplication in characteristic zero. Square bounds are ω < 2.258 outside finitely many positive characteristics, and ω < 2.371054886006746 over every fixed field.',
  },
  deep: {
    statement:
      'Over ℂ, the matrix multiplication exponent satisfies ω ≤ 9/4, so the product of two n×n matrices uses O(n^{9/4+ε}) arithmetic operations. For some inner dimension α > 0.465, rectangular multiplication costs n^{2+o(1)} in characteristic zero. Square bounds ω < 2.258 hold outside finitely many positive characteristics, and ω < 2.371054886006746 holds over every fixed field. 9/4 = 2.25. The schoolbook algorithm uses n^3 operations. The only prior ceiling named here is the remembered classical range ω < 2.372.',
    notes: [
      'Public in the OpenAI math catalog on 6 Oct 2026, credited to an OpenAI internal frontier model. The preprint directory name in openai/math carries the date 2 Oct 2026.',
      'Simons examination on 15 Oct 2026. Catalog formalization review is unchecked. This app does not machine-check the argument, and no Lean certificate is attached.',
    ],
    jargon: [
      {
        term: 'Matrix multiplication exponent',
        def: 'The power ω in an arithmetic-operation count O(n^{ω+ε}) for n by n matrix products. The claim is ω ≤ 9/4 over ℂ.',
      },
      {
        term: 'Schoolbook algorithm',
        def: 'The direct product of two n by n matrices, using n^3 arithmetic operations.',
      },
      {
        term: 'Inner dimension',
        def: 'A parameter α for a rectangular matrix product. The claim says some α > 0.465 permits an n^{2+o(1)} product in characteristic zero.',
      },
    ],
  },
  applications: [
    {
      id: 'omega-ceilings',
      title: 'Running times written with ω',
      domain: 'complexity',
      blurb: 'A ceiling of 2.25 over ℂ lowers algebraic running times that quote ω.',
      detail:
        'Many algebraic algorithms price their work as a power of the matrix multiplication exponent. Under the claim, that power over the complex numbers is at most 9/4, which is 2.25, against a schoolbook count of n^3 and a remembered classical range of ω < 2.372. The ε in O(n^{9/4+ε}) stays in the theorem. A floating-point library still multiplies with the kernel it ships.',
      commercial:
        'Research groups that cite ω in a theorem can point at the catalog ceiling once examination finishes. A faster floating-point matrix kernel is a separate product, and this entry does not supply one.',
    },
    {
      id: 'rectangular-and-fields',
      title: 'Rectangular products and other fields',
      domain: 'foundations',
      blurb:
        'Characteristic zero gets a near-quadratic rectangular claim. Other fields get weaker square ceilings.',
      detail:
        'The same family claims that some inner dimension α > 0.465 permits rectangular multiplication in n^{2+o(1)} operations when the characteristic is zero. Square multiplication is claimed to satisfy ω < 2.258 outside finitely many positive characteristics, and ω < 2.371054886006746 over every fixed field. The 2.25 headline stays tied to the complex numbers.',
      commercial:
        'Exact-arithmetic software that already documents an exponent by field is the nearest edge, and the ceilings to cite are the ones in the claim after the Simons examination. This entry includes no implementation.',
    },
  ],
  demoId: 'matrix-mult',
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
      label: 'Preprint PDF (nine-fourths)',
      href: 'https://github.com/openai/math/blob/main/preprints/Matrix-Multiplication-Nine-Fourths-October-2-2026/paper.pdf',
    },
  ],
}
