import { useState } from 'react'
import { Download, Share2, Trash2, Wand2 } from 'lucide-react'
import type { SavedMeme } from '../types'
import { clearMemes, deleteMeme } from '../lib/storage'
import { canShareFiles, downloadBlob, memeFilename, shareImage } from '../lib/share'
import { ConfirmSheet, Sheet } from '../components/Sheet'
import { useToast } from '../components/Toast'

interface Props {
  memes: SavedMeme[]
  loaded: boolean
  error: boolean
  onCreate: () => void
}

const timeAgo = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(t).toLocaleDateString()
}

export function GalleryScreen({ memes, loaded, error, onCreate }: Props) {
  const toast = useToast()
  const [viewing, setViewing] = useState<SavedMeme | null>(null)
  const [confirm, setConfirm] = useState<'one' | 'all' | null>(null)
  const shareable = canShareFiles()

  const share = async (m: SavedMeme) => {
    const r = await shareImage(m.blob, memeFilename())
    if (r === 'shared') toast('Shared! 🚀')
    else if (r === 'unsupported' || r === 'failed') {
      downloadBlob(m.blob, memeFilename())
      toast('Sharing unavailable — downloaded instead', 'info')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-safe sm:px-6">
      <header className="flex items-end justify-between pb-2 pt-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">My Memes</h1>
          <p className="mt-1 text-ink-400">
            {memes.length ? `${memes.length} creation${memes.length === 1 ? '' : 's'} · saved on this device` : 'Saved on this device'}
          </p>
        </div>
        {memes.length > 0 && (
          <button
            onClick={() => setConfirm('all')}
            className="h-10 rounded-full bg-white/5 px-4 text-sm font-bold text-ink-400 transition hover:bg-pop-pink/15 hover:text-pop-pink"
          >
            Clear all
          </button>
        )}
      </header>

      {!loaded ? (
        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="shimmer aspect-square rounded-[28px]" />
          ))}
        </div>
      ) : memes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-pop-violet/30 blur-3xl" />
            <span className="relative block animate-float text-8xl">🖼️</span>
          </div>
          <h2 className="mt-6 font-display text-2xl font-extrabold">{error ? 'Storage unavailable' : 'Your gallery is empty'}</h2>
          <p className="mt-2 max-w-xs text-ink-400">
            {error
              ? 'This browser is blocking local storage (private mode?). You can still create and download memes.'
              : 'Every meme you finish lands here automatically. Go make something legendary.'}
          </p>
          <button
            onClick={onCreate}
            className="mt-6 flex h-14 items-center gap-2 rounded-2xl bg-pop-lime px-6 text-lg font-extrabold text-ink-950 shadow-lg shadow-pop-lime/20 transition hover:brightness-105 active:scale-95"
          >
            <Wand2 className="size-5" strokeWidth={2.5} /> Create a meme
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3 lg:grid-cols-4">
          {memes.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setViewing(m)}
              className="group relative animate-fade-up overflow-hidden rounded-[28px] bg-ink-850 ring-1 ring-white/5 transition hover:ring-pop-lime/50 active:scale-[0.97]"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <img src={m.url} alt={m.title} loading="lazy" className="aspect-square size-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8 text-left">
                <p className="truncate text-sm font-bold">{m.title}</p>
                <p className="text-xs text-ink-300">{timeAgo(m.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!viewing && confirm === null} onClose={() => setViewing(null)} title={viewing?.title ?? ''}>
        {viewing && (
          <>
            <div className="overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-white/10">
              <img src={viewing.url} alt={viewing.title} className="mx-auto max-h-[55dvh] w-auto object-contain" />
            </div>
            <p className="mt-2 text-center text-xs text-ink-400">
              {viewing.width}×{viewing.height} · {timeAgo(viewing.createdAt)}
            </p>
            <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-3">
              {shareable ? (
                <button
                  onClick={() => share(viewing)}
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-pop-lime font-extrabold text-ink-950 transition active:scale-95"
                >
                  <Share2 className="size-5" /> Share
                </button>
              ) : null}
              <button
                onClick={() => {
                  downloadBlob(viewing.blob, memeFilename())
                  toast('Downloaded!')
                }}
                className={`flex h-14 items-center justify-center gap-2 rounded-2xl font-extrabold transition active:scale-95 ${
                  shareable ? 'bg-white/10 hover:bg-white/15' : 'col-span-2 bg-pop-lime text-ink-950'
                }`}
              >
                <Download className="size-5" /> Save
              </button>
              <button
                aria-label="Delete meme"
                onClick={() => setConfirm('one')}
                className="grid size-14 place-items-center rounded-2xl bg-pop-pink/10 text-pop-pink transition hover:bg-pop-pink/20 active:scale-95"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          </>
        )}
      </Sheet>

      <ConfirmSheet
        open={confirm !== null}
        title={confirm === 'all' ? 'Clear all memes?' : 'Delete this meme?'}
        message={confirm === 'all' ? `This permanently removes all ${memes.length} memes from this device.` : 'This permanently removes it from this device.'}
        confirmLabel={confirm === 'all' ? 'Clear all' : 'Delete'}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          try {
            if (confirm === 'all') await clearMemes()
            else if (viewing) await deleteMeme(viewing.id)
            toast(confirm === 'all' ? 'Gallery cleared' : 'Meme deleted')
            setViewing(null)
          } catch {
            toast('Something went wrong', 'error')
          }
          setConfirm(null)
        }}
      />
    </div>
  )
}
