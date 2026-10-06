# MemeForge — AI Meme Studio

Turn anything into a meme. A mobile-first meme editor built with React, Vite, TypeScript, Tailwind CSS v4 and Lucide icons.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (exposed on your LAN for phone testing)
npm run build      # typecheck + production build to dist/
npm run typecheck
```

## Features

- Upload a photo (tap or drag & drop) or start from 9 built-in, procedurally drawn templates (no external images)
- Live canvas editor: top/bottom + unlimited text boxes, drag to move, corner handle to resize, centre snapping
- Text styling: 4 bundled meme fonts, size, alignment, colour, outline colour/width, caps, box width, rotation
- Emoji stickers, duplicate / bring to front / delete
- Undo, redo (Ctrl+Z / Ctrl+Shift+Z) and reset (itself undoable)
- Mock "AI" caption suggestions by vibe — fully local (`src/lib/captions.ts`, swap for a real API later)
- Export to JPEG, download, and Web Share API (falls back to download)
- Finished memes saved automatically to My Memes (IndexedDB, up to 60, on-device only)
- Browser/Android back button support with an unsaved-changes guard

## Structure

```
src/
  lib/        render (canvas), templates, captions, storage (IndexedDB), share, fonts
  hooks/      useHistory (undo/redo)
  editor/     MemeCanvas (preview + drag handles), Panels, ExportSheet
  screens/    Home, Create, Editor, Gallery
  components/ BottomNav, Sheet, Toast, Logo
```

## Installable PWA

MemeForge is an installable Progressive Web App (via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) + Workbox):

- Web app manifest (`MemeForge — AI Meme Studio`, short name `MemeForge`), dark theme `#09080d`, standalone display, home-screen shortcuts for **Create** and **My Memes**
- Service worker precaches the full app shell (JS, CSS, HTML, icons, fonts), so the app loads and works fully offline — templates and captions are local, memes save to IndexedDB
- Updates use a prompt ("New version available → Reload") so an update never reloads the page mid-edit
- Icons: `npm run icons` regenerates `public/` icons from `public/favicon.svg` (standard) and `scripts/icon-fullbleed.svg` (maskable + Apple touch)

The service worker only runs in production builds. To test installing/offline locally:

```bash
npm run build && npm run preview
```

Installing requires HTTPS (or `localhost`), so to install on a phone deploy `dist/` to any static host with HTTPS.
