import { entry as alphaproofNexus } from './alphaproof-nexus'
import { entry as bsdLowCorank } from './bsd-low-corank'
import { entry as catalanConstant } from './catalan-constant'
import { entry as erdosReciprocal } from './erdos-reciprocal'
import { entry as falconer } from './falconer'
import { entry as goldfeld } from './goldfeld'
import { entry as hilbertSixteenth } from './hilbert-sixteenth'
import { entry as hilbertTenthQ } from './hilbert-tenth-q'
import { entry as ineqDittert } from './ineq-dittert'
import { entry as logspaceDerandom } from './logspace-derandom'
import { entry as mahler } from './mahler'
import { entry as matrixMult } from './matrix-mult'
import { entry as mipStarLidt } from './mip-star-lidt'
import { entry as planeFiveColors } from './plane-five-colors'
import { entry as quasiRiemann } from './quasi-riemann'
import { entry as uniqueGames } from './unique-games'
import type { Breakthrough } from '../types'

/** October 2026 catch-up. One file per result so writers do not share landmarks.ts. */
export const octoberBreakthroughs: Breakthrough[] = [
  quasiRiemann,
  bsdLowCorank,
  hilbertTenthQ,
  uniqueGames,
  logspaceDerandom,
  matrixMult,
  catalanConstant,
  goldfeld,
  hilbertSixteenth,
  planeFiveColors,
  erdosReciprocal,
  falconer,
  mahler,
  alphaproofNexus,
  mipStarLidt,
  ineqDittert,
]
