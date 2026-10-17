import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allCategories, getCategory, subscriptions } from '../lib/data'
import { newCatalogItem, resolveItem, type CatalogItem } from '../lib/selection'
import { formatMoney } from '../lib/savings'
import { useSelection } from '../state'
import ItemEditor from '../components/ItemEditor'
import CustomEntryForm from '../components/CustomEntryForm'
import { Money, PageHeader } from '../components/ui'

export default function Picker() {
  const { selection, upsertItem, removeItem } = useSelection()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const selected = new Map(selection.items.filter((i): i is CatalogItem => i.t === 'c').map((i) => [i.id, i]))
  const customs = selection.items.filter((i) => i.t === 'u')
  const usedCategories = allCategories.filter((c) => subscriptions.some((s) => s.category === c.id))

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return subscriptions.filter(
      (s) =>
        (!category || s.category === category) &&
        (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || getCategory(s.category).name.toLowerCase().includes(q)),
    )
  }, [query, category])

  const total = selection.items.map(resolveItem).reduce((t, r) => t + (r?.currentYearly ?? 0), 0)

  return (
    <div className="pb-28">
      <PageHeader eyebrow="Step 1" title="What are you paying for?">
        Check off every subscription you pay for. Prices are pre-filled from each tool's pricing page; change them if you pay something different.
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3">
        <input className="field max-w-md py-3" type="search" placeholder="Search tools… (e.g. Calendly, notes, AI)" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search tools" />
        <div className="flex flex-wrap gap-2">
          <Chip active={!category} onClick={() => setCategory(null)}>
            All
          </Chip>
          {usedCategories.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(category === c.id ? null : c.id)}>
              {c.emoji} {c.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {visible.map((s) => {
          const item = selected.get(s.id)
          return (
            <div key={s.id} className={`card p-4 transition ${item ? 'border-emerald-500 ring-1 ring-emerald-500 dark:border-emerald-600' : ''}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 accent-emerald-600"
                  checked={!!item}
                  onChange={() => (item ? removeItem(s.id) : upsertItem(newCatalogItem(s)))}
                  aria-label={`I pay for ${s.name}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      {getCategory(s.category).emoji} {s.name}
                    </span>
                    {item && <Money value={resolveItem(item)!.currentYearly} className="text-sm font-semibold text-rose-600 dark:text-rose-400" />}
                  </span>
                  <span className="mt-0.5 block text-sm text-stone-500">{s.description}</span>
                </span>
              </label>
              {item && <ItemEditor sub={s} item={item} />}
            </div>
          )
        })}
        {visible.length === 0 && <p className="text-stone-500">No tools match. Add it as a custom subscription below. 👇</p>}
      </div>

      <div className="mt-8 space-y-3">
        <CustomEntryForm />
        {customs.map((c) => {
          const r = resolveItem(c)!
          return (
            <div key={c.id} className="card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">
                  {getCategory(r.category).emoji} {r.name} <span className="text-xs font-normal text-stone-500">(custom)</span>
                </p>
                <p className="text-sm text-stone-500">
                  {formatMoney(c.price)} {c.billing === 'monthly' ? 'per month' : 'per year'} · <Money value={r.currentYearly} />
                  /yr
                </p>
              </div>
              <button className="btn-ghost px-3 py-1.5" onClick={() => removeItem(c.id)} aria-label={`Remove ${c.name}`}>
                Remove
              </button>
            </div>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm">
            <strong>{selection.items.length}</strong> selected ·{' '}
            <Money value={total} className="font-semibold text-rose-600 dark:text-rose-400" />
            <span className="text-stone-500">/yr in software rent</span>
          </p>
          <Link to="/results" className={`btn-primary ${selection.items.length ? '' : 'pointer-events-none opacity-50'}`} aria-disabled={!selection.items.length}>
            See my savings →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
      }`}
    >
      {children}
    </button>
  )
}
