import { Link } from 'react-router-dom'
import { AGENTS, type AgentId } from '../lib/agentPrompt'
import type { Suggestion } from '../lib/apiSuggest'
import { allApis } from '../lib/data'
import type { Api } from '../lib/schema'
import { Badge } from './ui'

// Shared by the Remake studio (apps) and the Game builder, so both feel the same.

export const AGENT_ORDER: AgentId[] = ['claude-code', 'codex', 'opencode', 'cursor', 'chat']

export function AgentPicker({ agent, onChange }: { agent: AgentId; onChange: (a: AgentId) => void }) {
  return (
    <>
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
            onClick={() => onChange(id)}
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
    </>
  )
}

// Suggested building blocks as checkboxes, plus "add another".
export function BlockList({
  suggestions,
  chosen,
  extra,
  onToggle,
  pool = allApis,
}: {
  suggestions: Suggestion[]
  chosen: Api[]
  extra: string[]
  onToggle: (id: string, suggested: boolean) => void
  pool?: Api[]
}) {
  const rows = [
    ...suggestions.map((s) => ({ ...s, suggested: true })),
    ...extra.filter((id) => !suggestions.some((s) => s.id === id)).map((id) => ({ id, why: 'You added this.', suggested: false })),
  ]
  return (
    <>
      <ul className="mt-3 space-y-2">
        {rows.map(({ id, why, suggested }) => {
          const api = allApis.find((a) => a.id === id)
          if (!api) return null
          const on = chosen.some((a) => a.id === id)
          return (
            <li key={id}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${on ? 'border-ink bg-money-soft/60' : 'border-line'}`}>
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--money)]" checked={on} onChange={() => onToggle(id, suggested)} aria-label={`Use ${api.name}`} />
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
          {pool
            .filter((a) => !suggestions.some((s) => s.id === a.id) && !extra.includes(a.id))
            .map((a) => (
              <button key={a.id} type="button" className="rounded-full border-2 border-line px-3 py-1 text-xs font-bold hover:border-ink" onClick={() => onToggle(a.id, false)}>
                + {a.name}
              </button>
            ))}
        </div>
        <Link to="/toolbox" className="mt-2 inline-block text-xs font-bold text-money underline">
          What are these? See the toolbox →
        </Link>
      </details>
    </>
  )
}

// Turn a building block on/off, remembering what was suggested vs added.
export function toggleBlock(id: string, suggested: boolean, chosen: Api[], off: string[], extra: string[]) {
  const on = chosen.some((a) => a.id === id)
  if (suggested) return { apiOff: on ? [...off, id] : off.filter((x) => x !== id), apiExtra: extra }
  return { apiOff: off, apiExtra: on ? extra.filter((x) => x !== id) : [...extra, id] }
}
