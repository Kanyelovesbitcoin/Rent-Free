import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { allApis, getSubscription } from '../src/lib/data'
import { newCatalogItem } from '../src/lib/selection'
import { envExample, selectedApis, suggestApis } from '../src/lib/apiSuggest'
import { agentPrompt, type RemakeConfig } from '../src/lib/agentPrompt'
import { TIERS } from '../src/lib/complexity'
import { starterKitFiles, starterKitZip } from '../src/lib/starterKit'
import { buildIcs } from '../src/lib/ics'
import { gradeLevel } from '../src/lib/readability'

const config: RemakeConfig = {
  appName: '',
  features: ['Public booking page', 'Automatic email confirmations and reminders', 'Collect payments when people book'],
  customFeatures: [],
  description: '',
  audience: 'me',
  runsOn: 'local',
  platform: 'web',
  stack: 'auto',
  style: '',
  localData: true,
  apiOff: [],
  apiExtra: [],
}
const ids = (s: { id: string }[]) => s.map((x) => x.id)

describe('LM Studio first', () => {
  it('AI subscriptions start on LM Studio, the easiest local AI app', () => {
    for (const id of ['chatgpt', 'claude', 'gemini']) expect(newCatalogItem(getSubscription(id)!).alt, id).toBe('lm-studio')
  })
})

describe('building-block suggestions', () => {
  it('suggests the right services for the features', () => {
    const s = ids(suggestApis({ features: config.features, audience: 'me', runsOn: 'local' }))
    expect(s).toContain('sqlite')
    expect(s).toContain('resend')
    expect(s).toContain('stripe')
  })
  it('suggests a newsletter sender, local AI, and hosting when they fit', () => {
    expect(ids(suggestApis({ features: ['Scheduled campaigns and newsletters'], audience: 'me', runsOn: 'local' }))).toContain('brevo')
    expect(ids(suggestApis({ features: ['Chat'], categoryId: 'ai-chat', audience: 'me', runsOn: 'local' }))).toContain('lm-studio-server')
    const cloud = ids(suggestApis({ features: [], audience: 'family', runsOn: 'free-cloud' }))
    expect(cloud).toEqual(expect.arrayContaining(['supabase', 'cloudflare-pages']))
    expect(ids(suggestApis({ features: [], audience: 'team', runsOn: 'own-server' }))).toEqual(expect.arrayContaining(['pocketbase', 'coolify']))
  })
  it('every suggestion points at a real API in data/apis.json', () => {
    const all = suggestApis({ features: ['AI chat', 'email', 'payments', 'transcribe', 'photo backup', 'search the web', 'map', 'stock photo', 'video call'], categoryId: 'ai-chat', audience: 'team', runsOn: 'free-cloud' })
    for (const s of all) expect(allApis.some((a) => a.id === s.id), s.id).toBe(true)
  })
  it('respects unticked and added services', () => {
    const sug = suggestApis({ features: config.features, audience: 'me', runsOn: 'local' })
    const chosen = ids(selectedApis(sug, ['stripe'], ['unsplash'], allApis))
    expect(chosen).not.toContain('stripe')
    expect(chosen).toContain('unsplash')
  })
})

describe('prompt + starter kit', () => {
  const apis = selectedApis(suggestApis({ features: config.features, audience: 'me', runsOn: 'local' }), [], [], allApis)
  const prompt = agentPrompt({ inspiredBy: 'Calendly', categoryName: 'Scheduling', isContent: false, config, tier: TIERS.standard, agent: 'claude-code', apis })

  it('lists chosen services and their settings in the prompt', () => {
    expect(prompt).toContain('## Services to use')
    expect(prompt).toContain('Resend')
    expect(prompt).toContain('`RESEND_API_KEY`')
    expect(prompt).toContain('.env.example')
  })
  it('builds a .env.example with every key', () => {
    const env = envExample(apis)
    expect(env).toContain('RESEND_API_KEY=')
    expect(env).toContain('STRIPE_SECRET_KEY=')
  })
  it('packs a starter kit with everything a beginner needs', () => {
    const files = starterKitFiles({ slug: 'calendly', name: 'Calendly', prompt, agent: 'claude-code', apis, wireframeHtml: '<!doctype html><p>hi</p>' })
    expect(Object.keys(files)).toEqual(expect.arrayContaining(['START-HERE.md', 'PROMPT.md', 'CLAUDE.md', '.env.example', '.gitignore', 'wireframe.html']))
    expect(files['START-HERE.md']).toContain('Read START-HERE.md and PROMPT.md')
    const codex = starterKitFiles({ slug: 'x', name: 'X', prompt, agent: 'codex', apis: [], wireframeHtml: '' })
    expect(codex['AGENTS.md']).toBeDefined()
    expect(codex['.env.example']).toContain('No secret keys needed')
  })
  it('the zip unzips into one tidy folder', () => {
    const zip = starterKitZip({ slug: 'calendly', name: 'Calendly', prompt, agent: 'claude-code', apis, wireframeHtml: '<p>x</p>' })
    const out = unzipSync(zip)
    expect(Object.keys(out).every((k) => k.startsWith('rent-free-starter-calendly/'))).toBe(true)
    expect(strFromU8(out['rent-free-starter-calendly/PROMPT.md'])).toContain('Calendly')
  })
})

describe('calendar reminders', () => {
  it('makes a valid calendar file with one event per reminder', () => {
    const ics = buildIcs(
      [
        { title: 'Switch Netflix, then rest', description: 'Line one\nLine two; with, commas', date: new Date(2026, 9, 20) },
        { title: 'Rotate', description: 'x', date: new Date(2026, 10, 19) },
      ],
      new Date(Date.UTC(2026, 9, 18, 12)),
    )
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('DTSTART;VALUE=DATE:20261020')
    expect(ics).toContain('DTEND;VALUE=DATE:20261021')
    expect(ics).toContain('SUMMARY:Switch Netflix\\, then rest')
    expect(ics).toContain('Line one\\nLine two\\; with\\, commas')
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true)
  })
})

describe('plain language in the toolbox', () => {
  it('API descriptions are easy to read', () => {
    const grades = allApis.map((a) => ({ id: a.id, g: gradeLevel(a.what), text: a.what }))
    const avg = grades.reduce((t, x) => t + x.g, 0) / grades.length
    expect(avg).toBeLessThanOrEqual(6)
    expect(grades.filter((x) => x.g > 10)).toEqual([])
  })
})
