import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

const CW = 720
const CH = 460
const GX = 16
const GY = 16
const GS = 428
const PL = 500 // plot panel
const PR = 704
const PT = 40
const PB = 300
const L_MIN = 3
const L_MAX = 40
const MS = [1, 5, 25, 65, 325, 1105]
const Y_MAX = 12

/** Undirected integer vectors (a, b) with a^2 + b^2 = m. */
function vectors(m: number) {
  const out: [number, number][] = []
  const r = Math.floor(Math.sqrt(m))
  for (let a = 0; a <= r; a++) {
    for (let b = -r; b <= r; b++) {
      if (a * a + b * b !== m) continue
      if (a > 0 || (a === 0 && b > 0)) out.push([a, b])
    }
  }
  return out
}
const VECS = new Map(MS.map((m) => [m, vectors(m)]))

/** Pairs of points of the L x L grid at distance exactly sqrt(m). */
function edgeCount(L: number, m: number) {
  let e = 0
  for (const [a, b] of VECS.get(m) ?? []) {
    const da = Math.abs(a)
    const db = Math.abs(b)
    if (da < L && db < L) e += (L - da) * (L - db)
  }
  return e
}

const lx = (n: number) => PL + ((PR - PL) * (Math.log10(n) - Math.log10(L_MIN * L_MIN))) / (Math.log10(L_MAX * L_MAX) - Math.log10(L_MIN * L_MIN))
const ly = (v: number) => PB - ((PB - PT) * Math.min(v, Y_MAX)) / Y_MAX

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function UnitDistanceDemo() {
  const [L, setL] = useState(14)
  const [m, setM] = useState(25)
  const [focus, setFocus] = useState<[number, number] | null>([6, 7])
  const [growT, setGrowT] = useState(1)
  const [playing, setPlaying] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const vecs = useMemo(() => VECS.get(m) ?? [], [m])
  const n = L * L
  const E = edgeCount(L, m)
  const best = useMemo(() => {
    const out: { L: number; m: number; e: number }[] = []
    for (let l = L_MIN; l <= L_MAX; l++) {
      let bm = 1
      let be = 0
      for (const mm of MS) {
        const e = edgeCount(l, mm)
        if (e > be) {
          be = e
          bm = mm
        }
      }
      out.push({ L: l, m: bm, e: be })
    }
    return out
  }, [])
  const bestHere = best[L - L_MIN]

  // edges grow in whenever the grid or the length changes
  useEffect(() => {
    if (reducedMotion()) {
      setGrowT(1)
      return
    }
    let raf = 0
    const t0 = performance.now()
    setGrowT(0)
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 650)
      setGrowT(1 - (1 - k) ** 3)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [L, m])

  // "Grow n" play: step the grid size up
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setL((v) => Math.min(L_MAX, v + 1)), reducedMotion() ? 60 : 380)
    return () => window.clearInterval(id)
  }, [playing])
  useEffect(() => {
    if (playing && L >= L_MAX) setPlaying(false)
  }, [playing, L])

  const spacing = GS / Math.max(1, L - 1)

  useEffect(() => {
    const g = canvasRef.current?.getContext('2d')
    if (!g) return
    const P = (i: number, j: number): [number, number] => [GX + i * spacing, GY + GS - j * spacing]
    g.fillStyle = '#070b0a'
    g.fillRect(0, 0, CW, CH)

    // edges, colored by direction
    g.lineWidth = L > 28 ? 0.7 : 1.1
    g.globalAlpha = L > 28 ? 0.45 : 0.65
    for (const [a, b] of vecs) {
      if (Math.abs(a) >= L || Math.abs(b) >= L) continue
      const ang = ((Math.atan2(b, a) + Math.PI) % Math.PI) / Math.PI
      g.strokeStyle = `hsl(${150 + ang * 200} 85% 60%)`
      g.beginPath()
      for (let i = 0; i < L; i++) {
        for (let j = 0; j < L; j++) {
          const i2 = i + a
          const j2 = j + b
          if (i2 < 0 || i2 >= L || j2 < 0 || j2 >= L) continue
          const [x1, y1] = P(i, j)
          const [x2, y2] = P(i2, j2)
          g.moveTo(x1, y1)
          g.lineTo(x1 + (x2 - x1) * growT, y1 + (y2 - y1) * growT)
        }
      }
      g.stroke()
    }
    g.globalAlpha = 1

    // focus point: its circle of radius sqrt(m) and its neighbours
    const neighbours = new Set<string>()
    if (focus && focus[0] < L && focus[1] < L) {
      const [fx, fy] = P(focus[0], focus[1])
      g.strokeStyle = '#f0c95a'
      g.lineWidth = 1.5
      g.setLineDash([4, 4])
      g.beginPath()
      g.arc(fx, fy, Math.sqrt(m) * spacing * growT, 0, Math.PI * 2)
      g.stroke()
      g.setLineDash([])
      g.lineWidth = 2.2
      g.shadowColor = '#f0c95a'
      g.shadowBlur = 10
      for (const [a, b] of vecs) {
        for (const s of [1, -1]) {
          const i2 = focus[0] + s * a
          const j2 = focus[1] + s * b
          if (i2 < 0 || i2 >= L || j2 < 0 || j2 >= L) continue
          neighbours.add(`${i2},${j2}`)
          const [x2, y2] = P(i2, j2)
          g.beginPath()
          g.moveTo(fx, fy)
          g.lineTo(fx + (x2 - fx) * growT, fy + (y2 - fy) * growT)
          g.stroke()
        }
      }
      g.shadowBlur = 0
    }

    // points
    const r = Math.max(1.6, Math.min(4, spacing * 0.18))
    for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        const [x, y] = P(i, j)
        const isF = focus && focus[0] === i && focus[1] === j
        const isN = neighbours.has(`${i},${j}`)
        g.fillStyle = isF ? '#f0c95a' : isN ? '#ffffff' : '#c9d6d2'
        g.beginPath()
        g.arc(x, y, isF ? r + 3 : isN ? r + 1.5 : r, 0, Math.PI * 2)
        g.fill()
      }
    }

    // ---- plot: edges per point vs n ----
    g.strokeStyle = '#24332e'
    g.lineWidth = 1
    g.strokeRect(PL, PT, PR - PL, PB - PT)
    g.font = '12px "IBM Plex Mono", monospace'
    g.fillStyle = '#8aa39a'
    g.fillText('unit pairs per point (E/n)', PL - 4, PT - 22)
    g.fillText('vs n, log scale', PL - 4, PT - 8)
    for (const v of [2, 4, 6, 8, 10]) {
      g.beginPath()
      g.moveTo(PL, ly(v))
      g.lineTo(PR, ly(v))
      g.stroke()
      g.fillText(String(v), PL - 20, ly(v) + 4)
    }
    for (const nn of [10, 100, 1000]) {
      g.fillText(String(nn), lx(nn) - 10, PB + 16)
    }
    const curve = (f: (L: number) => number, color: string, width: number, dash: number[] = []) => {
      g.strokeStyle = color
      g.lineWidth = width
      g.setLineDash(dash)
      g.beginPath()
      for (let l = L_MIN; l <= L_MAX; l++) {
        const x = lx(l * l)
        const y = ly(f(l))
        if (l === L_MIN) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.stroke()
      g.setLineDash([])
    }
    curve((l) => (l * l) ** (1 / 3), '#ff6b6b', 1.2, [2, 4])
    curve((l) => (l * l) ** 0.014, '#7eb6ff', 1.4, [6, 4])
    curve((l) => best[l - L_MIN].e / (l * l), '#f0c95a', 2.2)
    curve((l) => edgeCount(l, m) / (l * l), '#2ee6c5', 1.6)
    g.fillStyle = '#f0c95a'
    g.shadowColor = '#f0c95a'
    g.shadowBlur = 12
    g.beginPath()
    g.arc(lx(n), ly(E / n), 6, 0, Math.PI * 2)
    g.fill()
    g.shadowBlur = 0
    g.font = '11px "IBM Plex Mono", monospace'
    const legend: [string, string][] = [
      ['#2ee6c5', `this length √${m}`],
      ['#f0c95a', 'best length per n'],
      ['#7eb6ff', 'shape of n^0.014'],
      ['#ff6b6b', 'shape of n^(1/3) cap'],
    ]
    legend.forEach(([c, t], i) => {
      g.fillStyle = c
      g.fillRect(PL, PB + 34 + i * 18, 12, 3)
      g.fillStyle = '#8aa39a'
      g.fillText(t, PL + 18, PB + 39 + i * 18)
    })
    g.lineWidth = 1
  }, [L, m, vecs, focus, growT, best, E, n, spacing])

  const onPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * CW
    const y = ((e.clientY - rect.top) / rect.height) * CH
    if (x > GX + GS + spacing / 2) return
    const i = Math.round((x - GX) / spacing)
    const j = Math.round((GY + GS - y) / spacing)
    if (i >= 0 && i < L && j >= 0 && j < L) setFocus([i, j])
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Packing equal lengths into a grid</h3>
      <p className="demo-hint">
        Erdős's trick: put n points on a square grid and call √m the "unit", picking m that can be
        written as a² + b² in many ways. Each way is one rainbow direction. Tap a point to see its
        unit circle. Pick a length, then press Grow and follow how many unit pairs each point gets as
        n grows.
      </p>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        onPointerDown={onPointer}
        role="img"
        aria-label="Grid points joined by all pairs at the chosen unit distance, with a plot of unit pairs per point against n"
        style={{ cursor: 'pointer' }}
      />
      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        {MS.map((mm) => (
          <button key={mm} type="button" className={m === mm ? 'btn' : 'btn btn-ghost'} onClick={() => setM(mm)} style={{ padding: '0 var(--space-3)' }}>
            √{mm} · {(VECS.get(mm)?.length ?? 0) * 2} dirs
          </button>
        ))}
      </div>
      <div className="controls">
        <label>
          Grid side: <span className="stat">{L} × {L} = {n} points</span>
          <input
            type="range"
            min={L_MIN}
            max={L_MAX}
            step={1}
            value={L}
            onChange={(e) => {
              setPlaying(false)
              setL(Number(e.target.value))
            }}
          />
        </label>
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!playing && L >= L_MAX) setL(L_MIN)
            setPlaying((v) => !v)
          }}
        >
          {playing ? 'Pause' : 'Grow n'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setM(bestHere.m)}>
          Use best length here (√{bestHere.m})
        </button>
      </div>
      <p className="stat" role="status" style={{ fontSize: '0.8rem' }}>
        {E.toLocaleString()} pairs at distance exactly √{m} among {n} points, so {(E / n).toFixed(2)} per
        point. Best listed length for this n: √{bestHere.m} with {bestHere.e.toLocaleString()} pairs.
      </p>
      <p className="pill-inline" style={{ display: 'block', marginTop: 'var(--space-2)' }}>
        With one fixed length, pairs per point level off, so the count is linear in n. Erdős's
        grids let the length grow with n, giving n^(1 + c/log log n) pairs. Erdős conjectured that
        was the truth. The dashed shapes are drawn with constant 1 just to compare growth. At these
        sizes nobody could tell exponent 1.014 from 1 by eye.
      </p>
      <p className="demo-callout">
        The May 2026 construction, from an OpenAI model with later human refinement, is not a grid. It
        uses algebraic number fields to get at least n^(1+δ) unit pairs for a fixed δ (later about
        0.014), so pairs per point grow like a true power forever. The known cap is still O(n^(4/3)).
        This demo shows only the classical grid idea it beat.
      </p>
    </div>
  )
}
