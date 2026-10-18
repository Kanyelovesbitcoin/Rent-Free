import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatMoney } from '../lib/savings'
import type { Alternative, Difficulty, Hosting } from '../lib/schema'

export const REPO_URL = 'https://github.com/kanyelovesbitcoin/rent-free'

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const Money = ({ value, className = '' }: { value: number; className?: string }) => <span className={`money ${className}`}>{formatMoney(value)}</span>

// Animates from the previous value to the new one. Snaps instantly with reduced motion.
export function CountUp({ value, className = '', duration = 900 }: { value: number; className?: string; duration?: number }) {
  const [shown, setShown] = useState(prefersReducedMotion() ? value : 0)
  const from = useRef(shown)
  useEffect(() => {
    if (prefersReducedMotion()) return setShown(value)
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = a + (value - a) * eased
      setShown(p === 1 ? value : Math.round(v))
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      from.current = value
    }
  }, [value, duration])
  return <Money value={shown} className={className} />
}

// Monogram tiles instead of logos (we don't use other companies' logos).
const TILE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#1b1915', '#78716c']
export function tileColor(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TILE_COLORS[h % TILE_COLORS.length]
}
export function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9+ ]/g, ' ').trim().split(/\s+/)
  return (words.length > 1 ? words[0][0] + words[1][0] : name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2)).toUpperCase()
}
export function ToolTile({ name, size = 44, className = '' }: { name: string; size?: number; className?: string }) {
  const bg = tileColor(name)
  const dark = ['#eab308', '#22c55e', '#14b8a6', '#06b6d4'].includes(bg)
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-ink font-display font-extrabold ${className}`}
      style={{ width: size, height: size, background: bg, color: dark ? '#1b1915' : '#fff', fontSize: size * 0.38, boxShadow: '2px 2px 0 0 var(--ink)' }}
    >
      {initials(name)}
    </span>
  )
}

// --- toasts ---
const ToastContext = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastContext)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null)
  const show = useCallback((text: string) => setMsg({ text, id: Date.now() }), [])
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2200)
    return () => clearTimeout(t)
  }, [msg])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
        {msg && (
          <div key={msg.id} className="pop animate-rise rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-paper" role="status">
            {msg.text}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard blocked (e.g. insecure context): fall back to a hidden textarea.
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

export function CopyButton({ text, label = 'Copy', toast = 'Copied!', className = 'btn-ghost' }: { text: string; label?: string; toast?: string; className?: string }) {
  const notify = useToast()
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await copyText(text)
        notify(toast)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

// --- badges ---
const DIFFICULTY: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: 'Easy', cls: 'bg-money-soft text-money-ink' },
  medium: { label: 'Medium', cls: 'bg-hilite/40 text-ink' },
  weekend: { label: 'Weekend project', cls: 'bg-rent-soft text-rent' },
}
export const HOSTING: Record<Hosting, { label: string; hint: string }> = {
  desktop: { label: 'Desktop app', hint: 'Install it on your computer. $0.' },
  browser: { label: 'Free web / free tier', hint: 'Use it in the browser on a free plan. $0.' },
  'self-host': { label: 'Self-hosted', hint: 'Runs on a small server you rent. One server can run all your self-hosted apps.' },
  'pay-as-you-go': { label: 'Pay as you go', hint: 'You only pay for what you use.' },
  partial: { label: 'Part-time', hint: 'Keep paying only some months of the year.' },
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}>{children}</span>
}
const neutral = 'bg-paper-2 text-ink-soft'
export const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => <Badge className={DIFFICULTY[difficulty].cls}>{DIFFICULTY[difficulty].label}</Badge>
export const HostingBadge = ({ hosting }: { hosting: Hosting }) => (
  <Badge className={neutral}>
    <span title={HOSTING[hosting].hint}>{HOSTING[hosting].label}</span>
  </Badge>
)
export const formatHours = (h: number) => (h < 1 ? `${Math.round(h * 60)} min` : `${h % 1 ? h.toFixed(1) : h} hr${h === 1 ? '' : 's'}`)
export function AltMeta({ alt }: { alt: Alternative }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DifficultyBadge difficulty={alt.difficulty} />
      <HostingBadge hosting={alt.hosting} />
      <Badge className={neutral}>~{formatHours(alt.setupHours)} setup</Badge>
    </div>
  )
}

// --- layout bits ---
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="mb-2 text-sm font-bold tracking-wide text-money uppercase">{eyebrow}</p>}
      <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-lg text-ink-soft">{children}</div>}
    </header>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-xl border-2 border-line bg-paper-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${value === o.value ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const STEPS = [
  { n: 1, label: 'Pick', to: '/start' },
  { n: 2, label: 'See savings', to: '/results' },
  { n: 3, label: 'Switch or remake', to: null },
]
export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-sm font-bold" aria-label="Progress">
      {STEPS.map((s, i) => {
        const state = s.n < current ? 'done' : s.n === current ? 'now' : 'next'
        const dot = (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
              state === 'now' ? 'border-ink bg-hilite text-ink' : state === 'done' ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft'
            }`}
          >
            {state === 'done' ? '✓' : s.n}
          </span>
        )
        return (
          <li key={s.n} className="flex items-center gap-2" aria-current={state === 'now' ? 'step' : undefined}>
            {s.to && state === 'done' ? (
              <Link to={s.to} className="flex items-center gap-2 hover:underline">
                {dot}
                <span className="hidden sm:inline">{s.label}</span>
              </Link>
            ) : (
              <>
                {dot}
                <span className={`${state === 'next' ? 'text-ink-soft' : ''} ${state === 'now' ? '' : 'hidden sm:inline'}`}>{s.label}</span>
              </>
            )}
            {i < STEPS.length - 1 && <span className="mx-1 h-0.5 w-6 bg-line sm:w-10" />}
          </li>
        )
      })}
    </ol>
  )
}
