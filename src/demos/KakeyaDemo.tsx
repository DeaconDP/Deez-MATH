import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { DimSlider } from './shared/DimSlider'

/**
 * Perron-tree (Schoenberg / Besicovitch) construction in the plane.
 * An equilateral triangle T (base on y = 0, apex at height H) is cut into 2^k thin
 * "elementary" triangles that share the apex. Each one is only TRANSLATED sideways,
 * so every needle direction it contained survives. Pairs are slid together level by
 * level so they overlap; the union shrinks while still holding a segment in every
 * direction of a 60° fan.
 */

const H = Math.sqrt(3) / 2
const HALF_ANGLE = Math.atan(0.5 / H) // 30°

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!m) return
    const on = () => setReduced(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Horizontal shift of each elementary triangle after `progress` (0..k) merge levels. */
function perronShifts(k: number, alpha: number, progress: number): number[] {
  const n = 1 << k
  const w = 1 / n
  const shift = new Array<number>(n).fill(0)
  let starts = Array.from({ length: n }, (_, i) => i * w)
  let len = w
  for (let level = 1; level <= k; level++) {
    const amount = Math.max(0, Math.min(1, progress - (level - 1)))
    if (amount <= 0) break
    const eased = amount < 1 ? 0.5 - 0.5 * Math.cos(Math.PI * amount) : 1
    const blockSize = 1 << (level - 1)
    const next: number[] = []
    for (let b = 0; b < starts.length / 2; b++) {
      const p = starts[2 * b]
      const q = starts[2 * b + 1]
      // put the right heart flush against the left one, then slide it a further 2ℓ(1−α)
      const delta = (p + len - q - 2 * len * (1 - alpha)) * eased
      for (let i = (2 * b + 1) * blockSize; i < (2 * b + 2) * blockSize; i++) shift[i] += delta
      next.push(p)
    }
    if (amount < 1) break
    starts = next
    len = 2 * len * alpha
  }
  return shift
}

/** Area of the union, measured by slicing horizontally (exact per slice). */
function unionArea(k: number, shift: number[], slices = 160): number {
  const n = 1 << k
  const w = 1 / n
  let total = 0
  const lo = new Float64Array(n)
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let m = 0; m < slices; m++) {
    const t = (m + 0.5) / slices
    for (let i = 0; i < n; i++) lo[i] = i * w * (1 - t) + 0.5 * t + shift[i]
    idx.sort((a, b) => lo[a] - lo[b])
    const width = w * (1 - t)
    let covered = 0
    let cs = -Infinity
    let ce = -Infinity
    for (const i of idx) {
      const a = lo[i]
      const b = a + width
      if (a > ce) {
        if (ce > cs) covered += ce - cs
        cs = a
        ce = b
      } else if (b > ce) ce = b
    }
    if (ce > cs) covered += ce - cs
    total += (covered * H) / slices
  }
  return total
}

const TRI_AREA = 0.5 * H

function colorFor(i: number, n: number) {
  const u = n === 1 ? 0.5 : i / (n - 1)
  const hue = 172 - u * 128 // teal → gold
  return `hsl(${hue.toFixed(0)} 85% 58%)`
}

export function KakeyaDemo() {
  const [k, setK] = useState(6)
  const [alpha, setAlpha] = useState(0.82)
  const [progress, setProgress] = useState(6)
  const [playing, setPlaying] = useState(false)
  const [theta, setTheta] = useState(0.18)
  const [sweep, setSweep] = useState(true)
  const reduced = usePrefersReducedMotion()
  const svgRef = useRef<SVGSVGElement | null>(null)

  const n = 1 << k
  const shift = useMemo(() => perronShifts(k, alpha, progress), [k, alpha, progress])
  const area = useMemo(() => unionArea(k, shift), [k, shift])
  const finalShift = useMemo(() => perronShifts(k, alpha, k), [k, alpha])

  // stable frame: union of the starting triangle and the finished tree
  const frame = useMemo(() => {
    let minX = 0
    for (let i = 0; i < n; i++) minX = Math.min(minX, finalShift[i] + 0.5, finalShift[i] + i / n)
    const minXp = minX - 0.04
    const maxX = 1.04
    return { minX: minXp, maxX, scale: 300 / (maxX - minXp) }
  }, [finalShift, n])

  const W = 300
  const PADT = 14
  const VH = H * frame.scale + PADT * 2
  const X = (x: number) => (x - frame.minX) * frame.scale
  const Y = (y: number) => PADT + (H - y) * frame.scale

  // play the merge, level by level
  useEffect(() => {
    if (!playing) return
    if (reduced) {
      setProgress(k)
      setPlaying(false)
      return
    }
    let raf = 0
    let last = performance.now()
    let p = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      p = Math.min(k, p + dt * 1.1)
      setProgress(p)
      if (p >= k) setPlaying(false)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, k, reduced])

  // needle sweeps through the fan of directions
  useEffect(() => {
    if (!sweep || reduced) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const s = (now - t0) / 1000
      setTheta(HALF_ANGLE * 0.985 * Math.sin(s * 0.7))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sweep, reduced])

  const onPointer = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return
    const svg = svgRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const u = (e.clientX - r.left) / r.width
    setSweep(false)
    setTheta(Math.max(-1, Math.min(1, u * 2 - 1)) * HALF_ANGLE * 0.995)
  }

  // the needle: from the (shifted) apex down to base point x = 0.5 + H·tanθ
  const baseX = 0.5 + H * Math.tan(theta)
  const host = Math.max(0, Math.min(n - 1, Math.floor(baseX * n)))
  const hs = shift[host]
  const needle = { x1: X(0.5 + hs), y1: Y(H), x2: X(baseX + hs), y2: Y(0) }
  const pct = (area / TRI_AREA) * 100
  const bound = (alpha ** (2 * k) + 2 * (1 - alpha)) * 100

  const findBestAlpha = () => {
    let best = alpha
    let bestA = Infinity
    for (let a = 0.55; a <= 0.96; a += 0.01) {
      const A = unionArea(k, perronShifts(k, a, k), 120)
      if (A < bestA) {
        bestA = A
        best = a
      }
    }
    setAlpha(Number(best.toFixed(2)))
    setProgress(k)
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Shrink the set, keep every direction</h3>
      <p className="demo-hint">
        A Kakeya set holds a needle in every direction. Start with a triangle cut into 2^k thin
        slivers. Press play: slivers only slide sideways, so each keeps its directions, yet they
        pile on top of each other and the total area collapses. Drag across the picture to aim the
        needle; it always fits somewhere.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${VH.toFixed(1)}`}
        role="img"
        aria-label={`Perron tree with ${n} slivers, area ${pct.toFixed(0)} percent of the triangle`}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        style={{ cursor: 'ew-resize' }}
      >
        <defs>
          <filter id="kk-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="kk-ground" x1="0" x2="1">
            <stop offset="0" stopColor="#2ee6c5" stopOpacity="0" />
            <stop offset="0.5" stopColor="#2ee6c5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#2ee6c5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* ghost of the original triangle */}
        <polygon
          points={`${X(0)},${Y(0)} ${X(1)},${Y(0)} ${X(0.5)},${Y(H)}`}
          fill="none"
          stroke="#8aa39a"
          strokeOpacity={0.35}
          strokeDasharray="4 4"
        />
        <line x1={0} x2={W} y1={Y(0)} y2={Y(0)} stroke="url(#kk-ground)" strokeWidth={1} />
        <g style={{ mixBlendMode: 'screen' }}>
          {shift.map((s, i) => {
            const a = i / n + s
            const b = (i + 1) / n + s
            const ax = 0.5 + s
            return (
              <polygon
                key={i}
                points={`${X(a).toFixed(2)},${Y(0).toFixed(2)} ${X(b).toFixed(2)},${Y(0).toFixed(2)} ${X(ax).toFixed(2)},${Y(H).toFixed(2)}`}
                fill={colorFor(i, n)}
                fillOpacity={i === host ? 0.85 : 0.32}
                stroke={colorFor(i, n)}
                strokeOpacity={0.55}
                strokeWidth={0.4}
              />
            )
          })}
        </g>
        <line
          {...needle}
          stroke="#ffffff"
          strokeWidth={2.4}
          strokeLinecap="round"
          filter="url(#kk-glow)"
        />
        <circle cx={needle.x1} cy={needle.y1} r={3} fill="#ffffff" />
        <text x={8} y={VH - 6} fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">
          needle {((theta * 180) / Math.PI).toFixed(1)}° · sliver {host + 1}/{n}
        </text>
        <text x={W - 8} y={VH - 6} fill="#f0c95a" fontSize="9" fontFamily="IBM Plex Mono" textAnchor="end">
          area {pct.toFixed(1)}%
        </text>
      </svg>

      <div style={{ margin: '0.75rem 0 0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="pill-inline">Area left, vs. original triangle</span>
          <span className="stat">{pct.toFixed(1)}%</span>
        </div>
        <div className="meter" aria-hidden="true">
          <span
            style={{
              width: `${Math.min(100, pct)}%`,
              background: 'linear-gradient(90deg, #f0c95a, #2ee6c5)',
              transition: playing ? 'none' : 'width 200ms ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="pill-inline">Directions still covered</span>
          <span className="stat" style={{ color: 'var(--ok)' }}>
            all 60° (100%)
          </span>
        </div>
      </div>

      <div className="controls">
        <DimSlider
          label="Cuts k (2^k slivers)"
          value={k}
          min={1}
          max={9}
          onChange={(v) => {
            setK(v)
            setProgress(v)
            setPlaying(false)
          }}
          format={(v) => `${v} → ${1 << v} slivers`}
        />
        <DimSlider
          label="Overlap α (smaller = slide further)"
          value={alpha}
          min={0.55}
          max={0.96}
          step={0.01}
          onChange={(v) => {
            setAlpha(v)
            setProgress(k)
            setPlaying(false)
          }}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setProgress(0)
            setPlaying(true)
          }}
        >
          {playing ? 'Merging…' : '▶ Play the merge'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={findBestAlpha}>
          Best α for this k
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSweep((s) => !s)}>
          {sweep ? 'Stop needle' : 'Sweep needle'}
        </button>
      </div>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        Textbook bound for this α: area ≤ α^(2k) + 2(1−α) = {bound.toFixed(1)}%. Measured:{' '}
        {pct.toFixed(1)}%.
      </p>
      <p className="demo-callout">
        Push k up and the area keeps falling toward 0 (slowly), while the 60° fan of directions
        never loses a single needle. Three rotated copies cover all 180°. That is Besicovitch’s
        paradox in the plane: Kakeya sets can have zero area, yet they still have full
        dimension 2. Hong Wang and Joshua Zahl proved the 3D version: a needle-in-every-direction
        set in space must have dimension 3. This picture is the 2D intuition, not their proof.
      </p>
    </div>
  )
}
