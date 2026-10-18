import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { allCategories, byPopularity, getAlternative, getCategory, getSubscription } from '../lib/data'
import { resolveItem } from '../lib/selection'
import type { Subscription } from '../lib/schema'
import { useSelection } from '../state'
import RemakeStudio, { type RemakeSubject } from '../components/RemakeStudio'
import { PageHeader, ToolTile } from '../components/ui'
import NotFound from './NotFound'

// Open-source projects worth extending instead of rebuilding from scratch (first non-strategy alternative).
const STRATEGIES = new Set(['rotate-subscriptions', 'free-tier', 'free-streaming', 'library-streaming', 'library-books'])
const baseAlternativeFor = (sub: Subscription) => sub.alternatives.map((a) => getAlternative(a)).find((a) => a && !STRATEGIES.has(a.id) && a.repo)?.name

export function subjectFromSubscription(sub: Subscription, yearlyCost?: number): RemakeSubject {
  const cat = getCategory(sub.category)
  return {
    key: sub.id,
    name: sub.name,
    categoryName: cat.name,
    wireframe: cat.wireframe,
    description: sub.description,
    coreFeatures: sub.coreFeatures,
    extraFeatures: sub.extraFeatures,
    complexity: sub.complexity as RemakeSubject['complexity'],
    remakeTarget: sub.remakeTarget,
    remakeNote: sub.remakeNote,
    isContent: sub.kind === 'content',
    yearlyCost,
    baseAlternative: baseAlternativeFor(sub),
  }
}

// /remake: pick anything from the catalog, or describe your own.
export function RemakeIndex() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const list = useMemo(() => byPopularity.filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase())), [q])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    navigate(`/remake/custom?${new URLSearchParams({ name: name.trim(), category, description: description.trim() })}`)
  }

  return (
    <div>
      <PageHeader eyebrow="✨ Remake with AI" title={<>Rebuild any app <span className="hl">your way</span>.</>}>
        Pick a subscription (or describe your own), tick the features you actually use, and get a ready-to-paste prompt for Claude Code, Codex or OpenCode. The more
        complex the app, the more structure the prompt asks for.
      </PageHeader>

      <form onSubmit={submit} className="card pop mb-10 p-5" aria-label="Describe your own app">
        <h2 className="font-display text-xl font-extrabold">Paying for something not on the list?</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
          <label>
            <span className="label">What's it called?</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kajabi, Later, MyFitnessPal" />
          </label>
          <label>
            <span className="label">Category</span>
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block">
          <span className="label">What does it do for you?</span>
          <textarea className="field h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe it in your own words: what you use it for, the features that matter, what bugs you." />
        </label>
        <button type="submit" className="btn-primary mt-3">
          Build my remake prompt →
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold">Or pick one of the top {byPopularity.length}</h2>
        <input className="field max-w-xs" type="search" placeholder="Search…" aria-label="Search subscriptions" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((s) => (
          <Link key={s.id} to={`/remake/${s.id}`} className="card flex min-w-0 items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:border-ink">
            <ToolTile name={s.name} size={36} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{s.name}</span>
              <span className="block truncate text-xs text-ink-soft">{['', 'Quick', 'Standard', 'Big', 'Platform'][s.complexity]} build</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// /remake/:id: a catalog tool, a custom item from your list (custom-xxxx), or /remake/custom?name=…
export function RemakeTool() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const { selection } = useSelection()

  const subject = useMemo<RemakeSubject | null>(() => {
    const sub = getSubscription(id)
    if (sub) {
      const item = selection.items.find((i) => i.id === sub.id)
      return subjectFromSubscription(sub, item ? resolveItem(item)?.currentYearly : undefined)
    }
    const custom = selection.items.find((i) => i.t === 'u' && i.id === id)
    const name = custom && custom.t === 'u' ? custom.name : id === 'custom' ? params.get('name')?.slice(0, 80) : undefined
    if (!name) return null
    const cat = getCategory((custom && custom.t === 'u' ? custom.category : params.get('category')) || 'other')
    const userDescription = custom && custom.t === 'u' ? custom.description : params.get('description')?.slice(0, 1000)
    return {
      key: custom ? custom.id : `custom:${name.toLowerCase()}`,
      name,
      categoryName: cat.name,
      wireframe: cat.wireframe,
      description: undefined,
      coreFeatures: [],
      extraFeatures: [],
      complexity: 2,
      isContent: false,
      yearlyCost: custom ? resolveItem(custom)?.currentYearly : undefined,
      userDescription: userDescription || undefined,
    }
  }, [id, params, selection.items])

  if (!subject) return <NotFound />
  const sub = getSubscription(id)

  return (
    <div>
      <nav className="mb-4 text-sm font-semibold text-ink-soft">
        <Link to="/remake" className="hover:text-ink">
          ✨ Remake with AI
        </Link>{' '}
        / {subject.name}
      </nav>
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <ToolTile name={subject.name} size={64} />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Remake <span className="hl">{subject.name}</span>
          </h1>
          <p className="mt-1 max-w-2xl text-ink-soft">
            {subject.remakeTarget ? `What you'd build: ${subject.remakeTarget}.` : subject.description ?? `Build your own version of ${subject.name}, with only the features you use.`}
          </p>
        </div>
        {sub && (
          <Link to={`/tool/${sub.id}`} className="btn-ghost ml-auto">
            See ready-made swaps
          </Link>
        )}
      </header>
      {!sub && !subject.userDescription && (
        <p className="mb-6 rounded-xl border-2 border-hilite bg-hilite/15 p-3 text-sm">
          Tip: describe what you use {subject.name} for and add 3–5 features below. The more specific you are, the better the AI builds.
        </p>
      )}
      <RemakeStudio key={subject.key} subject={subject} />
    </div>
  )
}
