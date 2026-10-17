import { useState, type ReactNode } from 'react'
import { formatMoney } from '../lib/savings'
import type { Alternative, Difficulty, Hosting } from '../lib/schema'

export const REPO_URL = 'https://github.com/kanyelovesbitcoin/rent-free'

export const Money = ({ value, className = '' }: { value: number; className?: string }) => (
  <span className={`tabular-nums ${className}`}>{formatMoney(value)}</span>
)

const DIFFICULTY: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: 'Easy', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' },
  weekend: { label: 'Weekend project', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' },
}

export const HOSTING: Record<Hosting, { label: string; hint: string }> = {
  desktop: { label: 'Desktop app', hint: 'Install it on your computer. $0.' },
  browser: { label: 'Free web / free tier', hint: 'Use it in the browser on a free plan. $0.' },
  'self-host': { label: 'Self-hosted', hint: 'Runs on a small server you rent. One server can run all your self-hosted apps.' },
  'pay-as-you-go': { label: 'Pay as you go', hint: 'You only pay for what you use.' },
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}

export const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => (
  <Badge className={DIFFICULTY[difficulty].cls}>{DIFFICULTY[difficulty].label}</Badge>
)

export const HostingBadge = ({ hosting }: { hosting: Hosting }) => (
  <Badge className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
    <span title={HOSTING[hosting].hint}>{HOSTING[hosting].label}</span>
  </Badge>
)

export function AltMeta({ alt }: { alt: Alternative }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DifficultyBadge difficulty={alt.difficulty} />
      <HostingBadge hosting={alt.hosting} />
      <Badge className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">~{formatHours(alt.setupHours)} setup</Badge>
    </div>
  )
}

export const formatHours = (h: number) => (h < 1 ? `${Math.round(h * 60)} min` : `${h % 1 ? h.toFixed(1) : h} hr${h === 1 ? '' : 's'}`)

export function CopyButton({ text, label = 'Copy', className = 'btn-ghost' }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
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
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">{children}</div>}
    </header>
  )
}
