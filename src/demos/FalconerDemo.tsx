import { useEffect, useMemo, useRef, useState } from 'react'

const CW = 720
const CH = 440
const DX = 20
const DY = 34
const DS = 390 // dust square size in px
const BX = 468 // barcode column
const BW = 34
const BT = 34
const BB = 424
const MAXD = Math.SQRT2
const LEVELS = 5

/** Four-corner Cantor dust: keep the 4 corner squares of ratio r at every level. dim = log 4 / log(1/r). */
function dust(s: number, k: number) {
  const r = 4 ** (-1 / s)
  let sq: number[] = [0, 0] // lower-left corners, side = r^level
  let side = 1
  for (let lvl = 0; lvl < k; lvl++) {
    const next: number[] = []
    const off = side * (1 - r)
    for (let i = 0; i < sq.length; i += 2) {
      const x = sq[i]
      const y = sq[i + 1]
      next.push(x, y, x + off, y, x, y + off, x + off, y + off)
    }
    sq = next
    side *= r
  }
  const n = sq.length / 2
  const centers = new Float64Array(sq.length)
  for (let i = 0; i < n; i++) {
    centers[2 * i] = sq[2 * i] + side / 2
    centers[2 * i + 1] = sq[2 * i + 1] + side / 2
  }
  return { corners: sq, centers, side, n }
}

/**
 * Every distance realized by E lies within sqrt(2)*side of a distance between level-k centers,
 * so the union of those intervals covers Δ(E). Its length is an upper estimate for |Δ(E)|.
 */
function cover(centers: Float64Array, n: number, side: number, rows: number) {
  const m = (n * (n - 1)) / 2
  const d = new Float64Array(m)
  let t = 0
  for (let i = 0; i < n; i++) {
    const xi = centers[2 * i]
    const yi = centers[2 * i + 1]
    for (let j = i + 1; j < n; j++) d[t++] = Math.hypot(centers[2 * j] - xi, centers[2 * j + 1] - yi)
  }
  d.sort()
  const delta = Math.SQRT2 * side
  const rowFill = new Float64Array(rows)
  const rowH = MAXD / rows
  let length = 0
  const addSeg = (a: number, b: number) => {
    a = Math.max(0, a)
    b = Math.min(MAXD, b)
    if (b <= a) return
    length += b - a
    for (let r = Math.floor(a / rowH); r <= Math.min(rows - 1, Math.floor(b / rowH)); r++) {
      const lo = Math.max(a, r * rowH)
      const hi = Math.min(b, (r + 1) * rowH)
      if (hi > lo) rowFill[r] += (hi - lo) / rowH
    }
  }
  let curA = -1
  let curB = -1
  for (let i = 0; i < m; i++) {
    const a = d[i] - delta
    const b = d[i] + delta
    if (a > curB) {
      if (curB > curA) addSeg(curA, curB)
      curA = a
      curB = b
    } else if (b > curB) curB = b
  }
  if (curB > curA) addSeg(curA, curB)
  return { length, rowFill }
}

type Drop = { x1: number; y1: number; x2: number; y2: number; d: number; born: number }

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const yOfD = (d: number) => BB - ((BB - BT) * d) / MAXD

export function FalconerDemo() {
  const [s, setS] = useState(1.3)
  const [level, setLevel] = useState(4)
  const [rain, setRain] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const all = useMemo(() => {
    const rows = BB - BT
    return Array.from({ length: LEVELS }, (_, i) => {
      const dd = dust(s, i + 1)
      return { ...dd, ...cover(dd.centers, dd.n, dd.side, rows) }
    })
  }, [s])
  const cur = all[level - 1]

  // Static layer (dust + barcode) rendered offscreen once per change.
  const staticLayer = useMemo(() => {
    if (typeof document === 'undefined') return null
    const c = document.createElement('canvas')
    c.width = CW
    c.height = CH
    const g = c.getContext('2d')
    if (!g) return null
    g.fillStyle = '#070b0a'
    g.fillRect(0, 0, CW, CH)
    g.strokeStyle = '#24332e'
    g.strokeRect(DX - 0.5, DY - 0.5, DS + 1, DS + 1)
    const px = Math.max(1.2, cur.side * DS)
    g.shadowColor = '#f0c95a'
    g.shadowBlur = cur.n > 300 ? 0 : 8
    for (let i = 0; i < cur.corners.length; i += 2) {
      const hue = 40 + (cur.corners[i] + cur.corners[i + 1]) * 70
      g.fillStyle = `hsl(${hue} 85% 60%)`
      g.fillRect(DX + cur.corners[i] * DS, DY + (1 - cur.corners[i + 1]) * DS - px, px, px)
    }
    g.shadowBlur = 0
    // barcode
    g.fillStyle = '#0b1210'
    g.fillRect(BX, BT, BW, BB - BT)
    for (let r = 0; r < cur.rowFill.length; r++) {
      const f = Math.min(1, cur.rowFill[r])
      if (f <= 0) continue
      g.fillStyle = `rgba(46, 230, 197, ${0.15 + 0.85 * f})`
      g.fillRect(BX, BB - r - 1, BW, 1)
    }
    g.strokeStyle = '#24332e'
    g.strokeRect(BX - 0.5, BT - 0.5, BW + 1, BB - BT + 1)
    g.font = '13px "IBM Plex Mono", monospace'
    g.fillStyle = '#8aa39a'
    g.fillText(`E: ${cur.n} squares, level ${level}`, DX, 22)
    g.fillText('Δ(E) cover', BX - 8, 22)
    g.fillText('0', BX + BW + 6, BB)
    g.fillText('√2', BX + BW + 6, BT + 10)
    g.fillText('1', BX + BW + 6, yOfD(1) + 4)
    g.beginPath()
    g.moveTo(BX + BW, yOfD(1))
    g.lineTo(BX + BW + 4, yOfD(1))
    g.stroke()
    // per-level sparkline of cover length
    const SX = 560
    const SW = 140
    const SY = 300
    const SH = 110
    g.strokeStyle = '#24332e'
    g.strokeRect(SX, SY, SW, SH)
    g.fillStyle = '#8aa39a'
    g.font = '12px "IBM Plex Mono", monospace'
    g.fillText('cover length', SX, SY - 22)
    g.fillText('by level 1→5', SX, SY - 8)
    g.beginPath()
    all.forEach((lv, i) => {
      const x = SX + 10 + (i * (SW - 20)) / (LEVELS - 1)
      const y = SY + SH - 8 - (Math.min(MAXD, lv.length) / MAXD) * (SH - 16)
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    })
    g.strokeStyle = '#2ee6c5'
    g.lineWidth = 2
    g.stroke()
    g.lineWidth = 1
    all.forEach((lv, i) => {
      const x = SX + 10 + (i * (SW - 20)) / (LEVELS - 1)
      const y = SY + SH - 8 - (Math.min(MAXD, lv.length) / MAXD) * (SH - 16)
      g.fillStyle = i === level - 1 ? '#f0c95a' : '#2ee6c5'
      g.beginPath()
      g.arc(x, y, i === level - 1 ? 5 : 3, 0, Math.PI * 2)
      g.fill()
    })
    g.font = '15px "IBM Plex Mono", monospace'
    g.fillStyle = '#e8f2ef'
    g.fillText(`${cur.length.toFixed(3)}`, SX, SY - 50)
    g.font = '11px "IBM Plex Mono", monospace'
    g.fillStyle = '#8aa39a'
    g.fillText('of 1.414', SX + 68, SY - 50)
    return c
  }, [all, cur, level])

  useEffect(() => {
    const canvas = canvasRef.current
    const g = canvas?.getContext('2d')
    if (!canvas || !g || !staticLayer) return
    g.drawImage(staticLayer, 0, 0)
    if (!rain || reducedMotion()) return
    let raf = 0
    let drops: Drop[] = []
    let seed = 12345
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    const LIFE = 1500
    const tick = (now: number) => {
      g.drawImage(staticLayer, 0, 0)
      if (drops.length < 14 && rnd() < 0.35) {
        const i = Math.floor(rnd() * cur.n)
        let j = Math.floor(rnd() * cur.n)
        if (j === i) j = (j + 1) % cur.n
        const ax = cur.centers[2 * i]
        const ay = cur.centers[2 * i + 1]
        const bx = cur.centers[2 * j]
        const by = cur.centers[2 * j + 1]
        drops.push({
          x1: DX + ax * DS,
          y1: DY + (1 - ay) * DS,
          x2: DX + bx * DS,
          y2: DY + (1 - by) * DS,
          d: Math.hypot(bx - ax, by - ay),
          born: now,
        })
      }
      drops = drops.filter((d) => now - d.born < LIFE)
      for (const d of drops) {
        const age = (now - d.born) / LIFE
        const ty = yOfD(d.d)
        if (age < 0.35) {
          const a = 1 - age / 0.35
          g.strokeStyle = `rgba(240, 201, 90, ${0.25 + 0.75 * a})`
          g.lineWidth = 2
          g.shadowColor = '#f0c95a'
          g.shadowBlur = 10
          g.beginPath()
          g.moveTo(d.x1, d.y1)
          g.lineTo(d.x2, d.y2)
          g.stroke()
          g.shadowBlur = 0
        }
        const k = Math.max(0, Math.min(1, (age - 0.2) / 0.6))
        const e = k * k * (3 - 2 * k)
        const mx = (d.x1 + d.x2) / 2
        const my = (d.y1 + d.y2) / 2
        const x = mx + (BX + BW / 2 - mx) * e
        const y = my + (ty - my) * e
        if (age >= 0.2 && age < 0.8) {
          g.fillStyle = '#f0c95a'
          g.beginPath()
          g.arc(x, y, 3, 0, Math.PI * 2)
          g.fill()
        }
        if (age >= 0.8) {
          const a = 1 - (age - 0.8) / 0.2
          g.fillStyle = `rgba(255, 255, 255, ${a})`
          g.fillRect(BX - 6, ty - 1, BW + 12, 2)
        }
      }
      g.lineWidth = 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [staticLayer, rain, cur])

  const regime =
    s > 1
      ? {
          c: 'var(--ok)',
          t: `dim ${s.toFixed(2)} > d/2 = 1. The claim guarantees that Δ(E) has positive length. Before 2026 the plane was known only above 5/4.`,
        }
      : s < 0.5
        ? {
            c: 'var(--danger)',
            t: `dim ${s.toFixed(2)} < 1/2. Δ(E) is a Lipschitz image of E×E, which has dimension ${(2 * s).toFixed(2)} < 1, so its length is forced to be 0.`,
          }
        : {
            c: 'var(--accent-2)',
            t: `dim ${s.toFixed(2)} is between 1/2 and d/2 = 1. No guarantee either way. Grid-like sets this thin can have length-zero distance sets.`,
          }

  const sliderPct = (v: number) => `${((v - 0.3) / (1.95 - 0.3)) * 100}%`

  return (
    <div className="demo">
      <h3 className="demo-title">Distance rain from a fractal dust</h3>
      <p className="demo-hint">
        E is a four-corner Cantor dust. Keep the 4 corner squares and repeat, and the dimension is
        set by how much each step shrinks. Gold rulers measure random pairs and drop each length onto
        the strip, which shows every distance E can make, covered to the current level's
        resolution. Slide the dimension across d/2 = 1.
      </p>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        role="img"
        aria-label="Cantor dust with pair distances raining onto a strip showing the covered distance set"
      />
      <div className="controls">
        <label>
          Dimension of E: <span className="stat">{s.toFixed(2)}</span>
          <span style={{ position: 'relative', display: 'block' }}>
            <input type="range" min={0.3} max={1.95} step={0.05} value={s} onChange={(e) => setS(Number(e.target.value))} style={{ width: '100%' }} />
            {[
              { v: 0.5, l: '½' },
              { v: 1, l: 'd/2' },
              { v: 1.25, l: '5/4' },
            ].map((m) => (
              <span
                key={m.v}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: sliderPct(m.v),
                  top: '100%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.65rem',
                  color: m.v === 1 ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                ▲{m.l}
              </span>
            ))}
          </span>
        </label>
        <label style={{ marginTop: 'var(--space-3)' }}>
          Construction level: <span className="stat">{level}</span> ({4 ** level} squares)
          <input type="range" min={1} max={LEVELS} step={1} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
        </label>
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className={rain ? 'btn' : 'btn btn-ghost'} onClick={() => setRain((v) => !v)}>
          {rain ? 'Pause rain' : 'Start rain'}
        </button>
      </div>
      <p className="stat" role="status" style={{ fontSize: '0.8rem', color: regime.c }}>
        {regime.t}
      </p>
      <p className="pill-inline" style={{ display: 'block', marginTop: 'var(--space-2)' }}>
        The cover length is an upper estimate for the true length of Δ(E) and shrinks toward it as
        the level grows. A falling sparkline points toward length zero. A plateau suggests positive
        length but proves nothing.
      </p>
      <p className="demo-callout">
        Falconer's question asks how thick a set must be before its distances fill a positive length.
        The October 2026 claim, unchecked here, says above d/2 in every dimension d ≥ 2. This dust is
        one example in the plane. The theorem is about every compact set, including the worst ones.
      </p>
    </div>
  )
}
