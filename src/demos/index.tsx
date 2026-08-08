import type { ReactNode } from 'react'
import { SpherePackingDemo } from './SpherePackingDemo'
import { CodesDemo } from './CodesDemo'
import { NonSoficDemo } from './NonSoficDemo'
import { ConnesDemo } from './ConnesDemo'
import { PermanentDemo } from './PermanentDemo'
import { QuantumRepetitionDemo } from './QuantumRepetitionDemo'
import { CvpDemo } from './CvpDemo'
import { EhrhartDemo } from './EhrhartDemo'
import { RamseyDemo } from './RamseyDemo'
import { ExtremalDemo } from './ExtremalDemo'
import { JacobianDemo } from './JacobianDemo'
import { UnitDistanceDemo } from './UnitDistanceDemo'
import { KakeyaDemo } from './KakeyaDemo'
import { AndreOortDemo } from './AndreOortDemo'
import { CohenLenstraDemo } from './CohenLenstraDemo'
import { Erdos728Demo } from './Erdos728Demo'
import { FieldsPdeDemo } from './FieldsPdeDemo'

const MAP: Record<string, () => ReactNode> = {
  'sphere-packing': () => <SpherePackingDemo />,
  codes: () => <CodesDemo />,
  'non-sofic': () => <NonSoficDemo />,
  connes: () => <ConnesDemo />,
  permanent: () => <PermanentDemo />,
  'quantum-repetition': () => <QuantumRepetitionDemo />,
  cvp: () => <CvpDemo />,
  ehrhart: () => <EhrhartDemo />,
  ramsey: () => <RamseyDemo />,
  extremal: () => <ExtremalDemo />,
  jacobian: () => <JacobianDemo />,
  'unit-distance': () => <UnitDistanceDemo />,
  kakeya: () => <KakeyaDemo />,
  'andre-oort': () => <AndreOortDemo />,
  'cohen-lenstra': () => <CohenLenstraDemo />,
  'erdos-728': () => <Erdos728Demo />,
  'fields-pde': () => <FieldsPdeDemo />,
}

export function DemoFor({ id }: { id: string }) {
  const render = MAP[id]
  if (!render) {
    return (
      <div className="demo">
        <p className="feedback err">Demo not found.</p>
      </div>
    )
  }
  return <>{render()}</>
}
