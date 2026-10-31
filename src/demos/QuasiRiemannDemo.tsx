import { useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

/** Imaginary parts of the first nontrivial zeta zeros (all computed ones lie on Re s = 1/2). */
const ZEROS = [
  14.134725, 21.02204, 25.010858, 30.424876, 32.935062, 37.586178, 40.918719, 43.327073, 48.005151,
  49.773832, 52.970321, 56.446248, 59.347044, 60.831779, 65.112544, 67.079811, 69.546402,
]

const T_MAX = 72
// strip panel
const SL = 28
const SR = 178
const ST = 30
const SB = 214
// error plot panel
const PL = 222
const PR = 410
const PT = 30
const PB = 214
const X_LO = 2 // log10 x range
const X_HI = 6
const Y_LO = 0 // log10 error range
const Y_HI = 6
const N = 1_000_000

const sx = (sigma: number) => SL + (SR - SL) * sigma
const sy = (t: number) => SB - ((SB - ST) * t) / T_MAX
const px = (lx: number) => PL + ((PR - PL) * (lx - X_LO)) / (X_HI - X_LO)
const py = (ly: number) => PB - ((PB - PT) * (Math.max(Y_LO, Math.min(Y_HI, ly)) - Y_LO)) / (Y_HI - Y_LO)

/** Running max of |psi(y) - y| over y <= x, sampled at log-spaced x. psi = Chebyshev function. */
function chebyshevError() {
  const lam = new Float32Array(N + 1)
  const composite = new Uint8Array(N + 1)
  for (let p = 2; p <= N; p++) {
    if (composite[p]) continue
    for (let m = p * p; m <= N; m += p) composite[m] = 1
    const lp = Math.log(p)
    for (let q = p; q <= N; q *= p) lam[q] = lp
  }
  const samples: [number, number][] = []
  const COUNT = 240
  let next = 0
  const target = (i: number) => 10 ** (X_LO + ((X_HI - X_LO) * i) / COUNT)
  let psi = 0
  let worst = 0
  for (let n = 2; n <= N; n++) {
    // on [n-1, n) psi is constant; the error is extreme at the ends
    worst = Math.max(worst, Math.abs(psi - (n - 1)), Math.abs(psi - n))
    psi += lam[n]
    worst = Math.max(worst, Math.abs(psi - n))
    while (next <= COUNT && n >= target(next)) {
      samples.push([Math.log10(n), Math.log10(Math.max(1, worst))])
      next++
    }
  }
  return samples
}

const PRESETS: { label: string; v: number }[] = [
  { label: 'Classical (≈1)', v: 0.995 },
  { label: 'Claim 7/8', v: 7 / 8 },
  { label: 'Companion 11/12', v: 11 / 12 },
  { label: 'RH 1/2 (open)', v: 0.5 },
]

export function QuasiRiemannDemo() {
  const [edge, setEdge] = useState(7 / 8)
  const [rogue, setRogue] = useState<[number, number]>([0.8, 45])
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<'edge' | 'rogue' | null>(null)
  const data = useMemo(chebyshevError, [])

  const [rs, rt] = rogue
  const onLine = Math.abs(rs - 0.5) < 0.012
  const reach = Math.max(rs, 1 - rs) // a zero at s forces one at 1 - conj(s)
  const forbidden = reach > edge
  const status = onLine
    ? { c: '#2ee6c5', t: 'On the critical line. Allowed, and exactly what RH predicts.' }
    : forbidden
      ? { c: '#ff6b6b', t: `Ruled out: this zero or its mirror sits past ${edge.toFixed(3)}.` }
      : {
          c: '#f0c95a',
          t: `Allowed by a zero-free edge at ${edge.toFixed(3)}, but it would break RH.`,
        }

  const dataPath = data.map(([lx, ly], i) => `${i ? 'L' : 'M'}${px(lx).toFixed(1)},${py(ly).toFixed(1)}`).join(' ')
  const curve = (f: (lx: number) => number) => {
    const out: string[] = []
    for (let i = 0; i <= 60; i++) {
      const lx = X_LO + ((X_HI - X_LO) * i) / 60
      out.push(`${i ? 'L' : 'M'}${px(lx).toFixed(1)},${py(f(lx)).toFixed(1)}`)
    }
    return out.join(' ')
  }
  const ln10 = Math.log(10)
  // Schoenfeld: under RH, |psi(x) - x| < sqrt(x) log^2 x / (8 pi) for x >= 73.2
  const rhCurve = curve((lx) => 0.5 * lx + Math.log10((lx * ln10) ** 2 / (8 * Math.PI)))
  const edgeCurve = curve((lx) => edge * lx)
  const rhoAbs = Math.hypot(reach, rt)
  const rogueCurve = curve((lx) => reach * lx + Math.log10(2 / rhoAbs))

  const local = (e: ReactPointerEvent<SVGSVGElement>) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return null
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  }
  const applyDrag = (pt: DOMPoint) => {
    const sigma = Math.max(0.02, Math.min(0.995, (pt.x - SL) / (SR - SL)))
    if (drag.current === 'edge') setEdge(Math.max(0.5, sigma))
    else if (drag.current === 'rogue') {
      const snapped = Math.abs(sigma - 0.5) < 0.015 ? 0.5 : sigma
      const t = Math.max(3, Math.min(T_MAX - 2, ((SB - pt.y) / (SB - ST)) * T_MAX))
      setRogue([snapped, t])
    }
  }
  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const pt = local(e)
    if (!pt || pt.x > SR + 6) return
    drag.current = pt.y < ST + 2 || Math.abs(pt.x - sx(edge)) < 7 ? 'edge' : 'rogue'
    e.currentTarget.setPointerCapture(e.pointerId)
    applyDrag(pt)
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current) return
    const pt = local(e)
    if (pt) applyDrag(pt)
  }
  const onUp = () => {
    drag.current = null
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Where zeta's zeros are allowed to hide</h3>
      <p className="demo-hint">
        Left: the critical strip 0 ≤ Re s ≤ 1. Glowing dots are the true first zeros, all on the
        dashed line at 1/2. The teal zone is claimed zero-free. Drag the gold zero, a hypothetical
        rogue, anywhere. Its mirror image appears automatically. Drag the teal edge or use the
        presets. Right: real prime-counting error from a sieve up to 10⁶, next to the sizes each
        scenario allows.
      </p>
      <svg
        ref={svgRef}
        viewBox="0 0 420 246"
        role="img"
        aria-label="Critical strip with zeta zeros and a draggable hypothetical zero, beside a log-log plot of the prime counting error"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          <style>{`@keyframes qr-pulse{0%,100%{opacity:.55}50%{opacity:1}} .qr-z{animation:qr-pulse 2.4s ease-in-out infinite}`}</style>
          <linearGradient id="qr-free" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2ee6c5" stopOpacity="0.45" />
            <stop offset="1" stopColor="#2ee6c5" stopOpacity="0.08" />
          </linearGradient>
          <filter id="qr-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---- strip ---- */}
        <rect x={SL} y={ST} width={SR - SL} height={SB - ST} fill="#0b1210" stroke="#24332e" />
        <rect x={sx(edge)} y={ST} width={SR - sx(edge)} height={SB - ST} fill="url(#qr-free)" />
        <rect x={sx(0.5)} y={ST} width={sx(edge) - sx(0.5)} height={SB - ST} fill="#f0c95a" opacity={0.05} />
        <line x1={sx(0.5)} y1={ST} x2={sx(0.5)} y2={SB} stroke="#f0c95a" strokeDasharray="4 3" strokeWidth="1.3" />
        <line x1={sx(edge)} y1={ST} x2={sx(edge)} y2={SB} stroke="#2ee6c5" strokeWidth="2" />
        <rect x={sx(edge) - 6} y={ST - 10} width={12} height={10} rx={2} fill="#2ee6c5" style={{ cursor: 'ew-resize' }} />
        {ZEROS.map((t, i) => (
          <circle
            key={t}
            className="qr-z"
            style={{ animationDelay: `${(i * 0.17) % 2.4}s` }}
            cx={sx(0.5)}
            cy={sy(t)}
            r={3}
            fill="#e8f2ef"
            filter="url(#qr-glow)"
          />
        ))}
        {!onLine && (
          <>
            <line x1={sx(rs)} y1={sy(rt)} x2={sx(1 - rs)} y2={sy(rt)} stroke={status.c} strokeDasharray="2 3" opacity={0.6} />
            <circle cx={sx(1 - rs)} cy={sy(rt)} r={4.5} fill="none" stroke={status.c} strokeWidth="1.5" />
          </>
        )}
        <circle cx={sx(rs)} cy={sy(rt)} r={6.5} fill={status.c} stroke="#070b0a" strokeWidth="1.5" filter="url(#qr-glow)" style={{ cursor: 'grab' }} />
        <text x={SL} y={SB + 12} fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">0</text>
        <text x={sx(0.5)} y={SB + 12} textAnchor="middle" fill="#f0c95a" fontSize="9" fontFamily="IBM Plex Mono">½</text>
        <text x={SR} y={SB + 12} textAnchor="end" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">1</text>
        <text x={(SL + SR) / 2} y={SB + 24} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">Re s →  (height = Im s, 0–{T_MAX})</text>
        <text x={SL} y={ST - 14} fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">critical strip</text>

        {/* ---- error plot ---- */}
        <rect x={PL} y={PT} width={PR - PL} height={PB - PT} fill="#0b1210" stroke="#24332e" />
        {[3, 4, 5].map((lx) => (
          <line key={`gx${lx}`} x1={px(lx)} y1={PT} x2={px(lx)} y2={PB} stroke="#24332e" strokeWidth="0.6" />
        ))}
        {[1, 2, 3, 4, 5].map((ly) => (
          <line key={`gy${ly}`} x1={PL} y1={py(ly)} x2={PR} y2={py(ly)} stroke="#24332e" strokeWidth="0.6" />
        ))}
        {[2, 4, 6].map((lx) => (
          <text key={`tx${lx}`} x={px(lx)} y={PB + 12} textAnchor="middle" fill="#8aa39a" fontSize="8.5" fontFamily="IBM Plex Mono">
            10{lx === 2 ? '²' : lx === 4 ? '⁴' : '⁶'}
          </text>
        ))}
        {[0, 2, 4, 6].map((ly) => (
          <text key={`ty${ly}`} x={PL - 3} y={py(ly) + 3} textAnchor="end" fill="#8aa39a" fontSize="8" fontFamily="IBM Plex Mono">
            {ly === 0 ? '1' : `10${ly === 2 ? '²' : ly === 4 ? '⁴' : '⁶'}`}
          </text>
        ))}
        <path d={edgeCurve} fill="none" stroke="#2ee6c5" strokeWidth="1.6" strokeDasharray="5 3" />
        <path d={rhCurve} fill="none" stroke="#f0c95a" strokeWidth="1.2" strokeDasharray="2 3" />
        {!onLine && <path d={rogueCurve} fill="none" stroke={status.c} strokeWidth="1.4" opacity={0.85} />}
        <path d={dataPath} fill="none" stroke="#e8f2ef" strokeWidth="1.8" filter="url(#qr-glow)" />
        <text x={PL + 4} y={PT - 18} fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">largest |ψ(y) − y| for y ≤ x</text>
        <text x={PL + 4} y={PT - 6} fontSize="8.5" fontFamily="IBM Plex Mono">
          <tspan fill="#2ee6c5">- - x^{edge.toFixed(2)}</tspan>
          <tspan dx="6" fill="#f0c95a">··· RH size</tspan>
          {!onLine && <tspan dx="6" fill={status.c}>— rogue wave</tspan>}
        </text>
        <text x={(PL + PR) / 2} y={PB + 24} textAnchor="middle" fill="#8aa39a" fontSize="9" fontFamily="IBM Plex Mono">x →</text>
      </svg>

      <p className="stat" role="status" style={{ color: status.c, fontSize: '0.82rem', margin: 'var(--space-3) 0' }}>
        Rogue zero at {rs.toFixed(3)} + {rt.toFixed(1)}i. {status.t}
      </p>
      <div className="controls">
        <label>
          Zero-free edge, real part: <span className="stat">{edge.toFixed(3)}</span>
          <input type="range" min={0.5} max={0.995} step={0.001} value={edge} onChange={(e) => setEdge(Number(e.target.value))} />
        </label>
      </div>
      <div className="btn-row" style={{ marginBottom: 'var(--space-3)' }}>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className={Math.abs(edge - p.v) < 1e-6 ? 'btn' : 'btn btn-ghost'} onClick={() => setEdge(p.v)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="pill-inline" style={{ display: 'block' }}>
        A zero β + iγ adds a wave of size about 2x^β/|ρ| to the prime-count error (explicit formula),
        which is why the rightmost zero sets the error exponent. The x^edge curve drops constants and
        log factors. The white curve is real data, and it hugs the RH size, but finite data proves
        nothing about all x. The "classical" preset is schematic: the proven region hugs Re s = 1 and
        narrows as the height grows.
      </p>
      <p className="demo-callout">
        The October 2026 claim pushes the empty zone left to 7/8 for zeta and every Dirichlet
        L-function, so errors grow at most like x^(7/8 + ε). The band between ½ and 7/8 stays open.
        This is not RH. The claim is unchecked here and was still under independent examination.
      </p>
    </div>
  )
}
