import { strToU8, zipSync } from 'fflate'
import { AGENTS, type AgentId } from './agentPrompt'
import { envExample } from './apiSuggest'
import type { Api } from './schema'

export interface StarterKitInput {
  slug: string // used in the zip and folder name
  name: string // the app being replaced, e.g. "Calendly"
  prompt: string
  agent: AgentId
  apis: Api[]
  wireframeHtml: string
  wireframePng?: Uint8Array
}

// The files inside a starter kit. Kept separate from zipping so it's easy to test and read.
export function starterKitFiles(k: StarterKitInput): Record<string, string | Uint8Array> {
  const agent = AGENTS[k.agent]
  const files: Record<string, string | Uint8Array> = {}
  const hasKeys = k.apis.some((a) => a.envVars.length)

  files['START-HERE.md'] = [
    `# Start here: build your own ${k.name} replacement`,
    '',
    'This folder has everything your AI helper needs. You don\'t need to write any code.',
    '',
    '## Steps',
    '',
    `1. Open **${agent.name}**. ${agent.openFolder}`,
    '   (Terminal tip: on a Mac, right-click this folder → "New Terminal at Folder". On Windows, right-click → "Open in Terminal".)',
    agent.id === 'chat'
      ? '2. Paste everything from **PROMPT.md** into the chat, and attach **wireframe.png** if you have it.'
      : '2. Type this and press Enter: **"Read START-HERE.md and PROMPT.md, then let\'s build it."**',
    '3. Answer its questions. Say "yes" when it asks to make files or run commands you understand.',
    '4. When it\'s done, it will tell you the address to open in your web browser (like http://localhost:5173).',
    hasKeys ? '5. If the app needs keys (passwords for services), the AI will walk you through getting them. They go in a file named `.env`.' : '',
    '',
    '## What\'s in this folder',
    '',
    '- `PROMPT.md`: the full instructions for the AI',
    agent.memoryFile ? `- \`${agent.memoryFile}\`: notes the AI keeps about your project` : '',
    '- `.env.example`: the settings and keys your app needs (if any)',
    '- `wireframe.html` / `wireframe.png`: a simple sketch of the main screen',
    '',
    '## Tips',
    '',
    '- Go one step at a time. If something breaks, paste the error message to the AI and say "please fix this".',
    '- Never paste real passwords into the chat. Keys go in `.env`, which stays on your computer.',
    '- New to this? Read "New to AI coding? Start here" on Rent-Free.',
    '',
  ]
    .filter((l) => l !== '')
    .join('\n')
    .replace(/\n(#+ )/g, '\n\n$1')

  files['PROMPT.md'] = k.prompt + '\n'
  if (agent.memoryFile) {
    files[agent.memoryFile] = [
      `# ${k.name} replacement`,
      '',
      'This project started from a Rent-Free starter kit. The full goals and requirements are in PROMPT.md.',
      '',
      '## Notes for the AI',
      '- The owner is not a professional developer. Explain things simply and give click-by-click steps.',
      '- Keep this file updated with: how to run the app, how to run the tests, and important decisions.',
      '- Never commit the .env file.',
      '',
      '## How to run',
      '(fill this in once the app exists)',
      '',
    ].join('\n')
  }
  files['.env.example'] = envExample(k.apis) + '\n'
  files['.gitignore'] = ['node_modules', '.env', 'dist', '.DS_Store', ''].join('\n')
  files['wireframe.html'] = k.wireframeHtml
  if (k.wireframePng) files['wireframe.png'] = k.wireframePng
  return files
}

export function starterKitZip(k: StarterKitInput): Uint8Array {
  const folder = `rent-free-starter-${k.slug}`
  const entries: Record<string, Uint8Array> = {}
  for (const [name, content] of Object.entries(starterKitFiles(k))) entries[`${folder}/${name}`] = typeof content === 'string' ? strToU8(content) : content
  return zipSync(entries, { level: 6 })
}
