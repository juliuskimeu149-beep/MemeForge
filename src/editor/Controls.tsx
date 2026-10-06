import type { ReactNode } from 'react'

export function Field({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-400">
        <span>{label}</span>
        {value !== undefined && <span className="tabular-nums text-ink-300">{value}</span>}
      </div>
      {children}
    </div>
  )
}

interface SliderProps {
  value: number
  min: number
  max: number
  step: number
  onBegin: () => void
  onChange: (v: number) => void
  label: string
}

export function Slider({ value, min, max, step, onBegin, onChange, label }: SliderProps) {
  const fill = `${((value - min) / (max - min)) * 100}%`
  return (
    <input
      type="range"
      aria-label={label}
      className="range"
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ ['--fill' as string]: fill }}
      onPointerDown={onBegin}
      onKeyDown={onBegin}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

export const COLORS = ['#ffffff', '#000000', '#ffc83d', '#ff3d7f', '#c6ff3d', '#3de0ff', '#8b5cff', '#ff8a3d']
const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'White',
  '#000000': 'Black',
  '#ffc83d': 'Yellow',
  '#ff3d7f': 'Pink',
  '#c6ff3d': 'Lime',
  '#3de0ff': 'Cyan',
  '#8b5cff': 'Purple',
  '#ff8a3d': 'Orange',
}

export function Swatches({ value, onPick, onBegin, label }: { value: string; onPick: (c: string, commit: boolean) => void; onBegin: () => void; label: string }) {
  const custom = !COLORS.includes(value.toLowerCase())
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label}>
      {COLORS.map((c) => {
        const active = value.toLowerCase() === c
        return (
          <button
            key={c}
            role="radio"
            aria-checked={active}
            aria-label={`${label}: ${COLOR_NAMES[c]}`}
            onClick={() => onPick(c, true)}
            className={`size-9 rounded-full border border-white/20 transition active:scale-90 ${
              active ? 'scale-110 ring-2 ring-pop-lime ring-offset-2 ring-offset-ink-850' : 'hover:scale-105'
            }`}
            style={{ background: c }}
          />
        )
      })}
      <label
        className={`relative size-9 cursor-pointer overflow-hidden rounded-full border border-white/20 ${
          custom ? 'ring-2 ring-pop-lime ring-offset-2 ring-offset-ink-850' : ''
        }`}
        style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
        title="Custom color"
      >
        <input
          type="color"
          aria-label={`Custom ${label.toLowerCase()}`}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          value={value}
          onClick={onBegin}
          onChange={(e) => onPick(e.target.value, false)}
        />
      </label>
    </div>
  )
}

interface SegOption<T extends string> {
  value: T
  label: ReactNode
  aria: string
}

export function Segmented<T extends string>({ options, value, onChange }: { options: SegOption<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-2xl bg-ink-900 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          aria-label={o.aria}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-bold transition ${
            o.value === value ? 'bg-white text-ink-950 shadow' : 'text-ink-300 hover:bg-white/5'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
