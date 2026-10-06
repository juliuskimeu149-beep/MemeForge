import { useMemo, useState, type DragEvent } from 'react'
import { ImagePlus, UploadCloud } from 'lucide-react'
import { TEMPLATES, templateUrl } from '../lib/templates'

interface Props {
  onUpload: () => void
  onFile: (file: File) => void
  onTemplate: (id: string) => void
}

export function CreateScreen({ onUpload, onFile, onTemplate }: Props) {
  const [dragging, setDragging] = useState(false)
  const thumbs = useMemo(() => TEMPLATES.map((t) => ({ t, url: templateUrl(t) })), [])

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-safe sm:px-6">
      <header className="pb-2 pt-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Create</h1>
        <p className="mt-1 text-ink-400">Start with your own photo or pick a template.</p>
      </header>

      <button
        onClick={onUpload}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`group relative mt-4 flex w-full animate-fade-up flex-col items-center justify-center gap-3 overflow-hidden rounded-[32px] border-2 border-dashed px-6 py-10 text-center transition active:scale-[0.99] ${
          dragging ? 'border-pop-lime bg-pop-lime/10' : 'border-white/15 bg-ink-850 hover:border-pop-pink/60'
        }`}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-pop-pink/25 blur-3xl transition group-hover:bg-pop-pink/40" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-pop-violet/25 blur-3xl" />
        <span className="relative grid size-16 place-items-center rounded-3xl bg-brand text-ink-950 shadow-lg shadow-pop-pink/30 transition group-hover:-rotate-6 group-hover:scale-110">
          {dragging ? <UploadCloud className="size-8" strokeWidth={2.5} /> : <ImagePlus className="size-8" strokeWidth={2.5} />}
        </span>
        <span className="relative font-display text-2xl font-extrabold">{dragging ? 'Drop it like it’s hot' : 'Upload a photo'}</span>
        <span className="relative text-sm text-ink-400">
          Tap to choose from your device<span className="hidden sm:inline"> · or drag & drop here</span>
        </span>
      </button>

      <div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink-600">
        <span className="h-px flex-1 bg-white/10" /> or pick a template <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {thumbs.map(({ t, url }, i) => (
          <button
            key={t.id}
            onClick={() => onTemplate(t.id)}
            className="group animate-fade-up overflow-hidden rounded-[28px] bg-ink-850 text-left ring-1 ring-white/5 transition hover:-translate-y-1 hover:ring-pop-lime/50 active:scale-[0.97]"
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <div className="aspect-square overflow-hidden bg-ink-800">
              <img src={url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
            </div>
            <div className="flex items-center gap-2 px-3.5 py-3">
              <span className="text-xl">{t.emoji}</span>
              <span className="min-w-0 truncate font-bold">{t.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
