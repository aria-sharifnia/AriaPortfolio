import { useManifest } from '@/ManifestProvider'
import GlobalErrorOverlay from './GlobalErrorOverlay'

export default function BootStrapiGuard({ children }: { children: React.ReactNode }) {
  const { ready, ok, refetch } = useManifest()

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
