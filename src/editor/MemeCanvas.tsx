import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Maximize2, X } from 'lucide-react'
import type { Layer } from '../types'
import { measureLayer, renderMeme } from '../lib/render'
import { fitSize } from '../lib/image'
import { FONTS } from '../lib/fonts'

interface Props {
  image: HTMLImageElement
  layers: Layer[]
  selectedId: string | null
  fontsVersion: number
  onSelect: (id: string | null) => void
  /** Transient layer update (grouped into the current undo step). */
  onLive: (id: string, patch: Partial<Layer>) => void
  /** Opens a new undo step for the gesture that is about to happen. */
  onBegin: () => void
  onDelete: (id: string) => void
  onEditText: (id: string) => void
}

const PREVIEW_MAX = 1280
const SNAP = 0.018
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

type Gesture =
  | { type: 'move'; id: string; startX: number; startY: number; ox: number; oy: number; moved: boolean; rect: DOMRect }
  | { type: 'scale'; id: string; cx: number; cy: number; d0: number; size0: number }

export function MemeCanvas({ image, layers, selectedId, fontsVersion, onSelect, onLive, onBegin, onDelete, onEditText }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const [guides, setGuides] = useState({ v: false, h: false })

  const { w: W, h: H } = fitSize(image.naturalWidth, image.naturalHeight, PREVIEW_MAX)

  // Downscale the source once; redrawing a 12MP photo every drag frame is slow on phones.
  // (Export still renders from the full-resolution image.)
  const preview = useMemo(() => {
    if (image.naturalWidth <= W && image.naturalHeight <= H) return image
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, W, H)
    return c
  }, [image, W, H])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    renderMeme(canvas.getContext('2d')!, preview, layers, W, H)
  }, [preview, layers, W, H, fontsVersion])

  const boxes = useMemo(
    () => new Map(layers.map((l) => [l.id, measureLayer(l, W)])),
    // fontsVersion: re-measure once web fonts finish loading
    [layers, W, fontsVersion],
  )

  const onLayerDown = (e: ReactPointerEvent, layer: Layer) => {
    e.stopPropagation()
    if (e.button !== 0) return
    onSelect(layer.id)
    const rect = stageRef.current!.getBoundingClientRect()
    gesture.current = { type: 'move', id: layer.id, startX: e.clientX, startY: e.clientY, ox: layer.x, oy: layer.y, moved: false, rect }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onScaleDown = (e: ReactPointerEvent, layer: Layer) => {
    e.stopPropagation()
    const rect = stageRef.current!.getBoundingClientRect()
    const cx = rect.left + layer.x * rect.width
    const cy = rect.top + layer.y * rect.height
    gesture.current = { type: 'scale', id: layer.id, cx, cy, d0: Math.max(8, Math.hypot(e.clientX - cx, e.clientY - cy)), size0: layer.size }
    onBegin()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onMove = (e: ReactPointerEvent) => {
    const g = gesture.current
    if (!g) return
    if (g.type === 'scale') {
      const d = Math.hypot(e.clientX - g.cx, e.clientY - g.cy)
      onLive(g.id, { size: clamp((g.size0 * d) / g.d0, 0.02, 0.9) })
      return
    }
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (!g.moved) {
      if (Math.hypot(dx, dy) < 4) return
      g.moved = true
      onBegin()
    }
    let x = clamp(g.ox + dx / g.rect.width, 0, 1)
    let y = clamp(g.oy + dy / g.rect.height, 0, 1)
    const v = Math.abs(x - 0.5) < SNAP
    const h = Math.abs(y - 0.5) < SNAP
    if (v) x = 0.5
    if (h) y = 0.5
    setGuides((cur) => (cur.v === v && cur.h === h ? cur : { v, h }))
    onLive(g.id, { x, y })
  }

  const onUp = () => {
    gesture.current = null
    setGuides({ v: false, h: false })
  }

  return (
    <div
      ref={stageRef}
      className="relative mx-auto select-none rounded-3xl bg-ink-800 shadow-2xl shadow-black/60 ring-1 ring-white/10 [container-type:inline-size]"
      style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, calc(var(--stage-max-h, 56dvh) * ${W / H}))`, touchAction: 'none' }}
      onPointerDown={() => onSelect(null)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full rounded-3xl" aria-label="Meme preview" />

      {guides.v && <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-pop-cyan shadow-[0_0_8px] shadow-pop-cyan" />}
      {guides.h && <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-pop-cyan shadow-[0_0_8px] shadow-pop-cyan" />}

      {layers.map((layer) => {
        const box = boxes.get(layer.id)!
        const selected = layer.id === selectedId
        const empty = layer.kind === 'text' && layer.text.trim() === ''
        return (
          <div
            key={layer.id}
            role="button"
            tabIndex={0}
            aria-label={layer.kind === 'text' ? `Text: ${layer.text || layer.placeholder}` : `Sticker ${layer.emoji}`}
            className={`absolute cursor-grab rounded-lg before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 active:cursor-grabbing ${
              selected
                ? 'outline-2 outline-dashed outline-pop-lime'
                : empty
                  ? 'outline-2 outline-dashed outline-white/40 hover:outline-white/70'
                  : 'hover:outline-2 hover:outline-dashed hover:outline-white/50'
            }`}
            style={{
              left: `${layer.x * 100}%`,
              top: `${layer.y * 100}%`,
              width: `${(box.w / W) * 100}%`,
              height: `${(box.h / H) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
              touchAction: 'none',
            }}
            onPointerDown={(e) => onLayerDown(e, layer)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onDoubleClick={() => layer.kind === 'text' && onEditText(layer.id)}
            onKeyDown={(e) => {
              // Delete/Backspace is handled by the editor-wide shortcut listener.
              if (e.key === 'Enter') onSelect(layer.id)
            }}
          >
            {empty && layer.kind === 'text' && (
              <span
                className="pointer-events-none flex size-full items-center justify-center whitespace-pre-wrap text-center leading-none opacity-60"
                style={{
                  fontFamily: FONTS[layer.font].family,
                  fontWeight: FONTS[layer.font].weight,
                  fontSize: `${layer.size * 100}cqw`,
                  color: layer.color,
                  textTransform: layer.uppercase ? 'uppercase' : 'none',
                  WebkitTextStroke: layer.strokeWidth > 0 ? `${Math.max(1, layer.strokeWidth * 6)}px ${layer.stroke}` : undefined,
                  paintOrder: 'stroke fill',
                }}
              >
                {layer.placeholder}
              </span>
            )}
            {selected && (
              <>
                <button
                  aria-label="Delete layer"
                  className="absolute -left-3.5 -top-3.5 grid size-7 before:absolute before:-inset-2.5 place-items-center rounded-full bg-pop-pink text-white shadow-lg ring-2 ring-ink-950"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(layer.id)
                  }}
                >
                  <X className="size-4" strokeWidth={3} />
                </button>
                <div
                  aria-label="Resize"
                  className="absolute -bottom-3.5 -right-3.5 grid size-7 before:absolute before:-inset-2.5 cursor-nwse-resize place-items-center rounded-full bg-pop-lime text-ink-950 shadow-lg ring-2 ring-ink-950"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => onScaleDown(e, layer)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                >
                  <Maximize2 className="size-3.5 rotate-90" strokeWidth={3} />
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
