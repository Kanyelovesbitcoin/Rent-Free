export interface BuildPromptInput {
  // The tool being replaced, e.g. "Calendly". Used only as a reference point, never for branding.
  inspiredBy: string
  categoryName: string
  description?: string
  coreFeatures?: string[]
}

export const NO_BRANDING_LINE =
  'Use an original name, logo, colors and copy. Do not copy any existing product\'s branding, trademarks, text or exact design.'

const GENERIC_FEATURES = [
  'A simple dashboard showing the most important information at a glance',
  'Create, edit and delete the main items',
  'Search and filter',
  'Settings page',
  'Export my data as CSV/JSON',
]

// Produces a copy-paste "mini product spec" for Claude, ChatGPT, Lovable, Bolt, Cursor, etc.
export function buildPrompt({ inspiredBy, categoryName, description, coreFeatures }: BuildPromptInput): string {
  const features = coreFeatures?.length ? coreFeatures : GENERIC_FEATURES
  const what = description ? description.replace(/\.$/, '') : `a ${categoryName.toLowerCase()} tool`
  return `I want to build my own simple app to replace a paid subscription (${inspiredBy}). I'm not a professional developer, so explain each step plainly and keep the setup as simple as possible.

## What it does
${what}. It's for my own use (and maybe a few others), so it doesn't need to scale to millions of users.

## Must-have features (MVP)
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Nice-to-have later (don't build yet)
- Login for multiple users
- Mobile-friendly polish
- Integrations with other apps

## Tech preferences
- Keep it free to run: a static site or a single small server, free hosting tier if possible (Vercel, Netlify, Cloudflare, or a $5 VPS).
- Prefer a simple stack (e.g. React or plain HTML + a lightweight database like SQLite or Supabase free tier).
- Use open-source libraries where they save time.
- Store my data in a format I can export.

## Design
- Clean, minimal, works on phone and desktop.
- I've attached a wireframe/mockup as a starting point. Follow its layout, not its exact styling.
- ${NO_BRANDING_LINE}

## How I want you to work
1. First, ask me up to 5 short questions if anything important is unclear.
2. Then propose the file structure and data model in plain English.
3. Build the MVP step by step, telling me exactly what to run and where to click.
4. Finish with how to deploy it for free and how to back up my data.`
}

export const LLM_LINKS = [
  { name: 'Claude', url: 'https://claude.ai/new' },
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Lovable', url: 'https://lovable.dev/' },
  { name: 'Bolt', url: 'https://bolt.new/' },
]
