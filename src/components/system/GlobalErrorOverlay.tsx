import { useEffect } from 'react'
import { Frown } from 'lucide-react'
import PrimaryButton from '@/components/common/PrimaryButton/PrimaryButton'

export default function GlobalErrorOverlay({
  show,
  message,
  details,
  title,
  buttonText,
  onRetry,
}: {
  show: boolean
  message?: string
  title?: string
  buttonText?: string
  details?: string
  onRetry?: () => void
}) {
  useEffect(() => {
    if (!show) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.overlay = '1'
    return () => {
      document.body.style.overflow = prev
      delete document.body.dataset.overlay
    }
  }, [show])

  if (!show) return null

  const handleRetry = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    ;(onRetry ?? (() => location.reload()))()
  }

  return (
    <div
      className={`fixed inset-0 z-[70] grid place-items-center bg-black/40 transition-opacity duration-150 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-100">
            <Frown className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-md text-slate-600">{message}</p>
          </div>
        </div>

        {details && (
          <pre className="mt-3 max-h-36 overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
            {details}
          </pre>
        )}

        <div className="mt-5 flex justify-end">
          <PrimaryButton
            href="#"
            onClick={handleRetry}
            className="rounded-full bg-teal-500 px-4 py-2 text-white shadow hover:opacity-90 focus-visible:outline-none"
          >
            {buttonText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
