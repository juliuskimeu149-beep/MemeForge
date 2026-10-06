import { useSyncExternalStore } from 'react'
import type { SavedMeme } from '../types'
import { uid } from './id'

/*
 * Saved memes live in IndexedDB — local browser storage that handles image
 * blobs far better than localStorage's ~5MB string quota.
 */

const DB_NAME = 'memeforge'
const STORE = 'memes'
const MAX_MEMES = 60

type StoredMeme = Omit<SavedMeme, 'url'>

let dbPromise: Promise<IDBDatabase> | null = null
function db(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const d = await db()
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode)
    const req = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(req ? req.result : undefined)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  })
}

interface State {
  memes: SavedMeme[]
  loaded: boolean
  error: boolean
}

let state: State = { memes: [], loaded: false, error: false }
const listeners = new Set<() => void>()
const emit = (next: Partial<State>) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

const toView = (r: StoredMeme): SavedMeme => ({ ...r, url: URL.createObjectURL(r.blob) })

let started = false
function init() {
  if (started) return
  started = true
  tx<StoredMeme[]>('readonly', (s) => s.getAll())
    .then((rows = []) => emit({ memes: rows.sort((a, b) => b.createdAt - a.createdAt).map(toView), loaded: true }))
    .catch(() => emit({ loaded: true, error: true }))
}

function subscribe(cb: () => void) {
  init()
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useMemes(): State {
  return useSyncExternalStore(subscribe, () => state)
}

export async function saveMeme(blob: Blob, width: number, height: number, title: string): Promise<SavedMeme> {
  init()
  const rec: StoredMeme = { id: uid(), createdAt: Date.now(), title, width, height, blob }
  await tx('readwrite', (s) => s.put(rec))
  let memes = [toView(rec), ...state.memes]
  const overflow = memes.slice(MAX_MEMES)
  if (overflow.length) {
    memes = memes.slice(0, MAX_MEMES)
    await tx('readwrite', (s) => overflow.forEach((m) => s.delete(m.id)))
    overflow.forEach((m) => URL.revokeObjectURL(m.url))
  }
  emit({ memes })
  return memes[0]
}

export async function deleteMeme(id: string) {
  await tx('readwrite', (s) => s.delete(id))
  const gone = state.memes.find((m) => m.id === id)
  if (gone) URL.revokeObjectURL(gone.url)
  emit({ memes: state.memes.filter((m) => m.id !== id) })
}

export async function clearMemes() {
  await tx('readwrite', (s) => s.clear())
  state.memes.forEach((m) => URL.revokeObjectURL(m.url))
  emit({ memes: [] })
}
