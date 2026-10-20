import type { Breakthrough } from '../types'

export const entry: Breakthrough = {
  id: 'hilbert-tenth-q',
  importance: 23,
  series: 'landmark',
  when: 'Oct 2026',
  title: "Hilbert's tenth problem over the rationals",
  field: 'Logic / number theory',
  glance:
    'No algorithm decides whether an integer polynomial in any number of variables has a rational zero.',
  discoveredBy: { kind: 'openai', label: 'OpenAI internal frontier model' },
  plain: {
    what: "Hilbert's tenth problem asks for a finite procedure that takes a polynomial equation with integer coefficients and says whether the integers solve it. Matiyasevich showed there is no such procedure. The rational version asks a different question. Does an integer-coefficient polynomial in any number of variables have a rational zero? OpenAI's 6 Oct 2026 math catalog claims that no algorithm decides that question either.",
    whyItMatters:
      'A single procedure would settle every such polynomial, including the ones that are not obvious by inspection. Easy examples already go both ways, which is why a uniform algorithm would be valuable. The integer problem has been impossible since Matiyasevich. The catalog claims the rational problem is impossible too.',
    result:
      "The announced claim is a negative answer to Hilbert's tenth problem over the rationals. No algorithm decides whether an integer-coefficient polynomial in an arbitrary number of variables has a rational zero. This app does not check the proof.",
  },
  deep: {
    statement:
      'There is no algorithm that takes a polynomial with integer coefficients in any finite number of variables and decides whether some rational numbers make it equal zero.',
    notes: [
      'Over the integers, Matiyasevich already showed that no algorithm decides solvability. A rational zero is a different question. A rational solution need not be an integer, and the absence of integer solutions need not rule out rational ones.',
      "OpenAI posted the claim on 6 Oct 2026 in its math catalog, with a preprint in the openai/math repository. The catalog's formalization review for this item was unchecked. This app does not machine-check the proof.",
      'Simons announced an independent examination on 15 Oct 2026. That examination is ongoing.',
    ],
    jargon: [
      {
        term: 'Rational zero',
        def: 'A choice of rational numbers, one for each variable, that makes the polynomial equal zero.',
      },
      {
        term: "Hilbert's tenth problem",
        def: 'The demand for an algorithm that decides whether an integer-coefficient polynomial equation has solutions. Over the integers, Matiyasevich showed there is none. Over the rationals, the question is about rational zeros.',
      },
    ],
  },
  applications: [
    {
      id: 'rational-diophantine',
      title: 'Rational solutions of polynomial equations',
      domain: 'number-theory',
      blurb: 'Obvious yes and no examples still leave no uniform test for every integer polynomial.',
      detail:
        "Number theorists ask whether a polynomial equation has a solution in the rational numbers. Some families are easy, including a linear polynomial with an obvious rational root and a square plus one, which stays positive. The announced claim says those special cases do not combine into one algorithm for an arbitrary number of variables. Matiyasevich's theorem on integer solutions does not settle the rational question.",
      commercial:
        'Computer-algebra vendors sell solvers for one variable and for named equation families. They cannot guarantee a rational-zero answer for every integer polynomial in every number of variables.',
    },
    {
      id: 'decision-limits',
      title: 'Limits on yes-or-no algorithms',
      domain: 'foundations',
      blurb: 'Some polynomial questions have no algorithm that works for every input.',
      detail:
        "Computability asks which yes-or-no questions a program can settle for every input. Integer solvability was the classical example. The catalog's claim puts rational zeros on the same list. Restricted families can still have their own procedures. The missing object is one procedure for all integer polynomials in all numbers of variables.",
      commercial:
        'A product can sell a decision procedure for a restricted family only if it states the restriction. A general rational-zero oracle would be an algorithm the catalog claims does not exist.',
    },
  ],
  demoId: 'hilbert-tenth-q',
  sources: [
    {
      label: 'OpenAI, sharing AI progress in mathematics',
      href: 'https://openai.com/index/sharing-ai-progress-in-mathematics/',
    },
    {
      label: 'OpenAI math catalog',
      href: 'https://github.com/openai/math',
    },
    {
      label: "Preprint, Hilbert's tenth problem over the rational numbers",
      href: 'https://github.com/openai/math/blob/main/preprints/Hilberts-tenth-problem-over-the-rational-numbers-October-6-2026/main.pdf',
    },
  ],
}
