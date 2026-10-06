import { useEffect, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowUpToLine,
  CaseUpper,
  Copy,
  MousePointerClick,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import type { Align, FontId, Layer, MemeTemplate, StickerLayer, TextLayer } from '../types'
import { FONT_LIST } from '../lib/fonts'
import { suggestCaptions, VIBES, type Suggestion, type Vibe } from '../lib/captions'
import { Field, Segmented, Slider, Swatches } from './Controls'

/* ---------------------------------- Text ---------------------------------- */

interface TextPanelProps {
  layers: TextLayer[]
  selectedId: string | null
  focusId: string | null
  onFocused: () => void
  onSelect: (id: string) => void
  onBegin: () => void
  onText: (id: string, text: string) => void
  onAdd: () => void
}

export function TextPanel({ layers, selectedId, focusId, onFocused, onSelect, onBegin, onText, onAdd }: TextPanelProps) {
  const refs = useRef(new Map<string, HTMLTextAreaElement>())

  useEffect(() => {
    if (!focusId) return
    const el = refs.current.get(focusId)
    if (el) {
      el.focus()
      el.select()
    }
    onFocused()
  }, [focusId, onFocused])

  return (
    <div className="space-y-3">
      {layers.length === 0 && <p className="text-sm text-ink-400">No text yet — add a text box to get started.</p>}
      {layers.map((l, i) => {
        const active = l.id === selectedId
        return (
          <label
            key={l.id}
            className={`block rounded-2xl border p-3 transition ${
              active ? 'border-pop-lime/60 bg-pop-lime/5' : 'border-white/5 bg-ink-900 hover:border-white/15'
            }`}
          >
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-400">
              {l.placeholder && l.placeholder !== 'Your text' ? l.placeholder : `Text ${i + 1}`}
            </span>
            <textarea
              ref={(el) => {
                if (el) refs.current.set(l.id, el)
                else refs.current.delete(l.id)
              }}
              rows={1}
              value={l.text}
              placeholder={`Type ${l.placeholder?.toLowerCase() ?? 'something'}…`}
              onFocus={() => {
                onSelect(l.id)
                onBegin()
              }}
              onChange={(e) => onText(l.id, e.target.value)}
              className="field-sizing-content block max-h-40 min-h-7 w-full resize-none bg-transparent text-lg font-semibold text-white placeholder:text-ink-600 focus:outline-none"
            />
          </label>
        )
      })}
      <button
        onClick={onAdd}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 font-bold text-ink-300 transition hover:border-pop-lime/60 hover:text-white active:scale-[0.98]"
      >
        <Plus className="size-5" /> Add text box
      </button>
    </div>
  )
}

/* ---------------------------------- Style --------------------------------- */

interface StylePanelProps {
  layer: Layer | null
  onPatch: (patch: Partial<TextLayer> | Partial<StickerLayer>, commit: boolean) => void
  onBegin: () => void
  onDuplicate: () => void
  onDelete: () => void
  onFront: () => void
}

export function StylePanel({ layer, onPatch, onBegin, onDuplicate, onDelete, onFront }: StylePanelProps) {
  if (!layer) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 px-6 py-10 text-center">
        <MousePointerClick className="size-8 text-pop-violet" />
        <p className="font-bold">Tap any text or sticker on your meme</p>
        <p className="text-sm text-ink-400">Then tweak its size, color, outline and more right here.</p>
      </div>
    )
  }

  const actions = (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Duplicate', Icon: Copy, fn: onDuplicate },
        { label: 'To front', Icon: ArrowUpToLine, fn: onFront },
        { label: 'Delete', Icon: Trash2, fn: onDelete, danger: true },
      ].map(({ label, Icon, fn, danger }) => (
        <button
          key={label}
          onClick={fn}
          className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold transition active:scale-95 ${
            danger ? 'bg-pop-pink/10 text-pop-pink hover:bg-pop-pink/20' : 'bg-white/5 text-ink-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Icon className="size-4" /> {label}
        </button>
      ))}
    </div>
  )

  const rotation = (
    <Field label="Rotate" value={`${Math.round(layer.rotation)}°`}>
      <Slider label="Rotation" min={-180} max={180} step={1} value={layer.rotation} onBegin={onBegin} onChange={(v) => onPatch({ rotation: v }, false)} />
    </Field>
  )

  if (layer.kind === 'sticker') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-2xl bg-ink-900 text-4xl">{layer.emoji}</span>
          <div>
            <p className="font-bold">Sticker</p>
            <p className="text-sm text-ink-400">Drag to move · pull the green handle to resize</p>
          </div>
        </div>
        <Field label="Size" value={`${Math.round(layer.size * 100)}`}>
          <Slider label="Sticker size" min={0.04} max={0.8} step={0.005} value={layer.size} onBegin={onBegin} onChange={(v) => onPatch({ size: v }, false)} />
        </Field>
        {rotation}
        {actions}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Field label="Font">
        <div className="grid grid-cols-4 gap-2">
          {FONT_LIST.map((f) => (
            <button
              key={f.id}
              onClick={() => onPatch({ font: f.id as FontId }, true)}
              aria-pressed={layer.font === f.id}
              className={`h-12 truncate rounded-2xl px-1 text-base transition sm:text-lg active:scale-95 ${
                layer.font === f.id ? 'bg-white text-ink-950' : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
              }`}
              style={{ fontFamily: f.family, fontWeight: f.weight }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Size" value={`${Math.round(layer.size * 1000)}`}>
        <Slider label="Text size" min={0.025} max={0.2} step={0.001} value={layer.size} onBegin={onBegin} onChange={(v) => onPatch({ size: v }, false)} />
      </Field>

      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <Field label="Align">
          <Segmented<Align>
            value={layer.align}
            onChange={(v) => onPatch({ align: v }, true)}
            options={[
              { value: 'left', label: <AlignLeft className="size-5" />, aria: 'Align left' },
              { value: 'center', label: <AlignCenter className="size-5" />, aria: 'Align center' },
              { value: 'right', label: <AlignRight className="size-5" />, aria: 'Align right' },
            ]}
          />
        </Field>
        <button
          aria-pressed={layer.uppercase}
          aria-label="All caps"
          onClick={() => onPatch({ uppercase: !layer.uppercase }, true)}
          className={`grid h-[52px] w-14 place-items-center rounded-2xl transition ${
            layer.uppercase ? 'bg-pop-lime text-ink-950' : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
          }`}
        >
          <CaseUpper className="size-6" />
        </button>
      </div>

      <Field label="Text color">
        <Swatches label="Text color" value={layer.color} onBegin={onBegin} onPick={(c, commit) => onPatch({ color: c }, commit)} />
      </Field>

      <Field label="Outline" value={layer.strokeWidth === 0 ? 'Off' : `${Math.round(layer.strokeWidth * 100)}`}>
        <Slider label="Outline width" min={0} max={0.3} step={0.01} value={layer.strokeWidth} onBegin={onBegin} onChange={(v) => onPatch({ strokeWidth: v }, false)} />
        <div className="mt-2">
          <Swatches label="Outline color" value={layer.stroke} onBegin={onBegin} onPick={(c, commit) => onPatch({ stroke: c, strokeWidth: layer.strokeWidth || 0.12 }, commit)} />
        </div>
      </Field>

      <Field label="Box width" value={`${Math.round(layer.maxWidth * 100)}%`}>
        <Slider label="Text box width" min={0.2} max={1} step={0.01} value={layer.maxWidth} onBegin={onBegin} onChange={(v) => onPatch({ maxWidth: v }, false)} />
      </Field>

      {rotation}
      {actions}
    </div>
  )
}

/* -------------------------------- Stickers -------------------------------- */

const STICKERS: Record<string, string[]> = {
  Faces: ['😂', '🤣', '💀', '😭', '🥹', '😎', '🤡', '🤨', '😳', '🫠', '😤', '🥵', '🥶', '🤯', '😈', '🙄', '😬', '🤓', '🥴', '😏'],
  Reactions: ['🔥', '💯', '✨', '💥', '❤️', '💔', '👀', '🚨', '⚠️', '❌', '✅', '❓', '‼️', '💤', '💢', '🎉', '🏆', '📈', '📉', '🧠'],
  Hands: ['👍', '👎', '👏', '🙌', '🤌', '🫡', '🤝', '✌️', '🤞', '👉', '👈', '☝️', '💪', '🙏', '🫶', '🖕'],
  Things: ['🕶️', '👑', '🎩', '🧢', '🍕', '🍔', '☕', '🍿', '🎮', '💻', '📱', '💸', '💰', '🚀', '💣', '🗿', '🪦', '🧃'],
  Animals: ['🐸', '🐶', '🐱', '🙈', '🦆', '🐒', '🦄', '🐐', '🦖', '🐍', '🦀', '🐧', '🦍', '🐌'],
}

export function StickerPanel({ onAdd }: { onAdd: (emoji: string) => void }) {
  const cats = Object.keys(STICKERS)
  const [cat, setCat] = useState(cats[0])
  return (
    <div>
      <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition ${
              c === cat ? 'bg-white text-ink-950' : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-6">
        {STICKERS[cat].map((e, i) => (
          <button
            key={e}
            onClick={() => onAdd(e)}
            aria-label={`Add ${e} sticker`}
            className="grid aspect-square animate-pop place-items-center rounded-2xl bg-ink-900 text-3xl transition hover:scale-110 hover:bg-ink-700 active:scale-90"
            style={{ animationDelay: `${i * 12}ms` }}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- AI ------------------------------------- */

interface AIPanelProps {
  template: MemeTemplate | null
  isUpload: boolean
  onApply: (s: Suggestion) => void
}

export function AIPanel({ template, isUpload, onApply }: AIPanelProps) {
  const [vibe, setVibe] = useState<Vibe>('auto')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Suggestion[]>([])
  const req = useRef(0)

  const generate = async (v = vibe) => {
    const id = ++req.current
    setLoading(true)
    const res = await suggestCaptions(template, v)
    if (id !== req.current) return
    setItems(res)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pop-violet/30 via-pop-pink/20 to-transparent p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-2 font-display text-lg font-extrabold">
          <Sparkles className="size-5 text-pop-sun" /> AI Caption Studio
        </div>
        <p className="mt-1 text-sm text-ink-300">
          {isUpload ? 'Pick a vibe and we’ll cook up captions for your photo.' : `Pick a vibe for “${template?.name}”.`}
        </p>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {VIBES.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setVibe(v.id)
              generate(v.id)
            }}
            className={`h-10 shrink-0 rounded-full px-3.5 text-sm font-bold transition active:scale-95 ${
              v.id === vibe ? 'bg-white text-ink-950' : 'bg-ink-900 text-ink-300 hover:bg-ink-700'
            }`}
          >
            {v.emoji} {v.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => generate()}
        disabled={loading}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pop-violet to-pop-pink font-bold shadow-lg shadow-pop-violet/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? <RefreshCw className="size-5 animate-spin" /> : <Wand2 className="size-5" />}
        {loading ? (isUpload ? 'Reading the vibes…' : 'Thinking…') : items.length ? 'Generate more' : 'Generate captions'}
      </button>

      <div className="space-y-2">
        {loading &&
          Array.from({ length: 3 }, (_, i) => <div key={i} className="shimmer h-[76px] rounded-2xl" />)}
        {!loading &&
          items.map((s, i) => (
            <button
              key={s.lines.join('|')}
              onClick={() => onApply(s)}
              className="group block w-full animate-fade-up rounded-2xl border border-white/5 bg-ink-900 p-4 text-left transition hover:border-pop-lime/50 hover:bg-ink-800 active:scale-[0.98]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {s.lines.map((line, j) => (
                <span key={j} className="block whitespace-pre-line font-semibold leading-snug">
                  <span className="mr-1.5 text-xs font-bold text-ink-600">{j + 1}</span>
                  {line}
                </span>
              ))}
              <span className="mt-2 inline-block text-xs font-bold text-pop-lime opacity-70 transition group-hover:opacity-100">
                Tap to use →
              </span>
            </button>
          ))}
      </div>
      <p className="text-center text-xs text-ink-600">Suggestions are generated on-device — no data leaves your phone.</p>
    </div>
  )
}
