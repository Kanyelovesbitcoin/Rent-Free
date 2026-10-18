import { hardParts, type Audience, type Platform, type RunsOn, type Tier } from './complexity'

export type AgentId = 'claude-code' | 'codex' | 'opencode' | 'cursor' | 'chat'
export type Stack = 'auto' | 'nextjs' | 'simple' | 'python'

export const NO_BRANDING_LINE =
  "Use an original name, logo, colors and copy. Do not copy any existing product's branding, trademarks, text or exact design."
export const CONTENT_LINE =
  'Only handle media and content I own or have the rights to. Do not build anything that downloads, rips, or bypasses DRM or another service\'s protections.'

export interface Agent {
  id: AgentId
  name: string
  memoryFile: string | null
  howToRun: string[]
}

export const AGENTS: Record<AgentId, Agent> = {
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    memoryFile: 'CLAUDE.md',
    howToRun: [
      'Get Claude Code at claude.com/claude-code (it also comes as a desktop app).',
      'Make a new, empty folder for your app and open it in Claude Code (or open a terminal there and type `claude`).',
      'Paste the instructions and press Enter. Answer its questions as it works.',
      'Big job? Press Shift+Tab first so it makes a plan before it writes code.',
    ],
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    memoryFile: 'AGENTS.md',
    howToRun: [
      'Get Codex from OpenAI (in the ChatGPT app, or type `npm install -g @openai/codex` in a terminal).',
      'Make a new, empty folder for your app and open a terminal there.',
      'Type `codex`, paste the instructions and press Enter.',
    ],
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    memoryFile: 'AGENTS.md',
    howToRun: [
      'Get OpenCode at opencode.ai. It can even use a free AI on your own computer.',
      'Make a new, empty folder for your app and open a terminal there.',
      'Type `opencode`, paste the instructions and press Enter.',
    ],
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor / other IDE',
    memoryFile: 'AGENTS.md',
    howToRun: ['Open a new, empty folder in Cursor (or any AI code editor).', 'Open the AI chat, paste the instructions and press Enter.'],
  },
  chat: {
    id: 'chat',
    name: 'Chat (Claude.ai / ChatGPT)',
    memoryFile: null,
    howToRun: [
      'Paste the instructions into Claude.ai or ChatGPT. Add the sketch picture if you have it.',
      "It will give you code to copy into files. For anything bigger than a small build, Claude Code or Codex is easier: it makes the files and runs them for you.",
    ],
  },
}

export interface RemakeConfig {
  appName: string
  features: string[] // selected catalog features
  customFeatures: string[] // the user's own
  description: string // "describe it in your words"
  audience: Audience
  runsOn: RunsOn
  platform: Platform
  stack: Stack
  style: string
  localData: boolean
}

export interface AgentPromptInput {
  inspiredBy: string
  categoryName: string
  description?: string
  remakeTarget?: string
  remakeNote?: string
  isContent: boolean
  yearlyCost?: number
  baseAlternative?: string // an open-source project worth extending (platform tier)
  config: RemakeConfig
  tier: Tier
  agent: AgentId
}

const AUDIENCE: Record<Audience, string> = {
  me: 'Just me. No login needed; single user.',
  family: 'Me and my family (a few people). Simple accounts or profiles; no complex permissions.',
  team: 'My team or clients. User accounts with roles (admin / member); invite by email.',
}
const RUNS_ON: Record<RunsOn, string> = {
  local: 'Runs on my own computer with one command. No cloud accounts required.',
  'free-cloud': 'Deployable for free (e.g. Vercel, Netlify or Cloudflare plus a free database tier). Explain the deploy steps.',
  'own-server': 'Runs on a small Linux server (VPS) with Docker Compose. Include the docker-compose.yml and a backup script.',
}
const PLATFORM: Record<Platform, string> = {
  web: 'A responsive web app that works well on desktop and phone browsers.',
  desktop: 'A desktop app. Use the simplest option (a local web app opened in the browser, or Tauri/Electron if truly needed) and explain the choice.',
  mobile: 'Mobile-first, installable on my phone as a PWA (add to home screen). Offline support where it makes sense.',
}
const STACK: Record<Stack, string> = {
  auto: 'Pick a simple, popular, well-documented stack that fits the requirements, and explain the choice in one short paragraph before starting.',
  nextjs: 'Next.js + TypeScript, with SQLite (local) or Postgres (hosted) via a simple ORM.',
  simple: 'Plain HTML, CSS and JavaScript. Add a tiny backend only if something truly needs one.',
  python: 'Python (FastAPI) with SQLite and a simple HTML frontend (HTMX or plain JS).',
}

function workflow(tier: Tier, agent: Agent, baseAlternative?: string): string[] {
  const mem = agent.memoryFile
  const memStep = mem ? `Create ${mem} with a short project summary, how to run it, how to test it, and conventions. Keep it updated as you go.` : null
  const git = agent.id === 'chat' ? null : 'Use git: initialize a repo and commit after each working step with a clear message.'
  const chatNote = agent.id === 'chat' ? "You can't run code here, so give me complete files with their paths and the exact commands to run. One milestone per reply." : null

  if (tier.id === 'quick') {
    return [
      'Ask me up to 3 short questions only if something important is unclear.',
      ...(memStep ? [memStep] : []),
      'Build the whole MVP in one go. Keep it small: few files, few dependencies.',
      'Run it yourself and fix any errors before handing over.',
      'Finish with: the exact command to start it, how to use it, and how to back up my data.',
      ...[git, chatNote].filter((x): x is string => !!x),
    ]
  }
  const steps: string[] = []
  if (tier.id === 'platform') {
    steps.push(
      `Before anything else: research whether extending an existing open-source project${baseAlternative ? ` (for example ${baseAlternative})` : ''} would get me there faster than building from scratch. Give me a short recommendation with trade-offs, and wait for my choice.`,
      'Scope this as my personal MVP, not a full clone of the original product.',
    )
  }
  if (tier.id === 'standard') {
    steps.push('First, write a short plan: file structure, data model, and 3 milestones (1: core data + main screen, 2: the remaining features, 3: polish, export/backup and README). Wait for my OK before coding.')
  } else {
    steps.push(
      'Before writing code, create SPEC.md (who it is for, features, data model, screens, and non-goals) and PLAN.md (milestones, each with acceptance criteria and checkboxes). Stop and wait for my approval.',
    )
  }
  if (memStep) steps.push(memStep)
  steps.push(
    tier.id === 'standard'
      ? 'Build one milestone at a time. After each one: run it, run the tests, fix failures, and tell me what to try.'
      : 'Work one milestone at a time: implement it, write tests for the core logic, run them, tick the boxes in PLAN.md, then STOP and give me a summary plus what to test by hand. Never start the next milestone without my OK.',
    'Write tests for the core logic (data handling, calculations, permissions).',
    'Keep secrets out of the code: use a .env file and commit a .env.example.',
  )
  if (git) steps.push(git)
  if (chatNote) steps.push(chatNote)
  steps.push('Finish with a README: setup, how to run, how to deploy (if relevant), and how to back up and export my data.')
  return steps
}

// The copy-paste prompt for a coding agent. Deliberately plain Markdown so it works in any tool.
export function agentPrompt(input: AgentPromptInput): string {
  const { config: c, tier } = input
  const agent = AGENTS[input.agent]
  const features = [...c.features, ...c.customFeatures.map((f) => f.trim()).filter(Boolean)]
  const name = c.appName.trim()
  // "a personal media server…" for content subscriptions; otherwise "scheduling app" from the category.
  const what = input.remakeTarget ?? `${input.categoryName.toLowerCase().replace(/ (&|and) .*$/, '')} app to replace ${input.inspiredBy}`
  const hard = hardParts(features)

  const lines: string[] = []
  lines.push(name ? `# Build "${name}": my own ${what}` : `# Build my own ${what}`)
  lines.push('')
  lines.push('## Context')
  lines.push(
    `I'm replacing a paid subscription (${input.inspiredBy}${input.yearlyCost ? `, about $${Math.round(input.yearlyCost)}/year` : ''}) with my own app. ` +
      "I'm not a professional developer, so explain decisions in plain English and keep the setup as simple as possible.",
  )
  if (input.description) lines.push('', `What ${input.inspiredBy} does: ${input.description}`)
  if (!name) lines.push('', 'First, suggest 3 short, original names for the app (not similar to the original product) and use the one I pick.')
  if (c.description.trim()) {
    lines.push('', '## In my own words', c.description.trim())
  }
  lines.push('', '## Must-have features (MVP)')
  features.forEach((f, i) => lines.push(`${i + 1}. ${f}`))
  if (!features.length) lines.push('1. (Ask me which features matter most before starting.)')

  lines.push('', '## Requirements')
  lines.push(`- **Who uses it:** ${AUDIENCE[c.audience]}`)
  lines.push(`- **Where it runs:** ${RUNS_ON[c.runsOn]}`)
  lines.push(`- **Platform:** ${PLATFORM[c.platform]}`)
  lines.push(`- **Tech stack:** ${STACK[c.stack]}`)
  lines.push(`- **My data:** Store data in a format I can export (JSON/CSV) and back up easily.${c.localData ? ' Keep all data on my own device/server, with no third-party analytics, tracking or telemetry.' : ''}`)
  lines.push(`- **Look & feel:** ${c.style.trim() ? c.style.trim() + '. ' : ''}Clean and simple. I'll attach a wireframe; follow its layout, not its exact styling.`)
  lines.push(`- **Branding:** ${NO_BRANDING_LINE}`)
  if (input.isContent) lines.push(`- **Content:** ${CONTENT_LINE}`)
  if (input.remakeNote) lines.push(`- **Important:** ${input.remakeNote}`)
  if (hard.length) lines.push(`- **Tricky parts to plan carefully:** ${hard.join(', ')}. Prefer proven open-source libraries over writing these from scratch.`)

  lines.push('', `## How to work (${tier.label}: ${tier.effort})`)
  workflow(tier, agent, input.baseAlternative).forEach((s, i) => lines.push(`${i + 1}. ${s}`))

  lines.push('', '## Definition of done')
  lines.push('- [ ] Every must-have feature works end to end')
  lines.push('- [ ] Starts with one documented command')
  if (tier.id !== 'quick') lines.push('- [ ] Tests for the core logic pass')
  lines.push('- [ ] README covers setup, usage, and backup/export')
  lines.push('- [ ] No secrets in the code; my data can be exported')
  return lines.join('\n')
}
