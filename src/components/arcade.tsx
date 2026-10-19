import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { OPENNESS } from '../lib/games'
import type { Openness, SourceDrop } from '../lib/schema'

// Building blocks for Game mode's arcade look. They sit on the normal tokens, so they match the rest of the app.

const ORDER: Openness[] = ['closed', 'look-alike', 'fans-rebuilt', 'code-out']

// "How open is it?" A 4-step meter, from 🔒 closed to 🔓 code is out.
export function OpenMeter({ openness, compact = false }: { openness: Openness; compact?: boolean }) {
  const o = OPENNESS[openness]
  if (compact)
    return (
      <span className="pixel inline-flex items-center gap-1 self-start bg-paper-2 px-2 py-0.5 font-pixel text-xs" data-testid="open-badge">
        {o.emoji} {o.label}
      </span>
    )
  return (
    <div data-testid="open-meter">
      <p className="label">How open is it? (← closed · open →)</p>
      <div className="grid grid-cols-4 gap-1" role="img" aria-label={`${o.label}: ${o.short}`}>
        {ORDER.map((id) => {
          const s = OPENNESS[id]
          const here = s.step === o.step
          return (
            <div
              key={id}
              aria-current={here ? 'true' : undefined}
              className={`pixel px-1 py-2 text-center font-pixel text-[11px] leading-tight sm:text-xs ${here ? 'bg-money text-paper' : 'bg-paper-2 text-ink-soft opacity-70'}`}
            >
              <span className="block text-base" aria-hidden>
                {s.emoji}
              </span>
              {s.label}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-sm font-semibold">{o.short}</p>
    </div>
  )
}

const LICENSE_KIND = {
  open: { emoji: '🔓', label: 'Truly open', cls: 'bg-money text-paper' },
  'public-domain': { emoji: '🎁', label: 'No rules (public domain)', cls: 'bg-hilite text-[#1b1915]' },
  'source-available': { emoji: '👀', label: 'Open with limits', cls: 'bg-rent-soft text-rent' },
}
export function LicenseBadge({ drop }: { drop: Pick<SourceDrop, 'license' | 'licenseKind'> }) {
  const k = LICENSE_KIND[drop.licenseKind]
  return (
    <span className={`pixel inline-flex items-center gap-1 px-2 py-0.5 font-pixel text-xs font-bold ${k.cls}`} data-testid="license-badge">
      {k.emoji} {k.label} · {drop.license}
    </span>
  )
}

// Level 1…N with an XP bar. Game mode's version of the step tracker.
export function QuestBar({ levels, done, onJump }: { levels: string[]; done: boolean[]; onJump?: (i: number) => void }) {
  const xp = done.filter(Boolean).length
  const current = Math.min(done.findIndex((d) => !d) === -1 ? levels.length : done.findIndex((d) => !d) + 1, levels.length)
  return (
    <div className="pop sticky top-[68px] z-20 mb-8 rounded-2xl bg-card px-4 py-3" data-testid="quest-bar">
      <div className="flex items-center justify-between gap-3 font-pixel text-sm font-bold">
        <span>
          LEVEL {current}/{levels.length}
        </span>
        <span className="text-money">
          XP {xp * 100}/{levels.length * 100}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper-2" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={levels.length} aria-label="Quest progress">
        <div className="h-full bg-money transition-all duration-500" style={{ width: `${(xp / levels.length) * 100}%` }} />
      </div>
      <ol className="mt-2 hidden gap-1 sm:flex">
        {levels.map((l, i) => (
          <li key={l} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onJump?.(i)}
              className={`w-full truncate rounded-md px-1 py-0.5 text-[11px] font-bold ${done[i] ? 'text-money' : i + 1 === current ? 'text-ink' : 'text-ink-soft'}`}
            >
              {done[i] ? '★' : '☆'} {l}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

// The big "▶ PRESS START" button.
export function PressStart({ to, children = 'PRESS START', className = '' }: { to: string; children?: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`btn-primary px-6 py-3 font-pixel text-base tracking-wide ${className}`}>
      <span className="animate-blink" aria-hidden>
        ▶
      </span>
      {children}
    </Link>
  )
}

// A section card titled like a game level.
export function LevelCard({ n, title, id, children, testId }: { n: number; title: string; id?: string; children: ReactNode; testId?: string }) {
  return (
    <section id={id} className="card scroll-mt-40 p-5 sm:p-6" data-testid={testId}>
      <h2 className="mb-4 flex items-center gap-3 font-display text-xl font-extrabold sm:text-2xl">
        <span className="pixel flex h-9 min-w-9 items-center justify-center bg-hilite px-2 font-pixel text-sm text-[#1b1915]">L{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}
