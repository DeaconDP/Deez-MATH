import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'mahler',
  importance: 33,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Mahler conjectures hold in every dimension',
  field: 'Convex geometry',
  glance:
    'Volume times polar volume is minimized by Hanner polytopes in the symmetric case and by simplices in general.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'The Mahler conjectures ask which convex bodies make volume times polar volume as small as possible. The symmetric conjecture keeps only bodies that are symmetric through the origin. The nonsymmetric conjecture asks the same question for general convex bodies. On 6 Oct 2026 the OpenAI math catalog published a claim that both geometric conjectures hold in every dimension. Hanner polytopes minimize the product in the symmetric case. Simplices minimize it in the general case. Equality cases are classified. Sharp functional Mahler inequalities are part of the claim. For n ≥ 2, every symmetric polar product K × K° in dimension 2n has Gromov width 4.',
    whyItMatters:
      'Volume times polar volume is a basic comparison between a convex body and its polar. Naming the minimizers in every dimension, and classifying equality, answers a classical question in convex geometry. The same claim gives one symplectic width for every symmetric polar product in dimension 2n, once n is at least 2.',
    result:
      'Both the symmetric and the nonsymmetric geometric Mahler conjectures hold in every dimension, on the catalog claim. Volume times polar volume is minimized by Hanner polytopes in the symmetric case and by simplices in the general case, with equality cases classified. Sharp functional Mahler inequalities hold. For n ≥ 2, every symmetric polar product K × K° in dimension 2n has Gromov width 4.',
  },
  deep: {
    statement:
      'The symmetric Mahler conjecture and the nonsymmetric Mahler conjecture both hold in every dimension. Among convex bodies symmetric through the origin, volume times polar volume is minimized by Hanner polytopes. Among general convex bodies, it is minimized by simplices. Equality cases are classified. Sharp functional Mahler inequalities hold. For each integer n ≥ 2 and each convex body K of dimension n that is symmetric through the origin, the product K × K° in dimension 2n has Gromov width 4.',
    notes: [
      'Public in the OpenAI math catalog on 6 Oct 2026, from an OpenAI internal frontier model. The two preprints in openai/math are dated 22 Sep 2026.',
      'Simons examination on 15 Oct 2026. Catalog formalization review is unchecked. This app does not machine-check the argument, and no Lean certificate is attached.',
    ],
    jargon: [
      {
        term: 'Polar body',
        def: 'The set of points that pair with every point of the body by at most 1. Its volume is the second factor in the volume product.',
      },
      {
        term: 'Volume product',
        def: 'Volume times polar volume. The conjectures say this product is minimized by Hanner polytopes in the symmetric case and by simplices in general.',
      },
      {
        term: 'Hanner polytope',
        def: 'A polytope symmetric through the origin, built from a segment by products and polars. These are the claimed symmetric minimizers.',
      },
      {
        term: 'Gromov width',
        def: 'A symplectic measure of how large a ball embeds into a shape. The claim sets it to 4 for every symmetric polar product in dimension 2n, when n ≥ 2.',
      },
    ],
  },
  applications: [
    {
      id: 'volume-product',
      title: 'Smallest volume times polar volume',
      domain: 'geometry',
      blurb: 'Hanner polytopes and simplices are the claimed minimizers of that product.',
      detail:
        'Convex geometry compares a body with its polar by multiplying their volumes. The catalog claim names the minimizers. Hanner polytopes in the symmetric case, simplices in the general case, with equality classified. Sharp functional versions of the same comparison are claimed too. Later bounds can quote those shapes as the floor.',
      commercial:
        'Computational-geometry and convex-optimization libraries compute polars and volumes. They can quote Hanner polytopes and simplices as the claimed minimum of volume times polar volume.',
    },
    {
      id: 'polar-gromov-width',
      title: 'Width of a symmetric polar product',
      domain: 'geometry',
      blurb: 'For n ≥ 2, every symmetric K × K° in dimension 2n has Gromov width 4.',
      detail:
        'Gromov width measures how large a ball fits inside a shape after a symplectic embedding. The claim says that width is 4 for every product of a symmetric convex body with its polar, in dimension 2n, when n ≥ 2. The same number is claimed for every such body.',
      commercial:
        'Symplectic geometry groups are the audience. Labs that publish model-written mathematics can cite Gromov width 4 for these products.',
    },
  ],
  demoId: 'mahler',
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
      label: 'Preprint PDF, symmetric Mahler conjecture',
      href: 'https://github.com/openai/math/blob/main/preprints/The-symmetric-Mahler-conjecture-and-its-equality-cases-September-22-2026/paper.pdf',
    },
    {
      label: 'Preprint PDF, Mahler conjecture for general convex bodies',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Mahler-Conjecture-for-General-Convex-Bodies-September-22-2026/paper.pdf',
    },
  ],
}
