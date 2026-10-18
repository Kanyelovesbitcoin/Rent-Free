import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { fromMonthly, getAlternative, getCategory, getSubscription } from '../lib/data'
import { formatMoney, yearlyCost } from '../lib/savings'
import type { Alternative } from '../lib/schema'
import { newCatalogItem, resolveItem } from '../lib/selection'
import { useSelection } from '../state'
import RemakeStudio from '../components/RemakeStudio'
import { AltMeta, Badge, Money, REPO_URL, ToolTile } from '../components/ui'
import { subjectFromSubscription } from './Remake'
import NotFound from './NotFound'

const TABS = [
  { id: 'switch', label: '🔁 Switch' },
  { id: 'costs', label: '🧾 Costs' },
  { id: 'remake', label: '✨ Remake with AI' },
] as const
type TabId = (typeof TABS)[number]['id']

const KIND_LABEL = { software: 'Software', content: 'Content subscription', membership: 'Membership' }

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
          <BeforeYouCancel name={sub.name} />
          {sub.kind !== 'software' && (
            <p className="rounded-xl border-2 border-line bg-card p-4 text-sm">
              <strong>Honest note:</strong> you can't open-source {sub.kind === 'content' ? "the movies, music or books themselves" : 'a membership'}. These are the real ways to pay less, plus
              free tools for the stuff you already own.
            </p>
          )}
          {alts.map((a, i) => (
            <AlternativeCard key={a.id} alt={a} recommended={i === 0} replacing={sub.name} />
          ))}
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <p>
              <strong>None of these fit?</strong> <span className="text-ink-soft">Build your own version with an AI coding agent.</span>
            </p>
            <button type="button" className="btn-dark" onClick={() => setParams({ tab: 'remake' }, { replace: true })}>
              ✨ Remake {sub.name}
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
        <li>Export your data first (files, contacts, notes, playlists, anything you'd miss).</li>
        <li>Check your plan: annual contracts may not refund, and most cancel at the end of the billing period.</li>
        <li>Run the new tool alongside the old one for a week before you switch over completely.</li>
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
            <p className="mt-1 text-ink-soft">{alt.summary}</p>
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
          <p className="label">What you gain</p>
          <ul className="space-y-1 text-sm">
            {alt.gains.map((g) => (
              <li key={g}>✅ {g}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">What you give up</p>
          <ul className="space-y-1 text-sm">
            {alt.tradeoffs.map((t) => (
              <li key={t}>⚠️ {t}</li>
            ))}
          </ul>
        </div>
      </div>
      <details className="mt-4 rounded-xl bg-paper-2 p-4" open={recommended}>
        <summary className="cursor-pointer font-bold">How to switch from {replacing}</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
          {alt.setupSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink-soft">
          Platforms: {alt.platforms.join(', ')} · License: {alt.license}
          {alt.freeTierLimits && <> · {alt.freeTierLimits}</>}
        </p>
      </details>
      {alt.commercialNote && (
        <p className="mt-3 text-xs text-ink-soft" data-testid="commercial-note">
          <strong className="text-ink">⚖️ License note:</strong> {alt.commercialNote}
        </p>
      )}
    </article>
  )
}
