// Renders the full-bleed maskable + Apple touch icons (Android/iOS apply their own masks).
// Run via `npm run icons`, after pwa-assets-generator has produced the transparent icons.
import sharp from 'sharp'

const src = new URL('./icon-fullbleed.svg', import.meta.url)
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const svg = await (await import('node:fs/promises')).readFile(src)

for (const [name, size] of [['maskable-icon-512x512.png', 512], ['apple-touch-icon-180x180.png', 180]]) {
  await sharp(svg, { density: 72 * (size / 64) }).resize(size, size).png().toFile(out(name))
  console.log('✔', name)
}
