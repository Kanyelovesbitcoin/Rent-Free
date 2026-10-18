// Plain-English meanings for the tech words we can't avoid. Shown when someone taps a dotted word.
export const GLOSSARY: Record<string, string> = {
  'open source': 'The code is public. Anyone can use it for free, check it, and improve it.',
  'open-source': 'The code is public. Anyone can use it for free, check it, and improve it.',
  'self-host': 'You run the app on a computer you control (often a small rented one) instead of paying a company to run it.',
  'self-hosted': 'You run the app on a computer you control (often a small rented one) instead of paying a company to run it.',
  'self-hosting': 'Running the app on a computer you control (often a small rented one) instead of paying a company to run it.',
  server: 'A computer that stays on all the time so your app works 24/7. You can rent a small one for about $5–6 a month.',
  VPS: 'A small rented computer in the cloud (a "virtual private server"). About $5–6 a month.',
  Docker: 'A free tool that installs apps for you in neat boxes, so setup is one command instead of many steps.',
  'docker-compose': 'A recipe file that tells Docker which apps to start and how. You usually just copy it.',
  'Docker Compose': 'A recipe file that tells Docker which apps to start and how. You usually just copy it.',
  terminal: 'The text window where you type commands. Mac: open "Terminal". Windows: open "PowerShell".',
  license: 'The rules for using the code. Most here say "free to use"; some have extra rules if you sell it.',
  AGPL: 'A free license. Use it however you like; if you change it and let others use it online, you must share your changes.',
  API: 'A way for two apps to talk to each other automatically.',
  'API key': 'A secret password that lets an app use another service (like an AI model). Keep it private.',
  'local model': 'An AI that runs on your own computer instead of on a company\'s servers. Free and private.',
  'pay-as-you-go': 'You pay only for what you use, like a prepaid phone, instead of a fixed monthly price.',
  PWA: 'A website you can add to your phone\'s home screen so it works like an app.',
  DRM: 'Copy protection on movies, music or books you buy.',
  'free tier': 'The free version of a paid app. Usually has ads or limits.',
  repo: 'A project folder on GitHub that holds all the code.',
  GitHub: 'A free website where people share code and work on projects together.',
  Whisper: 'A free AI that turns speech into text. It can run on your own computer.',
}

const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const PATTERN = new RegExp(`\\b(${TERMS.map(escape).join('|')})\\b`, 'i')

export type Piece = { text: string; term?: string }

// Splits text so the FIRST mention of each glossary word can be explained.
export function splitGlossary(text: string, seen = new Set<string>()): Piece[] {
  const out: Piece[] = []
  let rest = text
  while (rest) {
    const m = PATTERN.exec(rest)
    if (!m) break
    const key = TERMS.find((t) => t.toLowerCase() === m[1].toLowerCase())!
    const explained = GLOSSARY[key]
    if (seen.has(explained)) {
      out.push({ text: rest.slice(0, m.index + m[1].length) })
    } else {
      seen.add(explained)
      if (m.index) out.push({ text: rest.slice(0, m.index) })
      out.push({ text: m[1], term: key })
    }
    rest = rest.slice(m.index + m[1].length)
  }
  if (rest) out.push({ text: rest })
  return out
}
