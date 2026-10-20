import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'bsd-low-corank',
  importance: 22,
  series: 'landmark',
  when: 'Oct 2026',
  title: 'BSD leading term for Selmer corank 0 or 1',
  field: 'Number theory',
    glance:
      'A claimed exact formula for rational points on an elliptic curve when a prime-power count is 0 or 1. The prize problem for every curve stays open.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: 'Elliptic curves are equations like y² = x³ + ax + b. Their rational points form a group, and rank counts how many independent points of infinite order that group needs. The Birch and Swinnerton-Dyer conjecture predicts that rank from a formula attached to the curve, and it predicts the first nonzero term of that formula. On 6 Oct 2026 OpenAI released work from an internal frontier model that claims this full leading-term formula for every elliptic curve over the rationals whose prime-power count is 0 or 1 for some prime. The claim includes finiteness of the usual obstruction group in that range. OpenAI says that, with a separate Goldfeld claim, the same formula then holds for a density-one set of quadratic twists of every elliptic curve over the rationals.',
    whyItMatters:
      'The full conjecture is a Clay Millennium Prize problem. A proof for every curve would tie rational points to that formula with no leftover cases. This claim, if it holds, covers only curves that meet the 0 or 1 count for at least one prime. Curves that miss the count at every prime stay outside it. The open-problems catalog in this app still lists Birch and Swinnerton-Dyer.',
    result:
      'In that 0 or 1 range, the manuscript claims that the number of independent rational points matches how flat the formula is, that the obstruction group is finite, and that the first nonzero term has its classical value. OpenAI says the separate Goldfeld claim then puts the full formula on a density-one set of quadratic twists of every elliptic curve over the rationals. The claim does not cover every elliptic curve.',
  },
  deep: {
    statement:
      'Let E be an elliptic curve over Q. Suppose that for some prime p the full p-power Selmer group of E has corank 0 or 1. The 7 Oct 2026 manuscript claims that this corank equals both the Mordell-Weil rank of E(Q) and the order of vanishing of L(E, s) at s = 1, that Sha(E/Q) is finite, and that the leading Taylor coefficient of L(E, s) at s = 1 equals the classical Birch and Swinnerton-Dyer value. That value uses the real period, regulator, Tamagawa numbers, torsion, and the order of Sha, under the normalizations written in the manuscript. The manuscript states no extra hypothesis on reduction, rational torsion, isogenies, complex multiplication, or residual Galois representations. It also says the low-corank hypothesis is essential, and that a bound on Mordell-Weil rank alone does not replace it. This is not the Birch and Swinnerton-Dyer conjecture for every elliptic curve over Q.',
    notes: [
      'The manuscript is part of the OpenAI 6 Oct 2026 mathematics release and is dated 7 Oct 2026. This app does not machine-check the proof. A formalization review of this catalog item was not done.',
      'On 15 Oct 2026 OpenAI said it is contributing $5 million to a Simons Foundation initiative so mathematicians can examine, understand, and build on the results in that release. The Simons Foundation manages the funding for workshops, conferences, and special programs.',
      'The OpenAI catalog says that together with a separate Goldfeld claim, this yields the full formula for a density-one set of quadratic twists of every elliptic curve over Q. This app still lists the Millennium problem for a general elliptic curve as open.',
    ],
    jargon: [
      {
        term: 'Selmer corank',
        def: 'The corank of the full p-power Selmer group, a prime-power count of rational points and obstructions. The claim is the case 0 or 1 for some prime p.',
      },
      {
        term: 'Tate-Shafarevich group',
        def: 'The usual obstruction group, written Sha. The claim says it is finite when the Selmer corank is 0 or 1.',
      },
      {
        term: 'Leading term',
        def: 'The first nonzero Taylor coefficient of L(E, s) at s = 1.',
      },
    ],
  },
  applications: [
    {
      id: 'low-corank-points',
      title: 'Rational points in the small-count range',
      domain: 'number-theory',
      blurb: 'Claims an exact point formula when one prime-power count is 0 or 1.',
      detail:
        'People who compute rational points on elliptic curves already treat a small point count as the workable range. The manuscript claims the full leading-term formula once a prime-power count attached to the curve is 0 or 1 for some prime, and it claims the usual obstruction group is finite there. Curves that miss that count at every prime are outside the claim. The Millennium problem for every curve stays open in this app.',
      commercial:
        'Magma licenses and SageMath support sell elliptic-curve arithmetic, including rank computations. A checked formula in this range would be a feature for those tools. This release is a manuscript, and this app does not machine-check it, so a vendor cannot yet ship it as a settled theorem.',
    },
    {
      id: 'twist-density',
      title: 'Most quadratic twists of one curve',
      domain: 'number-theory',
      blurb: 'With a separate Goldfeld claim, most twists are said to get the full formula.',
      detail:
        'Start with one elliptic curve over the rationals and twist the equation by square-free integers. OpenAI says this leading-term claim, together with a separate Goldfeld claim, puts the full formula on a density-one set of those twists. Twists that miss the 0 or 1 count at every prime stay outside the claim.',
      commercial:
        'Nobody sells a density-one theorem as a product. Research groups and labs that already compute families of twists can treat the claim as something to examine. They cannot sell it as the Millennium problem solved.',
    },
  ],
  demoId: 'bsd-low-corank',
  sources: [
    {
      label: 'OpenAI, sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'openai/math repository',
      href: 'https://github.com/openai/math',
    },
    {
      label: 'Preprint, exact BSD formula from low Selmer corank',
      href: 'https://github.com/openai/math/blob/main/preprints/Exact-Birch-Swinnerton-Dyer-Formula-from-Low-Selmer-Corank-October-7-2026/exact-bsd-low-selmer-corank.pdf',
    },
  ],
}
