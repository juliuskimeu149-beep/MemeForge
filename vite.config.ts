import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const THEME = '#09080d'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Ask before activating a new version so an update never reloads mid-edit.
      registerType: 'prompt',
      // Icons are already matched by workbox.globPatterns below.
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: 'MemeForge — AI Meme Studio',
        short_name: 'MemeForge',
        description: 'Turn anything into a meme. Upload a photo or pick a template, add captions and stickers, and share in seconds.',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: THEME,
        background_color: THEME,
        categories: ['entertainment', 'photo', 'social'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Create a meme',
            short_name: 'Create',
            url: '/?tab=create',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'My Memes',
            short_name: 'My Memes',
            url: '/?tab=gallery',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        // App shell: JS, CSS, HTML, icons and the woff2 meme/UI fonts (every
        // service-worker-capable browser supports woff2, so .woff is skipped).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  server: { host: true },
})
