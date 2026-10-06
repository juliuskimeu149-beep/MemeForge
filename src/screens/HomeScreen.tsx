import { useMemo } from 'react'
import { ArrowRight, ImagePlus, Share2, Smile, Sparkles, Wand2 } from 'lucide-react'
import { Wordmark } from '../components/Logo'
import { TEMPLATES, templateUrl } from '../lib/templates'
import type { SavedMeme } from '../types'

interface Props {
  memes: SavedMeme[]
  onCreate: () => void
  onUpload: () => void
  onTemplate: (id: string) => void
  onGallery: () => void
}

const FLOATERS = [
  { e: '😂', cls: 'left-[6%] top-[14%] text-5xl', delay: '0s' },
  { e: '🔥', cls: 'right-[8%] top-[10%] text-4xl', delay: '-2s' },
  { e: '💀', cls: 'right-[18%] bottom-[30%] text-3xl', delay: '-4s' },
  { e: '✨', cls: 'left-[16%] bottom-[34%] text-3xl', delay: '-1s' },
]

export function HomeScreen({ memes, onCreate, onUpload, onTemplate, onGallery }: Props) {
  const thumbs = useMemo(() => TEMPLATES.map((t) => ({ t, url: templateUrl(t) })), [])

  return (
    <div className="mx-auto max-w-5xl px-4 pt-safe sm:px-6">
      <header className="flex h-16 items-center justify-between">
        <Wordmark />
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-ink-300">
          <Sparkles className="size-3.5 text-pop-sun" /> AI Meme Studio
        </span>
      </header>

      {/* Hero */}
      <section className="relative mt-3 overflow-hidden rounded-[36px] border border-white/10 bg-ink-850 px-6 pb-7 pt-12 sm:px-12 sm:pb-12 sm:pt-16">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-pop-pink/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 size-72 rounded-full bg-pop-violet/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-pop-orange/30 blur-3xl" />
        {FLOATERS.map((f) => (
          <span key={f.e} aria-hidden className={`pointer-events-none absolute hidden animate-float select-none sm:block ${f.cls}`} style={{ animationDelay: f.delay }}>
            {f.e}
          </span>
        ))}

        <div className="relative mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex w-fit animate-fade-up items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-xs font-bold text-ink-300 ring-1 ring-white/10">
            <span className="size-2 animate-pulse rounded-full bg-pop-lime" /> No sign-up. Works offline.
          </div>
          <h1 className="animate-fade-up font-display text-[2.7rem] font-extrabold leading-[0.95] tracking-tight [animation-delay:60ms] sm:text-7xl">
            Turn <span className="text-gradient">anything</span>
            <br /> into a meme.
          </h1>
          <p className="mx-auto mt-4 max-w-sm animate-fade-up text-base text-ink-300 [animation-delay:120ms] sm:text-lg">
            Upload a photo or grab a template, drop in captions & stickers, and share in seconds.
          </p>

          <div className="mt-7 grid animate-fade-up gap-3 [animation-delay:180ms] sm:mx-auto sm:max-w-md sm:grid-cols-[1.3fr_1fr]">
            <button
              onClick={onCreate}
              className="group flex h-16 items-center justify-center gap-2 rounded-[22px] bg-pop-lime text-lg font-extrabold text-ink-950 shadow-[0_10px_40px_-8px] shadow-pop-lime/60 transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.97]"
            >
              <Wand2 className="size-6 transition group-hover:-rotate-12" strokeWidth={2.5} />
              Create Meme
            </button>
            <button
              onClick={onUpload}
              className="flex h-16 items-center justify-center gap-2 rounded-[22px] bg-white/10 text-lg font-bold ring-1 ring-white/10 backdrop-blur transition hover:bg-white/15 active:scale-[0.97]"
            >
              <ImagePlus className="size-6" /> Upload
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="no-scrollbar -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
        {[
          { Icon: Sparkles, title: 'AI captions', text: 'Stuck? Get instant joke ideas.', color: 'text-pop-sun bg-pop-sun/10' },
          { Icon: Smile, title: 'Stickers', text: 'Slap on emojis, drag & resize.', color: 'text-pop-pink bg-pop-pink/10' },
          { Icon: Share2, title: 'One-tap share', text: 'Straight to your group chat.', color: 'text-pop-cyan bg-pop-cyan/10' },
        ].map(({ Icon, title, text, color }) => (
          <div key={title} className="flex min-w-[220px] snap-start items-center gap-3 rounded-3xl bg-ink-850 p-4 ring-1 ring-white/5">
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${color}`}>
              <Icon className="size-6" />
            </span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="text-sm text-ink-400">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Templates */}
      <section className="mt-9">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">🔥 Hot templates</h2>
          <button onClick={onCreate} className="flex items-center gap-1 text-sm font-bold text-ink-400 hover:text-white">
            All <ArrowRight className="size-4" />
          </button>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {thumbs.map(({ t, url }, i) => (
            <button
              key={t.id}
              onClick={() => onTemplate(t.id)}
              className="group w-36 shrink-0 snap-start animate-fade-up text-left sm:w-44"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="aspect-square overflow-hidden rounded-3xl bg-ink-800 ring-1 ring-white/10 transition group-hover:ring-pop-lime/60 group-active:scale-95">
                <img src={url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <p className="mt-2 truncate text-sm font-bold">
                {t.emoji} {t.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">Your recent memes</h2>
          {memes.length > 0 && (
            <button onClick={onGallery} className="flex items-center gap-1 text-sm font-bold text-ink-400 hover:text-white">
              See all <ArrowRight className="size-4" />
            </button>
          )}
        </div>
        {memes.length === 0 ? (
          <button
            onClick={onCreate}
            className="flex w-full items-center gap-4 rounded-3xl border-2 border-dashed border-white/10 p-5 text-left transition hover:border-white/25"
          >
            <span className="grid size-14 shrink-0 animate-wiggle place-items-center rounded-2xl bg-white/5 text-3xl">🎨</span>
            <span>
              <span className="block font-bold">Nothing here yet</span>
              <span className="text-sm text-ink-400">Your creations will show up here — make your first one!</span>
            </span>
          </button>
        ) : (
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {memes.slice(0, 10).map((m) => (
              <button key={m.id} onClick={onGallery} className="w-32 shrink-0 snap-start sm:w-40">
                <div className="aspect-square overflow-hidden rounded-3xl bg-ink-800 ring-1 ring-white/10">
                  <img src={m.url} alt={m.title} className="size-full object-cover" loading="lazy" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
