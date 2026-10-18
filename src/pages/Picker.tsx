import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allCategories, byPopularity, fromMonthly, getCategory, getSubscription } from '../lib/data'
import { defaultSwap, newCatalogItem, resolveItem, type CatalogItem, type ResolvedItem } from '../lib/selection'
import { formatMoney } from '../lib/savings'
import { useSelection } from '../state'
import ItemEditor from '../components/ItemEditor'
import CustomEntryForm from '../components/CustomEntryForm'
import { CountUp, PageHeader, Stepper, ToolTile } from '../components/ui'
import { LevelChip } from '../components/ReplaceMeter'

export default function Picker() {
  const { selection, upsertItem, removeItem, clear } = useSelection()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<string>('popular')

  const selected = new Map(selection.items.filter((i): i is CatalogItem => i.t === 'c').map((i) => [i.id, i]))
  const resolved = selection.items.map(resolveItem).filter((r): r is ResolvedItem => r !== null)
  const total = resolved.reduce((t, r) => t + r.currentYearly, 0)
  const tabs = [
    { id: 'popular', label: '🔥 Popular' },
    { id: 'all', label: 'All' },
    ...allCategories.filter((c) => byPopularity.some((s) => s.category === c.id)).map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` })),
  ]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) return byPopularity.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || getCategory(s.category).name.toLowerCase().includes(q))
    if (tab === 'popular') return byPopularity.slice(0, 20)
    if (tab === 'all') return byPopularity
    return byPopularity.filter((s) => s.category === tab)
  }, [query, tab])

  return (
    <div className="pb-20 lg:pb-0">
      <Stepper current={1} />
      <PageHeader title={<>What do you <span className="hl">pay for</span>?</>}>Tap every app you pay for. We fill in the price. If you pay a different price, tap it on your receipt to change it.</PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <input className="field mb-4 max-w-md py-3 text-base" type="search" placeholder="Search… (Netflix, music, photos, AI)" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search tools" />
          {!query && (
            <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Categories">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap transition ${tab === t.id ? 'border-ink bg-ink text-paper' : 'border-line bg-card hover:border-ink'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((s) => {
              const on = selected.has(s.id)
              return (
                <label
                  key={s.id}
                  className={`relative flex cursor-pointer flex-col items-start gap-2 rounded-2xl border-2 p-3.5 transition select-none focus-within:ring-4 focus-within:ring-hilite ${
                    on ? 'pop animate-pop bg-money-soft' : 'border-line bg-card hover:-translate-y-0.5 hover:border-ink'
                  }`}
                >
                  <input type="checkbox" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" checked={on} onChange={() => (on ? removeItem(s.id) : upsertItem(newCatalogItem(s)))} aria-label={`I pay for ${s.name}`} />
                  <span className={`absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-extrabold ${on ? 'border-ink bg-money text-white' : 'border-line text-transparent'}`} aria-hidden>
                    ✓
                  </span>
                  <ToolTile name={s.name} size={40} />
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{s.name}</span>
                    <span className="block text-xs text-ink-soft">
                      from <span className="money">{formatMoney(fromMonthly(s))}</span>/mo
                    </span>
                    <LevelChip alt={defaultSwap(s)} />
                  </span>
                </label>
              )
            })}
          </div>
          {visible.length === 0 && <p className="text-ink-soft">Not on our list? Add it yourself on your receipt ("+ Add something not listed").</p>}
        </div>

        {/* running receipt */}
        <aside className="lg:sticky lg:top-24 lg:self-start" id="receipt" aria-label="Your receipt">
          <div className="receipt pop rounded-sm px-5">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-xs tracking-[0.25em] text-ink-soft uppercase">Your rent receipt</p>
              {selection.items.length > 0 && (
                <button type="button" onClick={clear} className="text-xs font-bold text-ink-soft underline hover:text-rent">
                  Clear
                </button>
              )}
            </div>
            {resolved.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-soft">Nothing yet. Tap an app to add it. 🧾</p>
            ) : (
              <ul className="mt-3 divide-y-2 divide-dashed divide-line border-y-2 border-dashed border-line">
                {resolved.map((r) => (
                  <ReceiptLine key={r.key} r={r} onRemove={() => removeItem(r.key)} />
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-end justify-between">
              <span className="font-mono text-sm font-bold">TOTAL / YEAR</span>
              <CountUp value={total} className="font-display text-3xl font-extrabold text-rent" />
            </div>
            <Link to="/results" className={`btn-primary mt-4 w-full py-3 text-base ${resolved.length ? '' : 'pointer-events-none opacity-50'}`} aria-disabled={!resolved.length}>
              See what I could keep →
            </Link>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold">+ Add something not listed</summary>
              <div className="mt-3">
                <CustomEntryForm compact />
              </div>
            </details>
          </div>
        </aside>
      </div>

      {/* phone bottom bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-20 border-t-2 border-ink bg-card lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="#receipt" className="text-sm">
            <strong>{selection.items.length}</strong> picked · <span className="money font-bold text-rent">{formatMoney(total)}</span>
            <span className="text-ink-soft">/yr</span>
          </a>
          <Link to="/results" className={`btn-primary ${selection.items.length ? '' : 'pointer-events-none opacity-50'}`} aria-disabled={!selection.items.length}>
            See savings →
          </Link>
        </div>
      </div>
    </div>
  )
}

function ReceiptLine({ r, onRemove }: { r: ResolvedItem; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  const sub = r.sub ?? (r.item.t === 'c' ? getSubscription(r.item.id) : undefined)
  return (
    <li className="py-2.5 animate-rise">
      <div className="flex items-center gap-2.5">
        <ToolTile name={r.name} size={28} />
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Edit ${r.name}`}>
          <span className="block truncate text-sm font-bold">{r.name}</span>
          <span className="block truncate text-xs text-ink-soft">
            {r.plan ? r.plan.name : 'custom'} · {open ? 'done' : 'edit'} ✎
          </span>
        </button>
        <span className="money text-sm text-rent">{formatMoney(r.currentYearly)}</span>
        <button type="button" onClick={onRemove} aria-label={`Remove ${r.name}`} className="text-ink-soft hover:text-rent">
          ✕
        </button>
      </div>
      {open && sub && r.item.t === 'c' && <ItemEditor sub={sub} item={r.item} />}
    </li>
  )
}
