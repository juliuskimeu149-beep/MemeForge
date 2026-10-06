import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Images, Plus, Share2 } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { useToast } from '../components/Toast'
import { canShareFiles, downloadBlob, memeFilename, shareImage } from '../lib/share'

interface Props {
  result: { blob: Blob; saved: boolean } | null
  onClose: () => void
  onGallery: () => void
  onNew: () => void
}

export function ExportSheet({ result, onClose, onGallery, onNew }: Props) {
  const toast = useToast()
  const [url, setUrl] = useState<string | null>(null)
  const shareable = canShareFiles()

  useEffect(() => {
    if (!result) return
    const u = URL.createObjectURL(result.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [result])

  if (!result) return null

  const download = () => {
    downloadBlob(result.blob, memeFilename())
    toast('Downloaded!')
  }

  const share = async () => {
    const r = await shareImage(result.blob, memeFilename())
    if (r === 'shared') toast('Shared! 🚀')
    else if (r === 'unsupported' || r === 'failed') {
      downloadBlob(result.blob, memeFilename())
      toast('Sharing unavailable — downloaded instead', 'info')
    }
  }

  return (
    <Sheet open onClose={onClose} title="Your meme is ready 🎉">
      <div className="overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-white/10">
        {url && <img src={url} alt="Your finished meme" className="mx-auto max-h-[46dvh] w-auto animate-pop object-contain" />}
      </div>

      {result.saved && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-pop-lime">
          <CheckCircle2 className="size-4" /> Saved to My Memes
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {shareable && (
          <button
            onClick={share}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-pop-lime text-lg font-extrabold text-ink-950 shadow-lg shadow-pop-lime/20 transition hover:brightness-105 active:scale-[0.98]"
          >
            <Share2 className="size-5" strokeWidth={2.5} /> Share
          </button>
        )}
        <button
          onClick={download}
          className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-lg font-extrabold transition active:scale-[0.98] ${
            shareable ? 'bg-white/10 hover:bg-white/15' : 'bg-pop-lime text-ink-950 shadow-lg shadow-pop-lime/20 hover:brightness-105'
          }`}
        >
          <Download className="size-5" strokeWidth={2.5} /> Download image
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onGallery}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/5 font-bold text-ink-300 transition hover:bg-white/10 hover:text-white"
          >
            <Images className="size-4" /> My Memes
          </button>
          <button
            onClick={onNew}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/5 font-bold text-ink-300 transition hover:bg-white/10 hover:text-white"
          >
            <Plus className="size-4" /> New meme
          </button>
        </div>
        {!shareable && <p className="text-center text-xs text-ink-600">Sharing isn’t supported in this browser — download and post it anywhere.</p>}
      </div>
    </Sheet>
  )
}
