import { useEffect } from 'react'
import GlobalErrorOverlay from './GlobalErrorOverlay'
import { useManifest } from '@/ManifestProvider'

export default function BootStrapiGuard({ children }: { children: React.ReactNode }) {
  const { ready, ok, refetch } = useManifest()

  useEffect(() => {
    const onOnline = () => void refetch()
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => void refetch(), 120)
      }
    }
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refetch])

  return (
    <>
      {children}
      <GlobalErrorOverlay
        show={ready && !ok}
        title="Oops!"
        message="Couldn't fetch the latest site data right now. Please try again."
        buttonText="Try again"
        onRetry={() => {
          refetch().then((okNow) => {
            if (okNow) window.location.reload()
          })
        }}
      />
    </>
  )
}
