import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'
import { useToast } from './Toast'

const UPDATE_CHECK_MS = 60 * 60 * 1000

/**
 * Registers the service worker. New versions wait for the user to tap
 * "Reload" so an update never interrupts a meme mid-edit.
 */
export function PwaPrompt() {
  const toast = useToast()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => {
        if (navigator.onLine) registration.update().catch(() => {})
      }, UPDATE_CHECK_MS)
    },
  })

  useEffect(() => {
    if (!offlineReady) return
    toast('Ready to work offline', 'info')
    setOfflineReady(false)
  }, [offlineReady, setOfflineReady, toast])

  if (!needRefresh) return null
  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex justify-center px-4 pt-safe" role="status">
      <div className="mt-3 flex w-full max-w-md animate-pop items-center gap-3 rounded-3xl border border-white/10 bg-ink-800/95 p-3 pl-4 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand text-ink-950">
          <RefreshCw className="size-5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">New version available</p>
          <p className="text-xs text-ink-400">Reload when you’re done editing.</p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="h-10 shrink-0 rounded-2xl bg-pop-lime px-4 text-sm font-extrabold text-ink-950 transition active:scale-95"
        >
          Reload
        </button>
        <button
          aria-label="Dismiss"
          onClick={() => setNeedRefresh(false)}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
