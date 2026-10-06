import '@fontsource/anton/400.css'
import '@fontsource/bangers/400.css'
import '@fontsource/permanent-marker/400.css'
import type { FontId } from '../types'

export interface FontDef {
  id: FontId
  label: string
  family: string
  weight: number
  lineHeight: number
}

export const FONTS: Record<FontId, FontDef> = {
  impact: { id: 'impact', label: 'Classic', family: '"Anton", Impact, "Arial Narrow Bold", sans-serif', weight: 400, lineHeight: 1.12 },
  comic: { id: 'comic', label: 'Comic', family: '"Bangers", "Comic Sans MS", cursive', weight: 400, lineHeight: 1.08 },
  marker: { id: 'marker', label: 'Marker', family: '"Permanent Marker", "Comic Sans MS", cursive', weight: 400, lineHeight: 1.2 },
  clean: { id: 'clean', label: 'Bold', family: '"Inter Variable", Arial, sans-serif', weight: 900, lineHeight: 1.15 },
}

export const FONT_LIST = Object.values(FONTS)

export const EMOJI_FAMILY = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif'

/** Resolves once every meme font is ready to be drawn on a canvas. */
export const fontsReady: Promise<void> =
  typeof document === 'undefined' || !document.fonts
    ? Promise.resolve()
    : Promise.all(FONT_LIST.map((f) => document.fonts.load(`${f.weight} 48px ${f.family}`, 'MEMEforge')))
        .then(() => undefined)
        .catch(() => undefined)
