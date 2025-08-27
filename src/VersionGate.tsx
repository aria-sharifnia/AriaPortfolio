import { useManifest } from './ManifestProvider'

export function VersionGate({ children }: { children: React.ReactNode }) {
  const { ready } = useManifest()
  if (!ready) return null
  return <>{children}</>
}
