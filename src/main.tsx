import { startTransition } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import App from './App'
import './styles/globals.css'

declare global {
  interface Window {
    requestIdleCallback: typeof globalThis.requestIdleCallback
    cancelIdleCallback: typeof globalThis.cancelIdleCallback
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 7 * 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
})

const asyncLocalStorage = {
  getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
}

const persister = createAsyncStoragePersister({
  storage: asyncLocalStorage,
  key: 'portfolio-query-cache-v1',
})

const root = ReactDOM.createRoot(document.getElementById('root')!)

startTransition(() => {
  root.render(
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </PersistQueryClientProvider>
  )
})

if (import.meta.env.PROD) {
  const idle = (cb: () => void) =>
    window.requestIdleCallback?.(cb, { timeout: 2000 }) ?? window.setTimeout(cb, 300)

  window.addEventListener('load', () => {
    idle(() => {
      import('@vercel/analytics').then(({ inject }) => inject?.()).catch(() => {})
      import('@vercel/speed-insights').then(() => {}).catch(() => {})
    })
  })
}
