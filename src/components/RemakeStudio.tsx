import { useMemo, useRef, useState } from 'react'
import { AGENTS, agentPrompt, type AgentId, type RemakeConfig, type Stack } from '../lib/agentPrompt'
import { hardParts, tierFor, TIERS, type Audience, type Platform, type RunsOn } from '../lib/complexity'
import { useRemakeConfig } from '../lib/remakeStore'
import { renderWireframe, type WireframeId } from '../lib/wireframes'
import { downloadNodeAsPng } from './SavingsCard'
import { Badge, CopyButton, Segmented, useToast } from './ui'

export interface RemakeSubject {
  key: string // storage key: subscription id or custom item id
  name: string
  categoryName: string
  wireframe: WireframeId
  description?: string
  coreFeatures: string[]
  extraFeatures: string[]
  complexity: 1 | 2 | 3 | 4
  remakeTarget?: string
  remakeNote?: string
  isContent: boolean
  yearlyCost?: number
  baseAlternative?: string
  userDescription?: string // custom entries: what the user typed when adding it
}

const AGENT_ORDER: AgentId[] = ['claude-code', 'codex', 'opencode', 'cursor', 'chat']
const TIER_ORDER = ['quick', 'standard', 'big', 'platform'] as const

export default function RemakeStudio({ subject }: { subject: RemakeSubject }) {
  const defaults: RemakeConfig = useMemo(
    () => ({
      appName: '',
      features: subject.coreFeatures,
      customFeatures: [],
      description: subject.userDescription ?? '',
      audience: 'me',
      runsOn: 'local',
      platform: 'web',
      stack: 'auto',
      style: '',
      localData: true,
    }),
    [subject],
  )
  const [config, setConfig, reset] = useRemakeConfig(subject.key, defaults)
  const [agent, setAgent] = useState<AgentId>('claude-code')
  const [newFeature, setNewFeature] = useState('')
  const notify = useToast()
  const frame = useRef<HTMLIFrameElement>(null)
  const set = (patch: Partial<RemakeConfig>) => setConfig((c) => ({ ...c, ...patch }))

  const allFeatures = [...config.features, ...config.customFeatures]
  const cxInput = { base: subject.complexity, features: allFeatures, audience: config.audience, runsOn: config.runsOn, platform: config.platform }
  const tier = tierFor(cxInput)
  const hard = hardParts(allFeatures)
  const prompt = agentPrompt({
    inspiredBy: subject.name,
    categoryName: subject.categoryName,
    description: subject.description,
    remakeTarget: subject.remakeTarget,
    remakeNote: subject.remakeNote,
    isContent: subject.isContent,
    yearlyCost: subject.yearlyCost,
    baseAlternative: subject.baseAlternative,
    config,
    tier,
    agent,
  })
  const wireframeHtml = useMemo(() => renderWireframe(subject.wireframe, config.appName || 'Your app'), [subject.wireframe, config.appName])
  const options = [...subject.coreFeatures, ...subject.extraFeatures.filter((f) => !subject.coreFeatures.includes(f))]
  const toggle = (f: string) => set({ features: config.features.includes(f) ? config.features.filter((x) => x !== f) : [...options.filter((o) => o === f || config.features.includes(o))] })
  const addFeature = () => {
    const f = newFeature.trim()
    if (!f) return
    set({ customFeatures: [...config.customFeatures, f.slice(0, 200)] })
    setNewFeature('')
  }
  const download = () => {
    const blob = new Blob([prompt], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `remake-${subject.key}-${agent}.md`
    a.click()
    URL.revokeObjectURL(a.href)
    notify('Prompt downloaded')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]" data-testid="remake-studio">
      {/* ---------- customize ---------- */}
      <div className="card space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-extrabold">1. Make it yours</h3>
          <button type="button" className="text-xs font-bold text-ink-soft underline" onClick={reset}>
            Reset
          </button>
        </div>
        <label className="block">
          <span className="label">App name</span>
          <input className="field" value={config.appName} placeholder="Leave blank and the agent will suggest names" onChange={(e) => set({ appName: e.target.value.slice(0, 40) })} />
        </label>

        <fieldset>
          <legend className="label">Features you want</legend>
          <div className="space-y-1.5">
            {options.map((f) => (
              <label key={f} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 text-sm hover:bg-paper-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--money)]" checked={config.features.includes(f)} onChange={() => toggle(f)} />
                <span>
                  {f}
                  {!subject.coreFeatures.includes(f) && <Badge className="ml-1.5 bg-paper-2 text-ink-soft">extra</Badge>}
                </span>
              </label>
            ))}
            {config.customFeatures.map((f, i) => (
              <div key={f + i} className="flex items-start gap-2.5 rounded-lg bg-hilite/25 p-1.5 text-sm">
                <span aria-hidden>✨</span>
                <span className="flex-1">{f}</span>
                <button type="button" aria-label={`Remove ${f}`} className="text-ink-soft hover:text-rent" onClick={() => set({ customFeatures: config.customFeatures.filter((_, j) => j !== i) })}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="field"
              placeholder="Add your own feature…"
              aria-label="Add your own feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button type="button" className="btn-ghost px-3" onClick={addFeature}>
              Add
            </button>
          </div>
        </fieldset>

        <label className="block">
          <span className="label">Describe it in your own words</span>
          <textarea
            className="field h-24 resize-y"
            placeholder={`What do you actually use ${subject.name} for? Anything you wish it did differently?`}
            value={config.description}
            onChange={(e) => set({ description: e.target.value.slice(0, 1500) })}
          />
        </label>

        <div className="space-y-3">
          <div>
            <span className="label">Who uses it</span>
            <Segmented<Audience> label="Who uses it" value={config.audience} onChange={(audience) => set({ audience })} options={[{ value: 'me', label: 'Just me' }, { value: 'family', label: 'Family' }, { value: 'team', label: 'Team / clients' }]} />
          </div>
          <div>
            <span className="label">Where it runs</span>
            <Segmented<RunsOn> label="Where it runs" value={config.runsOn} onChange={(runsOn) => set({ runsOn })} options={[{ value: 'local', label: 'My computer' }, { value: 'free-cloud', label: 'Free cloud' }, { value: 'own-server', label: 'My server' }]} />
          </div>
          <div>
            <span className="label">Platform</span>
            <Segmented<Platform> label="Platform" value={config.platform} onChange={(platform) => set({ platform })} options={[{ value: 'web', label: 'Web' }, { value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Phone-first' }]} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">Tech stack</span>
            <select className="field" value={config.stack} onChange={(e) => set({ stack: e.target.value as Stack })}>
              <option value="auto">Let the agent choose</option>
              <option value="nextjs">Next.js + TypeScript</option>
              <option value="simple">Plain HTML/JS</option>
              <option value="python">Python + FastAPI</option>
            </select>
          </label>
          <label className="block">
            <span className="label">Look & feel</span>
            <input className="field" placeholder="e.g. dark, playful, minimal" value={config.style} onChange={(e) => set({ style: e.target.value.slice(0, 120) })} />
          </label>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4 accent-[var(--money)]" checked={config.localData} onChange={(e) => set({ localData: e.target.checked })} />
          Keep my data private (no tracking or third-party analytics)
        </label>
      </div>

      {/* ---------- output ---------- */}
      <div className="min-w-0 space-y-5">
        <div className="card p-5" data-testid="effort">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label">2. How big is this build?</p>
              <p className="font-display text-2xl font-extrabold" data-testid="tier">
                {tier.label}
              </p>
              <p className="text-sm text-ink-soft">
                {tier.effort} · {tier.summary}
              </p>
            </div>
            <div className="flex gap-1" aria-hidden>
              {TIER_ORDER.map((t, i) => (
                <span key={t} className={`h-8 w-3 rounded-full border-2 border-ink ${i <= TIER_ORDER.indexOf(tier.id) ? (tier.id === 'platform' ? 'bg-rent' : tier.id === 'big' ? 'bg-hilite' : 'bg-money') : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
          {hard.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-ink-soft">Tricky parts:</span>
              {hard.map((h) => (
                <Badge key={h} className="bg-paper-2 text-ink">
                  {h}
                </Badge>
              ))}
            </p>
          )}
          {subject.remakeNote && <p className="mt-3 rounded-xl border-2 border-hilite bg-hilite/15 p-3 text-sm">⚠️ {subject.remakeNote}</p>}
          <p className="mt-3 text-xs text-ink-soft">
            The bigger the build, the more structure the prompt asks for: {TIERS.quick.label.toLowerCase()}s build in one go; big builds get a spec, a plan, tests and a review stop after every milestone.
          </p>
        </div>

        <div className="card p-5">
          <p className="label">3. Pick your AI coding tool</p>
          <div role="tablist" aria-label="Coding agent" className="flex flex-wrap gap-1.5">
            {AGENT_ORDER.map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={agent === id}
                type="button"
                onClick={() => setAgent(id)}
                className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition ${agent === id ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'}`}
              >
                {AGENTS[id].name}
              </button>
            ))}
          </div>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            {AGENTS[agent].howToRun.map((s) => (
              <li key={s} dangerouslySetInnerHTML={{ __html: s.replace(/`([^`]+)`/g, '<code class="rounded bg-paper-2 px-1 py-0.5 font-mono text-ink text-xs">$1</code>') }} />
            ))}
          </ol>
          <textarea readOnly value={prompt} aria-label="Agent prompt" className="field mt-4 h-96 resize-y font-mono text-xs leading-relaxed" data-testid="agent-prompt" />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={prompt} label={`Copy ${AGENTS[agent].name} prompt`} toast="Prompt copied. Paste it into your agent" className="btn-primary" />
            <button type="button" className="btn-ghost" onClick={download}>
              ⬇ Download .md
            </button>
          </div>
        </div>

        <details className="card p-5">
          <summary className="cursor-pointer font-display text-lg font-extrabold">4. Attach a wireframe (optional)</summary>
          <p className="mt-1 text-sm text-ink-soft">A gray-box layout so the AI knows what you picture. Download the image and drop it into your agent with the prompt.</p>
          <iframe ref={frame} title="Wireframe preview" srcDoc={wireframeHtml} sandbox="allow-same-origin" className="mt-3 h-80 w-full rounded-xl border-2 border-line bg-white" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={async () => {
                const body = frame.current?.contentDocument?.body
                if (body) await downloadNodeAsPng(body, 'wireframe.png')
              }}
            >
              ⬇ Download PNG
            </button>
            <CopyButton text={wireframeHtml} label="Copy HTML" />
          </div>
        </details>
      </div>
    </div>
  )
}
