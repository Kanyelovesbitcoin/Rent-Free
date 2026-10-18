import type { Audience, RunsOn } from './complexity'
import type { Api } from './schema'

export interface Suggestion {
  id: string
  why: string
}

interface SuggestInput {
  features: string[]
  categoryId?: string
  audience: Audience
  runsOn: RunsOn
}

const has = (features: string[], re: RegExp) => features.some((f) => re.test(f))

// Picks "building block" services that fit the app someone wants to build.
// Rules of thumb: free or local first; only add a service when a feature needs it.
export function suggestApis({ features, categoryId, audience, runsOn }: SuggestInput): Suggestion[] {
  const out: Suggestion[] = []
  const add = (id: string, why: string) => {
    if (!out.some((s) => s.id === id)) out.push({ id, why })
  }

  // Where the data lives.
  if (audience === 'me' && runsOn === 'local') add('sqlite', 'Saves your data in one simple file. Nothing to sign up for.')
  else if (runsOn === 'free-cloud') add('supabase', 'Saves data online and handles logins, so it works on all your devices.')
  else add('pocketbase', 'Saves data and handles logins on your own computer or server. Free.')

  if (categoryId === 'ai-chat' || has(features, /\bAI\b|chat with|assistant|summar|generat|answers? with|recogni/i)) {
    if (runsOn === 'local') add('lm-studio-server', 'Free AI that runs on your computer. No bill, totally private.')
    add('openrouter', 'Lets your app use a smarter AI only when it needs one, for a few cents.')
  }
  if (has(features, /newsletter|campaign|subscriber|mailing/i)) add('brevo', 'Sends newsletters and emails, 300 a day for free.')
  else if (has(features, /email|reminder|notification|confirmation|sms|login code/i)) add('resend', 'Sends emails like reminders and confirmations, 3,000 a month for free.')
  if (has(features, /payment|stripe|invoice|checkout|sell|collect money|pay/i)) add('stripe', 'Takes card payments safely. No monthly fee.')
  if (has(features, /transcri|speech|caption|subtitle|speaker|record(ing)?s? into text/i)) add('whisper-local', 'Turns speech into text on your computer, for free.')
  if (has(features, /photo backup|upload|file storage|share links|video library|backups?/i) && runsOn !== 'local')
    add('cloudflare-r2', 'Stores photos and files online, 10 GB free with free downloads.')
  if (has(features, /search the web|with sources|cited|web search/i)) add('searxng', 'A free search engine your app can use to find answers.')
  if (has(features, /\bmap|location|places?\b|near me/i)) add('openstreetmap', 'Free maps for your app.')
  if (has(features, /stock photo|photo library|backgrounds?/i)) add('unsplash', 'Free, beautiful photos your app can show.')
  if (has(features, /video (call|meeting)|meetings? with a link|screen sharing|webinar/i)) add('jitsi-embed', 'Free video calls inside your app.')

  // Where the app lives.
  if (runsOn === 'free-cloud') add('cloudflare-pages', 'Puts your app online for free, with no limit on visitors.')
  if (runsOn === 'own-server') add('coolify', 'Makes running apps on your own server as easy as clicking Deploy.')

  return out
}

export function selectedApis(suggestions: Suggestion[], off: string[], extra: string[], all: Api[]): Api[] {
  const ids = [...suggestions.map((s) => s.id).filter((id) => !off.includes(id)), ...extra.filter((id) => !suggestions.some((s) => s.id === id))]
  return ids.map((id) => all.find((a) => a.id === id)).filter((a): a is Api => !!a)
}

// The .env.example file a starter kit ships with, built from the chosen services.
export function envExample(apis: Api[]): string {
  const lines = ['# Copy this file to .env and fill in the values. Never share your .env file.', '']
  for (const a of apis) {
    if (!a.envVars.length) continue
    lines.push(`# ${a.name}: ${a.docsUrl}`)
    for (const v of a.envVars) lines.push(v.includes('=') ? v : `${v}=`)
    lines.push('')
  }
  if (lines.length === 2) lines.push('# No secret keys needed for this app. 🎉')
  return lines.join('\n')
}
