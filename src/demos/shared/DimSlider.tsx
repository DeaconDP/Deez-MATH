type Props = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}

export function DimSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = String,
}: Props) {
  return (
    <label>
      {label}: <span className="stat">{format(value)}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
