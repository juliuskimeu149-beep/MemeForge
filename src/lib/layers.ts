import type { Layer, StickerLayer, TextLayer } from '../types'
import { uid } from './id'

export const makeText = (p: Partial<TextLayer> = {}): TextLayer => ({
  id: uid(),
  kind: 'text',
  text: '',
  placeholder: 'Your text',
  x: 0.5,
  y: 0.5,
  size: 0.085,
  maxWidth: 0.92,
  align: 'center',
  color: '#ffffff',
  stroke: '#000000',
  strokeWidth: 0.14,
  font: 'impact',
  uppercase: true,
  rotation: 0,
  ...p,
})

export const makeSticker = (emoji: string, p: Partial<StickerLayer> = {}): StickerLayer => ({
  id: uid(),
  kind: 'sticker',
  emoji,
  x: 0.5,
  y: 0.5,
  size: 0.2,
  rotation: 0,
  ...p,
})

/** Classic top + bottom caption pair, positioned for the given aspect ratio. */
export function topBottom(aspect = 1): TextLayer[] {
  const edge = Math.min(0.12, 0.085 * aspect)
  return [
    makeText({ y: edge, placeholder: 'Top text' }),
    makeText({ y: 1 - edge, placeholder: 'Bottom text' }),
  ]
}

export const cloneLayer = (l: Layer): Layer => ({
  ...l,
  id: uid(),
  x: Math.min(0.95, l.x + 0.04),
  y: Math.min(0.95, l.y + 0.04),
})
