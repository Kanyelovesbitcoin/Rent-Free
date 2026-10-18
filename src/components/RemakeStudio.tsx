import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { AGENTS, agentPrompt, type AgentId, type RemakeConfig, type Stack } from '../lib/agentPrompt'
import { selectedApis, suggestApis } from '../lib/apiSuggest'
import { allApis } from '../lib/data'
import { downloadFile } from '../lib/ics'
import { starterKitZip } from '../lib/starterKit'
import { hardParts, tierFor, type Audience, type Platform, type RunsOn } from '../lib/complexity'
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
  categoryId?: string
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
      apiOff: [],
      apiExtra: [],
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
  const suggestions = suggestApis({ features: allFeatures, categoryId: subject.categoryId, audience: config.audience, runsOn: config.runsOn })
  const apis = selectedApis(suggestions, config.apiOff ?? [], config.apiExtra ?? [], allApis)
  const [kitBusy, setKitBusy] = useState(false)
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
    apis,
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
  const toggleApi = (id: string, suggested: boolean) => {
    const off = config.apiOff ?? []
    const extra = config.apiExtra ?? []
    const on = apis.some((a) => a.id === id)
    if (suggested) set({ apiOff: on ? [...off, id] : off.filter((x) => x !== id) })
    else set({ apiExtra: on ? extra.filter((x) => x !== id) : [...extra, id] })
  }
  const downloadKit = async () => {
    setKitBusy(true)
    try {
      let png: Uint8Array | undefined
      const body = frame.current?.offsetParent ? frame.current.contentDocument?.body : null
      if (body) {
        try {
          const dataUrl = await toPng(body, { pixelRatio: 2 })
          png = Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0))
        } catch {
          // The sketch is optional; the HTML version is always included.
        }
      }
      const slug = subject.key.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
      const zip = starterKitZip({ slug, name: subject.name, prompt, agent, apis, wireframeHtml, wireframePng: png })
      downloadFile(zip, `rent-free-starter-${slug}.zip`, 'application/zip')
      notify('Starter kit downloaded. Unzip it and open the folder in your AI helper')
    } finally {
      setKitBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]" data-testid="remake-studio">
      {/* ---------- customize ---------- */}
      <div className="card space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-extrabold">1. Pick what you want</h3>
          <button type="button" className="text-xs font-bold text-ink-soft underline" onClick={reset}>
            Reset
          </button>
        </div>
        <fieldset>
          <legend className="label">Features (tick the ones you use)</legend>
          <div className="space-y-1.5">
            {options.map((f) => (
              <label key={f} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 text-sm hover:bg-paper-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--money)]" checked={config.features.includes(f)} onChange={() => toggle(f)} />
                <span>
                  {f}
                  {!subject.coreFeatures.includes(f) && <Badge className="ml-1.5 bg-paper-2 text-ink-soft">bonus</Badge>}
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
              placeholder="Something else you want…"
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
          <span className="label">Tell the AI about it (optional)</span>
          <textarea
            className="field h-24 resize-y"
            placeholder={`What do you use ${subject.name} for? What do you wish it did better?`}
            value={config.description}
            onChange={(e) => set({ description: e.target.value.slice(0, 1500) })}
          />
        </label>

        <div className="space-y-3">
          <div>
            <span className="label">Who will use it?</span>
            <Segmented<Audience> label="Who will use it?" value={config.audience} onChange={(audience) => set({ audience })} options={[{ value: 'me', label: 'Just me' }, { value: 'family', label: 'My family' }, { value: 'team', label: 'My team' }]} />
          </div>
          <div>
            <span className="label">Where will you use it most?</span>
            <Segmented<Platform> label="Where will you use it most?" value={config.platform} onChange={(platform) => set({ platform })} options={[{ value: 'web', label: 'Web browser' }, { value: 'desktop', label: 'Computer app' }, { value: 'mobile', label: 'Phone' }]} />
          </div>
        </div>

        <details className="rounded-xl border-2 border-line p-3">
          <summary className="cursor-pointer text-sm font-bold">More options (you can skip these)</summary>
          <div className="mt-3 space-y-3">
        <label className="block">
          <span className="label">App name</span>
          <input className="field" value={config.appName} placeholder="Leave blank and the AI will suggest names" onChange={(e) => set({ appName: e.target.value.slice(0, 40) })} />
        </label>
        <div>
          <span className="label">Where should the app live?</span>
          <Segmented<RunsOn> label="Where should the app live?" value={config.runsOn} onChange={(runsOn) => set({ runsOn })} options={[{ value: 'local', label: 'My computer' }, { value: 'free-cloud', label: 'Free website' }, { value: 'own-server', label: 'My own server' }]} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">Code tools</span>
            <select className="field" value={config.stack} onChange={(e) => set({ stack: e.target.value as Stack })}>
              <option value="auto">Let the AI choose (best)</option>
              <option value="nextjs">Next.js + TypeScript</option>
              <option value="simple">Plain HTML/JS</option>
              <option value="python">Python + FastAPI</option>
            </select>
          </label>
          <label className="block">
            <span className="label">Look & feel</span>
            <input className="field" placeholder="e.g. dark, fun, simple" value={config.style} onChange={(e) => set({ style: e.target.value.slice(0, 120) })} />
          </label>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4 accent-[var(--money)]" checked={config.localData} onChange={(e) => set({ localData: e.target.checked })} />
          Keep my data private (no tracking)
        </label>
          </div>
        </details>
      </div>

      {/* ---------- output ---------- */}
      <div className="min-w-0 space-y-5">
        <div className="card p-5" data-testid="effort">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label">2. How big is this job?</p>
              <p className="font-display text-2xl font-extrabold" data-testid="tier">
                {tier.emoji} {tier.label}, {tier.likeA}
              </p>
              <p className="text-sm text-ink-soft">
                Time: {tier.effort}. {tier.summary}
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
              <span className="font-bold text-ink-soft">Harder parts:</span>
              {hard.map((h) => (
                <Badge key={h} className="bg-paper-2 text-ink">
                  {h}
                </Badge>
              ))}
            </p>
          )}
          {subject.remakeNote && <p className="mt-3 rounded-xl border-2 border-hilite bg-hilite/15 p-3 text-sm">⚠️ {subject.remakeNote}</p>}
          <p className="mt-3 text-xs text-ink-soft">Tick more features and the job gets bigger. Bigger jobs get more careful instructions, so the AI works step by step.</p>
        </div>

        <div className="card p-5" data-testid="building-blocks">
          <p className="label">3. Building blocks (free services)</p>
          <p className="text-sm text-ink-soft">
            Your app doesn't have to build everything from scratch. These services plug right in, like plugging a lamp into the wall. We picked them from your features.
          </p>
          <ul className="mt-3 space-y-2">
            {[...suggestions.map((s) => ({ ...s, suggested: true })), ...(config.apiExtra ?? []).filter((id) => !suggestions.some((s) => s.id === id)).map((id) => ({ id, why: 'You added this.', suggested: false }))].map(({ id, why, suggested }) => {
              const api = allApis.find((a) => a.id === id)
              if (!api) return null
              const on = apis.some((a) => a.id === id)
              return (
                <li key={id}>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${on ? 'border-ink bg-money-soft/60' : 'border-line'}`}>
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--money)]" checked={on} onChange={() => toggleApi(id, suggested)} aria-label={`Use ${api.name}`} />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5 font-bold">
                        {api.name}
                        {api.runsLocally && <Badge className="bg-paper-2 text-ink-soft">💻 on your computer</Badge>}
                        {api.openSource && <Badge className="bg-paper-2 text-ink-soft">open source</Badge>}
                      </span>
                      <span className="block text-sm text-ink-soft">{why}</span>
                      <span className="block text-xs text-money-ink">Free: {api.freeTier}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-bold">+ Add another building block</summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {allApis
                .filter((a) => !suggestions.some((s) => s.id === a.id) && !(config.apiExtra ?? []).includes(a.id))
                .map((a) => (
                  <button key={a.id} type="button" className="rounded-full border-2 border-line px-3 py-1 text-xs font-bold hover:border-ink" onClick={() => toggleApi(a.id, false)}>
                    + {a.name}
                  </button>
                ))}
            </div>
            <Link to="/toolbox" className="mt-2 inline-block text-xs font-bold text-money underline">
              What are these? See the toolbox →
            </Link>
          </details>
        </div>

        <div className="card p-5">
          <p className="label">4. Pick your AI helper</p>
          <Link to="/ai-helpers" className="mb-3 flex items-center gap-3 rounded-xl border-2 border-hilite bg-hilite/15 p-3 text-sm hover:border-ink" data-testid="ai-helpers-banner">
            <span className="text-2xl" aria-hidden>
              👋
            </span>
            <span>
              <strong>Never used an AI helper?</strong> Read our 5-minute beginner guide: what Claude Code and Codex are, what they cost, and your first 30 minutes. →
            </span>
          </Link>
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
          <p className="mt-2 text-xs font-bold text-ink-soft">💳 {AGENTS[agent].cost}</p>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            {AGENTS[agent].howToRun.map((s) => (
              <li key={s} dangerouslySetInnerHTML={{ __html: s.replace(/`([^`]+)`/g, '<code class="rounded bg-paper-2 px-1 py-0.5 font-mono text-ink text-xs">$1</code>') }} />
            ))}
          </ol>
          <p className="mt-4 text-sm font-bold">
            Your instructions for the AI <span className="font-normal text-ink-soft">(you don't need to read them, just copy and paste)</span>
          </p>
          <textarea readOnly value={prompt} aria-label="Agent prompt" className="field mt-2 h-64 resize-y font-mono text-xs leading-relaxed" data-testid="agent-prompt" />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={prompt} label={`Copy ${AGENTS[agent].name} prompt`} toast="Prompt copied. Paste it into your agent" className="btn-primary" />
            <button type="button" className="btn-ghost" onClick={download}>
              ⬇ Download .md
            </button>
          </div>
          <div className="mt-4 rounded-xl border-2 border-ink bg-paper-2 p-4">
            <p className="font-display text-lg font-extrabold">📦 Easiest way: download the starter kit</p>
            <p className="mt-1 text-sm text-ink-soft">
              One folder with the instructions, a "start here" guide, the settings file and the sketch. Unzip it, open the folder in {AGENTS[agent].name}, and say{' '}
              <em>"Read START-HERE.md and let's build it."</em>
            </p>
            <button type="button" className="btn-dark mt-3" onClick={downloadKit} disabled={kitBusy}>
              {kitBusy ? 'Packing…' : '⬇ Download starter kit (.zip)'}
            </button>
          </div>
        </div>

        <details className="card p-5">
          <summary className="cursor-pointer font-display text-lg font-extrabold">5. Add a sketch of the screen (optional)</summary>
          <p className="mt-1 text-sm text-ink-soft">A simple gray drawing of how the app could look. Download it and drop it into your AI helper with the instructions.</p>
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
