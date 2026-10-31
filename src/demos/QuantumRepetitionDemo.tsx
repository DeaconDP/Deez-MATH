import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'

/* ------------------------------------------------------------------ */
/*  CHSH game with a shared Bell pair |Φ+⟩. Alice measures at angle    */
/*  α_x, Bob at β_y; then P(a = b) = cos²(α_x − β_y).                   */
/*  Win iff a ⊕ b = x ∧ y.                                             */
/* ------------------------------------------------------------------ */

const TSIRELSON = Math.cos(Math.PI / 8) ** 2 // ≈ 0.853553
const CLASSICAL = 0.75
const OPTIMAL: [number, number, number, number] = [0, Math.PI / 4, Math.PI / 8, -Math.PI / 8]

function winTable(ang: [number, number, number, number]) {
  const [a0, a1, b0, b1] = ang
  const alpha = [a0, a1]
  const beta = [b0, b1]
  const t: number[][] = [
    [0, 0],
    [0, 0],
  ]
  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const c = Math.cos(alpha[x] - beta[y]) ** 2
      t[x][y] = x & y ? 1 - c : c
    }
  return t
}

/** Exhaustive classical value of CHSH played twice in parallel (all 256 × 256 deterministic strategies). */
function classicalTwoCopy() {
  let best = 0
  for (let A = 0; A < 256; A++)
    for (let B = 0; B < 256; B++) {
      let w = 0
      for (let x = 0; x < 4; x++)
        for (let y = 0; y < 4; y++) {
          const a = (A >> (2 * x)) & 3
          const b = (B >> (2 * y)) & 3
          const ok0 = ((a & 1) ^ (b & 1)) === (x & 1 & (y & 1))
          const ok1 = (((a >> 1) & 1) ^ ((b >> 1) & 1)) === ((x >> 1) & 1 & ((y >> 1) & 1))
          if (ok0 && ok1) w++
        }
      if (w > best) best = w
    }
  return best / 16
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!m) return
    const f = () => setReduced(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return reduced
}

const ROUNDS = 240
const AXIS_COLORS = ['#2ee6c5', '#f0c95a']
const DIAL_R = 62

export function QuantumRepetitionDemo() {
  const reduced = useReducedMotion()
  const [ang, setAng] = useState<[number, number, number, number]>([0, 0, 0, 0])
  const [results, setResults] = useState<boolean[]>([])
  const [playing, setPlaying] = useState(false)
  const [k, setK] = useState(10)
  const [twoCopy, setTwoCopy] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragIdx = useRef<number | null>(null)

  const table = winTable(ang)
  const value = (table[0][0] + table[0][1] + table[1][0] + table[1][1]) / 4

  useEffect(() => () => window.clearInterval(timer.current), [])

  // dial centres in the 640×250 viewBox
  const centres = [
    { cx: 100, cy: 120 },
    { cx: 540, cy: 120 },
  ]

  const onDown = (e: RPointerEvent, i: number) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    dragIdx.current = i
  }
  const onMove = (e: RPointerEvent) => {
    const i = dragIdx.current
    const svg = svgRef.current
    if (i === null || !svg) return
    const r = svg.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 640
    const y = ((e.clientY - r.top) / r.height) * 250
    const c = centres[i < 2 ? 0 : 1]
    let a = Math.atan2(-(y - c.cy), x - c.cx)
    // a measurement axis is a line: fold into (−π/2, π/2]
    if (a > Math.PI / 2) a -= Math.PI
    if (a <= -Math.PI / 2) a += Math.PI
    setAng((prev) => {
      const next = [...prev] as [number, number, number, number]
      next[i] = a
      return next
    })
    setResults([])
  }

  const play = () => {
    window.clearInterval(timer.current)
    const sample = () => {
      const x = Math.random() < 0.5 ? 0 : 1
      const y = Math.random() < 0.5 ? 0 : 1
      return Math.random() < table[x][y]
    }
    if (reduced) {
      setResults(Array.from({ length: ROUNDS }, sample))
      return
    }
    setResults([])
    setPlaying(true)
    let n = 0
    timer.current = window.setInterval(() => {
      n += 6
      setResults((r) => [...r, ...Array.from({ length: 6 }, sample)].slice(0, ROUNDS))
      if (n >= ROUNDS) {
        window.clearInterval(timer.current)
        setPlaying(false)
      }
    }, 30)
  }

  const wins = results.filter(Boolean).length

  /* ---------- repetition chart ---------- */
  const RW = 640
  const RH = 220
  const KMAX = 40
  const LOGMIN = -8
  const rx = (kk: number) => 44 + ((kk - 1) / (KMAX - 1)) * (RW - 60)
  const ry = (p: number) => 14 + (Math.max(LOGMIN, Math.log10(Math.max(p, 1e-30))) / LOGMIN) * (RH - 40)
  const series = useMemo(
    () => [
      { label: 'Your strategy, copy by copy: v^k', base: value, color: '#2ee6c5' },
      { label: 'Best entangled value of CHSH^k = 0.8536^k', base: TSIRELSON, color: '#f0c95a' },
    ],
    [value],
  )
  const exact = (base: number, kk: number) => base ** kk
  const linePath = (base: number) =>
    Array.from({ length: KMAX }, (_, i) => `${i ? 'L' : 'M'}${rx(i + 1).toFixed(1)} ${ry(exact(base, i + 1)).toFixed(1)}`).join('')

  const copiesFor = (eps: number) => Math.ceil(Math.log(eps) / Math.log(TSIRELSON))

  const dial = (who: 0 | 1) => {
    const c = centres[who]
    const name = who === 0 ? 'Alice' : 'Bob'
    return (
      <g>
        <circle cx={c.cx} cy={c.cy} r={DIAL_R} fill="#0e1614" stroke="#24332e" />
        <circle cx={c.cx} cy={c.cy} r={DIAL_R - 18} fill="none" stroke="#24332e" strokeDasharray="2 4" />
        <text x={c.cx} y={c.cy - DIAL_R - 10} fontSize="12" fill="#e8f2ef" textAnchor="middle" fontWeight={600}>
          {name}
        </text>
        {[0, 1].map((inp) => {
          const i = who * 2 + inp
          const a = ang[i]
          const dx = Math.cos(a) * DIAL_R
          const dy = -Math.sin(a) * DIAL_R
          return (
            <g key={inp}>
              <line x1={c.cx - dx} y1={c.cy - dy} x2={c.cx + dx} y2={c.cy + dy} stroke={AXIS_COLORS[inp]} strokeWidth={3} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${AXIS_COLORS[inp]})` }} />
              <circle
                cx={c.cx + dx}
                cy={c.cy + dy}
                r={11}
                fill={AXIS_COLORS[inp]}
                stroke="#070b0a"
                strokeWidth={2}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => onDown(e, i)}
              />
              <text x={c.cx + dx} y={c.cy + dy + 4} fontSize="10" fill="#041210" textAnchor="middle" pointerEvents="none" fontWeight={700}>
                {who === 0 ? 'x' : 'y'}
                {inp}
              </text>
            </g>
          )
        })}
        <text x={c.cx} y={c.cy + DIAL_R + 18} fontSize="10" fill="#8aa39a" textAnchor="middle">
          {who === 0 ? 'α' : 'β'}₀ = {Math.round((ang[who * 2] * 180) / Math.PI)}°, {who === 0 ? 'α' : 'β'}₁ = {Math.round((ang[who * 2 + 1] * 180) / Math.PI)}°
        </text>
      </g>
    )
  }

  const meterX = (v: number) => 200 + (v - 0.5) * 2 * 240

  return (
    <div className="demo">
      <h3 className="demo-title">The CHSH game: entanglement beats 75%, then repetition crushes it</h3>
      <p className="demo-hint">
        A referee sends random bits x to Alice and y to Bob, who cannot talk to each other. They
        win when their answers satisfy a ⊕ b = x AND y. Without entanglement, no strategy wins more
        than 75% of the time. With a shared entangled pair, each player measures along an axis
        chosen by their input bit. Drag the handles to set the four axes. The win rate is exact
        quantum mechanics: P(a = b) = cos²(α − β).
      </p>

      <svg
        ref={svgRef}
        viewBox="0 0 640 250"
        role="img"
        aria-label={`CHSH measurement dials, win probability ${(value * 100).toFixed(1)} percent`}
        onPointerMove={onMove}
        onPointerUp={() => (dragIdx.current = null)}
        onPointerCancel={() => (dragIdx.current = null)}
      >
        <defs>
          <linearGradient id="qr-bar" x1="0" x2="1">
            <stop offset="0%" stopColor="#1a9e87" />
            <stop offset="100%" stopColor="#2ee6c5" />
          </linearGradient>
        </defs>
        {/* entanglement link */}
        <path d="M168 110 C 250 20, 390 20, 472 110" fill="none" stroke="#7eb6ff" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.6}>
          {!reduced && <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />}
        </path>
        <text x={320} y={40} fontSize="10" fill="#7eb6ff" textAnchor="middle">
          shared Bell pair
        </text>
        {dial(0)}
        {dial(1)}
        {/* question table */}
        {[0, 1].map((x) =>
          [0, 1].map((y) => {
            const v = table[x][y]
            const gx = 262 + y * 60
            const gy = 112 + x * 31
            return (
              <g key={`${x}${y}`}>
                <rect x={gx} y={gy} width={56} height={28} rx={3} fill={`rgba(46,230,197,${0.1 + 0.6 * v})`} stroke="#24332e" />
                <text x={gx + 28} y={gy + 18} fontSize="10.5" fill="#e8f2ef" textAnchor="middle">
                  {(v * 100).toFixed(0)}%
                </text>
              </g>
            )
          }),
        )}
        <text x={258} y={130} fontSize="9" fill="#8aa39a" textAnchor="end">x=0</text>
        <text x={258} y={161} fontSize="9" fill="#8aa39a" textAnchor="end">x=1</text>
        <text x={290} y={107} fontSize="9" fill="#8aa39a" textAnchor="middle">y=0</text>
        <text x={350} y={107} fontSize="9" fill="#8aa39a" textAnchor="middle">y=1</text>
        {/* meter */}
        <rect x={200} y={210} width={240} height={14} rx={7} fill="#121a18" stroke="#24332e" />
        <rect x={200} y={210} width={Math.max(0, meterX(value) - 200)} height={14} rx={7} fill={value > CLASSICAL + 1e-9 ? 'url(#qr-bar)' : '#8aa39a'} style={{ transition: 'width 120ms' }} />
        <line x1={meterX(CLASSICAL)} x2={meterX(CLASSICAL)} y1={204} y2={230} stroke="#ff6b6b" strokeWidth={2} />
        <line x1={meterX(TSIRELSON)} x2={meterX(TSIRELSON)} y1={204} y2={230} stroke="#f0c95a" strokeWidth={2} />
        <text x={meterX(CLASSICAL)} y={244} fontSize="9" fill="#ff6b6b" textAnchor="middle">classical 75%</text>
        <text x={meterX(TSIRELSON) + 4} y={244} fontSize="9" fill="#f0c95a" textAnchor="start">quantum max 85.4%</text>
        <text x={320} y={194} fontSize="14" fill={value > CLASSICAL + 1e-6 ? '#2ee6c5' : '#e8f2ef'} textAnchor="middle" fontWeight={700}>
          win rate {(value * 100).toFixed(2)}%
        </text>
      </svg>

      <div className="btn-row" style={{ margin: 'var(--space-3) 0' }}>
        <button type="button" className="btn" onClick={() => { setAng(OPTIMAL); setResults([]) }}>
          Snap to the optimal angles
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setAng([0, 0, 0, 0]); setResults([]) }}>
          Same axis for everyone (75%)
        </button>
        <button type="button" className="btn btn-ghost" onClick={play} disabled={playing}>
          Play {ROUNDS} rounds
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(40, 1fr)', gap: 2 }}>
            {results.map((w, i) => (
              <span key={i} style={{ aspectRatio: '1', borderRadius: 2, background: w ? 'var(--ok)' : 'var(--danger)', opacity: w ? 0.8 : 0.9 }} />
            ))}
          </div>
          <p className="stat" style={{ fontSize: '0.8rem', marginTop: 'var(--space-2)' }}>
            {wins} / {results.length} won ({((wins / results.length) * 100).toFixed(1)}%). Sampled from the exact quantum statistics.
          </p>
        </div>
      )}

      <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)', fontSize: '0.9rem' }}>Now demand k wins at once</h4>
      <p className="demo-hint">
        Play k copies in parallel: all questions arrive together, and the players must win every
        copy. If the players play each copy separately, they win all k with probability v^k. But
        they are allowed to correlate their answers across copies, so it is not obvious that the
        odds shrink this fast.
      </p>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setTwoCopy(classicalTwoCopy())}>
          Search all 65,536 classical strategies for 2 copies
        </button>
      </div>
      {twoCopy !== null && (
        <p className="feedback ok" role="status" style={{ marginTop: 0 }}>
          Exhaustive search: the best classical pair wins both copies {(twoCopy * 100).toFixed(1)}% of the
          time, not 0.75² = 56.25%. Correlating across copies helps, so repetition does not simply
          multiply.
        </p>
      )}
      <svg viewBox={`0 0 ${RW} ${RH}`} role="img" aria-label="Probability of winning all k copies on a log scale">
        {[0, -2, -4, -6, -8].map((e) => (
          <g key={e}>
            <line x1={44} x2={RW - 16} y1={ry(10 ** e)} y2={ry(10 ** e)} stroke="#24332e" strokeDasharray="2 4" />
            <text x={38} y={ry(10 ** e) + 3} fontSize="9.5" fill="#8aa39a" textAnchor="end">
              {e === 0 ? '1' : `1e${e}`}
            </text>
          </g>
        ))}
        {[1, 10, 20, 30, 40].map((kk) => (
          <text key={kk} x={rx(kk)} y={RH - 8} fontSize="9.5" fill="#8aa39a" textAnchor="middle">
            k = {kk}
          </text>
        ))}
        {series.map((s) => (
          <path key={s.label} d={linePath(s.base)} fill="none" stroke={s.color} strokeWidth={2.2} />
        ))}
        <line x1={rx(k)} x2={rx(k)} y1={10} y2={RH - 22} stroke="#e8f2ef" strokeOpacity={0.35} />
        {series.map((s) => (
          <circle key={s.label} cx={rx(k)} cy={ry(exact(s.base, k))} r={4.5} fill={s.color} stroke="#070b0a" />
        ))}
        {series.map((s, i) => (
          <text key={s.label} x={RW - 20} y={22 + i * 14} fontSize="10" fill={s.color} textAnchor="end">
            {s.label}
          </text>
        ))}
      </svg>
      <div className="controls">
        <label>
          Parallel copies k: <span className="stat">{k}</span>
          <input type="range" min={1} max={KMAX} value={k} onChange={(e) => setK(Number(e.target.value))} />
        </label>
      </div>
      <p className="stat" style={{ fontSize: '0.8rem' }}>
        At k = {k}: your strategy wins all copies with probability {exact(value, k).toExponential(2)}. The
        best entangled players manage {exact(TSIRELSON, k).toExponential(2)}. At this exponential rate,{' '}
        {copiesFor(1e-6)} copies push a cheater below one in a million. A bound that decays only
        polynomially, like k^(−1/4), would need 10^24 copies.
      </p>

      <p className="demo-callout">
        For CHSH and other XOR games, the gold curve was already known to be exact: entangled
        values multiply perfectly. The August 2026 theorem covers every finite two-player
        entangled game. If one copy has value below 1, k parallel copies have value at most
        e^(−ck), where c &gt; 0 depends on the game. General bounds before it decayed only
        polynomially. The k^(−1/4) comparison uses a toy exponent.
      </p>
    </div>
  )
}
