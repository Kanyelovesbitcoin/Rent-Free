import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCategory } from '../lib/data'
import { encodeSelection, resolveItem, toLines, type ResolvedItem } from '../lib/selection'
import { effectiveBilling, formatMoney, summarize } from '../lib/savings'
import { useSelection, useSharedSelection } from '../state'
import SavingsCard, { downloadNodeAsPng } from '../components/SavingsCard'
import { AltMeta, CopyButton, HOSTING, Money, PageHeader, formatHours } from '../components/ui'

export default function Results() {
  const [params] = useSearchParams()
  const shared = useSharedSelection(params.get('s'))
  const { selection, upsertItem, setServer } = useSelection()
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const resolved = useMemo(() => selection.items.map(resolveItem).filter((r): r is ResolvedItem => r !== null), [selection.items])
  const summary = useMemo(() => summarize(toLines(resolved), selection.server), [resolved, selection.server])
  const shareUrl = `${window.location.origin}${window.location.pathname}#/results?s=${encodeSelection(selection)}`

  if (!resolved.length) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-5xl">🧾</p>
        <h1 className="mt-4 font-display text-3xl font-extrabold">No subscriptions yet</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">Pick the tools you pay for and we'll show you what you could keep.</p>
        <Link to="/start" className="btn-primary mt-6">
          Start the calculator →
        </Link>
      </div>
    )
  }

  const monthly = (n: number) => formatMoney(n / 12)

  return (
    <div>
      {shared && (
        <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          You're viewing a shared result. Change anything below, or{' '}
          <Link to="/start" className="font-semibold underline">
            pick your own tools
          </Link>
          .
        </p>
      )}
      <PageHeader eyebrow="Step 2" title="Here's what you could keep">
        Switch an alternative or choose "keep paying" for any tool, and the totals update live. These are estimates from list prices; your actual bill may differ.
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="You pay now" value={summary.currentYearly} sub={`${monthly(summary.currentYearly)}/mo`} tone="rose" />
        <Stat label="Rent-Free route" value={summary.rentFreeYearly} sub={summary.needsServer ? `incl. ${formatMoney(summary.serverYearly)}/yr server` : 'no server needed'} tone="stone" />
        <Stat label="You could keep" value={summary.savingsYearly} sub={`${monthly(summary.savingsYearly)}/mo · ~${formatHours(summary.setupHours)} total setup`} tone="emerald" />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_minmax(0,520px)]">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-extrabold">Your swaps</h2>
          {resolved.map((r) => (
            <SwapRow key={r.key} r={r} savings={summary.lines.find((l) => l.key === r.key)!.savingsYearly} onAlt={(alt) => upsertItem({ ...r.item, alt })} />
          ))}

          {summary.needsServer && (
            <div className="card p-4">
              <label className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  <span className="font-semibold">Shared server</span>
                  <span className="block text-sm text-stone-500">{HOSTING['self-host'].hint} Counted once.</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  $
                  <input
                    className="field w-20"
                    type="number"
                    min={0}
                    step="1"
                    value={selection.server}
                    onChange={(e) => setServer(Math.max(0, Number(e.target.value) || 0))}
                    aria-label="Server cost per month"
                  />
                  /month
                </span>
              </label>
            </div>
          )}
          <Link to="/start" className="btn-ghost">
            ← Add or edit subscriptions
          </Link>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-xl font-extrabold">Share your receipt</h2>
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
                } finally {
                  setDownloading(false)
                }
              }}
            >
              {downloading ? 'Making image…' : '⬇ Download image'}
            </button>
            <CopyButton text={shareUrl} label="🔗 Copy share link" />
            {'share' in navigator && (
              <button
                className="btn-ghost"
                onClick={() =>
                  navigator.share({ title: 'My Rent-Free receipt', text: `I could keep ${formatMoney(summary.savingsYearly)}/yr by dropping software rent.`, url: shareUrl }).catch(() => {})
                }
              >
                Share…
              </button>
            )}
          </div>
          <p className="text-xs text-stone-500">The share link contains your picks, encoded in the URL. Nothing is stored on a server.</p>
        </aside>
      </section>
    </div>
  )
}

function Stat({ label, value, sub, tone }: { label: string; value: number; sub: string; tone: 'rose' | 'stone' | 'emerald' }) {
  const color = { rose: 'text-rose-600 dark:text-rose-400', stone: 'text-stone-900 dark:text-stone-100', emerald: 'text-emerald-600 dark:text-emerald-400' }[tone]
  return (
    <div className={`card p-5 ${tone === 'emerald' ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/40' : ''}`}>
      <p className="label">{label}</p>
      <p className={`font-display text-4xl font-extrabold tabular-nums ${color}`} data-testid={`stat-${tone}`}>
        <Money value={value} />
        <span className="text-base font-semibold">/yr</span>
      </p>
      <p className="mt-1 text-sm text-stone-500">{sub}</p>
    </div>
  )
}

function SwapRow({ r, savings, onAlt }: { r: ResolvedItem; savings: number; onAlt: (alt: string | null) => void }) {
  const cat = getCategory(r.category)
  const alt = r.alternative
  const billing = r.plan && r.item.t === 'c' ? effectiveBilling(r.plan, r.item.billing) : r.item.billing
  const buildHref = r.sub ? `/tool/${r.sub.id}#build` : `/build?name=${encodeURIComponent(r.name)}&category=${r.category}`

  return (
    <div className="card p-4" data-testid={`swap-${r.key}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {cat.emoji} {r.name}
            {r.plan && <span className="font-normal text-stone-500"> · {r.plan.name}</span>}
            <span className="font-normal text-stone-500"> · {billing === 'annual' ? 'yearly' : 'monthly'}</span>
          </p>
          <p className="text-sm text-stone-500">
            <Money value={r.currentYearly} className="text-rose-600 dark:text-rose-400" /> per year now
          </p>
        </div>
        <p className="text-right">
          <span className="label">Could keep</span>
          <Money value={savings} className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400" />
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-stone-100 pt-3 sm:flex-row sm:items-center dark:border-stone-800">
        <label className="sm:w-64">
          <span className="sr-only">Alternative for {r.name}</span>
          <select className="field" value={alt?.id ?? ''} onChange={(e) => onAlt(e.target.value || null)}>
            {r.choices.map((c, i) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {i === 0 && r.sub ? ' (pick for me)' : ''}
              </option>
            ))}
            <option value="">Keep paying for {r.name}</option>
          </select>
        </label>
        {alt && <AltMeta alt={alt} />}
      </div>
      {alt && <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{alt.summary}</p>}
      {!r.choices.length && <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">No known open-source alternative in this category yet. You can build your own, though.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {r.sub && (
          <Link to={`/tool/${r.sub.id}`} className="btn-ghost px-3 py-1.5">
            How to switch
          </Link>
        )}
        <Link to={buildHref} className="btn-ghost px-3 py-1.5">
          🛠 Build my own
        </Link>
        {r.sub?.localAI && (
          <Link to="/local-ai" className="btn-ghost px-3 py-1.5">
            🖥 Can my computer run it?
          </Link>
        )}
      </div>
    </div>
  )
}
