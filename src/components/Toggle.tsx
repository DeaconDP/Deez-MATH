type Props = {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
  id?: string
  compact?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  id = 'toggle',
  compact = false,
}: Props) {
  return (
    <div className={compact ? 'toggle-row toggle-row--header' : 'toggle-row'}>
      <div className="toggle-meta">
        <strong id={`${id}-label`}>{label}</strong>
        {!compact && hint ? <span id={`${id}-hint`}>{hint}</span> : null}
      </div>
      <button
        type="button"
        className="toggle"
        role="switch"
        id={id}
        title={hint}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={!compact && hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" aria-hidden="true" />
      </button>
    </div>
  )
}
