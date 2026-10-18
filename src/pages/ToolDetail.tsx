import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getAlternative, getCategory, getSubscription } from '../lib/data'
import { yearlyCost } from '../lib/savings'
import type { Alternative } from '../lib/schema'
import { newCatalogItem } from '../lib/selection'
import { useSelection } from '../state'
import BuildKit from '../components/BuildKit'
import { AltMeta, Badge, Money, PageHeader } from '../components/ui'
import NotFound from './NotFound'

export default function ToolDetail() {
  const { id = '' } = useParams()
  const { hash } = useLocation()
  const sub = getSubscription(id)
  const { selection, upsertItem } = useSelection()

  useEffect(() => {
    if (hash === '#build') document.getElementById('build')?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, id])

  if (!sub) return <NotFound />
  const cat = getCategory(sub.category)
  const alts = sub.alternatives.map((a) => getAlternative(a)!).filter(Boolean)
  const inList = selection.items.some((i) => i.id === sub.id)

  return (
    <div className="space-y-12">
      <PageHeader eyebrow={`${cat.emoji} ${cat.name}`} title={`Replace ${sub.name}`}>
        <p>{sub.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!inList ? (
            <button className="btn-primary" onClick={() => upsertItem(newCatalogItem(sub))}>
              + I pay for {sub.name}
            </button>
          ) : (
            <Link to="/results" className="btn-primary">
              ✓ In your list · see savings
            </Link>
          )}
          <a href="#build" className="btn-ghost" onClick={(e) => (e.preventDefault(), document.getElementById('build')?.scrollIntoView({ behavior: 'smooth' }))}>
            🛠 Build my own
          </a>
          {sub.localAI && (
            <Link to="/local-ai" className="btn-ghost">
              🖥 Check my computer for local AI
            </Link>
          )}
        </div>
      </PageHeader>

      <section>
        <h2 className="font-display text-xl font-extrabold">What {sub.name} costs</h2>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="text-left text-stone-500">
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="p-3 font-semibold">Plan</th>
                <th className="p-3 font-semibold">Billed monthly</th>
                <th className="p-3 font-semibold">Billed yearly</th>
              </tr>
            </thead>
            <tbody>
              {sub.plans.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                  <td className="p-3 font-medium">
                    {p.name}
                    {p.perSeat && <span className="text-stone-500"> / seat</span>}
                  </td>
                  <td className="p-3">
                    {p.monthlyPrice != null ? (
                      <>
                        <Money value={p.monthlyPrice} />
                        /mo = <Money value={yearlyCost(p, 'monthly')} className="font-semibold text-rose-600 dark:text-rose-400" />
                        /yr
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3">
                    {p.annualPrice != null ? (
                      <>
                        <Money value={p.annualPrice} className="font-semibold text-rose-600 dark:text-rose-400" />
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
        <p className="mt-2 text-xs text-stone-500">
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
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40" data-testid="before-cancel">
        <h2 className="font-semibold">✋ Before you cancel {sub.name}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700 dark:text-stone-300">
          <li>Export your data first (files, contacts, notes, templates, anything you'd miss).</li>
          <li>Check your plan: annual contracts may not refund, and some cancel at the end of the billing period.</li>
          <li>Run the new tool alongside the old one for a week before you switch over completely.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold">Open-source alternatives</h2>
        <div className="mt-4 space-y-4">
          {alts.map((a, i) => (
            <AlternativeCard key={a.id} alt={a} recommended={i === 0} replacing={sub.name} />
          ))}
        </div>
      </section>

      <section id="build" className="scroll-mt-24">
        <h2 className="font-display text-xl font-extrabold">🛠 Or build your own</h2>
        <p className="mt-1 mb-4 max-w-2xl text-stone-600 dark:text-stone-400">
          Want something made exactly for you? Hand this to an AI app builder. It covers the {sub.coreFeatures.length} core features people actually use in{' '}
          {sub.name}, with your own branding.
        </p>
        <BuildKit prompt={{ inspiredBy: sub.name, categoryName: cat.name, description: sub.description, coreFeatures: sub.coreFeatures }} wireframe={cat.wireframe} />
      </section>
    </div>
  )
}

function AlternativeCard({ alt, recommended, replacing }: { alt: Alternative; recommended: boolean; replacing: string }) {
  return (
    <article className={`card p-5 ${recommended ? 'border-emerald-400 dark:border-emerald-700' : ''}`} data-testid={`alt-${alt.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
            {alt.name}
            {recommended && <Badge className="bg-emerald-600 text-white">⭐ Pick for me</Badge>}
          </h3>
          <p className="mt-1 text-stone-600 dark:text-stone-400">{alt.summary}</p>
        </div>
        <div className="flex gap-2">
          <a href={alt.website} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
            Website ↗
          </a>
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
      <details className="mt-4 rounded-xl bg-stone-50 p-4 dark:bg-stone-950" open={recommended}>
        <summary className="cursor-pointer font-semibold">How to switch from {replacing}</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
          {alt.setupSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-stone-500">
          Platforms: {alt.platforms.join(', ')} · License: {alt.license}
          {alt.freeTierLimits && <> · {alt.freeTierLimits}</>}
        </p>
      </details>
      {alt.commercialNote && (
        <p className="mt-3 text-xs text-stone-500" data-testid="commercial-note">
          <strong className="text-stone-700 dark:text-stone-300">⚖️ License note:</strong> {alt.commercialNote}
        </p>
      )}
    </article>
  )
}
