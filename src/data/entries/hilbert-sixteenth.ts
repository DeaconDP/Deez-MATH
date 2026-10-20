import type { Breakthrough } from '../types'

/** Uniform boundedness in Hilbert's sixteenth problem. No explicit general-degree cap. */
export const entry: Breakthrough = {
  id: 'hilbert-sixteenth',
  importance: 29,
  series: 'landmark',
  when: 'Oct 2026',
  title: "Uniform bound in Hilbert's sixteenth problem",
  field: 'Dynamical systems',
  glance:
    'Isolated periodic orbits of a real planar polynomial vector field stay under a finite cap that depends only on the degree.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: "Hilbert's sixteenth problem asks how many isolated periodic orbits a polynomial differential equation in the plane can have. On 6 Oct 2026 OpenAI published a manuscript from an internal frontier model. For each degree, some finite constant depending only on that degree bounds the isolated periodic orbits of every real planar polynomial vector field of that degree. Classical quintic Liénard systems are sharper. Their exact maximum is two limit cycles.",
    whyItMatters:
      'For more than a century the open question was whether, at a fixed degree, changing coefficients could produce arbitrarily many isolated cycles. A finite cap that depends only on the degree would close that question. The manuscript asserts that such a cap exists. An explicit formula for the cap at every degree is absent.',
    result:
      'A finite bound depending only on the degree, for isolated periodic orbits of real planar polynomial vector fields, and an exact maximum of two limit cycles for classical quintic Liénard systems.',
  },
  deep: {
    statement:
      'For every degree d there exists a finite constant C(d), depending only on d, such that every real planar polynomial vector field of degree d has at most C(d) isolated periodic orbits. For a classical Liénard system whose polynomial has degree at most 5, the number of geometrically distinct isolated periodic orbits is at most 2, and some such system attains 2. No formula for C(d) at every degree is part of the claim.',
    notes: [
      'Public on 6 Oct 2026 in the OpenAI mathematics catalog. The uniform-bounds manuscript is dated 24 Sep 2026. Its abstract separates asymptotic expansions on nested complex domains, then counts with a finite-dimensional argument.',
      'Formalization review in the OpenAI catalog is unchecked. This app does not machine-check the argument.',
      'Simons examination, 15 Oct 2026. OpenAI announced a Simons Foundation program, funded with $5 million, for mathematicians to examine AI results from the 6 Oct release, including this manuscript. The announcement does not publish a verdict on the proof.',
    ],
    jargon: [
      {
        term: 'Limit cycle',
        def: 'An isolated periodic orbit. Nearby trajectories do not all share that same closed path.',
      },
      {
        term: 'Uniform bound',
        def: 'A finite cap that depends only on the degree, not on the particular coefficients.',
      },
    ],
  },
  applications: [
    {
      id: 'planar-flows',
      title: 'Planar polynomial flows',
      domain: 'analysis',
      blurb: 'At fixed degree, isolated cycles sit under one finite cap.',
      detail:
        'People who study polynomial differential equations in the plane ask whether changing coefficients, at a fixed degree, can create arbitrarily many isolated cycles. The claim supplies a finite constant, depending only on the degree, that bounds every such count. Cycle-hunting tools can treat an infinite family at that degree as impossible. They still have no specific integer to display for a general degree.',
      commercial:
        'ODE tools such as MATLAB and Mathematica sell phase portraits and cycle hunting. From this manuscript they can describe a degree-only finite cap. They cannot print a specific integer for a general degree, because the manuscript does not give one.',
    },
    {
      id: 'lienard-quintic',
      title: 'Quintic Liénard oscillators',
      domain: 'geometry',
      blurb: 'Classical quintic Liénard systems have at most two limit cycles.',
      detail:
        'The Liénard equation is the standard planar model for a nonlinear oscillator, with a polynomial damping term. When that polynomial has degree at most 5, the claim is sharp. There are at most two geometrically distinct isolated periodic orbits, and two occurs. Circuit and mechanics models that already use this quintic family can treat two as the exact maximum.',
      commercial:
        'Nonlinear-dynamics software and circuit-simulation vendors can state an exact maximum of two limit cycles for this classical family. That count is specific to polynomial degree at most 5.',
    },
  ],
  demoId: 'hilbert-sixteenth',
  sources: [
    {
      label: 'OpenAI, Sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'openai/math catalog',
      href: 'https://github.com/openai/math',
    },
    {
      label: 'Uniform bounds manuscript, 24 Sep 2026',
      href: 'https://github.com/openai/math/blob/main/preprints/uniform-bounds-for-planar-polynomial-limit-cycles-September-24-2026/uniform-bounds-for-planar-polynomial-limit-cycles-September-24-2026.pdf',
    },
  ],
}
