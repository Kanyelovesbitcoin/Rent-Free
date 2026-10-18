import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { byPopularity } from '../lib/data'
import { newCatalogItem } from '../lib/selection'
import { useSelection } from '../state'
import { ToolTile, useToast } from './ui'

// "What do you pay for?" Type, tap, done. The fastest way to start.
export default function QuickAdd() {
  const { selection, upsertItem } = useSelection()
  const notify = useToast()
  const [q, setQ] = useState('')
  const picked = new Set(selection.items.map((i) => i.id))
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (s ? byPopularity.filter((x) => x.name.toLowerCase().includes(s)) : byPopularity).filter((x) => !picked.has(x.id)).slice(0, 6)
  }, [q, picked])

  return (
    <div className="card pop p-4" data-testid="quick-add">
      <label className="block">
        <span className="font-display text-lg font-extrabold">What do you pay for?</span>
        <input
          className="field mt-2 py-3 text-base"
          type="search"
          placeholder="Type an app… (Netflix, Spotify, iCloud)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="What do you pay for?"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {matches.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              upsertItem(newCatalogItem(s))
              notify(`Added ${s.name}`)
              setQ('')
            }}
            className="flex items-center gap-2 rounded-full border-2 border-line bg-card py-1 pr-3 pl-1 text-sm font-bold transition hover:border-ink"
            aria-label={`Add ${s.name}`}
          >
            <ToolTile name={s.name} size={24} />+ {s.name}
          </button>
        ))}
        {q && !matches.length && (
          <Link to="/start" className="text-sm font-bold text-money underline">
            Not on the list? Add it yourself →
          </Link>
        )}
      </div>
      {selection.items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-line pt-3">
          <span className="text-sm font-bold">
            {selection.items.length} on your receipt ✓
          </span>
          <Link to="/results" className="btn-primary">
            See what I could keep →
          </Link>
        </div>
      )}
    </div>
  )
}
