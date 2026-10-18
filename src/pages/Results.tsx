import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { encodeSelection, resolveItem, toLines, type ResolvedItem } from '../lib/selection'
import { effectiveBilling, formatMoney, summarize } from '../lib/savings'
import { useSelection, useSharedSelection } from '../state'
import SavingsCard, { downloadNodeAsPng } from '../components/SavingsCard'
import { AltMeta, CopyButton, CountUp, Money, Stepper, ToolTile, formatHours, prefersReducedMotion, useToast } from '../components/ui'
import { VerdictLine } from '../components/ReplaceMeter'
import Plain from '../components/Plain'
import { verdict } from '../lib/effort'

export default function Results() {
  const [params] = useSearchParams()
  const shared = useSharedSelection(params.get('s'))
  const { selection, upsertItem, setServer } = useSelection()
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const notify = useToast()

  const resolved = useMemo(() => selection.items.map(resolveItem).filter((r): r is ResolvedItem => r !== null), [selection.items])
  const summary = useMemo(() => summarize(toLines(resolved), selection.server), [resolved, selection.server])
  const savingsByKey = new Map(summary.lines.map((l) => [l.key, l.savingsYearly]))
  // Sorted by what you pay now, so rows don't jump around while you change alternatives.
  const rows = [...resolved].sort((a, b) => b.currentYearly - a.currentYearly)
  const quickWins = resolved
    .filter((r) => verdict(r.alternative, savingsByKey.get(r.key) ?? 0).id === 'do-it')
    .sort((a, b) => (savingsByKey.get(b.key) ?? 0) - (savingsByKey.get(a.key) ?? 0))
    .slice(0, 3)
  const shareUrl = `${window.location.origin}${window.location.pathname}#/results?s=${encodeSelection(selection)}`

  // A little celebration the first time someone sees their savings this session.
  useEffect(() => {
    if (summary.savingsYearly <= 0 || prefersReducedMotion()) return
    try {
      if (sessionStorage.getItem('rent-free:confetti')) return
      sessionStorage.setItem('rent-free:confetti', '1')
    } catch {
      // storage blocked: celebrate anyway
    }
    const t = setTimeout(() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.35 }, colors: ['#059669', '#fde047', '#e11d48', '#1b1915'], disableForReducedMotion: true }), 500)
    return () => clearTimeout(t)
  }, [summary.savingsYearly])

  if (!resolved.length) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-6xl">🧾</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold">Your receipt is empty</h1>
        <p className="mt-2 text-ink-soft">Pick the tools you pay for and we'll show you what you could keep.</p>
        <Link to="/start" className="btn-primary mt-6">
          Start the calculator →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Stepper current={2} />
      {shared && (
        <p className="mb-6 rounded-xl border-2 border-ink bg-hilite/30 px-4 py-3 text-sm">
          You're viewing a shared result. Change anything below, or{' '}
          <Link to="/start" className="font-bold underline">
            pick your own tools
          </Link>
          .
        </p>
      )}

      {/* the big number */}
      <section className="pop rounded-3xl bg-card p-6 sm:p-8">
        <p className="font-bold text-ink-soft">You could keep</p>
        <p className="font-display text-6xl leading-none font-extrabold text-money sm:text-8xl" data-testid="stat-keep">
          <CountUp value={summary.savingsYearly} />
          <span className="text-2xl sm:text-3xl">/yr</span>
        </p>
        <p className="mt-2 text-ink-soft">
          That's about <strong className="money text-ink">{formatMoney(summary.savingsYearly / 12)}</strong> every month, back in your pocket. Below, we show how hard each switch is.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MiniStat label="You pay now" value={summary.currentYearly} cls="text-rent line-through decoration-2" testId="stat-pay" />
          <MiniStat label="After switching" value={summary.rentFreeYearly} cls="text-ink" testId="stat-route" sub={summary.needsServer ? `includes a ${formatMoney(summary.serverYearly)}/yr server` : 'no server needed'} />
          <div className="rounded-2xl border-2 border-line p-4">
            <p className="label">Setup time</p>
            <p className="font-display text-3xl font-extrabold">~{formatHours(summary.setupHours)}</p>
            <p className="text-xs text-ink-soft">to make all the switches</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link to="/plan" className="btn-primary px-5 py-3 text-base" data-testid="make-plan">
            ✅ Make my switch plan →
          </Link>
          <span className="text-sm text-ink-soft">Easiest first, step by step, with calendar reminders.</span>
        </div>
        <p className="mt-4 text-xs text-ink-soft">These are estimates. Your real bill may be a little different.</p>
      </section>

      {quickWins.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-extrabold">⚡ Do these first: easy and worth it</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {quickWins.map((r) => (
              <div key={r.key} className="card flex items-center gap-3 p-4">
                <ToolTile name={r.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {r.name} → {r.alternative!.name}
                  </p>
                  <p className="text-xs text-ink-soft">~{formatHours(r.alternative!.setupHours)} to switch</p>
                </div>
                <Money value={savingsByKey.get(r.key)!} className="font-bold text-money" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_minmax(0,460px)]">
        <div className="min-w-0 space-y-3">
          <h2 className="font-display text-2xl font-extrabold">Your apps, one by one</h2>
          {rows.map((r) => (
            <SwapRow key={r.key} r={r} savings={savingsByKey.get(r.key) ?? 0} onAlt={(alt) => upsertItem({ ...r.item, alt })} />
          ))}

          {summary.needsServer && (
            <div className="card p-4">
              <label className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="font-bold">🖥 Shared server</span>
                  <span className="block text-sm text-ink-soft">Some of your picks run on a small rented computer (a server). One server runs all of them, so we count it once.</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  $
                  <input className="field w-20" type="number" min={0} step="1" value={selection.server} onChange={(e) => setServer(Math.max(0, Number(e.target.value) || 0))} aria-label="Server cost per month" />
                  /month
                </span>
              </label>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Link to="/start" className="btn-ghost">
              ← Add or edit apps
            </Link>
            <Link to="/plan" className="btn-primary">
              ✅ Make my switch plan →
            </Link>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-2xl font-extrabold">Share your receipt</h2>
          <SavingsCard ref={cardRef} summary={summary} items={resolved} />
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-primary"
              disabled={downloading}
              onClick={async () => {
                if (!cardRef.current) return
                setDownloading(true)
                try {
                  await downloadNodeAsPng(cardRef.current, 'rent-free-receipt.png')
                  notify('Receipt saved, ready to post')
                } finally {
                  setDownloading(false)
                }
              }}
            >
              {downloading ? 'Making image…' : '⬇ Download image'}
            </button>
            <CopyButton text={shareUrl} label="🔗 Copy share link" toast="Link copied" />
            {'share' in navigator && (
              <button
                className="btn-ghost"
                onClick={() => navigator.share({ title: 'My Rent-Free receipt', text: `I could keep ${formatMoney(summary.savingsYearly)}/yr by dropping software rent.`, url: shareUrl }).catch(() => {})}
              >
                Share…
              </button>
            )}
          </div>
          <p className="text-xs text-ink-soft">The share link holds your picks inside the URL itself. Nothing is stored on a server.</p>
        </aside>
      </section>
    </div>
  )
}

function MiniStat({ label, value, cls, sub, testId }: { label: string; value: number; cls: string; sub?: string; testId: string }) {
  return (
    <div className="rounded-2xl border-2 border-line p-4">
      <p className="label">{label}</p>
      <p className={`font-display text-3xl font-extrabold ${cls}`} data-testid={testId}>
        <Money value={value} />
        <span className="text-sm">/yr</span>
      </p>
      {sub && <p className="text-xs text-ink-soft">{sub}</p>}
    </div>
  )
}

function SwapRow({ r, savings, onAlt }: { r: ResolvedItem; savings: number; onAlt: (alt: string | null) => void }) {
  const alt = r.alternative
  const billing = r.plan && r.item.t === 'c' ? effectiveBilling(r.plan, r.item.billing) : r.item.billing
  const remakeHref = `/remake/${r.sub ? r.sub.id : r.key}`

  return (
    <div className="card p-4 animate-rise" data-testid={`swap-${r.key}`}>
      <div className="flex items-start gap-3">
        <ToolTile name={r.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {r.name}
            <span className="font-normal text-ink-soft">
              {r.plan && ` · ${r.plan.name}`} · {billing === 'annual' ? 'yearly' : 'monthly'}
            </span>
          </p>
          <p className="text-sm text-ink-soft">
            You pay <Money value={r.currentYearly} className="text-rent" /> a year
          </p>
        </div>
        <p className="text-right">
          <span className="label">Keep</span>
          <Money value={savings} className={`font-display text-2xl font-extrabold ${savings > 0 ? 'text-money' : 'text-ink-soft'}`} />
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t-2 border-dashed border-line pt-3 sm:flex-row sm:items-center">
        <label className="sm:w-72">
          <span className="label">Switch to</span>
          <select className="field" value={alt?.id ?? ''} onChange={(e) => onAlt(e.target.value || null)}>
            {r.choices.map((c, i) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {i === 0 && r.sub ? ' ⭐' : ''}
              </option>
            ))}
            <option value="">Keep paying for {r.name}</option>
          </select>
        </label>
        {alt && <AltMeta alt={alt} />}
      </div>
      {alt && (
        <p className="mt-2 text-sm text-ink-soft">
          <Plain text={alt.summary} />
        </p>
      )}
      {!r.choices.length && <p className="mt-2 text-sm text-ink-soft">We don't know a free swap for this yet, but you can build your own with AI.</p>}
      <div className="mt-3">
        <VerdictLine alt={alt} savings={savings} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {r.sub && (
          <Link to={`/tool/${r.sub.id}`} className="btn-ghost px-3 py-1.5">
            How to switch
          </Link>
        )}
        <Link to={remakeHref} className="btn-dark px-3 py-1.5">
          ✨ Build your own
        </Link>
        {r.sub?.localAI && (
          <Link to="/local-ai" className="btn-ghost px-3 py-1.5">
            🖥 Can my computer run free AI?
          </Link>
        )}
      </div>
    </div>
  )
}
