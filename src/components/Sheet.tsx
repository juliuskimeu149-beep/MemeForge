import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        className="absolute inset-0 animate-fade-in cursor-default bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[92dvh] w-full max-w-lg animate-sheet-up overflow-y-auto rounded-t-[32px] border border-white/10 bg-ink-850 shadow-2xl sm:animate-pop sm:rounded-[32px]">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-ink-850/90 px-5 pb-2 pt-3 backdrop-blur">
          <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/15 sm:hidden" />
          <h2 className="mt-3 font-display text-xl font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="mt-3 grid size-10 place-items-center rounded-full bg-white/5 text-ink-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSheet({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="text-ink-300">{message}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={onCancel} className="h-14 rounded-2xl bg-white/5 font-bold transition hover:bg-white/10 active:scale-[0.98]">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="h-14 rounded-2xl bg-pop-pink font-bold text-white shadow-lg shadow-pop-pink/30 transition hover:brightness-110 active:scale-[0.98]"
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  )
}
