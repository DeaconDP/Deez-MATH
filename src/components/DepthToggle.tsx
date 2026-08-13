import { Toggle } from './Toggle'
import { useDepth } from '../hooks/useDepth'

type Props = {
  compact?: boolean
}

export function DepthToggle({ compact = false }: Props) {
  const { deep, setDeep } = useDepth()
  return (
    <Toggle
      id="go-deeper"
      checked={deep}
      onChange={setDeep}
      label="Go deeper"
      hint="Show formal math"
      compact={compact}
    />
  )
}
