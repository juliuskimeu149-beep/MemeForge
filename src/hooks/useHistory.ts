import { useCallback, useState } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
  /** When set, the next transient update first snapshots `present` for undo. */
  pending: boolean
}

const LIMIT = 100

/**
 * Undo/redo state. `set(v)` commits a new undo step; `set(v, false)` is a
 * transient update (dragging, typing, sliding) that is grouped into the step
 * opened by the most recent `begin()`.
 */
export function useHistory<T>(initial: T) {
  const [s, setS] = useState<HistoryState<T>>({ past: [], present: initial, future: [], pending: false })

  const set = useCallback((update: T | ((prev: T) => T), commit = true) => {
    setS((h) => {
      const next = typeof update === 'function' ? (update as (prev: T) => T)(h.present) : update
      if (Object.is(next, h.present)) return h
      if (commit || h.pending) {
        return { past: [...h.past, h.present].slice(-LIMIT), present: next, future: [], pending: false }
      }
      return { ...h, present: next }
    })
  }, [])

  const begin = useCallback(() => setS((h) => (h.pending ? h : { ...h, pending: true })), [])

  const undo = useCallback(
    () =>
      setS((h) =>
        h.past.length === 0
          ? h
          : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], pending: false },
      ),
    [],
  )

  const redo = useCallback(
    () =>
      setS((h) =>
        h.future.length === 0
          ? h
          : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), pending: false },
      ),
    [],
  )

  return {
    value: s.present,
    set,
    begin,
    undo,
    redo,
    canUndo: s.past.length > 0,
    canRedo: s.future.length > 0,
  }
}
