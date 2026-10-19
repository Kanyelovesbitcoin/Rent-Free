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
  localhost: 'Means "this computer". An address like http://localhost:5173 opens an app that is running on your own computer.',
  'environment variable': 'A setting your app reads when it starts, like a key for a service. Kept in a file called .env.',
  deploy: 'Putting your app online so other people (or your phone) can open it.',
  'coding agent': 'An AI that writes, runs and fixes code for you, like Claude Code or Codex.',
  git: 'A free tool that saves checkpoints of your project, so you can always go back.',
  commit: 'One saved checkpoint of your project in git.',
  sandbox: 'A safe space where the AI can only touch your project folder.',
  // Game mode words
  'source code': 'The written instructions that make a game or app work. Releasing it lets anyone see and change how it works.',
  decompile: 'Turning a finished game back into code by reverse engineering. Sharing code made this way usually breaks copyright.',
  decompiled: 'Turned back into code from a finished game. Sharing code made this way usually breaks copyright.',
  'game engine': 'The part of a game that draws the screen, plays sounds and runs the rules. The art and levels sit on top.',
  assets: "A game's pictures, music, sounds and levels. Often still owned by the company even when the code is free.",
  mod: 'A fan-made change to a game, like a new level, character or rule.',
  mods: 'Fan-made changes to a game, like new levels, characters or rules.',
  port: 'A version of a game made to run on a different device, like a Steam Deck or a phone.',
  CC0: 'A "no rules" license. You can use it for anything, even selling, without asking.',
  'CC BY': 'A license that lets you reuse something as long as you credit the person who made it.',
  GPL: 'A free license. Anyone can use and change the code, but if they share their version it must stay open source too.',
  'GPL-3.0': 'A free license. Anyone can use and change the code, but if they share their version it must stay open source too.',
  'GPL v3': 'A free license. Anyone can use and change the code, but if they share their version it must stay open source too.',
  MIT: 'A very simple free license. Do almost anything with the code; just keep the original names on it.',
  'source-available': 'You can see and change the code, but the license has limits, often "no selling". Not truly open source.',
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
