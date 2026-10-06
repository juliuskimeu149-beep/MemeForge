import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Loader2, Palette, Redo2, RotateCcw, Smile, Sparkles, Type, Undo2, Wand2 } from 'lucide-react'
import type { EditorSource, Layer, StickerLayer, TextLayer } from '../types'
import { getTemplate, templateImage } from '../lib/templates'
import { loadImage } from '../lib/image'
import { fontsReady } from '../lib/fonts'
import { cloneLayer, makeSticker, makeText, topBottom } from '../lib/layers'
import { exportMeme } from '../lib/render'
import { saveMeme } from '../lib/storage'
import type { Suggestion } from '../lib/captions'
import { useHistory } from '../hooks/useHistory'
import { useToast } from '../components/Toast'
import { ConfirmSheet } from '../components/Sheet'
import { MemeCanvas } from '../editor/MemeCanvas'
import { AIPanel, StickerPanel, StylePanel, TextPanel } from '../editor/Panels'
import { ExportSheet } from '../editor/ExportSheet'

type PanelTab = 'text' | 'style' | 'stickers' | 'ai'

const TABS: { id: PanelTab; label: string; Icon: typeof Type }[] = [
  { id: 'text', label: 'Text', Icon: Type },
  { id: 'style', label: 'Style', Icon: Palette },
  { id: 'stickers', label: 'Stickers', Icon: Smile },
  { id: 'ai', label: 'AI Captions', Icon: Sparkles },
]

interface Props {
  source: EditorSource
  onClose: () => void
  onGallery: () => void
  onNew: () => void
  /** Registers a guard the app calls before leaving (e.g. hardware back). */
  registerLeaveGuard: (guard: (() => boolean) | null) => void
}

export function EditorScreen(props: Props) {
  const { source } = props
  const template = source.kind === 'template' ? (getTemplate(source.templateId) ?? null) : null
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    const p = source.kind === 'template' && template ? templateImage(template) : source.kind === 'upload' ? loadImage(source.url) : Promise.reject()
    p.then((img) => alive && setImage(img)).catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [source, template])

  if (failed) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="text-5xl">🫠</p>
          <p className="mt-4 font-display text-2xl font-extrabold">Couldn’t open that image</p>
          <button onClick={props.onClose} className="mt-6 h-12 rounded-2xl bg-white/10 px-6 font-bold">
            Go back
          </button>
        </div>
      </div>
    )
  }
  if (!image) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="size-10 animate-spin text-pop-pink" />
      </div>
    )
  }

  const initial = template ? template.layers() : topBottom(image.naturalWidth / image.naturalHeight)
  return <Editor {...props} image={image} initial={initial} templateName={template?.name ?? 'Your photo'} />
}

interface EditorProps extends Props {
  image: HTMLImageElement
  initial: Layer[]
  templateName: string
}

function Editor({ source, image, initial, templateName, onClose, onGallery, onNew, registerLeaveGuard }: EditorProps) {
  const toast = useToast()
  const template = source.kind === 'template' ? (getTemplate(source.templateId) ?? null) : null
  const initialRef = useRef(initial)
  const history = useHistory<Layer[]>(initial)
  const { value: layers, set, begin, undo, redo } = history
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<PanelTab>('text')
  const [focusId, setFocusId] = useState<string | null>(null)
  const [fontsVersion, setFontsVersion] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; saved: boolean } | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const lastSaved = useRef<Layer[] | null>(null)

  useEffect(() => {
    fontsReady.then(() => setFontsVersion((v) => v + 1))
  }, [])

  const dirty = history.canUndo && lastSaved.current !== layers
  useEffect(() => {
    registerLeaveGuard(() => {
      if (!dirty) return true
      setConfirmLeave(true)
      return false
    })
    return () => registerLeaveGuard(null)
  }, [dirty, registerLeaveGuard])

  const selected = layers.find((l) => l.id === selectedId) ?? null
  const textLayers = useMemo(() => layers.filter((l): l is TextLayer => l.kind === 'text'), [layers])

  const patch = useCallback(
    (id: string, p: Partial<Layer>, commit: boolean) =>
      set((ls) => ls.map((l) => (l.id === id ? ({ ...l, ...p } as Layer) : l)), commit),
    [set],
  )

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id)
      if (id) setTab((t) => (t === 'stickers' || t === 'ai' ? 'style' : t))
    },
    [],
  )

  const remove = useCallback(
    (id: string) => {
      set((ls) => ls.filter((l) => l.id !== id))
      setSelectedId((s) => (s === id ? null : s))
    },
    [set],
  )

  const addText = () => {
    const t = makeText({ y: 0.5 })
    set((ls) => [...ls, t])
    setSelectedId(t.id)
    setTab('text')
    setFocusId(t.id)
  }

  const addSticker = (emoji: string) => {
    const s: StickerLayer = makeSticker(emoji, {
      x: 0.5 + (Math.random() - 0.5) * 0.3,
      y: 0.5 + (Math.random() - 0.5) * 0.3,
      rotation: Math.round((Math.random() - 0.5) * 24),
    })
    set((ls) => [...ls, s])
    setSelectedId(s.id)
  }

  const applySuggestion = (s: Suggestion) => {
    set((ls) => {
      let next = ls
      let texts = ls.filter((l): l is TextLayer => l.kind === 'text')
      if (texts.length === 0) {
        texts = topBottom(image.naturalWidth / image.naturalHeight)
        next = [...ls, ...texts]
      }
      const assign = new Map<string, string>()
      if (s.fitsTemplate) {
        texts.forEach((t, i) => s.lines[i] !== undefined && assign.set(t.id, s.lines[i]))
      } else if (texts.length === 1) {
        assign.set(texts[0].id, s.lines.join('\n'))
      } else {
        assign.set(texts[0].id, s.lines[0] ?? '')
        assign.set(texts[texts.length - 1].id, s.lines[1] ?? '')
      }
      return next.map((l) => (assign.has(l.id) ? { ...l, text: assign.get(l.id)! } : l))
    })
    toast('Caption applied ✨')
  }

  const reset = () => {
    set(initialRef.current.map((l) => ({ ...l })))
    setSelectedId(null)
    toast('Reset — tap undo to bring it back', 'info')
  }

  const doExport = async () => {
    if (exporting) return
    setExporting(true)
    setSelectedId(null)
    try {
      const { blob, width, height } = await exportMeme(image, layers)
      let saved = lastSaved.current === layers
      if (!saved) {
        try {
          await saveMeme(blob, width, height, textLayers.find((t) => t.text.trim())?.text.trim().slice(0, 60) || templateName)
          lastSaved.current = layers
          saved = true
        } catch {
          toast('Couldn’t save to My Memes (storage unavailable)', 'error')
        }
      }
      setResult({ blob, saved })
    } catch {
      toast('Export failed — please try again', 'error')
    } finally {
      setExporting(false)
    }
  }

  // Keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [contenteditable]')) return
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        remove(selectedId)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedId, remove])

  const iconBtn =
    'grid size-10 shrink-0 place-items-center rounded-2xl sm:size-11 text-ink-300 transition hover:bg-white/10 hover:text-white active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className="flex h-dvh animate-fade-in flex-col lg:block lg:h-auto lg:min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-white/5 bg-ink-950/80 pt-safe backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-0.5 px-2 sm:gap-1 sm:px-4">
          <button aria-label="Back" className={iconBtn} onClick={() => (dirty ? setConfirmLeave(true) : onClose())}>
            <ChevronLeft className="size-6" />
          </button>
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate font-display text-lg font-extrabold leading-tight">{templateName}</p>
            <p className="truncate text-xs text-ink-400">{dirty ? 'Unsaved' : 'Editor'}</p>
          </div>
          <button aria-label="Undo" title="Undo (Ctrl+Z)" className={iconBtn} disabled={!history.canUndo} onClick={history.undo}>
            <Undo2 className="size-5" />
          </button>
          <button aria-label="Redo" title="Redo (Ctrl+Shift+Z)" className={iconBtn} disabled={!history.canRedo} onClick={history.redo}>
            <Redo2 className="size-5" />
          </button>
          <button aria-label="Reset" title="Reset" className={iconBtn} disabled={!history.canUndo} onClick={reset}>
            <RotateCcw className="size-5" />
          </button>
          <button
            onClick={doExport}
            disabled={exporting}
            className="ml-1 flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-pop-lime px-3 min-[360px]:px-3.5 sm:px-4 font-extrabold text-ink-950 shadow-lg shadow-pop-lime/20 transition hover:brightness-105 active:scale-95"
          >
            {exporting ? <Loader2 className="size-5 animate-spin" /> : <Wand2 className="hidden size-5 min-[360px]:block" strokeWidth={2.5} />}
            <span>Done</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:px-6">
        <section className="shrink-0 py-3 [--stage-max-h:40dvh] sm:[--stage-max-h:46dvh] lg:sticky lg:top-16 lg:self-start lg:py-8 lg:[--stage-max-h:calc(100dvh-10rem)]">
          <MemeCanvas
            image={image}
            layers={layers}
            selectedId={selectedId}
            fontsVersion={fontsVersion}
            onSelect={select}
            onLive={(id, p) => patch(id, p, false)}
            onBegin={begin}
            onDelete={remove}
            onEditText={(id) => {
              setTab('text')
              setFocusId(id)
            }}
          />
          <p className="mt-3 hidden text-center text-xs text-ink-400 lg:block">Drag to move · tap to select · double-tap text to edit</p>
        </section>

        <section className="flex min-h-0 flex-1 flex-col lg:block lg:py-8">
          <div className="shrink-0">
            <div className="grid grid-cols-4 gap-1 rounded-[22px] bg-ink-850 p-1.5 ring-1 ring-white/5" role="tablist">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-bold transition active:scale-95 ${
                    tab === id ? 'bg-white text-ink-950 shadow-lg' : 'text-ink-400 hover:text-white'
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="truncate">{id === 'ai' ? 'AI' : label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="-mx-4 mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:mx-0 lg:overflow-visible lg:px-0">
          <div key={tab} className="animate-fade-up rounded-[28px] bg-ink-850 p-4 ring-1 ring-white/5 sm:p-5">
            {tab === 'text' && (
              <TextPanel
                layers={textLayers}
                selectedId={selectedId}
                focusId={focusId}
                onFocused={() => setFocusId(null)}
                onSelect={setSelectedId}
                onBegin={begin}
                onText={(id, text) => patch(id, { text }, false)}
                onAdd={addText}
              />
            )}
            {tab === 'style' && (
              <StylePanel
                layer={selected}
                onBegin={begin}
                onPatch={(p, commit) => selected && patch(selected.id, p as Partial<Layer>, commit)}
                onDuplicate={() => {
                  if (!selected) return
                  const c = cloneLayer(selected)
                  set((ls) => [...ls, c])
                  setSelectedId(c.id)
                }}
                onDelete={() => selected && remove(selected.id)}
                onFront={() => selected && set((ls) => [...ls.filter((l) => l.id !== selected.id), selected])}
              />
            )}
            {tab === 'stickers' && <StickerPanel onAdd={addSticker} />}
            {tab === 'ai' && <AIPanel template={template} isUpload={source.kind === 'upload'} onApply={applySuggestion} />}
          </div>
          </div>
        </section>
      </main>

      <ExportSheet
        result={result}
        onClose={() => setResult(null)}
        onGallery={() => {
          setResult(null)
          onGallery()
        }}
        onNew={() => {
          setResult(null)
          onNew()
        }}
      />
      <ConfirmSheet
        open={confirmLeave}
        title="Leave the editor?"
        message="Your meme hasn’t been saved yet. Tap Done first to keep it in My Memes."
        confirmLabel="Discard"
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false)
          onClose()
        }}
      />
    </div>
  )
}
