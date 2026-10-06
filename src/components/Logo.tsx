export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mf-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3d7f" />
          <stop offset=".55" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ffc83d" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#mf-g)" />
      <path d="M16 46V18h6l10 14 10-14h6v28h-7V30l-9 12-9-12v16z" fill="#0f0d15" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-2xl font-extrabold tracking-tight">
        Meme<span className="text-gradient">Forge</span>
      </span>
    </div>
  )
}
