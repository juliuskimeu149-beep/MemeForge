import { useEffect, useState } from 'react'
import { readyThumb, templateThumb, TEMPLATES } from '../lib/templates'

const yieldToBrowser = () => new Promise<void>((r) => setTimeout(r, 0))

/**
 * Template thumbnails, generated one at a time after first paint so the
 * screen renders immediately (cards show a shimmer until their image is ready).
 */
export function useTemplateThumbs(): Record<string, string | undefined> {
  const [thumbs, setThumbs] = useState(() => Object.fromEntries(TEMPLATES.map((t) => [t.id, readyThumb(t.id)])))

  useEffect(() => {
    let alive = true
    ;(async () => {
      for (const t of TEMPLATES) {
        if (readyThumb(t.id)) continue
        await yieldToBrowser()
        try {
          const url = await templateThumb(t)
          if (alive) setThumbs((s) => ({ ...s, [t.id]: url }))
        } catch {
          // Leave the shimmer; the template still opens in the editor.
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return thumbs
}
