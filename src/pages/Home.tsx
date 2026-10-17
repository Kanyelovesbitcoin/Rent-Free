import { Link } from 'react-router-dom'
import { getAlternative, getCategory, getSubscription, subscriptions } from '../lib/data'
import { yearlyCost } from '../lib/savings'
import { Money } from '../components/ui'

const EXAMPLE_IDS = ['calendly', 'descript', 'chatgpt']

export default function Home() {
  const examples = EXAMPLE_IDS.map((id) => getSubscription(id)!).filter(Boolean)
  const exampleTotal = examples.reduce((t, s) => {
    const plan = s.plans.find((p) => p.id === s.defaultPlan)!
    return t + yearlyCost(plan, 'monthly')
  }, 0)

  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Free & open source · nothing to sign up for
          </p>
          <h1 className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
            Stop renting
            <br />
            your software.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-600 dark:text-stone-400">
            Pick the subscriptions you pay for. See what they really cost you per year, and how to replace them with free, open-source or local tools. If
            nothing good exists, get a build kit to make your own with AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/start" className="btn-primary px-6 py-3 text-base">
              Calculate my savings →
            </Link>
            <Link to="/local-ai" className="btn-ghost px-6 py-3 text-base">
              Replace ChatGPT with local AI
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <p className="label">Example: a typical creator stack</p>
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {examples.map((s) => {
              const plan = s.plans.find((p) => p.id === s.defaultPlan)!
              const alt = getAlternative(s.alternatives[0])!
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">
                      {s.name} <span className="font-normal text-stone-500">{plan.name}</span>
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">→ {alt.name}</p>
                  </div>
                  <div className="text-right">
                    <Money value={yearlyCost(plan, 'monthly')} className="font-semibold text-rose-600 line-through decoration-2 dark:text-rose-400" />
                    <p className="text-xs text-stone-500">per year</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/60">
            <p className="text-sm text-emerald-900 dark:text-emerald-200">You could keep</p>
            <p className="font-display text-4xl font-extrabold text-emerald-700 dark:text-emerald-300">
              <Money value={exampleTotal} />
              <span className="text-lg font-semibold">/yr</span>
            </p>
            <p className="mt-1 text-xs text-emerald-900/70 dark:text-emerald-200/70">Monthly billing, default plans. Prices checked {examples[0]?.lastVerified}.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['1', 'Pick what you pay for', 'Choose from the list or add anything custom. Prices are pre-filled, and you can edit them.'],
            ['2', 'See the real numbers', "What you pay per year vs. the open-source route, including hosting and setup time. We don't fudge \"free\"."],
            ['3', 'Switch, or build your own', 'Step-by-step guides for each swap, or a build prompt + wireframe to paste into Claude, ChatGPT or Lovable.'],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">{n}</span>
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold">Popular swaps</h2>
          <Link to="/contribute" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            Missing one? Add it →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((s) => (
            <Link key={s.id} to={`/tool/${s.id}`} className="card flex min-w-0 items-center gap-3 p-4 transition hover:border-emerald-400 dark:hover:border-emerald-700">
              <span className="text-2xl" aria-hidden>
                {getCategory(s.category).emoji}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{s.name}</p>
                <p className="truncate text-sm text-stone-500">→ {s.alternatives.map((a) => getAlternative(a)?.name).join(', ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
        <div className="sm:col-span-1">
          <h2 className="font-display text-2xl font-extrabold">What "free" really means here</h2>
        </div>
        <ul className="space-y-3 text-sm text-stone-600 sm:col-span-2 dark:text-stone-400">
          <li>
            <strong className="text-stone-900 dark:text-stone-100">Desktop apps and free tiers are $0.</strong> You trade a subscription for a download or a free account.
          </li>
          <li>
            <strong className="text-stone-900 dark:text-stone-100">Self-hosted apps need a small server</strong> (around $5–6/month). One server can run all of them, so we count it once.
          </li>
          <li>
            <strong className="text-stone-900 dark:text-stone-100">Your time counts too.</strong> Every swap shows a difficulty level and setup time.
          </li>
          <li>
            <strong className="text-stone-900 dark:text-stone-100">Local AI is private and free, but not magic.</strong> On most laptops it's a step below the newest paid models.
            We'll tell you what your computer can handle.
          </li>
        </ul>
      </section>
    </div>
  )
}
