import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const background = '#09080d'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0.05 },
    maskable: { ...minimal2023Preset.maskable, padding: 0.3, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, padding: 0.3, resizeOptions: { background } },
  },
  images: ['public/favicon.svg'],
})
