import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

type Tone = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  message: string
  tone: Tone
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {})

export const useToast = () => useContext(ToastContext)

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info }
const TONES = {
  success: 'text-pop-lime',
  error: 'text-pop-pink',
  info: 'text-pop-cyan',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const next = useRef(0)

  const toast = useCallback((message: string, tone: Tone = 'success') => {
    const id = ++next.current
    setItems((list) => [...list.slice(-2), { id, message, tone }])
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-safe"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = ICONS[t.tone]
          return (
            <div
              key={t.id}
              className="mt-3 flex animate-pop items-center gap-2.5 rounded-2xl border border-white/10 bg-ink-800/95 px-4 py-3 text-sm font-semibold shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              <Icon className={`size-5 shrink-0 ${TONES[t.tone]}`} />
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
