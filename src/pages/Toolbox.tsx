import { useState } from 'react'
import { Link } from 'react-router-dom'
import { allApis } from '../lib/data'
import type { ApiCategory } from '../lib/schema'
import { Badge, PageHeader } from '../components/ui'
import Plain from '../components/Plain'

const CATEGORIES: { id: ApiCategory; emoji: string; label: string }[] = [
  { id: 'ai', emoji: '🤖', label: 'AI' },
  { id: 'email', emoji: '📧', label: 'Sending email' },
  { id: 'database', emoji: '🗄️', label: 'Saving data' },
  { id: 'login', emoji: '🔐', label: 'Logins' },
  { id: 'hosting', emoji: '🌐', label: 'Putting it online' },
  { id: 'payments', emoji: '💳', label: 'Payments' },
  { id: 'storage', emoji: '📁', label: 'File storage' },
  { id: 'speech', emoji: '🎙️', label: 'Speech to text' },
  { id: 'search', emoji: '🔎', label: 'Web search' },
  { id: 'maps', emoji: '🗺️', label: 'Maps' },
  { id: 'images', emoji: '🖼️', label: 'Photos' },
  { id: 'video', emoji: '🎥', label: 'Video calls' },
  { id: 'game-engine', emoji: '🎮', label: 'Game makers' },
  { id: 'game-art', emoji: '🎨', label: 'Game art' },
  { id: 'game-sound', emoji: '🔊', label: 'Game sounds' },
]

export default function Toolbox() {
  const [cat, setCat] = useState<ApiCategory | 'all' | 'free-forever' | 'games'>('all')
  const shown = allApis.filter((a) =>
    cat === 'all'
      ? true
      : cat === 'free-forever'
        ? a.runsLocally || a.paidFrom === 'Always free'
        : cat === 'games'
          ? a.category.startsWith('game-') || a.goodFor.includes('games')
          : a.category === cat,
  )

  return (
    <div>
      <PageHeader eyebrow="🧰 Toolbox" title={<>Free <span className="hl">building blocks</span> for your app</>}>
        When you build your own app, you don't have to make everything yourself. These services plug right in, like plugging a lamp into the wall. Most are free to start.
      </PageHeader>

      <section className="card mb-8 grid gap-4 p-5 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-extrabold">🔌 What's an API?</p>
          <p className="mt-1 text-sm text-ink-soft">A way for your app to use another service. Like a power outlet: you plug in, and it just works.</p>
        </div>
        <div>
          <p className="font-display text-lg font-extrabold">🔑 What's a key?</p>
          <p className="mt-1 text-sm text-ink-soft">A secret password a service gives you. Your app keeps it in a file called <code>.env</code>. Never share it.</p>
        </div>
        <div>
          <p className="font-display text-lg font-extrabold">🤖 Do I set these up?</p>
          <p className="mt-1 text-sm text-ink-soft">
            Your AI helper does the code. You just sign up and copy the key when it asks. The{' '}
            <Link to="/remake" className="font-bold text-money underline">
              Build your own
            </Link>{' '}
            studio picks the right ones for you.
          </p>
        </div>
      </section>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Kinds of services">
        {[{ id: 'all', emoji: '✨', label: 'All' }, { id: 'free-forever', emoji: '💚', label: 'Free forever' }, { id: 'games', emoji: '🕹️', label: 'For games' }, ...CATEGORIES.filter((c) => !c.id.startsWith('game-'))].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(c.id as typeof cat)}
            className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap ${cat === c.id ? 'border-ink bg-ink text-paper' : 'border-line bg-card hover:border-ink'}`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2" data-testid="api-list">
        {shown.map((a) => {
          const c = CATEGORIES.find((x) => x.id === a.category)!
          return (
            <article key={a.id} className="card flex flex-col p-5" data-testid={`api-${a.id}`}>
              <p className="text-xs font-bold text-money">
                {c.emoji} {c.label}
              </p>
              <h2 className="mt-1 flex flex-wrap items-center gap-2 font-display text-xl font-extrabold">
                {a.name}
                {a.runsLocally && <Badge className="bg-money-soft text-money-ink">💻 Runs on your computer</Badge>}
                {a.openSource && <Badge className="bg-paper-2 text-ink-soft">Open source</Badge>}
              </h2>
              <p className="mt-1 text-ink-soft">
                <Plain text={a.what} />
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-money-soft/60 p-2.5">
                  <dt className="text-xs font-bold text-money-ink">FREE</dt>
                  <dd>{a.freeTier}</dd>
                </div>
                <div className="rounded-xl bg-paper-2 p-2.5">
                  <dt className="text-xs font-bold text-ink-soft">AFTER THAT</dt>
                  <dd>{a.paidFrom}</dd>
                </div>
              </dl>
              {a.note && <p className="mt-2 text-xs text-ink-soft">ℹ️ {a.note}</p>}
              <details className="mt-3 flex-1 text-sm">
                <summary className="cursor-pointer font-bold">How to get started</summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {a.signupSteps.map((s) => (
                    <li key={s}>
                      <Plain text={s} />
                    </li>
                  ))}
                </ol>
                {a.envVars.length > 0 && (
                  <p className="mt-2 text-xs text-ink-soft">
                    Settings your app will need: {a.envVars.map((v) => <code key={v} className="mr-1 rounded bg-paper-2 px-1">{v.split('=')[0]}</code>)}
                  </p>
                )}
              </details>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={a.website} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
                  Website ↗
                </a>
                <a href={a.docsUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
                  Guide ↗
                </a>
              </div>
              <p className="mt-2 text-[11px] text-ink-soft">
                Checked {a.lastVerified}.{' '}
                <a href={a.sourceUrl} className="underline" target="_blank" rel="noreferrer">
                  Source
                </a>
                . Free plans change, so check before you rely on them.
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
