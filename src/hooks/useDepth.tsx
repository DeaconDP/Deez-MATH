import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const KEY = 'deez-math-go-deeper'

type DepthCtx = {
  deep: boolean
  setDeep: (v: boolean) => void
  toggle: () => void
}

const Ctx = createContext<DepthCtx | null>(null)

export function DepthProvider({ children }: { children: ReactNode }) {
  const [deep, setDeepState] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  const setDeep = useCallback((v: boolean) => {
    setDeepState(v)
  }, [])

  const toggle = useCallback(() => {
    setDeepState((v) => !v)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, deep ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [deep])

  const value = useMemo(() => ({ deep, setDeep, toggle }), [deep, setDeep, toggle])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDepth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDepth requires DepthProvider')
  return ctx
}
