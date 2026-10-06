import { Home, Images, Plus } from 'lucide-react'

export type Tab = 'home' | 'create' | 'gallery'

interface Props {
  tab: Tab
  onChange: (tab: Tab) => void
  memeCount: number
}

export function BottomNav({ tab, onChange, memeCount }: Props) {
  const item = (id: Tab, label: string, Icon: typeof Home, badge?: number) => {
    const active = tab === id
    return (
      <button
        onClick={() => onChange(id)}
        aria-current={active ? 'page' : undefined}
        className={`relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-bold transition active:scale-95 ${
          active ? 'text-white' : 'text-ink-400 hover:text-ink-300'
        }`}
      >
        <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
        {label}
        {active && <span className="absolute bottom-1 h-1 w-5 rounded-full bg-brand" />}
        {!!badge && (
          <span className="absolute right-[calc(50%-22px)] top-1.5 min-w-5 rounded-full bg-pop-pink px-1.5 text-[10px] leading-5 text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-[28px] border border-white/10 bg-ink-850/85 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {item('home', 'Home', Home)}
        <button
          onClick={() => onChange('create')}
          aria-current={tab === 'create' ? 'page' : undefined}
          aria-label="Create"
          className={`group mx-1 grid size-16 -translate-y-4 place-items-center rounded-[22px] bg-brand text-ink-950 shadow-xl shadow-pop-pink/40 ring-4 ring-ink-950 transition hover:-translate-y-5 active:scale-95 ${
            tab === 'create' ? 'rotate-0' : ''
          }`}
        >
          <Plus className="size-8 transition group-hover:rotate-90" strokeWidth={3} />
        </button>
        {item('gallery', 'My Memes', Images, memeCount)}
      </div>
    </nav>
  )
}
