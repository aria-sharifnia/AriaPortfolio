import { useEffect, useRef, useState } from 'react'
import GlobalErrorOverlay from './GlobalErrorOverlay'
import { STRAPI_BASE } from '@/api/strapi'

const CHECKS = ['/health']
const REACHABLE = (s: number) => s >= 200 && s <= 599

const TIMEOUT_MS = 450
const MIN_INTERVAL_MS = 30000

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new DOMException('Timeout', 'TimeoutError')), ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      }
    )
  })
}

async function quickProbe(url: string): Promise<boolean> {
  const okHead = await withTimeout(
    fetch(url, { method: 'HEAD', mode: 'cors', credentials: 'omit', cache: 'no-store' }).then(
      (r) => (r.status === 405 || r.status === 501 ? false : REACHABLE(r.status))
    ),
    TIMEOUT_MS
  ).catch(() => false)

  if (okHead) return true

  const okGet = await withTimeout(
    fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store' }).then((r) =>
      REACHABLE(r.status)
    ),
    TIMEOUT_MS
  ).catch(() => false)

  return okGet
}

async function pingStrapi(): Promise<boolean> {
  const base = (STRAPI_BASE ?? '').replace(/\/+$/, '')
  if (!base) return false
  for (const p of CHECKS) {
    const ok = await quickProbe(`${base}${p.startsWith('/') ? '' : '/'}${p}`)
    if (ok) return true
  }
  return false
}

export default function BootStrapiGuard({ children }: { children: React.ReactNode }) {
  const [isDown, setIsDown] = useState(false)
  const lastCheckRef = useRef(0)
  const inFlightRef = useRef(false)
  const run = async (force = false): Promise<boolean> => {
    if (inFlightRef.current) return !isDown
    const now = Date.now()
    if (!force && !isDown && now - lastCheckRef.current < MIN_INTERVAL_MS) return !isDown
    if (document.hidden) return !isDown
    if (!navigator.onLine) {
      setIsDown(true)
      return false
    }

    inFlightRef.current = true
    try {
      const ok = await pingStrapi()
      lastCheckRef.current = Date.now()
      setIsDown(!ok)
      return ok
    } finally {
      inFlightRef.current = false
    }
  }

  useEffect(() => {
    run(true)

    const onOnline = () => run(true)
    const onVis = () => {
      if (document.visibilityState === 'visible') setTimeout(() => void run(false), 120)
    }

    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <>
      {children}
      <GlobalErrorOverlay
        show={isDown}
        title="Oops!"
        message="Couldn't fetch data right now. The server may be down."
        buttonText="Try again"
        onRetry={() => {
          run(true).then((ok) => {
            if (ok) {
              window.location.reload()
            }
          })
        }}
      />
    </>
  )
}
