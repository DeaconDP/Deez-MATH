import { Toggle } from './Toggle'
import { useDepth } from '../hooks/useDepth'

export function DepthToggle() {
  const { deep, setDeep } = useDepth()
  return (
    <Toggle
      id="go-deeper"
      checked={deep}
      onChange={setDeep}
      label="Go deeper"
      hint="Show formal statements and jargon"
    />
  )
}
