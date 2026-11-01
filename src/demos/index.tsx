import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'

// Each demo is its own chunk, loaded when its breakthrough page is opened.
const MAP: Record<string, LazyExoticComponent<ComponentType>> = {
  'sphere-packing': lazy(() => import('./SpherePackingDemo').then((m) => ({ default: m.SpherePackingDemo }))),
  codes: lazy(() => import('./CodesDemo').then((m) => ({ default: m.CodesDemo }))),
  'non-sofic': lazy(() => import('./NonSoficDemo').then((m) => ({ default: m.NonSoficDemo }))),
  connes: lazy(() => import('./ConnesDemo').then((m) => ({ default: m.ConnesDemo }))),
  permanent: lazy(() => import('./PermanentDemo').then((m) => ({ default: m.PermanentDemo }))),
  'quantum-repetition': lazy(() => import('./QuantumRepetitionDemo').then((m) => ({ default: m.QuantumRepetitionDemo }))),
  cvp: lazy(() => import('./CvpDemo').then((m) => ({ default: m.CvpDemo }))),
  ehrhart: lazy(() => import('./EhrhartDemo').then((m) => ({ default: m.EhrhartDemo }))),
  ramsey: lazy(() => import('./RamseyDemo').then((m) => ({ default: m.RamseyDemo }))),
  extremal: lazy(() => import('./ExtremalDemo').then((m) => ({ default: m.ExtremalDemo }))),
  jacobian: lazy(() => import('./JacobianDemo').then((m) => ({ default: m.JacobianDemo }))),
  'unit-distance': lazy(() => import('./UnitDistanceDemo').then((m) => ({ default: m.UnitDistanceDemo }))),
  kakeya: lazy(() => import('./KakeyaDemo').then((m) => ({ default: m.KakeyaDemo }))),
  'andre-oort': lazy(() => import('./AndreOortDemo').then((m) => ({ default: m.AndreOortDemo }))),
  'cohen-lenstra': lazy(() => import('./CohenLenstraDemo').then((m) => ({ default: m.CohenLenstraDemo }))),
  'erdos-728': lazy(() => import('./Erdos728Demo').then((m) => ({ default: m.Erdos728Demo }))),
  'fields-pde': lazy(() => import('./FieldsPdeDemo').then((m) => ({ default: m.FieldsPdeDemo }))),
  'flt-formalization': lazy(() => import('./FltFormalizationDemo').then((m) => ({ default: m.FltFormalizationDemo }))),
  'riemann-zeros': lazy(() => import('./RiemannZerosDemo').then((m) => ({ default: m.RiemannZerosDemo }))),
  'erdos-1196': lazy(() => import('./Erdos1196Demo').then((m) => ({ default: m.Erdos1196Demo }))),
  'quasi-riemann': lazy(() => import('./QuasiRiemannDemo').then((m) => ({ default: m.QuasiRiemannDemo }))),
  'bsd-low-corank': lazy(() => import('./BsdLowCorankDemo').then((m) => ({ default: m.BsdLowCorankDemo }))),
  'hilbert-tenth-q': lazy(() => import('./HilbertTenthDemo').then((m) => ({ default: m.HilbertTenthDemo }))),
  'unique-games': lazy(() => import('./UniqueGamesDemo').then((m) => ({ default: m.UniqueGamesDemo }))),
  'logspace-derandom': lazy(() => import('./LogspaceDerandomDemo').then((m) => ({ default: m.LogspaceDerandomDemo }))),
  'matrix-mult': lazy(() => import('./MatrixMultDemo').then((m) => ({ default: m.MatrixMultDemo }))),
  'catalan-constant': lazy(() => import('./CatalanConstantDemo').then((m) => ({ default: m.CatalanConstantDemo }))),
  'goldfeld': lazy(() => import('./GoldfeldDemo').then((m) => ({ default: m.GoldfeldDemo }))),
  'hilbert-sixteenth': lazy(() => import('./HilbertSixteenthDemo').then((m) => ({ default: m.HilbertSixteenthDemo }))),
  'plane-five-colors': lazy(() => import('./PlaneFiveColorsDemo').then((m) => ({ default: m.PlaneFiveColorsDemo }))),
  'erdos-reciprocal': lazy(() => import('./ErdosReciprocalDemo').then((m) => ({ default: m.ErdosReciprocalDemo }))),
  'falconer': lazy(() => import('./FalconerDemo').then((m) => ({ default: m.FalconerDemo }))),
  mahler: lazy(() => import('./MahlerDemo').then((m) => ({ default: m.MahlerDemo }))),
  'alphaproof-nexus': lazy(() => import('./AlphaproofNexusDemo').then((m) => ({ default: m.AlphaproofNexusDemo }))),
  'mip-star-lidt': lazy(() => import('./MipStarLidtDemo').then((m) => ({ default: m.MipStarLidtDemo }))),
  'ineq-dittert': lazy(() => import('./IneqDittertDemo').then((m) => ({ default: m.IneqDittertDemo }))),
  'eth-false': lazy(() => import('./EthFalseDemo').then((m) => ({ default: m.EthFalseDemo }))),
  'local-smoothing': lazy(() => import('./LocalSmoothingDemo').then((m) => ({ default: m.LocalSmoothingDemo }))),
  kls: lazy(() => import('./KlsDemo').then((m) => ({ default: m.KlsDemo }))),
}

export function DemoFor({ id }: { id: string }) {
  const Demo = MAP[id]
  if (!Demo) {
    return (
      <div className="demo">
        <p className="feedback err">Demo not found.</p>
      </div>
    )
  }
  return (
    <Suspense
      fallback={
        <div className="demo" aria-busy="true">
          <p className="feedback">Loading demo…</p>
        </div>
      }
    >
      <Demo />
    </Suspense>
  )
}
