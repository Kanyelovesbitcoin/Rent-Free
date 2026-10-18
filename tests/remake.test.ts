import { describe, expect, it } from 'vitest'
import { getSubscription } from '../src/lib/data'
import { complexityScore, tierFor, type ComplexityInput } from '../src/lib/complexity'
import { AGENTS, agentPrompt, CONTENT_LINE, NO_BRANDING_LINE, type AgentId, type RemakeConfig } from '../src/lib/agentPrompt'
import type { Subscription } from '../src/lib/schema'

const defaults = (sub: Subscription): RemakeConfig => ({
  appName: 'Booky',
  features: sub.coreFeatures,
  customFeatures: [],
  description: '',
  audience: 'me',
  runsOn: 'local',
  platform: 'web',
  stack: 'auto',
  style: '',
  localData: true,
})
const cx = (sub: Subscription, c: RemakeConfig): ComplexityInput => ({
  base: sub.complexity as 1 | 2 | 3 | 4,
  features: [...c.features, ...c.customFeatures],
  audience: c.audience,
  runsOn: c.runsOn,
  platform: c.platform,
})
const tierOf = (id: string, patch: Partial<RemakeConfig> = {}) => {
  const sub = getSubscription(id)!
  return tierFor(cx(sub, { ...defaults(sub), ...patch }))
}
const prompt = (id: string, agent: AgentId = 'claude-code', patch: Partial<RemakeConfig> = {}) => {
  const sub = getSubscription(id)!
  const config = { ...defaults(sub), ...patch }
  return agentPrompt({
    inspiredBy: sub.name,
    categoryName: 'X',
    description: sub.description,
    remakeTarget: sub.remakeTarget,
    remakeNote: sub.remakeNote,
    isContent: sub.kind === 'content',
    config,
    tier: tierFor(cx(sub, config)),
    agent,
  })
}

describe('complexity tiers', () => {
  it('simple tools get a quick or standard build', () => {
    expect(tierOf('linktree').id).toBe('quick')
    expect(['quick', 'standard']).toContain(tierOf('calendly').id)
  })
  it('platform-sized products get a big or platform build', () => {
    expect(['big', 'platform']).toContain(tierOf('netflix').id)
    expect(['big', 'platform']).toContain(tierOf('adobe-cc').id)
  })
  it('more features and a team audience raise the effort', () => {
    const sub = getSubscription('todoist')!
    const base = complexityScore(cx(sub, defaults(sub)))
    const more = complexityScore(cx(sub, { ...defaults(sub), audience: 'team', features: [...sub.coreFeatures, ...sub.extraFeatures] }))
    expect(more).toBeGreaterThan(base)
  })
})

describe('agent prompt', () => {
  it('includes selected features and leaves out unselected ones', () => {
    const sub = getSubscription('notion')!
    const [dropped, ...kept] = sub.coreFeatures
    const p = prompt('notion', 'claude-code', { features: kept })
    for (const f of kept) expect(p).toContain(f)
    expect(p).not.toContain(dropped)
  })
  it('adds the user\'s own features and description', () => {
    const p = prompt('notion', 'codex', { customFeatures: ['Kanban for video ideas'], description: 'A content planner for my YouTube channel' })
    expect(p).toContain('Kanban for video ideas')
    expect(p).toContain('A content planner for my YouTube channel')
  })
  it('names the right memory file per agent', () => {
    expect(prompt('notion', 'claude-code')).toContain('CLAUDE.md')
    expect(prompt('notion', 'codex')).toContain('AGENTS.md')
    expect(prompt('notion', 'opencode')).toContain('AGENTS.md')
    expect(prompt('notion', 'chat')).not.toMatch(/CLAUDE\.md|AGENTS\.md/)
    expect(AGENTS.chat.memoryFile).toBeNull()
  })
  it('always includes the no-branding rule; content subscriptions add the content rule', () => {
    expect(prompt('linktree')).toContain(NO_BRANDING_LINE)
    expect(prompt('linktree')).not.toContain(CONTENT_LINE)
    expect(prompt('netflix')).toContain(CONTENT_LINE)
  })
  it('big builds ask for SPEC.md/PLAN.md; quick builds do not', () => {
    expect(prompt('netflix')).toContain('SPEC.md')
    expect(prompt('linktree')).not.toContain('SPEC.md')
  })
})
