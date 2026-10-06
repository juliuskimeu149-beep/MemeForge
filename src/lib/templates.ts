import type { MemeTemplate } from '../types'
import { EMOJI_FAMILY } from './fonts'
import { loadImage } from './image'
import { makeText, topBottom } from './layers'

/*
 * Built-in templates are drawn procedurally on a canvas, so the app works
 * offline with zero external images and every template is original artwork.
 */

type Ctx = CanvasRenderingContext2D

function linear(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stops: string[]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
  return g
}

function radial(ctx: Ctx, x: number, y: number, r: number, stops: string[]) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c))
  return g
}

function emoji(ctx: Ctx, e: string, x: number, y: number, size: number, rotate = 0) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.font = `${size}px ${EMOJI_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(e, 0, size * 0.06)
  ctx.restore()
}

function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  ctx.beginPath()
  // roundRect is missing on iOS < 16; square corners are an acceptable fallback.
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
  ctx.fillStyle = fill
  ctx.fill()
}

function stars(ctx: Ctx, x: number, y: number, w: number, h: number, n: number, seed: number) {
  let s = seed
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`
    ctx.beginPath()
    ctx.arc(x + rnd() * w, y + rnd() * h, 1 + rnd() * 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function bigButton(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = '#5b0f1c'
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.28, r * 1.05, r * 0.62, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = radial(ctx, x - r * 0.3, y - r * 0.3, r * 1.4, ['#ff6b7d', '#e3172f', '#9a0b1d'])
  ctx.beginPath()
  ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.beginPath()
  ctx.ellipse(x - r * 0.35, y - r * 0.22, r * 0.3, r * 0.12, -0.3, 0, Math.PI * 2)
  ctx.fill()
}

const dark = { color: '#111111', stroke: '#ffffff', strokeWidth: 0, font: 'clean' as const, uppercase: false }

export const TEMPLATES: MemeTemplate[] = [
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    emoji: '😰',
    width: 1000,
    height: 1100,
    tags: ['choice', 'dilemma'],
    draw(ctx, W, H) {
      ctx.fillStyle = linear(ctx, 0, 0, 0, H * 0.55, ['#2a3350', '#1a2036'])
      ctx.fillRect(0, 0, W, H * 0.55)
      rrect(ctx, W * 0.08, H * 0.08, W * 0.84, H * 0.4, 40, linear(ctx, 0, 0, 0, H * 0.5, ['#c9ced9', '#8d94a5']))
      bigButton(ctx, W * 0.3, H * 0.3, W * 0.15)
      bigButton(ctx, W * 0.7, H * 0.26, W * 0.15)
      ctx.fillStyle = linear(ctx, 0, H * 0.55, 0, H, ['#ffe9a8', '#ffc56b'])
      ctx.fillRect(0, H * 0.55, W, H * 0.45)
      emoji(ctx, '😰', W * 0.5, H * 0.77, W * 0.36)
      emoji(ctx, '💦', W * 0.7, H * 0.66, W * 0.1, 15)
      emoji(ctx, '✋', W * 0.24, H * 0.86, W * 0.14, -20)
    },
    layers: () => [
      makeText({ ...dark, x: 0.3, y: 0.13, size: 0.05, maxWidth: 0.34, rotation: -6, placeholder: 'Option A' }),
      makeText({ ...dark, x: 0.7, y: 0.11, size: 0.05, maxWidth: 0.34, rotation: -6, placeholder: 'Option B' }),
      makeText({ y: 0.94, size: 0.075, placeholder: 'Me' }),
    ],
    captions: [
      ['Go to bed early', 'Watch one more episode', 'Me at 2am'],
      ['Save money', 'Buy the thing anyway', 'My bank account'],
      ['Fix the bug', 'Rename the variable', 'Senior dev'],
      ['Reply to texts', 'Overthink the reply for 3 days', 'Me'],
    ],
  },
  {
    id: 'nah-yeah',
    name: 'Nah / Yeah',
    emoji: '🙅',
    width: 1000,
    height: 1000,
    tags: ['preference', 'compare'],
    draw(ctx, W, H) {
      ctx.fillStyle = linear(ctx, 0, 0, W * 0.5, H * 0.5, ['#ff8a3d', '#ff3d7f'])
      ctx.fillRect(0, 0, W * 0.5, H * 0.5)
      ctx.fillStyle = linear(ctx, 0, H * 0.5, W * 0.5, H, ['#ffe14d', '#c6ff3d'])
      ctx.fillRect(0, H * 0.5, W * 0.5, H * 0.5)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(W * 0.5, 0, W * 0.5, H)
      ctx.fillStyle = '#e9e6f2'
      ctx.fillRect(W * 0.5, H * 0.5 - 3, W * 0.5, 6)
      emoji(ctx, '🙅', W * 0.25, H * 0.26, W * 0.3)
      emoji(ctx, '😎', W * 0.22, H * 0.76, W * 0.26)
      emoji(ctx, '👉', W * 0.41, H * 0.8, W * 0.13)
    },
    layers: () => [
      makeText({ ...dark, x: 0.75, y: 0.25, size: 0.06, maxWidth: 0.44, placeholder: 'The boring thing' }),
      makeText({ ...dark, x: 0.75, y: 0.75, size: 0.06, maxWidth: 0.44, placeholder: 'The better thing' }),
    ],
    captions: [
      ['Doing the work', 'Making a to-do list about the work'],
      ['Reading the docs', 'Asking in the group chat'],
      ['Going outside', 'Watching videos of people going outside'],
      ['A balanced breakfast', 'Cold pizza at 11am'],
    ],
  },
  {
    id: 'galaxy-brain',
    name: 'Galaxy Brain',
    emoji: '🧠',
    width: 1000,
    height: 1200,
    tags: ['escalation', 'smart'],
    draw(ctx, W, H) {
      const rowH = H / 4
      const panels = [
        ['#3b3b44', '#55555f'],
        ['#1d3a7a', '#3e6bd6'],
        ['#4a1a8a', '#b34dff'],
        ['#05010f', '#2b0b5a'],
      ]
      for (let i = 0; i < 4; i++) {
        const y = i * rowH
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, y, W / 2, rowH)
        ctx.fillStyle = linear(ctx, W / 2, y, W, y + rowH, panels[i])
        ctx.fillRect(W / 2, y, W / 2, rowH)
        if (i >= 2) stars(ctx, W / 2, y, W / 2, rowH, 30 + i * 30, 7 + i)
        if (i >= 1) {
          ctx.fillStyle = radial(ctx, W * 0.75, y + rowH / 2, rowH * (0.3 + i * 0.15), [
            `rgba(255,255,255,${0.15 + i * 0.2})`,
            'rgba(140,90,255,0.25)',
            'rgba(0,0,0,0)',
          ])
          ctx.fillRect(W / 2, y, W / 2, rowH)
        }
        emoji(ctx, '🧠', W * 0.75, y + rowH / 2, rowH * (0.5 + i * 0.07))
        if (i === 3) {
          emoji(ctx, '✨', W * 0.6, y + rowH * 0.25, rowH * 0.18)
          emoji(ctx, '🌌', W * 0.9, y + rowH * 0.78, rowH * 0.2)
        }
        ctx.fillStyle = '#d9d5e6'
        ctx.fillRect(0, y + rowH - 3, W, 6)
      }
    },
    layers: () =>
      ['Small idea', 'Bigger idea', 'Enlightened', 'Ascended'].map((p, i) =>
        makeText({ ...dark, x: 0.25, y: 0.125 + i * 0.25, size: 0.052, maxWidth: 0.44, placeholder: p }),
      ),
    captions: [
      ['Setting an alarm', 'Setting 3 alarms', 'Sleeping in your clothes', 'Never sleeping'],
      ['Using a password', 'Using a strong password', 'Using a password manager', 'Forgetting the manager password'],
      ['Saying "lol"', 'Saying "lmao"', 'Sending a skull emoji', 'Just sending "💀" to everything'],
      ['Studying', 'Making flashcards', 'Color-coding flashcards', 'Buying new pens instead'],
    ],
  },
  {
    id: 'stonks',
    name: 'Stonks',
    emoji: '📈',
    width: 1000,
    height: 800,
    tags: ['money', 'win'],
    draw(ctx, W, H) {
      ctx.fillStyle = linear(ctx, 0, 0, W, H, ['#06142e', '#0b3b8c', '#1252c9'])
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(120,180,255,0.18)'
      ctx.lineWidth = 2
      for (let x = 0; x <= W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y <= H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      const pts: [number, number][] = [[0.05, 0.85], [0.2, 0.72], [0.3, 0.78], [0.45, 0.55], [0.55, 0.62], [0.7, 0.38], [0.8, 0.44], [0.95, 0.15]]
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.shadowColor = '#3dff8f'
      ctx.shadowBlur = 30
      ctx.strokeStyle = '#3dff8f'
      ctx.lineWidth = 16
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)))
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#3dff8f'
      ctx.beginPath()
      ctx.moveTo(W * 0.985, H * 0.08)
      ctx.lineTo(W * 0.9, H * 0.12)
      ctx.lineTo(W * 0.965, H * 0.24)
      ctx.closePath()
      ctx.fill()
      emoji(ctx, '🕴️', W * 0.22, H * 0.58, H * 0.5)
      emoji(ctx, '💸', W * 0.82, H * 0.72, H * 0.16, -12)
    },
    layers: () => topBottom(1000 / 800),
    captions: [
      ['Bought one share', 'Financial genius'],
      ['Skipped breakfast', 'Saved $4 (stonks)'],
      ['Sold my old hoodie', 'Hedge fund manager now'],
    ],
  },
  {
    id: 'this-is-fine',
    name: 'Totally Fine',
    emoji: '🔥',
    width: 1000,
    height: 760,
    tags: ['chaos', 'denial'],
    draw(ctx, W, H) {
      ctx.fillStyle = linear(ctx, 0, 0, 0, H, ['#ff9a3c', '#ffcf6e', '#f2a541'])
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(60,20,0,0.35)'
      ctx.fillRect(0, 0, W, H * 0.22)
      ctx.fillStyle = '#8a4b1c'
      ctx.fillRect(0, H * 0.78, W, H * 0.22)
      ctx.fillStyle = '#6b3410'
      ctx.fillRect(W * 0.35, H * 0.66, W * 0.42, H * 0.04)
      ctx.fillRect(W * 0.38, H * 0.7, W * 0.03, H * 0.15)
      ctx.fillRect(W * 0.71, H * 0.7, W * 0.03, H * 0.15)
      for (let i = 0; i < 8; i++) emoji(ctx, '🔥', W * (0.06 + i * 0.125), H * 0.14, H * 0.2, (i % 2) * 10 - 5)
      emoji(ctx, '🔥', W * 0.1, H * 0.62, H * 0.32)
      emoji(ctx, '🔥', W * 0.9, H * 0.64, H * 0.36)
      emoji(ctx, '🐶', W * 0.52, H * 0.5, H * 0.34)
      emoji(ctx, '☕', W * 0.66, H * 0.6, H * 0.12)
      emoji(ctx, '🎩', W * 0.52, H * 0.29, H * 0.14)
    },
    layers: () => [...topBottom(1000 / 760)],
    captions: [
      ['My inbox: 4,382 unread', 'This is fine'],
      ['Deadline was yesterday', 'Me, starting now:'],
      ['Group project day before due', 'Everything is under control'],
    ],
  },
  {
    id: 'side-eye',
    name: 'The Side Eye',
    emoji: '🤨',
    width: 1000,
    height: 1000,
    tags: ['suspicious', 'reaction'],
    draw(ctx, W, H) {
      ctx.fillStyle = radial(ctx, W * 0.5, H * 0.5, W * 0.75, ['#ff6fb1', '#8b5cff', '#1a0b3d'])
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 40
      for (let r = 120; r < W; r += 120) {
        ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.stroke()
      }
      emoji(ctx, '🤨', W * 0.5, H * 0.52, W * 0.52)
      emoji(ctx, '👀', W * 0.82, H * 0.24, W * 0.13, 12)
    },
    layers: () => topBottom(1),
    captions: [
      ['When someone says', '"I don\'t really use my phone much"'],
      ['Me when the "quick call"', 'hits minute 47'],
      ['The teacher when you say', 'my dog ate my homework'],
    ],
  },
  {
    id: 'judge-cat',
    name: 'Judge Cat',
    emoji: '😾',
    width: 1000,
    height: 1000,
    tags: ['judging', 'reaction'],
    draw(ctx, W, H) {
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 ? '#6e3b1f' : '#7d4526'
        ctx.fillRect((i * W) / 10, 0, W / 10, H)
      }
      ctx.fillStyle = linear(ctx, 0, H * 0.7, 0, H, ['#4a240f', '#2b1206'])
      ctx.fillRect(0, H * 0.7, W, H * 0.3)
      ctx.fillStyle = '#c9963b'
      ctx.fillRect(0, H * 0.7, W, H * 0.025)
      emoji(ctx, '⚖️', W * 0.5, H * 0.18, W * 0.17)
      emoji(ctx, '😾', W * 0.5, H * 0.52, W * 0.42)
      emoji(ctx, '🔨', W * 0.8, H * 0.74, W * 0.17, -30)
    },
    layers: () => topBottom(1),
    captions: [
      ['You put pineapple', 'on WHAT?'],
      ['Guilty of', 'replying "k"'],
      ['The court finds you', 'chronically online'],
    ],
  },
  {
    id: 'expectation-reality',
    name: 'Expectation vs Reality',
    emoji: '✨',
    width: 1000,
    height: 1000,
    tags: ['compare', 'fail'],
    draw(ctx, W, H) {
      ctx.fillStyle = linear(ctx, 0, 0, W / 2, H, ['#ff9ad5', '#ffd36e', '#5ee7ff'])
      ctx.fillRect(0, 0, W / 2, H)
      ctx.fillStyle = linear(ctx, W / 2, 0, W, H, ['#5d6470', '#3a3f48'])
      ctx.fillRect(W / 2, 0, W / 2, H)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(W / 2 - 4, 0, 8, H)
      emoji(ctx, '🏝️', W * 0.25, H * 0.56, W * 0.3)
      emoji(ctx, '✨', W * 0.12, H * 0.32, W * 0.08)
      emoji(ctx, '🌈', W * 0.38, H * 0.82, W * 0.1)
      emoji(ctx, '🌧️', W * 0.75, H * 0.34, W * 0.16)
      emoji(ctx, '🏚️', W * 0.75, H * 0.6, W * 0.26)
      emoji(ctx, '🫠', W * 0.88, H * 0.84, W * 0.1)
    },
    layers: () => [
      makeText({ x: 0.25, y: 0.09, size: 0.06, maxWidth: 0.46, text: 'Expectation' }),
      makeText({ x: 0.75, y: 0.09, size: 0.06, maxWidth: 0.46, text: 'Reality' }),
      makeText({ y: 0.94, size: 0.065, placeholder: 'Caption' }),
    ],
    captions: [
      ['Expectation', 'Reality', 'My weekend plans'],
      ['Pinterest', 'My attempt', 'DIY birthday cake'],
      ['The trailer', 'The movie', 'Every sequel ever'],
    ],
  },
  {
    id: 'blank-night',
    name: 'Blank Canvas',
    emoji: '🖤',
    width: 1000,
    height: 1000,
    tags: ['text', 'blank'],
    draw(ctx, W, H) {
      ctx.fillStyle = linear(ctx, 0, 0, W, H, ['#1c1430', '#0b0a10', '#2a0e24'])
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = radial(ctx, W * 0.2, H * 0.15, W * 0.6, ['rgba(255,61,127,0.35)', 'rgba(0,0,0,0)'])
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = radial(ctx, W * 0.85, H * 0.9, W * 0.6, ['rgba(139,92,255,0.35)', 'rgba(0,0,0,0)'])
      ctx.fillRect(0, 0, W, H)
    },
    layers: () => [makeText({ y: 0.5, size: 0.1, maxWidth: 0.86, placeholder: 'Say something bold' })],
    captions: [
      ['Nobody:\n\nAbsolutely nobody:\n\nMe at 3am: one more snack'],
      ['I\'m not lazy\nI\'m in energy-saving mode'],
      ['Me: I\'ll just check my phone for a sec\n\n*4 hours later*'],
    ],
  },
]

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id)

const THUMB_MAX = 512
const fullCache = new Map<string, Promise<string>>()
const thumbCache = new Map<string, Promise<string>>()
const thumbReady = new Map<string, string>()

/**
 * Renders a template to a JPEG object URL. Encoding uses the async toBlob so
 * it never blocks a frame the way a synchronous toDataURL does.
 */
function renderTemplate(t: MemeTemplate, maxSide: number): Promise<string> {
  try {
    return drawTemplate(t, maxSide)
  } catch (err) {
    return Promise.reject(err)
  }
}

function drawTemplate(t: MemeTemplate, maxSide: number): Promise<string> {
  const scale = Math.min(1, maxSide / Math.max(t.width, t.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(t.width * scale)
  canvas.height = Math.round(t.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  t.draw(ctx, t.width, t.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(URL.createObjectURL(b)) : reject(new Error('Template render failed'))), 'image/jpeg', 0.9),
  )
}

function cached(cache: Map<string, Promise<string>>, t: MemeTemplate, maxSide: number): Promise<string> {
  let p = cache.get(t.id)
  if (!p) {
    p = renderTemplate(t, maxSide)
    p.catch(() => cache.delete(t.id))
    cache.set(t.id, p)
  }
  return p
}

/** Full-resolution template image for the editor. */
export const templateImage = (t: MemeTemplate) => cached(fullCache, t, Infinity).then(loadImage)

/** Small card thumbnail URL (cached). */
export const templateThumb = (t: MemeTemplate) =>
  cached(thumbCache, t, THUMB_MAX).then((url) => {
    thumbReady.set(t.id, url)
    return url
  })

/** Thumbnail URL if it has already been generated, for instant re-renders. */
export const readyThumb = (id: string) => thumbReady.get(id)
