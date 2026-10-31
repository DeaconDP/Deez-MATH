import { useEffect, useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

const small = { padding: '0 0.8rem', minHeight: 36, fontSize: '0.8rem' } as const

function popcount(x: number) {
  let c = 0
  while (x) {
    x &= x - 1
    c++
  }
  return c
}
const ham = (a: number, b: number) => popcount(a ^ b)

function binom(n: number, k: number) {
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i
  return Math.round(r)
}
function ballVolume(n: number, t: number) {
  let v = 0
  for (let i = 0; i <= t; i++) v += binom(n, i)
  return v
}

/** Best known (exact) A(n, d) for 4 ≤ n ≤ 8: classical table values. */
function knownA(n: number, d: number): number {
  if (d <= 1) return 2 ** n
  if (d === 2) return 2 ** (n - 1)
  const t3: Record<number, number> = { 4: 2, 5: 4, 6: 8, 7: 16, 8: 20 }
  const t4: Record<number, number> = { 4: 2, 5: 2, 6: 4, 7: 8, 8: 16 }
  if (d === 3) return t3[n]
  if (d === 4) return t4[n]
  if (d === 5 && n === 8) return 4
  return d <= n ? 2 : 1
}

function hue(i: number) {
  return `hsl(${(i * 47 + 168) % 360} 78% 62%)`
}

function bitsOf(w: number, n: number) {
  return w.toString(2).padStart(n, '0')
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

type Transmit = { sent: number; recv: number; decoded: number | null; flips: number }

export function CodesDemo() {
  const reduced = usePrefersReducedMotion()
  const [n, setN] = useState(7)
  const [d, setD] = useState(3)
  const [code, setCode] = useState<number[]>([])
  const [hover, setHover] = useState<number | null>(null)
  const [scan, setScan] = useState<number | null>(null)
  const [packRun, setPackRun] = useState(0)
  const [noise, setNoise] = useState(1)
  const [tx, setTx] = useState<Transmit | null>(null)

  const N = 2 ** n
  const t = Math.floor((d - 1) / 2)
  const rowBits = Math.floor(n / 2)
  const colBits = n - rowBits
  const rows = 2 ** rowBits
  const cols = 2 ** colBits
  const cell = Math.min(300 / cols, 46)
  const pad = 6
  const VW = cols * cell + pad * 2
  const VH = rows * cell + pad * 2

  const info = useMemo(() => {
    const owners: number[][] = Array.from({ length: N }, () => [])
    const minD = new Array<number>(N).fill(Infinity)
    code.forEach((c, idx) => {
      for (let w = 0; w < N; w++) {
        const h = ham(w, c)
        if (h <= t) owners[w].push(idx)
        if (h < minD[w]) minD[w] = h
      }
    })
    const bad = new Set<number>()
    let minDist = Infinity
    for (let i = 0; i < code.length; i++)
      for (let j = i + 1; j < code.length; j++) {
        const h = ham(code[i], code[j])
        minDist = Math.min(minDist, h)
        if (h < d) {
          bad.add(code[i])
          bad.add(code[j])
        }
      }
    let covered = 0
    for (let w = 0; w < N; w++) if (owners[w].length) covered++
    return { owners, minD, bad, minDist, covered }
  }, [code, N, t, d])

  // Greedy lexicode animation: scan words in order, keep any word far enough from all kept.
  useEffect(() => {
    if (packRun === 0) return
    if (reduced) {
      const out: number[] = []
      for (let w = 0; w < N; w++) if (out.every((c) => ham(c, w) >= d)) out.push(w)
      setCode(out)
      setScan(null)
      return
    }
    let raf = 0
    let w = 0
    let acc: number[] = []
    const perFrame = Math.max(1, Math.round(N / 110))
    const tick = () => {
      for (let s = 0; s < perFrame && w < N; s++, w++) {
        const cur = w
        if (acc.every((c) => ham(c, cur) >= d)) acc = [...acc, cur]
      }
      setCode(acc)
      if (w >= N) {
        setScan(null)
        return
      }
      setScan(w)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [packRun, reduced, N, d])

  function reset(nextN = n, nextD = d) {
    setPackRun(0)
    setScan(null)
    setCode([])
    setTx(null)
    setN(nextN)
    setD(Math.min(nextD, nextN))
  }

  function toggle(w: number) {
    if (scan !== null) return
    setTx(null)
    setCode((prev) => (prev.includes(w) ? prev.filter((c) => c !== w) : [...prev, w]))
  }

  function transmit() {
    if (!code.length) return
    const sent = code[Math.floor(Math.random() * code.length)]
    const pos = new Set<number>()
    while (pos.size < Math.min(noise, n)) pos.add(Math.floor(Math.random() * n))
    let recv = sent
    for (const p of pos) recv ^= 1 << p
    let best = Infinity
    let winners: number[] = []
    for (const c of code) {
      const h = ham(c, recv)
      if (h < best) {
        best = h
        winners = [c]
      } else if (h === best) winners.push(c)
    }
    setTx({ sent, recv, decoded: winners.length === 1 ? winners[0] : null, flips: pos.size })
  }

  const vol = ballVolume(n, t)
  const hammingBound = Math.floor(N / vol)
  const best = knownA(n, d)
  const perfect = code.length > 0 && info.bad.size === 0 && code.length * vol === N
  const conflicts = info.bad.size > 0
  const barMax = Math.max(hammingBound, code.length, 1)

  const cellOf = (w: number) => {
    // Gray-code layout: neighbours on the grid (with wraparound) differ in one bit.
    const hi = w >> colBits
    const lo = w & (cols - 1)
    // invert gray: find index whose gray equals value
    let r = 0
    for (let v = hi; v; v >>= 1) r ^= v
    let c = 0
    for (let v = lo; v; v >>= 1) c ^= v
    return { x: pad + c * cell, y: pad + r * cell }
  }

  const words = Array.from({ length: N }, (_, i) => i)
  const showNumbers = hover !== null && cell >= 18

  return (
    <div className="demo">
      <h3 className="demo-title">Pack the Hamming cube</h3>
      <p className="demo-hint">
        Each square is one {n}-bit word, laid out so that side-by-side squares differ in one bit. Tap
        squares to make them codewords; every pair must differ in at least d bits. Each codeword claims
        a colored ball of words within {t} flip{t === 1 ? '' : 's'}, which it can repair. Dark squares are
        too close to an existing codeword. How many can you fit?
      </p>

      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-label={`Hamming space of ${n}-bit words with ${code.length} codewords at minimum distance ${d}`}
        onPointerLeave={() => setHover(null)}
        style={{ maxWidth: Math.max(VW * 1.4, 320), margin: '0 auto' }}
      >
        <defs>
          <filter id="codes-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {words.map((w) => {
          const { x, y } = cellOf(w)
          const ci = code.indexOf(w)
          const own = info.owners[w]
          const blocked = ci < 0 && info.minD[w] < d
          let fill = '#0e1614'
          let op = 1
          if (ci >= 0) fill = info.bad.has(w) ? '#ff6b6b' : hue(ci)
          else if (own.length > 1) {
            fill = '#ff6b6b'
            op = 0.45
          } else if (own.length === 1) {
            fill = hue(own[0])
            op = 0.32
          } else if (blocked) {
            fill = '#050807'
          }
          const isScan = scan === w
          const isTx = tx && (tx.recv === w || tx.sent === w || tx.decoded === w)
          return (
            <g
              key={w}
              onClick={() => toggle(w)}
              onPointerEnter={() => setHover(w)}
              style={{ cursor: scan === null ? 'pointer' : 'default' }}
            >
              <rect
                x={x + 1}
                y={y + 1}
                width={cell - 2}
                height={cell - 2}
                rx={2}
                fill={fill}
                fillOpacity={op}
                stroke={isScan ? '#ffffff' : ci >= 0 ? '#e8f2ef' : '#1d2b27'}
                strokeWidth={isScan || ci >= 0 ? 1.4 : 0.8}
                filter={ci >= 0 ? 'url(#codes-glow)' : undefined}
              />
              {showNumbers ? (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 3}
                  textAnchor="middle"
                  fontSize={Math.min(10, cell * 0.42)}
                  fontFamily="IBM Plex Mono"
                  fill={ci >= 0 ? '#041210' : '#8aa39a'}
                  pointerEvents="none"
                >
                  {ham(w, hover)}
                </text>
              ) : null}
              {tx && isTx ? (
                <circle
                  cx={x + cell / 2}
                  cy={y + cell / 2}
                  r={cell * 0.36}
                  fill="none"
                  stroke={tx.recv === w ? '#f0c95a' : tx.decoded === w && tx.decoded !== tx.sent ? '#ff6b6b' : '#ffffff'}
                  strokeWidth={2}
                  strokeDasharray={tx.recv === w ? '3 2' : undefined}
                  pointerEvents="none"
                />
              ) : null}
            </g>
          )
        })}
        {hover !== null ? (
          <rect
            x={cellOf(hover).x + 0.5}
            y={cellOf(hover).y + 0.5}
            width={cell - 1}
            height={cell - 1}
            fill="none"
            stroke="#f0c95a"
            strokeWidth={1.6}
            pointerEvents="none"
          />
        ) : null}
      </svg>
      <p className="pill-inline" style={{ marginTop: 'var(--space-2)', minHeight: '1.2em' }}>
        {hover !== null
          ? `word ${bitsOf(hover, n)} · numbers show Hamming distance from it · nearest codeword ${
              info.minD[hover] === Infinity ? '–' : `${info.minD[hover]} flips away`
            }`
          : 'Hover a square to see Hamming distances from it.'}
      </p>

      <div className="controls">
        <DimSlider label="Word length n" value={n} min={4} max={8} onChange={(v) => reset(v, d)} />
        <DimSlider
          label="Minimum distance d"
          value={d}
          min={1}
          max={n}
          onChange={(v) => reset(n, v)}
          format={(v) => `${v} (repairs ${Math.floor((v - 1) / 2)} flip${Math.floor((v - 1) / 2) === 1 ? '' : 's'})`}
        />
      </div>

      <div className="btn-row" style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-2)' }}>
        <button
          type="button"
          style={small}
          className="btn"
          disabled={scan !== null}
          onClick={() => {
            setCode([])
            setTx(null)
            setScan(0)
            setPackRun((r) => r + 1)
          }}
        >
          Greedy pack (lexicode)
        </button>
        <button type="button" style={small} className="btn btn-ghost" onClick={() => reset()}>
          Clear
        </button>
      </div>

      <div style={{ display: 'grid', gap: 6 }} aria-label="Code size against bounds">
        {[
          { label: `Your code${conflicts ? ' (has clashes)' : ''}`, v: code.length, color: conflicts ? '#ff6b6b' : '#2ee6c5' },
          { label: 'Best possible A(n,d), known', v: best, color: '#f0c95a' },
          { label: 'Sphere-packing ceiling 2^n / ball', v: hammingBound, color: '#7eb6ff' },
        ].map((b) => (
          <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4, alignItems: 'center' }}>
            <span className="pill-inline">{b.label}</span>
            <span className="stat" style={{ fontSize: '0.8rem' }}>
              {b.v}
            </span>
            <div className="meter" style={{ gridColumn: '1 / -1' }}>
              <span style={{ width: `${(b.v / barMax) * 100}%`, background: b.color, transition: 'width 250ms' }} />
            </div>
          </div>
        ))}
      </div>

      <p className={`feedback ${conflicts ? 'err' : 'ok'}`} role="status">
        {conflicts
          ? 'Two codewords are closer than d: their repair balls collide (red).'
          : perfect
            ? `Perfect code: ${code.length} balls of ${vol} words tile all ${N} words with nothing left over.`
            : code.length
              ? `${code.length} codewords, min distance ${code.length > 1 ? info.minDist : '–'}, balls cover ${info.covered} of ${N} words.`
              : 'Empty code. Tap squares or run the greedy packer. Try n = 7, d = 3.'}
      </p>

      <div className="controls" style={{ marginBottom: 'var(--space-2)' }}>
        <DimSlider label="Bit flips in transit" value={noise} min={0} max={3} onChange={setNoise} />
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-2)' }}>
        <button type="button" style={small} className="btn btn-ghost" disabled={!code.length || conflicts} onClick={transmit}>
          Send a codeword through noise
        </button>
      </div>
      {tx ? (
        <p className="stat" style={{ fontSize: '0.8rem' }}>
          sent{' '}
          <code>{bitsOf(tx.sent, n)}</code> → received{' '}
          <code>
            {bitsOf(tx.recv, n)
              .split('')
              .map((ch, i) => (
                <span key={i} style={{ color: ch !== bitsOf(tx.sent, n)[i] ? '#ff6b6b' : undefined }}>
                  {ch}
                </span>
              ))}
          </code>{' '}
          →{' '}
          {tx.decoded === null ? (
            <span style={{ color: 'var(--danger)' }}>tie between codewords, cannot decide</span>
          ) : tx.decoded === tx.sent ? (
            <span style={{ color: 'var(--ok)' }}>repaired to {bitsOf(tx.decoded, n)}</span>
          ) : (
            <span style={{ color: 'var(--danger)' }}>wrongly decoded as {bitsOf(tx.decoded, n)}</span>
          )}
          {tx.flips > t ? ` (${tx.flips} flips > ${t}: past the repair radius)` : ''}
        </p>
      ) : null}

      <p className="demo-callout">
        The ceiling is the real question: how many codewords can ever fit? For tiny n the answer is
        known exactly. As n grows, the best general ceilings came from linear-programming arguments
        (Delsarte, MRRW). The 2026 claim lowers those ceilings by exponential factors for binary and
        sphere codes. This grid only plays the small classical game; it does not compute the new bound.
      </p>
    </div>
  )
}
