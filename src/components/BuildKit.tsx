import { useMemo, useRef, useState } from 'react'
import { buildPrompt, LLM_LINKS, type BuildPromptInput } from '../lib/buildPrompt'
import { renderWireframe, type WireframeId } from '../lib/wireframes'
import { downloadNodeAsPng } from './SavingsCard'
import { CopyButton } from './ui'

// "Build my own": a copy-paste build prompt + a low-fi wireframe the user can hand to any AI builder.
export default function BuildKit({ prompt, wireframe }: { prompt: BuildPromptInput; wireframe: WireframeId }) {
  const [appName, setAppName] = useState(`My ${prompt.categoryName.replace(/ &.*$/, '')} app`)
  const text = useMemo(() => buildPrompt(prompt), [prompt])
  const html = useMemo(() => renderWireframe(wireframe, appName || 'My app'), [wireframe, appName])
  const frame = useRef<HTMLIFrameElement>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card flex flex-col p-5">
        <h3 className="font-semibold">1. Copy the build prompt</h3>
        <p className="mt-1 text-sm text-stone-500">A mini product spec written for AI app builders. Paste it in, attach the wireframe, and follow along.</p>
        <textarea readOnly value={text} className="field mt-3 h-80 flex-1 font-mono text-xs leading-relaxed" aria-label="Build prompt" />
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={text} label="Copy prompt" className="btn-primary" />
          {LLM_LINKS.map((l) => (
            <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="btn-ghost px-3">
              Open {l.name} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="card flex flex-col p-5">
        <h3 className="font-semibold">2. Grab the wireframe</h3>
        <p className="mt-1 text-sm text-stone-500">A gray-box layout so the AI knows what you picture. Download the image, or copy the HTML and ask the AI to start from it.</p>
        <label className="mt-3">
          <span className="label">Your app's name</span>
          <input className="field" value={appName} onChange={(e) => setAppName(e.target.value.slice(0, 40))} />
        </label>
        <iframe
          ref={frame}
          title="Wireframe preview"
          srcDoc={html}
          sandbox="allow-same-origin"
          className="mt-3 h-80 w-full flex-1 rounded-xl border border-stone-200 bg-white dark:border-stone-700"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn-primary"
            disabled={busy}
            onClick={async () => {
              const body = frame.current?.contentDocument?.body
              if (!body) return
              setBusy(true)
              try {
                await downloadNodeAsPng(body, 'wireframe.png')
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? 'Making image…' : '⬇ Download PNG'}
          </button>
          <CopyButton text={html} label="Copy HTML" />
        </div>
      </div>
    </div>
  )
}
