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
  { id: 'mac', label: 'A Mac from 2020 or newer', hint: 'Click the Apple menu → About This Mac. Look for "Chip" (M1, M2, M3…) and "Memory".' },
  { id: 'nvidia', label: 'A gaming PC (NVIDIA graphics card)', hint: 'Open Task Manager → Performance → GPU. Look for "Dedicated GPU memory".' },
  { id: 'cpu', label: 'A regular PC or laptop', hint: 'Most work and school laptops. Open Task Manager → Performance → Memory to see your RAM.' },
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
  comfortable: { label: '✅ Runs well', cls: 'bg-money-soft text-money-ink' },
  tight: { label: '😬 Just fits', cls: 'bg-hilite/40 text-ink' },
  'too-big': { label: '❌ Too big', cls: 'bg-paper-2 text-ink-soft' },
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
  const apps = ['lm-studio', 'jan', 'ollama-openwebui'].map((id) => getAlternative(id)!).filter(Boolean)

  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Free AI on your computer" title="Can your computer run its own ChatGPT?">
        Many computers can run a free AI that never leaves your device. Answer 2 questions and we'll tell you which AI fits, how to set it up, and if it's worth it.
      </PageHeader>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="card space-y-5 p-5">
          <fieldset>
            <legend className="label">What computer do you have?</legend>
            <div className="space-y-2">
              {MACHINES.map((m) => (
                <label key={m.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${machine === m.id ? 'border-ink bg-money-soft' : 'border-line'}`}>
                  <input type="radio" name="machine" className="mt-1 accent-[var(--money)]" checked={machine === m.id} onChange={() => setMachine(m.id)} />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-ink-soft">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">{machine === 'mac' ? 'Memory' : 'Memory (RAM)'}</span>
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
                <span className="label">Graphics card memory</span>
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
            <legend className="label">What do you use AI for?</legend>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map((u) => {
                const on = useCases.includes(u.id)
                return (
                  <label key={u.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${on ? 'border-ink bg-ink text-paper' : 'border-line'}`}>
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
            <p className="label">Your computer can run · about {rec.usableGB.toFixed(0)} GB free for AI</p>
            <h2 className="font-display text-2xl font-extrabold" data-testid="ai-tier">
              {rec.tier.label}
            </h2>
            <p className="mt-1 text-ink-soft">{rec.tier.verdict}</p>
            {rec.slow && (
              <p className="mt-3 rounded-xl border-2 border-hilite bg-hilite/15 p-3 text-sm">
                🐢 Without a dedicated GPU, models run on your processor. They work, but expect a few words per second. "MoE" models like Qwen3 30B feel much faster
                than their size suggests.
              </p>
            )}
          </div>

          {rec.best ? (
            <ModelCard model={rec.best} title="⭐ Start with this" />
          ) : (
            <div className="card p-5">
              <h3 className="font-semibold">Your computer is a bit too small for free AI</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Try the pay-as-you-go option below instead: no hardware needed, and usually cheaper than a subscription for light use.
              </p>
            </div>
          )}
          {rec.stretch && <ModelCard model={rec.stretch} title="🚀 Stretch pick (close other apps first)" />}

          {rec.byUseCase.filter((u) => u.model && u.model.id !== rec.best?.id).length > 0 && (
            <div className="card p-5">
              <p className="label">Best pick for each job</p>
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
        <h2 className="font-display text-xl font-extrabold">All the free AIs we know about</h2>
        <p className="mt-1 text-sm text-ink-soft">Sizes are approximate for the default 4-bit download. New models come out all the time, so check the Ollama library for the latest. Running
          any of these privately is fine; if you build a product on one, read its license (Llama and Gemma have their own usage rules).</p>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-ink-soft">
              <tr className="border-b-2 border-line">
                <th className="p-3">Model</th>
                <th className="p-3">Needs</th>
                <th className="p-3">Good for</th>
                <th className="p-3">License</th>
                <th className="p-3">On your machine</th>
              </tr>
            </thead>
            <tbody>
              {rec.fits.map(({ model, fit }) => (
                <tr key={model.id} className={`border-b border-line last:border-0 ${fit === 'too-big' ? 'opacity-50' : ''}`}>
                  <td className="p-3">
                    <span className="font-medium">{model.name}</span>
                    <code className="ml-2 text-xs text-ink-soft">{model.ollamaTag}</code>
                  </td>
                  <td className="p-3 tabular-nums">~{memoryNeededGB(model).toFixed(0)} GB</td>
                  <td className="p-3 text-ink-soft">{model.bestFor.join(', ')}</td>
                  <td className="p-3 text-xs text-ink-soft">{model.license}</td>
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
        <h2 className="font-display text-xl font-extrabold">Pick an app to run it (all free)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {apps.map((a, i) => (
            <div key={a.id} className="card flex flex-col p-5">
              <h3 className="font-semibold">
                {a.name} {i === 0 && <Badge className="ml-1 border-2 border-ink bg-hilite text-ink">Easiest: no commands</Badge>}
              </h3>
              <p className="mt-1 flex-1 text-sm text-ink-soft">{a.summary}</p>
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
        <h2 className="font-display text-xl font-extrabold">Is it worth it? Let's do the math</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">What you pay for AI each month</span>
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
            <span className="label">How often you need a really smart AI</span>
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
          <Option title="Keep paying" yearly={subMonthly * 12} tone="rose" note="The smartest AI, same price every month." />
          <Option title="Free AI only" yearly={0} tone="emerald" note="Free and private. How smart it is depends on your computer." />
          <Option title="Both: free + pay a little" yearly={apiMonthly * 12} tone="stone" note={`Free AI for everyday, pay a few cents for hard questions. About ${formatMoney(apiMonthly)}/mo.`} />
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Pay-as-you-go estimate assumes ~{API_ASSUMPTIONS.inputTokensPerMessage.toLocaleString()} input + {API_ASSUMPTIONS.outputTokensPerMessage} output tokens per message at $
          {API_ASSUMPTIONS.inputPricePerMillion}/${API_ASSUMPTIONS.outputPricePerMillion} per million tokens (a typical mid-to-top-tier API price), or about{' '}
          {formatMoney(costPerMessage())} per message. Long documents cost more. Always set a monthly spending limit with your API provider.
        </p>

        <div className="mt-6 border-t-2 border-line pt-5">
          <h3 className="font-semibold">Thinking about buying a new computer for this?</h3>
          <label className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            Upgrade cost $
            <input className="field w-28" type="number" min={0} value={upgradeCost || ''} placeholder="1200" onChange={(e) => setUpgradeCost(Math.max(0, Number(e.target.value) || 0))} aria-label="Upgrade cost" />
          </label>
          {upgradeCost > 0 && (
            <ul className="mt-3 space-y-1 text-sm" data-testid="break-even">
              <li>
                Going <strong>free AI only</strong>: pays for itself in <strong>{fmtMonths(breakEvenMonths(upgradeCost, subMonthly, 0))}</strong>.
              </li>
              <li>
                Going <strong>both</strong>: pays for itself in <strong>{fmtMonths(breakEvenMonths(upgradeCost, subMonthly, apiMonthly))}</strong>.
              </li>
              <li className="text-ink-soft">Honest tip: only buy a new computer if you need one anyway. A $2,000 computer to save $20 a month takes years to pay off.</li>
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold">🙏 The truth</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Free AI on your computer is private and costs nothing. But it's not as smart as the newest paid AIs, especially on smaller computers. Many people
            do best with both: free AI for everyday things, and paying a few cents only for the hard questions.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">🎨 Also paying for AI images?</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Free picture-making AI can run on your computer with ComfyUI (Windows/Mac/Linux) or Draw Things (Mac). You need a gaming PC with 8 GB+ of graphics memory, or a Mac with 16 GB+.{' '}
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
      <p className="mt-1 text-sm text-ink-soft">{model.notes}</p>
      <p className="mt-2 text-xs text-ink-soft">
        {model.paramsB}B parameters{model.activeParamsB ? ` (${model.activeParamsB}B active)` : ''} · ~{model.sizeGB} GB download · good for {model.bestFor.join(', ')} · license: {model.license}
      </p>
      <ol className="mt-3 space-y-1.5 rounded-xl bg-paper-2 p-3 text-sm">
        <li>
          1. Open <strong>LM Studio</strong> (free, see below) and click the 🔍 <strong>Discover</strong> button.
        </li>
        <li>
          2. Search for <strong>"{model.name}"</strong> and click <strong>Download</strong>.
        </li>
        <li>
          3. Click <strong>Chat</strong>, pick it at the top, and say hi. 👋
        </li>
      </ol>
      <div className="mt-2 flex items-center gap-2">
        <CopyButton text={model.name} label="Copy name to search" toast="Name copied. Paste it in LM Studio's search" />
      </div>
      <details className="mt-3 text-xs text-ink-soft">
        <summary className="cursor-pointer font-bold">For advanced users: Ollama command</summary>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-paper-2 px-3 py-2 text-sm text-ink">{cmd}</code>
          <CopyButton text={cmd} label="Copy command" />
        </div>
      </details>
    </div>
  )
}

function Option({ title, yearly, note, tone }: { title: string; yearly: number; note: string; tone: 'rose' | 'emerald' | 'stone' }) {
  const color = { rose: 'text-rent', emerald: 'text-money', stone: 'text-ink' }[tone]
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className={`font-display text-3xl font-extrabold ${color}`}>
        <Money value={yearly} />
        <span className="text-sm font-semibold">/yr</span>
      </p>
      <p className="mt-1 text-xs text-ink-soft">{note}</p>
    </div>
  )
}
