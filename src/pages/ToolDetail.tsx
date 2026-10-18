import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { fromMonthly, getAlternative, getCategory, getSubscription } from '../lib/data'
import { alternativeYearly, formatMoney, yearlyCost } from '../lib/savings'
import type { Alternative } from '../lib/schema'
import { bestSwap, newCatalogItem, resolveItem } from '../lib/selection'
import { useSelection } from '../state'
import RemakeStudio from '../components/RemakeStudio'
import ReplaceMeter from '../components/ReplaceMeter'
import Plain from '../components/Plain'
import { AltMeta, Badge, Money, REPO_URL, ToolTile } from '../components/ui'
import { subjectFromSubscription } from './Remake'
import NotFound from './NotFound'

const TABS = [
  { id: 'switch', label: '🔁 How to switch' },
  { id: 'costs', label: '🧾 Prices' },
  { id: 'remake', label: '✨ Build your own' },
] as const
type TabId = (typeof TABS)[number]['id']

const KIND_LABEL = { software: 'App', content: 'Shows, music or books', membership: 'Membership' }

export default function ToolDetail() {
  const { id = '' } = useParams()
  const { hash } = useLocation()
  const [params, setParams] = useSearchParams()
  const sub = getSubscription(id)
  const { selection, upsertItem } = useSelection()

  if (!sub) return <NotFound />
  const tabParam = params.get('tab')
  const tab: TabId = hash === '#build' ? 'remake' : TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : 'switch'
  const cat = getCategory(sub.category)
  const alts = sub.alternatives.map((a) => getAlternative(a)!).filter(Boolean)
  const item = selection.items.find((i) => i.id === sub.id)
  const yearly = item ? resolveItem(item)?.currentYearly : undefined
  // For the meter: what you pay (or the basic plan, billed monthly) minus what the best swap costs.
  const basePlan = sub.plans.find((p) => p.id === sub.defaultPlan)!
  const payYearly = yearly ?? yearlyCost(basePlan, basePlan.monthlyPrice != null ? 'monthly' : 'annual')
  const best = bestSwap(sub, payYearly) ?? alts[0] ?? null
  const bestSavings = best ? payYearly - alternativeYearly(best, payYearly) : 0

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start gap-5">
        <ToolTile name={sub.name} size={72} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-money">
            {cat.emoji} {cat.name} · {KIND_LABEL[sub.kind]}
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Replace <span className="hl">{sub.name}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-soft">{sub.description}</p>
          <p className="mt-2 text-sm">
            From <span className="money font-bold text-rent">{formatMoney(fromMonthly(sub))}/mo</span>
            {yearly != null && (
              <>
                {' '}
                · you pay <span className="money font-bold text-rent">{formatMoney(yearly)}/yr</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!item ? (
            <button className="btn-primary" onClick={() => upsertItem(newCatalogItem(sub))}>
              + I pay for {sub.name}
            </button>
          ) : (
            <Link to="/results" className="btn-primary">
              ✓ On your receipt · see savings
            </Link>
          )}
          {sub.localAI && (
            <Link to="/local-ai" className="btn-ghost">
              🖥 Can my computer run AI?
            </Link>
          )}
        </div>
      </header>

      <div role="tablist" aria-label="Sections" className="sticky top-[66px] z-20 -mx-4 mb-8 flex gap-2 overflow-x-auto border-b-2 border-line bg-paper/95 px-4 py-3 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'switch' ? {} : { tab: t.id }, { replace: true })}
            className={`shrink-0 rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${tab === t.id ? 'border-ink bg-ink text-paper' : 'border-line bg-card hover:border-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'switch' && (
        <div className="space-y-6">
          <ReplaceMeter name={sub.name} alt={best} savings={bestSavings} />
          <BeforeYouCancel name={sub.name} />
          {sub.kind !== 'software' && (
            <p className="rounded-xl border-2 border-line bg-card p-4 text-sm">
              <strong>The truth:</strong> nobody can give you {sub.kind === 'content' ? 'free copies of these movies, songs or books' : 'this membership for free'}. But here are real ways to pay
              less, plus free apps for things you already own.
            </p>
          )}
          {alts.map((a, i) => (
            <AlternativeCard key={a.id} alt={a} recommended={i === 0} replacing={sub.name} />
          ))}
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <p>
              <strong>None of these fit?</strong> <span className="text-ink-soft">Build your own version with an AI helper.</span>
            </p>
            <button type="button" className="btn-dark" onClick={() => setParams({ tab: 'remake' }, { replace: true })}>
              ✨ Build my own {sub.name}
            </button>
          </div>
        </div>
      )}

      {tab === 'costs' && (
        <section>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead className="text-left text-ink-soft">
                <tr className="border-b-2 border-line">
                  <th className="p-3 font-bold">Plan</th>
                  <th className="p-3 font-bold">Billed monthly</th>
                  <th className="p-3 font-bold">Billed yearly</th>
                </tr>
              </thead>
              <tbody>
                {sub.plans.map((p) => (
                  <tr key={p.id} className="border-b-2 border-dashed border-line last:border-0">
                    <td className="p-3 font-bold">
                      {p.name}
                      {p.perSeat && <span className="font-normal text-ink-soft"> / {p.unitLabel ?? 'seat'}</span>}
                    </td>
                    <td className="p-3">
                      {p.monthlyPrice != null ? (
                        <>
                          <Money value={p.monthlyPrice} />
                          /mo = <Money value={yearlyCost(p, 'monthly')} className="font-bold text-rent" />
                          /yr
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3">
                      {p.annualPrice != null ? (
                        <>
                          <Money value={p.annualPrice} className="font-bold text-rent" />
                          /yr
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Checked {sub.lastVerified} against{' '}
            <a href={sub.sourceUrl} className="underline" target="_blank" rel="noreferrer">
              {sub.name}'s pricing page
            </a>
            . {sub.priceNote} Prices change, so if this looks wrong,{' '}
            <Link to="/contribute" className="underline">
              send a fix
            </Link>
            .
          </p>
          <div className="mt-6">
            <BeforeYouCancel name={sub.name} />
          </div>
        </section>
      )}

      {tab === 'remake' && <RemakeStudio key={sub.id} subject={subjectFromSubscription(sub, yearly)} />}
    </div>
  )
}

function BeforeYouCancel({ name }: { name: string }) {
  return (
    <section className="rounded-2xl border-2 border-ink bg-hilite/20 p-5" data-testid="before-cancel">
      <h2 className="font-display text-lg font-extrabold">✋ Before you cancel {name}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>Export your data first. Save a copy of your files, notes, playlists, or anything you'd miss.</li>
        <li>Check your plan. If you paid for a whole year, you may not get money back.</li>
        <li>Use the new app and the old one side by side for a week. Then cancel.</li>
      </ul>
    </section>
  )
}

function AlternativeCard({ alt, recommended, replacing }: { alt: Alternative; recommended: boolean; replacing: string }) {
  return (
    <article className={`card p-5 ${recommended ? 'pop' : ''}`} data-testid={`alt-${alt.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ToolTile name={alt.name} size={44} />
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-center gap-2 font-display text-xl font-extrabold">
              {alt.name}
              {recommended && <Badge className="border-2 border-ink bg-hilite text-ink">⭐ Pick for me</Badge>}
            </h3>
            <p className="mt-1 text-ink-soft">
              <Plain text={alt.summary} />
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Strategy entries (rotate, free plan) point at our own repo; no point linking it here. */}
          {alt.website !== REPO_URL && (
            <a href={alt.website} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
              Website ↗
            </a>
          )}
          {alt.repo && (
            <a href={alt.repo} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
              Code ↗
            </a>
          )}
        </div>
      </div>
      <div className="mt-3">
        <AltMeta alt={alt} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="label">What's good</p>
          <ul className="space-y-1 text-sm">
            {alt.gains.map((g) => (
              <li key={g}>
                ✅ <Plain text={g} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">What's not as good</p>
          <ul className="space-y-1 text-sm">
            {alt.tradeoffs.map((t) => (
              <li key={t}>
                ⚠️ <Plain text={t} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <details className="mt-4 rounded-xl bg-paper-2 p-4" open={recommended}>
        <summary className="cursor-pointer font-bold">Step by step: switch from {replacing}</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
          {alt.setupSteps.map((s) => (
            <li key={s}>
              <Plain text={s} />
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-ink-soft">Tip: tap any underlined word to see what it means.</p>
        <p className="mt-3 text-xs text-ink-soft">
          Works on: {alt.platforms.join(', ')} · <Plain text={`License: ${alt.license}`} />
          {alt.freeTierLimits && <> · {alt.freeTierLimits}</>}
        </p>
      </details>
      {alt.commercialNote && (
        <p className="mt-3 text-xs text-ink-soft" data-testid="commercial-note">
          <strong className="text-ink">⚖️ If you use it for a business:</strong> <Plain text={alt.commercialNote} />
        </p>
      )}
    </article>
  )
}
