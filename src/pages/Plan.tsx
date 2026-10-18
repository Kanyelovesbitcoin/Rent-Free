import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { verdict, timeWords, type VerdictId } from '../lib/effort'
import { buildIcs, downloadFile, type Reminder } from '../lib/ics'
import { resolveItem, toLines, type ResolvedItem } from '../lib/selection'
import { formatMoney, summarize } from '../lib/savings'
import { useSelection } from '../state'
import { VerdictLine } from '../components/ReplaceMeter'
import Plain from '../components/Plain'
import { CountUp, Money, PageHeader, Stepper, ToolTile, prefersReducedMotion, useToast } from '../components/ui'

const DONE_KEY = 'rent-free:plan-done:v1'
const ORDER: Record<VerdictId, number> = { 'do-it': 0, maybe: 1, keep: 2 }

function loadDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export default function Plan() {
  const { selection } = useSelection()
  const notify = useToast()
  const [done, setDone] = useState<string[]>(loadDone)
  useEffect(() => {
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify(done))
    } catch {
      // ignore
    }
  }, [done])

  const resolved = useMemo(() => selection.items.map(resolveItem).filter((r): r is ResolvedItem => r !== null), [selection.items])
  const summary = useMemo(() => summarize(toLines(resolved), selection.server), [resolved, selection.server])
  const savings = new Map(summary.lines.map((l) => [l.key, l.savingsYearly]))
  const steps = resolved
    .filter((r) => r.alternative && (savings.get(r.key) ?? 0) > 0)
    .map((r) => ({ r, v: verdict(r.alternative, savings.get(r.key) ?? 0) }))
    .sort((a, b) => ORDER[a.v.id] - ORDER[b.v.id] || (savings.get(b.r.key) ?? 0) - (savings.get(a.r.key) ?? 0))
  const keeping = resolved.filter((r) => !steps.some((s) => s.r.key === r.key))
  const doneSteps = steps.filter((s) => done.includes(s.r.key))
  const savedSoFar = doneSteps.reduce((t, s) => t + (savings.get(s.r.key) ?? 0), 0)
  const planned = steps.reduce((t, s) => t + (savings.get(s.r.key) ?? 0), 0)
  const pct = steps.length ? Math.round((doneSteps.length / steps.length) * 100) : 0

  const toggle = (key: string) => {
    const isDone = done.includes(key)
    const next = isDone ? done.filter((k) => k !== key) : [...done, key]
    setDone(next)
    if (!isDone) {
      notify(`Nice! +${formatMoney(savings.get(key) ?? 0)}/yr saved`)
      if (steps.every((s) => next.includes(s.r.key)) && !prefersReducedMotion()) confetti({ particleCount: 160, spread: 90, origin: { y: 0.3 } })
    }
  }

  const reminders = () => {
    const today = new Date()
    const events: Reminder[] = []
    steps
      .filter((s) => !done.includes(s.r.key))
      .forEach((s, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + 1 + i * 2) // one switch every other day, so it never feels like a lot
        events.push({
          title: `Switch ${s.r.name} → ${s.r.alternative!.name}`,
          description: `Rent-Free switch plan. Takes ${timeWords(s.r.alternative!.setupHours)}. Saves about ${formatMoney(savings.get(s.r.key) ?? 0)} a year. Steps: ${s.r.alternative!.setupSteps.join(' · ')}`,
          date,
        })
        if (s.r.alternative!.hosting === 'partial') {
          const rotate = new Date(date)
          rotate.setDate(rotate.getDate() + 30)
          events.push({ title: `Time to rotate: cancel ${s.r.name}?`, description: 'Done watching? Cancel it and switch to the next service on your list.', date: rotate })
        }
      })
    if (!events.length) return notify('Nothing left to remind you about. 🎉')
    downloadFile(buildIcs(events), 'rent-free-reminders.ics', 'text/calendar')
    notify('Reminders downloaded. Open the file to add them to your calendar')
  }

  if (!resolved.length) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-6xl">🗺️</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold">No plan yet</h1>
        <p className="mt-2 text-ink-soft">Pick the apps you pay for first. We'll turn them into an easy step-by-step plan.</p>
        <Link to="/start" className="btn-primary mt-6">
          Start: what do I pay for? →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="print:hidden">
        <Stepper current={3} />
      </div>
      <PageHeader title={<>Your <span className="hl">switch plan</span></>}>
        Easiest wins first. Do one switch at a time, tick it off, and watch your savings grow. Your progress is saved on this device.
      </PageHeader>

      <section className="pop mb-8 rounded-3xl bg-card p-6" data-testid="plan-progress">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold text-ink-soft">Saved so far</p>
            <p className="font-display text-5xl font-extrabold text-money" data-testid="saved-so-far">
              <CountUp value={savedSoFar} />
              <span className="text-xl">/yr</span>
            </p>
            <p className="text-sm text-ink-soft">
              of <Money value={planned} className="font-bold text-ink" /> a year in your plan
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" className="btn-ghost" onClick={reminders}>
              📅 Add reminders to my calendar
            </button>
            <button type="button" className="btn-ghost" onClick={() => window.print()}>
              🖨 Print
            </button>
          </div>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-ink bg-paper-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Plan progress">
          <div className="h-full bg-money transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm font-bold">
          {doneSteps.length} of {steps.length} switches done{pct === 100 && steps.length ? ' 🎉 You did it!' : ''}
        </p>
      </section>

      <ol className="space-y-4">
        {steps.map(({ r }, i) => {
          const isDone = done.includes(r.key)
          const alt = r.alternative!
          const isRotation = alt.hosting === 'partial' // a habit, not an app: nothing to open or move over
          return (
            <li key={r.key} className={`card p-5 transition ${isDone ? 'opacity-70' : ''}`} data-testid={`plan-${r.key}`}>
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-hilite font-display font-extrabold">{isDone ? '✓' : i + 1}</span>
                <span className="hidden sm:block">
                  <ToolTile name={r.name} size={40} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-display text-lg font-extrabold ${isDone ? 'line-through' : ''}`}>
                    {r.name} → {alt.name}
                  </p>
                  <p className="text-sm text-ink-soft">
                    ⏱ {timeWords(alt.setupHours)} · saves <Money value={savings.get(r.key) ?? 0} className="font-bold text-money" /> a year
                  </p>
                </div>
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-ink px-3 py-2 text-sm font-bold sm:w-auto print:hidden">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--money)]" checked={isDone} onChange={() => toggle(r.key)} aria-label={`Done: ${r.name}`} />
                  {isDone ? 'Done!' : 'Mark done'}
                </label>
              </div>
              {!isDone && (
                <>
                  <div className="mt-3">
                    <VerdictLine alt={alt} savings={savings.get(r.key) ?? 0} />
                  </div>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                    {!isRotation && <li>Save a copy of anything you need from {r.name} first.</li>}
                    {alt.setupSteps.map((s) => (
                      <li key={s}>
                        <Plain text={s} />
                      </li>
                    ))}
                    {!isRotation && <li>Use both for a few days. When you're happy, cancel {r.name}.</li>}
                  </ol>
                  <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                    {r.sub && (
                      <Link to={`/tool/${r.sub.id}`} className="btn-ghost px-3 py-1.5">
                        More details
                      </Link>
                    )}
                    {!isRotation && (
                      <a href={alt.website} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
                        Open {alt.name} ↗
                      </a>
                    )}
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ol>

      {keeping.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-extrabold">👍 Keeping these (for now)</h2>
          <p className="mt-1 text-sm text-ink-soft">No easy swap saves money here. You can always build your own version.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {keeping.map((r) => (
              <Link key={r.key} to={`/remake/${r.sub ? r.sub.id : r.key}`} className="card flex items-center gap-2 px-3 py-2 text-sm font-bold hover:border-ink">
                <ToolTile name={r.name} size={24} /> {r.name} · ✨ build your own
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-2 print:hidden">
        <Link to="/results" className="btn-ghost">
          ← Back to my savings
        </Link>
        <Link to="/remake" className="btn-dark">
          ✨ Build your own app next
        </Link>
      </div>
    </div>
  )
}
