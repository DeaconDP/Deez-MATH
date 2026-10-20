import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'quasi-riemann',
  importance: 21,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'Quasi-Riemann claim: zero-free past 7/8',
  field: 'Analytic number theory',
  glance:
    'Zeta and the functions that track primes in arithmetic progressions are claimed empty past 7/8. The Riemann hypothesis stays open.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'The Riemann hypothesis says every important zero of the zeta function sits on the vertical line at one-half. An October 2026 claim, produced with an OpenAI internal frontier model, stops short of that line. It says zeta, and every function of the same kind that tracks primes in an arithmetic progression, has no zeros to the right of seven-eighths. The same empty half-plane is claimed for a matching family on the number field made by adjoining the square root of -3. A companion paper claims a different argument for an empty region to the right of eleven-twelfths, and a uniform ban on one classical family of exceptional zeros near 1. This is not a proof of the Riemann hypothesis. The catalog entry that more than two-thirds of zeta zeros lie on the line at one-half is a different theorem. This claim does not replace it.',
    whyItMatters:
      'Where these functions are allowed to vanish controls the error in counting primes, including primes in an arithmetic progression. An empty region to the right of 7/8 would be a wide explicit input to that error, and it still leaves the band from one-half to 7/8 open. The Riemann hypothesis stays open. This app does not machine-check the proof. Independent examination was still underway, including a 15 October 2026 Simons Foundation effort funded by OpenAI.',
    result:
      'Zeta and the wider family that encodes primes in arithmetic progressions are claimed to have no zeros with real part above 7/8. The same half-plane is claimed for a related family over the field adjoining the square root of -3. A companion claims a different proof that the empty region starts at 11/12, plus a uniform exclusion of exceptional zeros near 1.',
  },
  deep: {
    statement:
      'Every Dirichlet L-function, including the Riemann zeta function, is zero-free in Re(s) > 7/8. The same half-plane is claimed for finite-order Hecke L-functions over Q(sqrt(-3)). A companion preprint claims a different proof of zero-freeness in Re(s) > 11/12, together with a uniform exclusion of Landau-Siegel zeros. The Riemann hypothesis asks for zero-freeness in Re(s) > 1/2 and remains open. Catalog id riemann-zeros is the separate theorem that more than two-thirds of nontrivial zeta zeros are simple and lie on Re(s) = 1/2.',
    notes: [
      'Announced in the OpenAI mathematics catalog of 6 October 2026. The main preprint is dated 30 September 2026. The companion preprint is dated 5 October 2026.',
      'This app does not machine-check the proof. Formalization review of this catalog was still unchecked as of the October 2026 community note.',
      'Independent examination was still underway, including a 15 October 2026 Simons Foundation effort funded by OpenAI.',
      'Distinct from catalog id riemann-zeros. This claim does not replace that theorem and does not prove the Riemann hypothesis.',
    ],
    jargon: [
      {
        term: 'Dirichlet L-function',
        def: 'A twist of the zeta function by a Dirichlet character. Zeta is the case of the trivial character, and the others track primes in arithmetic progressions.',
      },
      {
        term: 'Hecke L-function',
        def: 'An L-function attached to a Hecke character of a number field. The claim uses finite-order characters of Q(sqrt(-3)).',
      },
      {
        term: 'Landau-Siegel zero',
        def: 'A real zero of a real Dirichlet L-function sitting unusually close to s = 1. The companion claims these are excluded uniformly.',
      },
      {
        term: 'Critical line',
        def: 'The line Re(s) = 1/2. The Riemann hypothesis places the nontrivial zeros there. The 7/8 claim does not.',
      },
    ],
  },
  applications: [
    {
      id: 'prime-error',
      title: 'Prime counts and arithmetic progressions',
      domain: 'number-theory',
      blurb: 'A zero-free half-plane is the input that limits the error in a prime count.',
      detail:
        'Counting primes, and counting primes in an arithmetic progression, takes its error from the rightmost zero of the matching function. The claim says that real part is at most 7/8 for zeta and its arithmetic-progression cousins, and the same for one related family over the field adjoining the square root of -3. Until independent examination finishes, that cap is a claim, not a checked bound.',
      commercial:
        'No vendor should ship a prime-error guarantee on this preprint. The nearest commercial edge is research software for prime counts, and only after the outside examination finishes.',
    },
    {
      id: 'exceptional-zeros',
      title: 'Exceptional zeros near 1',
      domain: 'number-theory',
      blurb: 'The companion claims a uniform ban on exceptional zeros close to 1.',
      detail:
        'An exceptional zero of this kind sits on the real axis, unusually close to 1, for one real character. Classically it would distort primes in one arithmetic progression and the class number of an imaginary quadratic field. The companion preprint claims a uniform exclusion of these zeros, by a different argument from the 7/8 half-plane. That exclusion is part of the claim under review. This app does not check it, and it states no new class-number bound.',
      commercial:
        'Class-number tables and character-sum software are the nearest edge. They gain a citation only if the exclusion survives examination. There is no product in the claim itself.',
    },
  ],
  demoId: 'quasi-riemann',
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
      label: 'Main preprint, 30 Sep 2026',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/paper.pdf',
    },
    {
      label: 'Companion preprint, 5 Oct 2026',
      href: 'https://github.com/openai/math/blob/main/preprints/The-Quasi-Riemann-Hypothesis-October-5-2026/paper2.pdf',
    },
  ],
}
