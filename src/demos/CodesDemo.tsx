import { useMemo, useState } from 'react'
import { DimSlider } from './shared/DimSlider'

function hamming(a: string, b: string) {
  let d = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++
  return d
}

function randomBits(n: number) {
  let s = ''
  for (let i = 0; i < n; i++) s += Math.random() < 0.5 ? '0' : '1'
  return s
}

function flip(bits: string, k: number) {
  const arr = bits.split('')
  const idxs = new Set<number>()
  while (idxs.size < Math.min(k, arr.length)) {
    idxs.add(Math.floor(Math.random() * arr.length))
  }
  for (const i of idxs) arr[i] = arr[i] === '0' ? '1' : '0'
  return arr.join('')
}

export function CodesDemo() {
  const [n, setN] = useState(12)
  const [dMin, setDMin] = useState(3)
  const [noise, setNoise] = useState(1)
  const [code, setCode] = useState(() => ['000000000000', '111000111000', '000111000111'])
  const [received, setReceived] = useState('000000000000')
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')

  const distances = useMemo(() => {
    const out: number[] = []
    for (let i = 0; i < code.length; i++) {
      for (let j = i + 1; j < code.length; j++) out.push(hamming(code[i], code[j]))
    }
    return out
  }, [code])

  const minDist = distances.length ? Math.min(...distances) : 0

  function rebuild() {
    const words: string[] = []
    let tries = 0
    while (words.length < 4 && tries < 400) {
      tries++
      const w = randomBits(n)
      if (words.every((c) => hamming(c, w) >= dMin)) words.push(w)
    }
    if (words.length < 2) {
      setStatus('err')
      setMsg('Could not pack enough codewords at that distance — try lower d or larger n.')
      return
    }
    setCode(words)
    setReceived(words[0])
    setStatus('ok')
    setMsg(`Packed ${words.length} codewords (min distance ${Math.min(...pairs(words))}).`)
  }

  function pairs(words: string[]) {
    const out: number[] = []
    for (let i = 0; i < words.length; i++)
      for (let j = i + 1; j < words.length; j++) out.push(hamming(words[i], words[j]))
    return out
  }

  function sendWithNoise() {
    const sent = code[0]
    const r = flip(sent, noise)
    setReceived(r)
    // nearest neighbor decode
    let best = code[0]
    let bestD = Infinity
    for (const c of code) {
      const d = hamming(r, c)
      if (d < bestD) {
        bestD = d
        best = c
      }
    }
    const ok = best === sent
    setStatus(ok ? 'ok' : 'err')
    setMsg(
      ok
        ? `Decoded correctly (distance ${bestD} to nearest codeword).`
        : `Decode failed — noise beat the code’s distance.`,
    )
  }

  return (
    <div className="demo">
      <h3 className="demo-title">Hamming-distance sandbox</h3>
      <p className="demo-hint">
        Build a small binary code with a target minimum distance, then flip bits and decode by nearest
        neighbor — the same idea behind storage and QR resilience.
      </p>
      <div className="controls">
        <DimSlider label="Block length n" value={n} min={6} max={16} onChange={setN} />
        <DimSlider label="Target min distance" value={dMin} min={1} max={6} onChange={setDMin} />
        <DimSlider label="Noise flips" value={noise} min={0} max={5} onChange={setNoise} />
      </div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={rebuild}>
          Pack codewords
        </button>
        <button type="button" className="btn btn-ghost" onClick={sendWithNoise}>
          Send with noise
        </button>
      </div>
      <p className="stat" style={{ wordBreak: 'break-all' }}>
        Code: {code.join(' · ')}
      </p>
      <p className="stat" style={{ wordBreak: 'break-all' }}>
        Received: {received} · actual min distance: {minDist}
      </p>
      {status !== 'idle' ? (
        <p className={`feedback ${status === 'ok' ? 'ok' : 'err'}`} role="status">
          {msg}
        </p>
      ) : null}
      <p className="demo-callout">
        So what: stronger upper bounds on code size tell engineers when a distance/rate target is
        already near the theoretical wall.
      </p>
    </div>
  )
}
