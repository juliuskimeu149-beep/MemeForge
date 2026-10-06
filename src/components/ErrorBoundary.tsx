import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  failed: boolean
}

/** Last-resort fallback so an unexpected crash never leaves a blank screen (installed PWAs have no reload button). */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('MemeForge crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="text-6xl">🫠</p>
          <h1 className="mt-4 font-display text-2xl font-extrabold">Something went wrong</h1>
          <p className="mx-auto mt-2 max-w-xs text-ink-400">Your saved memes are safe. Reload to get back to forging.</p>
          <button
            onClick={() => window.location.assign('/')}
            className="mt-6 h-14 rounded-2xl bg-pop-lime px-6 text-lg font-extrabold text-ink-950 transition active:scale-95"
          >
            Reload MemeForge
          </button>
        </div>
      </div>
    )
  }
}
