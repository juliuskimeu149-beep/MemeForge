import { useCallback, useEffect, useRef, useState } from 'react'
import type { EditorSource } from './types'
import { BottomNav, type Tab } from './components/BottomNav'
import { useToast } from './components/Toast'
import { PwaPrompt } from './components/PwaPrompt'
import { HomeScreen } from './screens/HomeScreen'
import { CreateScreen } from './screens/CreateScreen'
import { GalleryScreen } from './screens/GalleryScreen'
import { EditorScreen } from './screens/EditorScreen'
import { useMemes } from './lib/storage'
import { MAX_UPLOAD_BYTES } from './lib/image'

/** Initial tab from `?tab=` (used by the installed app's home-screen shortcuts). */
function initialTab(): Tab {
  const params = new URLSearchParams(window.location.search)
  const t = params.get('tab')
  if (t) window.history.replaceState(window.history.state, '', window.location.pathname)
  return t === 'create' || t === 'gallery' ? t : 'home'
}

export default function App() {
  const toast = useToast()
  const { memes, loaded, error } = useMemes()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [source, setSource] = useState<EditorSource | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const leaveGuard = useRef<(() => boolean) | null>(null)
  const closing = useRef(false)

  const goTab = useCallback((t: Tab) => {
    setTab(t)
    window.scrollTo({ top: 0 })
  }, [])

  const openEditor = useCallback((s: EditorSource) => {
    window.history.pushState({ editor: true }, '')
    setSource(s)
    window.scrollTo({ top: 0 })
  }, [])

  const finishClose = useCallback(() => {
    setSource((s) => {
      if (s?.kind === 'upload') URL.revokeObjectURL(s.url)
      return null
    })
    window.scrollTo({ top: 0 })
  }, [])

  /** Close the editor from the UI (already confirmed by the editor itself). */
  const closeEditor = useCallback(
    (then?: Tab) => {
      if (then) setTab(then)
      if (window.history.state?.editor) {
        closing.current = true
        window.history.back()
      } else finishClose()
    },
    [finishClose],
  )

  // Hardware / browser back button support for the full-screen editor.
  useEffect(() => {
    const onPop = () => {
      if (!source) return
      if (closing.current) {
        closing.current = false
        finishClose()
        return
      }
      if (leaveGuard.current && !leaveGuard.current()) {
        window.history.pushState({ editor: true }, '')
        return
      }
      finishClose()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [source, finishClose])

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return toast('That’s not an image file', 'error')
      if (file.size > MAX_UPLOAD_BYTES) return toast('Image is too large (max 30MB)', 'error')
      openEditor({ kind: 'upload', url: URL.createObjectURL(file), name: file.name })
    },
    [openEditor, toast],
  )

  const pickFile = () => fileInput.current?.click()
  const registerLeaveGuard = useCallback((g: (() => boolean) | null) => {
    leaveGuard.current = g
  }, [])

  return (
    <>
      <PwaPrompt />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) handleFile(f)
        }}
      />

      {source ? (
        <EditorScreen
          key={source.kind === 'upload' ? source.url : source.templateId}
          source={source}
          registerLeaveGuard={registerLeaveGuard}
          onClose={() => closeEditor()}
          onGallery={() => closeEditor('gallery')}
          onNew={() => closeEditor('create')}
        />
      ) : (
        <>
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_40%_at_10%_0%,rgb(255_61_127/0.12),transparent),radial-gradient(50%_40%_at_100%_10%,rgb(139_92_255/0.12),transparent)]" />
          <main key={tab} className="animate-fade-in pb-36">
            {tab === 'home' && (
              <HomeScreen
                memes={memes}
                onCreate={() => goTab('create')}
                onUpload={pickFile}
                onTemplate={(id) => openEditor({ kind: 'template', templateId: id })}
                onGallery={() => goTab('gallery')}
              />
            )}
            {tab === 'create' && (
              <CreateScreen onUpload={pickFile} onFile={handleFile} onTemplate={(id) => openEditor({ kind: 'template', templateId: id })} />
            )}
            {tab === 'gallery' && <GalleryScreen memes={memes} loaded={loaded} error={error} onCreate={() => goTab('create')} />}
          </main>
          <BottomNav tab={tab} onChange={goTab} memeCount={memes.length} />
        </>
      )}
    </>
  )
}
