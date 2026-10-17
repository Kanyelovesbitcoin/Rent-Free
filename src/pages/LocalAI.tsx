import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allLocalModels, getAlternative } from '../lib/data'
import {
  API_ASSUMPTIONS,
  USAGE_LEVELS,
  apiMonthlyCost,
  breakEvenMonths,
  costPerMessage,
  memoryNeededGB,
  recommend,
  type Fit,
  type Machine,
  type UsageLevel,
  type UseCase,
} from '../lib/hardware'
import { formatMoney } from '../lib/savings'
import type { LocalModel } from '../lib/schema'
import { AltMeta, Badge, CopyButton, Money, PageHeader } from '../components/ui'

const MACHINES: { id: Machine; label: string; hint: string }[] = [
  { id: 'mac', label: 'Mac with Apple Silicon', hint: 'M1, M2, M3, M4… Apple menu → About This Mac shows "Chip" and "Memory".' },
  { id: 'nvidia', label: 'PC with an NVIDIA graphics card', hint: 'Windows: Task Manager → Performance → GPU shows "Dedicated GPU memory".' },
  { id: 'cpu', label: 'PC / laptop without a gaming GPU', hint: 'Most office laptops and Intel/AMD integrated graphics. Task Manager → Performance → Memory.' },
]
const RAM = [8, 16, 18, 24, 32, 36, 48, 64, 96, 128]
const VRAM = [4, 6, 8, 10, 12, 16, 20, 24, 32, 48]
const USE_CASES: { id: UseCase; label: string }[] = [
  { id: 'chat', label: 'Everyday questions' },
  { id: 'writing', label: 'Writing & emails' },
  { id: 'coding', label: 'Coding' },
  { id: 'reasoning', label: 'Planning & reasoning' },
]
const FIT_BADGE: Record<Fit, { label: string; cls: string }> = {
  comfortable: { label: 'Runs well', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' },
  tight: { label: 'Tight fit', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' },
  'too-big': { label: 'Too big', cls: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400' },
}

export default function LocalAI() {
  const [machine, setMachine] = useState<Machine>('mac')
  const [ramGB, setRam] = useState(16)
  const [vramGB, setVram] = useState(8)
  const [useCases, setUseCases] = useState<UseCase[]>(['chat', 'writing'])
  const [subMonthly, setSubMonthly] = useState(20)
  const [usage, setUsage] = useState<UsageLevel>('medium')
  const [upgradeCost, setUpgradeCost] = useState(0)

  const rec = useMemo(() => recommend({ machine, ramGB, vramGB, useCases }, allLocalModels), [machine, ramGB, vramGB, useCases])
  const apiMonthly = apiMonthlyCost(usage)
  const apps = ['lm-studio', 'ollama-openwebui', 'jan'].map((id) => getAlternative(id)!).filter(Boolean)

  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Local AI advisor" title="Can your computer replace ChatGPT or Claude?">
        Tell us what you're working with. We'll suggest models that actually fit, the easiest app to run them in, and whether it's worth it money-wise.
      </PageHeader>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="card space-y-5 p-5">
          <fieldset>
            <legend className="label">Your computer</legend>
            <div className="space-y-2">
              {MACHINES.map((m) => (
                <label key={m.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${machine === m.id ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40' : 'border-stone-200 dark:border-stone-700'}`}>
                  <input type="radio" name="machine" className="mt-1 accent-emerald-600" checked={machine === m.id} onChange={() => setMachine(m.id)} />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-stone-500">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">{machine === 'mac' ? 'Memory (unified)' : 'System RAM'}</span>
              <select className="field" value={ramGB} onChange={(e) => setRam(Number(e.target.value))} aria-label="RAM in GB">
                {RAM.map((r) => (
                  <option key={r} value={r}>
                    {r} GB
                  </option>
                ))}
              </select>
            </label>
            {machine === 'nvidia' && (
              <label>
                <span className="label">GPU memory (VRAM)</span>
                <select className="field" value={vramGB} onChange={(e) => setVram(Number(e.target.value))} aria-label="VRAM in GB">
                  {VRAM.map((r) => (
                    <option key={r} value={r}>
                      {r} GB
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <fieldset>
            <legend className="label">What you use AI for</legend>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map((u) => {
                const on = useCases.includes(u.id)
                return (
                  <label key={u.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 dark:border-stone-700'}`}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => setUseCases(on ? useCases.filter((x) => x !== u.id) : [...useCases, u.id])} />
                    {u.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        <div className="space-y-4" data-testid="ai-recommendation">
          <div className="card p-5">
            <p className="label">Your tier · about {rec.usableGB.toFixed(0)} GB usable for AI</p>
            <h2 className="font-display text-2xl font-extrabold" data-testid="ai-tier">
              {rec.tier.label}
            </h2>
            <p className="mt-1 text-stone-600 dark:text-stone-400">{rec.tier.verdict}</p>
            {rec.slow && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                🐢 Without a dedicated GPU, models run on your processor. They work, but expect a few words per second. "MoE" models like Qwen3 30B feel much faster
                than their size suggests.
              </p>
            )}
          </div>

          {rec.best ? (
            <ModelCard model={rec.best} title="⭐ Start with this" />
          ) : (
            <div className="card p-5">
              <h3 className="font-semibold">Your machine is below the smallest model we list</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Try the pay-as-you-go option below instead: no hardware needed, and usually cheaper than a subscription for light use.
              </p>
            </div>
          )}
          {rec.stretch && <ModelCard model={rec.stretch} title="🚀 Stretch pick (close other apps first)" />}

          {rec.byUseCase.filter((u) => u.model && u.model.id !== rec.best?.id).length > 0 && (
            <div className="card p-5">
              <p className="label">Best fit by task</p>
              <ul className="space-y-1 text-sm">
                {rec.byUseCase.map((u) => (
                  <li key={u.useCase}>
                    <strong>{USE_CASES.find((x) => x.id === u.useCase)?.label}:</strong> {u.model ? `${u.model.name} (${u.model.ollamaTag})` : 'nothing fits comfortably'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold">Every model we track</h2>
        <p className="mt-1 text-sm text-stone-500">Sizes are approximate for the default 4-bit download. New models come out all the time, so check the Ollama library for the latest.</p>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-stone-500">
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="p-3">Model</th>
                <th className="p-3">Needs</th>
                <th className="p-3">Good for</th>
                <th className="p-3">On your machine</th>
              </tr>
            </thead>
            <tbody>
              {rec.fits.map(({ model, fit }) => (
                <tr key={model.id} className={`border-b border-stone-100 last:border-0 dark:border-stone-800 ${fit === 'too-big' ? 'opacity-50' : ''}`}>
                  <td className="p-3">
                    <span className="font-medium">{model.name}</span>
                    <code className="ml-2 text-xs text-stone-500">{model.ollamaTag}</code>
                  </td>
                  <td className="p-3 tabular-nums">~{memoryNeededGB(model).toFixed(0)} GB</td>
                  <td className="p-3 text-stone-600 dark:text-stone-400">{model.bestFor.join(', ')}</td>
                  <td className="p-3">
                    <Badge className={FIT_BADGE[fit].cls}>{FIT_BADGE[fit].label}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold">Pick an app to run it</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {apps.map((a, i) => (
            <div key={a.id} className="card flex flex-col p-5">
              <h3 className="font-semibold">
                {a.name} {i === 0 && <Badge className="ml-1 bg-emerald-600 text-white">Easiest</Badge>}
              </h3>
              <p className="mt-1 flex-1 text-sm text-stone-600 dark:text-stone-400">{a.summary}</p>
              <div className="mt-3">
                <AltMeta alt={a} />
              </div>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold">Setup steps</summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {a.setupSteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-xl font-extrabold">Is it worth it? The money math</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Your AI subscription(s) per month</span>
            <div className="flex flex-wrap gap-2">
              <input className="field w-28" type="number" min={0} value={subMonthly} onChange={(e) => setSubMonthly(Math.max(0, Number(e.target.value) || 0))} aria-label="Subscription per month" />
              {[20, 40, 100, 200].map((v) => (
                <button key={v} type="button" className="btn-ghost px-3 py-1.5" onClick={() => setSubMonthly(v)}>
                  ${v}
                </button>
              ))}
            </div>
          </label>
          <label>
            <span className="label">How often you'd need a top-tier model</span>
            <select className="field" value={usage} onChange={(e) => setUsage(e.target.value as UsageLevel)}>
              {Object.entries(USAGE_LEVELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Option title="Keep subscribing" yearly={subMonthly * 12} tone="rose" note="Best models, flat price." />
          <Option title="Local only" yearly={0} tone="emerald" note="Free and private. Quality depends on your machine." />
          <Option title="Hybrid: local + pay-as-you-go" yearly={apiMonthly * 12} tone="stone" note={`Local for everyday use, API for hard tasks. ~${formatMoney(apiMonthly)}/mo.`} />
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Pay-as-you-go estimate assumes ~{API_ASSUMPTIONS.inputTokensPerMessage.toLocaleString()} input + {API_ASSUMPTIONS.outputTokensPerMessage} output tokens per message at $
          {API_ASSUMPTIONS.inputPricePerMillion}/${API_ASSUMPTIONS.outputPricePerMillion} per million tokens (a typical mid-to-top-tier API price), or about{' '}
          {formatMoney(costPerMessage())} per message. Long documents cost more. Always set a monthly spending limit with your API provider.
        </p>

        <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
          <h3 className="font-semibold">Thinking about buying more RAM or a new computer for this?</h3>
          <label className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            Upgrade cost $
            <input className="field w-28" type="number" min={0} value={upgradeCost || ''} placeholder="1200" onChange={(e) => setUpgradeCost(Math.max(0, Number(e.target.value) || 0))} aria-label="Upgrade cost" />
          </label>
          {upgradeCost > 0 && (
            <ul className="mt-3 space-y-1 text-sm" data-testid="break-even">
              <li>
                Going <strong>local only</strong>: pays for itself in <strong>{fmtMonths(breakEvenMonths(upgradeCost, subMonthly, 0))}</strong>.
              </li>
              <li>
                Going <strong>hybrid</strong>: pays for itself in <strong>{fmtMonths(breakEvenMonths(upgradeCost, subMonthly, apiMonthly))}</strong>.
              </li>
              <li className="text-stone-500">Honest take: buy hardware for privacy or because you need it anyway. Saving money alone rarely justifies a $2,000+ machine for a $20/mo plan.</li>
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold">🙏 The honest part</h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Local models are private and free to run, but expect them to be a step below the newest paid models, especially on 8–16 GB machines. Most
            people get the best deal with the hybrid setup: free local AI for the daily stuff, pay-per-use for the hard 10%.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">🎨 Also paying for AI images?</h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Open image models run locally with ComfyUI (Windows/Linux/Mac) or Draw Things (Mac). Plan on an NVIDIA card with 8 GB+ VRAM or a Mac with 16 GB+.{' '}
            <Link to="/contribute" className="underline">
              Help us add a full guide
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}

const fmtMonths = (m: number | null) => (m == null ? 'never (no monthly saving)' : m <= 12 ? `${m} month${m === 1 ? '' : 's'}` : `${(m / 12).toFixed(1)} years`)

function ModelCard({ model, title }: { model: LocalModel; title: string }) {
  const cmd = `ollama run ${model.ollamaTag}`
  return (
    <div className="card p-5" data-testid="model-card">
      <p className="label">{title}</p>
      <h3 className="text-xl font-bold">{model.name}</h3>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{model.notes}</p>
      <p className="mt-2 text-xs text-stone-500">
        {model.paramsB}B parameters{model.activeParamsB ? ` (${model.activeParamsB}B active)` : ''} · ~{model.sizeGB} GB download · good for {model.bestFor.join(', ')}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-stone-100 px-3 py-2 text-sm dark:bg-stone-800">{cmd}</code>
        <CopyButton text={cmd} label="Copy command" />
      </div>
      <p className="mt-2 text-xs text-stone-500">In LM Studio or Jan, search for "{model.name}" instead.</p>
    </div>
  )
}

function Option({ title, yearly, note, tone }: { title: string; yearly: number; note: string; tone: 'rose' | 'emerald' | 'stone' }) {
  const color = { rose: 'text-rose-600 dark:text-rose-400', emerald: 'text-emerald-600 dark:text-emerald-400', stone: 'text-stone-900 dark:text-stone-100' }[tone]
  return (
    <div className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
      <p className="text-sm font-semibold">{title}</p>
      <p className={`font-display text-3xl font-extrabold ${color}`}>
        <Money value={yearly} />
        <span className="text-sm font-semibold">/yr</span>
      </p>
      <p className="mt-1 text-xs text-stone-500">{note}</p>
    </div>
  )
}
