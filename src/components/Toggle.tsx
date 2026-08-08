type Props = {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
  id?: string
}

export function Toggle({ checked, onChange, label, hint, id = 'toggle' }: Props) {
  return (
    <div className="toggle-row">
      <div className="toggle-meta">
        <strong id={`${id}-label`}>{label}</strong>
        {hint ? <span id={`${id}-hint`}>{hint}</span> : null}
      </div>
      <button
        type="button"
        className="toggle"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" aria-hidden="true" />
      </button>
    </div>
  )
}
