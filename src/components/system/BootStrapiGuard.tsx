import { useEffect, useRef, useState } from 'react'
import GlobalErrorOverlay from './GlobalErrorOverlay'
import { STRAPI_BASE } from '@/api/strapi'

const CHECKS = ['/health']
const REACHABLE = (s: number) => s >= 200 && s <= 599

const GRACE_MS = 300
const TIMEOUT_MS = 450

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
  let okHead = false

  try {
    okHead = await withTimeout(
      fetch(url, { method: 'HEAD', mode: 'cors', credentials: 'omit', cache: 'no-store' }).then(
        (r) => {
          if (r.status === 405 || r.status === 501) return false
          return REACHABLE(r.status)
        }
      ),
      TIMEOUT_MS
    )
  } catch {
    okHead = false
  }

  if (okHead) return true

  try {
    const okGet = await withTimeout(
      fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store' }).then(
        (r) => REACHABLE(r.status)
      ),
      TIMEOUT_MS
    )
    return okGet
  } catch {
    return false
  }
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
  const [status, setStatus] = useState<'unknown' | 'up' | 'down'>('unknown')
  const [showOverlay, setShowOverlay] = useState(false)
  const graceTimer = useRef<number | null>(null)

  const run = async () => {
    setStatus('unknown')
    if (graceTimer.current) window.clearTimeout(graceTimer.current)
    graceTimer.current = window.setTimeout(() => {
      setShowOverlay(true)
      document.body.dataset.overlay = '1'
    }, GRACE_MS)

    const ok = await pingStrapi()

    if (graceTimer.current) {
      window.clearTimeout(graceTimer.current)
      graceTimer.current = null
    }
    setStatus(ok ? 'up' : 'down')
    setShowOverlay(!ok)
    if (ok) delete document.body.dataset.overlay
    else document.body.dataset.overlay = '1'
  }

  useEffect(() => {
    run()
    const onFocusOrOnline = () => run()
    window.addEventListener('online', onFocusOrOnline)
    window.addEventListener('focus', onFocusOrOnline)
    return () => {
      window.removeEventListener('online', onFocusOrOnline)
      window.removeEventListener('focus', onFocusOrOnline)
      if (graceTimer.current) window.clearTimeout(graceTimer.current)
    }
  }, [])

  if (status === 'unknown' && !showOverlay) return null

  if (status === 'down' || showOverlay) {
    return (
      <GlobalErrorOverlay
        show
        title="Oops!"
        message="Couldn't fetch data right now. The server may be down."
        buttonText="Try again"
        onRetry={run}
      />
    )
  }
  return <>{children}</>
}
