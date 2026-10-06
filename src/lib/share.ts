export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function canShareFiles(): boolean {
  try {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false
    const probe = new File([new Blob(['x'], { type: 'image/jpeg' })], 'probe.jpg', { type: 'image/jpeg' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

export type ShareResult = 'shared' | 'cancelled' | 'unsupported' | 'failed'

export async function shareImage(blob: Blob, filename: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
  if (!canShareFiles() || !navigator.canShare({ files: [file] })) return 'unsupported'
  try {
    await navigator.share({ files: [file], title: 'Made with MemeForge', text: 'Made with MemeForge 🔥' })
    return 'shared'
  } catch (err) {
    return err instanceof DOMException && err.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}

export const memeFilename = () => `memeforge-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.jpg`
