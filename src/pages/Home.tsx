import { Link, useNavigate } from 'react-router-dom'
import { byPopularity, getAlternative, getSubscription, STARTER_STACKS, fromMonthly } from '../lib/data'
import { newCatalogItem, resolveItem } from '../lib/selection'
import { formatMoney, summarize } from '../lib/savings'
import { useSelection } from '../state'
import { CountUp, Money, ToolTile } from '../components/ui'

export default function Home() {
  const navigate = useNavigate()
  const { selection, setSelection } = useSelection()

  const household = STARTER_STACKS[0]
  const demoItems = household.ids.map((id) => resolveItem(newCatalogItem(getSubscription(id)!))!)
  const demo = summarize(demoItems.map((r) => ({ key: r.key, currentYearly: r.currentYearly, alternative: r.alternative })))

  const loadStack = (ids: string[]) => {
    const existing = new Set(selection.items.map((i) => i.id))
    const items = [...selection.items, ...ids.filter((id) => !existing.has(id)).map((id) => newCatalogItem(getSubscription(id)!))]
    setSelection({ ...selection, items })
    navigate('/results')
  }

  return (
    <div className="space-y-24">
      {/* hero */}
      <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="animate-rise">
          <p className="pop mb-5 inline-flex -rotate-1 rounded-full bg-hilite px-3 py-1 text-sm font-bold text-ink">Free · open source · no sign-up</p>
          <h1 className="font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-7xl">
            Stop paying <span className="hl">rent</span> on your software.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            See what your subscriptions really cost per year, swap them for free and open-source tools, or remake them yourself with an AI coding agent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/start" className="btn-primary px-6 py-3.5 text-base">
              Calculate my savings →
            </Link>
            <Link to="/remake" className="btn-ghost px-6 py-3.5 text-base">
              ✨ Remake an app with AI
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Covers the {byPopularity.length} subscriptions people pay for most, plus anything you add yourself.</p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-1 -z-10 rotate-3 rounded-3xl bg-money/20 sm:-inset-3" aria-hidden />
          <div className="receipt pop rotate-[-1.5deg] rounded-sm px-6" data-testid="hero-receipt">
            <p className="text-center font-mono text-xs tracking-[0.3em] text-ink-soft uppercase">*** Monthly rent ***</p>
            <p className="mt-1 text-center font-display text-lg font-extrabold">{household.name}</p>
            <ul className="mt-4 space-y-2 border-y-2 border-dashed border-line py-3 font-mono text-sm">
              {demoItems.map((r) => (
                <li key={r.key} className="flex items-center justify-between gap-3">
                  <span className="truncate">{r.name}</span>
                  <span className="text-rent">{formatMoney(r.currentYearly)}/yr</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between font-mono text-sm">
              <span>TOTAL</span>
              <Money value={demo.currentYearly} className="text-rent line-through decoration-2" />
            </div>
            <div className="mt-4 rounded-xl border-2 border-ink bg-money-soft p-4 text-center">
              <p className="text-sm font-bold text-money-ink">You could keep</p>
              <p className="font-display text-5xl font-extrabold text-money">
                <CountUp value={demo.savingsYearly} />
                <span className="text-lg">/yr</span>
              </p>
            </div>
            <p className="mt-3 text-center font-mono text-[10px] text-ink-soft">Estimate · default plans · rotate streaming 3 mo/yr</p>
          </div>
        </div>
      </section>

      {/* starter stacks */}
      <section>
        <h2 className="font-display text-3xl font-extrabold">Start from a typical stack</h2>
        <p className="mt-1 text-ink-soft">One click loads it. You can edit everything after.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STARTER_STACKS.map((s) => (
            <button key={s.id} type="button" onClick={() => loadStack(s.ids)} className="card group p-5 text-left transition hover:-translate-y-1 hover:border-ink" data-testid={`stack-${s.id}`}>
              <span className="text-3xl" aria-hidden>
                {s.emoji}
              </span>
              <span className="mt-2 block font-display text-xl font-extrabold">{s.name}</span>
              <span className="mt-1 block text-sm text-ink-soft">{s.blurb}</span>
              <span className="mt-4 flex -space-x-2">
                {s.ids.map((id) => (
                  <ToolTile key={id} name={getSubscription(id)!.name} size={32} />
                ))}
              </span>
              <span className="mt-4 inline-block font-bold text-money group-hover:underline">Load this stack →</span>
            </button>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section>
        <h2 className="font-display text-3xl font-extrabold">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Pick what you pay for', 'Tap the tools you subscribe to. Prices are pre-filled and editable, or add anything custom.'],
            ['See the real numbers', 'Yearly cost vs. the free route, including server costs and setup time. No fudging "free".'],
            ['Switch or remake', 'Follow a step-by-step swap guide, or copy a prompt that lets an AI coding agent build your own version.'],
          ].map(([t, d], i) => (
            <li key={t} className="card relative overflow-hidden p-6">
              <span className="absolute -top-4 -right-1 font-display text-8xl font-extrabold text-paper-2" aria-hidden>
                {i + 1}
              </span>
              <h3 className="relative font-display text-lg font-extrabold">{t}</h3>
              <p className="relative mt-2 text-sm text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* most popular */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-extrabold">What most people pay for</h2>
            <p className="mt-1 text-ink-soft">Tap any of them to see the swaps and the remake prompt.</p>
          </div>
          <Link to="/start" className="font-bold text-money hover:underline">
            See all {byPopularity.length} →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {byPopularity.slice(0, 12).map((s) => {
            const alt = getAlternative(s.alternatives[0])
            return (
              <Link key={s.id} to={`/tool/${s.id}`} className="card flex min-w-0 items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:border-ink">
                <ToolTile name={s.name} size={40} />
                <span className="min-w-0">
                  <span className="block truncate font-bold">{s.name}</span>
                  <span className="block truncate text-xs text-ink-soft">
                    from <span className="money text-rent">{formatMoney(fromMonthly(s))}/mo</span> → {alt?.name}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* remake teaser */}
      <section className="pop grid gap-8 rounded-3xl bg-ink p-8 text-paper md:grid-cols-2 md:p-10">
        <div>
          <p className="font-bold text-hilite">✨ New: Remake with AI</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">No good swap? Build your own in an afternoon.</h2>
          <p className="mt-3 text-paper/80">
            Tick the features you actually use, then copy a prompt made for Claude Code, Codex or OpenCode. Simple apps get a one-shot build; bigger ones get a
            spec, a milestone plan and tests.
          </p>
          <Link to="/remake" className="btn mt-6 border-2 border-paper bg-hilite text-ink">
            Try the Remake studio →
          </Link>
        </div>
        <pre className="overflow-hidden rounded-2xl border-2 border-paper/20 bg-black/40 p-4 font-mono text-xs leading-relaxed text-paper/90" aria-hidden>
          {`# Build "Booky": my own scheduling app

## Must-have features (MVP)
1. Public booking page with your slots
2. Syncs with Google Calendar
3. Email confirmations and reminders

## How to work (Standard build)
1. Write a short plan, wait for my OK
2. Create CLAUDE.md …`}
        </pre>
      </section>

      {/* honesty */}
      <section className="grid gap-6 md:grid-cols-3">
        <h2 className="font-display text-3xl font-extrabold md:col-span-1">What "free" really means here</h2>
        <ul className="space-y-3 text-ink-soft md:col-span-2">
          <li>
            <strong className="text-ink">Desktop apps and free tiers are $0.</strong> You trade a subscription for a download or a free account.
          </li>
          <li>
            <strong className="text-ink">Self-hosted apps need a small server</strong> (around $5–6/month). One server runs all of them, so we count it once.
          </li>
          <li>
            <strong className="text-ink">You can't open-source Netflix's movies.</strong> For streaming and memberships we show honest moves: rotate services, use your library card, or
            run a media server for what you own.
          </li>
          <li>
            <strong className="text-ink">Your time counts.</strong> Every swap shows difficulty and setup time, and every remake shows how big the build is.
          </li>
        </ul>
      </section>
    </div>
  )
}
