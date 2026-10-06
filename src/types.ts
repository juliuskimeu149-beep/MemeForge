export type Align = 'left' | 'center' | 'right'
export type FontId = 'impact' | 'comic' | 'marker' | 'clean'

export interface TextLayer {
  id: string
  kind: 'text'
  text: string
  /** Placeholder shown in the editor (never exported) while text is empty. */
  placeholder?: string
  /** Center position, 0..1 relative to image width/height. */
  x: number
  y: number
  /** Font size as a fraction of image width. */
  size: number
  /** Max line width as a fraction of image width. */
  maxWidth: number
  align: Align
  color: string
  stroke: string
  /** Outline thickness as a fraction of the font size (0 = no outline). */
  strokeWidth: number
  font: FontId
  uppercase: boolean
  rotation: number
}

export interface StickerLayer {
  id: string
  kind: 'sticker'
  emoji: string
  x: number
  y: number
  /** Sticker size as a fraction of image width. */
  size: number
  rotation: number
}

export type Layer = TextLayer | StickerLayer

export interface MemeTemplate {
  id: string
  name: string
  emoji: string
  width: number
  height: number
  tags: string[]
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  layers: () => Layer[]
  /** Template-specific caption sets, one string per text layer (in order). */
  captions?: string[][]
}

export type EditorSource =
  | { kind: 'template'; templateId: string }
  | { kind: 'upload'; url: string; name: string }

export interface SavedMeme {
  id: string
  createdAt: number
  title: string
  width: number
  height: number
  blob: Blob
  url: string
}
