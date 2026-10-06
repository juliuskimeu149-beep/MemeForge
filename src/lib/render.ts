import type { Layer, StickerLayer, TextLayer } from '../types'
import { EMOJI_FAMILY, FONTS } from './fonts'
import { fitSize } from './image'

export interface Box {
  w: number
  h: number
}

interface TextLayout extends Box {
  lines: string[]
  px: number
  lineH: number
}

let measureCtx: CanvasRenderingContext2D | null = null
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')!
  return measureCtx
}

const displayText = (l: TextLayer, usePlaceholder: boolean) => {
  const raw = l.text.trim() === '' && usePlaceholder ? (l.placeholder ?? 'Your text') : l.text
  return l.uppercase ? raw.toUpperCase() : raw
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      out.push('')
      continue
    }
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (ctx.measureText(candidate).width <= maxW || !line) {
        line = candidate
      } else {
        out.push(line)
        line = word
      }
      // Break words that are too long on their own.
      while (ctx.measureText(line).width > maxW && line.length > 1) {
        let cut = line.length - 1
        while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxW) cut--
        out.push(line.slice(0, cut))
        line = line.slice(cut)
      }
    }
    out.push(line)
  }
  return out
}

function layoutText(ctx: CanvasRenderingContext2D, l: TextLayer, W: number, usePlaceholder: boolean): TextLayout {
  const font = FONTS[l.font]
  const px = l.size * W
  ctx.font = `${font.weight} ${px}px ${font.family}`
  const lines = wrap(ctx, displayText(l, usePlaceholder), l.maxWidth * W)
  const lineH = px * font.lineHeight
  const pad = l.strokeWidth * px
  const textW = Math.max(px * 0.5, ...lines.map((ln) => ctx.measureText(ln).width))
  return { lines, px, lineH, w: textW + pad + px * 0.2, h: lines.length * lineH + pad }
}

/** Bounding box (unrotated, in canvas px) of a layer, used for editor hit areas. */
export function measureLayer(layer: Layer, W: number): Box {
  if (layer.kind === 'sticker') {
    const s = layer.size * W * 1.15
    return { w: s, h: s }
  }
  const { w, h } = layoutText(getMeasureCtx(), layer, W, true)
  return { w, h }
}

function drawText(ctx: CanvasRenderingContext2D, l: TextLayer, W: number, H: number) {
  if (l.text.trim() === '') return
  const t = layoutText(ctx, l, W, false)
  ctx.save()
  ctx.translate(l.x * W, l.y * H)
  ctx.rotate((l.rotation * Math.PI) / 180)
  ctx.textBaseline = 'middle'
  ctx.textAlign = l.align
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  const innerW = t.w - l.strokeWidth * t.px - t.px * 0.2
  const lx = l.align === 'left' ? -innerW / 2 : l.align === 'right' ? innerW / 2 : 0
  t.lines.forEach((line, i) => {
    const ly = -((t.lines.length - 1) * t.lineH) / 2 + i * t.lineH
    if (l.strokeWidth > 0) {
      ctx.strokeStyle = l.stroke
      ctx.lineWidth = l.strokeWidth * t.px
      ctx.strokeText(line, lx, ly)
    }
    ctx.fillStyle = l.color
    ctx.fillText(line, lx, ly)
  })
  ctx.restore()
}

function drawSticker(ctx: CanvasRenderingContext2D, s: StickerLayer, W: number, H: number) {
  const px = s.size * W
  ctx.save()
  ctx.translate(s.x * W, s.y * H)
  ctx.rotate((s.rotation * Math.PI) / 180)
  ctx.font = `${px}px ${EMOJI_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = px * 0.08
  ctx.shadowOffsetY = px * 0.03
  // Nudge down slightly: emoji glyphs sit high on the "middle" baseline.
  ctx.fillText(s.emoji, 0, px * 0.06)
  ctx.restore()
}

export function renderMeme(ctx: CanvasRenderingContext2D, image: CanvasImageSource, layers: Layer[], W: number, H: number) {
  ctx.clearRect(0, 0, W, H)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, W, H)
  for (const layer of layers) {
    if (layer.kind === 'text') drawText(ctx, layer, W, H)
    else drawSticker(ctx, layer, W, H)
  }
}

export async function exportMeme(
  image: HTMLImageElement,
  layers: Layer[],
  maxSide = 2048,
): Promise<{ blob: Blob; width: number; height: number }> {
  const { w, h } = fitSize(image.naturalWidth, image.naturalHeight, maxSide)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  renderMeme(canvas.getContext('2d')!, image, layers, w, h)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
  if (!blob) throw new Error('Export failed')
  return { blob, width: w, height: h }
}
