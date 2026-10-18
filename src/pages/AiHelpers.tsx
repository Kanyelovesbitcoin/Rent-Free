import { Link } from 'react-router-dom'
import { AGENTS, type AgentId } from '../lib/agentPrompt'
import { Badge, PageHeader } from '../components/ui'
import Plain from '../components/Plain'

interface HelperInfo {
  id: AgentId
  who: string
  where: string
  ease: 1 | 2 | 3 // 3 = easiest for beginners
  link: string
  facts: string[]
}

// Plain-language facts about each AI coding helper. Checked 2026-10-18; plans change, so we link to the source.
const HELPERS: HelperInfo[] = [
  {
    id: 'claude-code',
    who: 'You already pay for Claude, or want one of the best AI coders.',
    where: 'Desktop app, terminal, or inside VS Code',
    ease: 2,
    link: 'https://claude.com/claude-code',
    facts: ['Made by Anthropic.', 'Comes with Claude Pro ($20/mo) and higher plans. The free Claude plan does not include it.', 'Asks before it changes files or runs commands.'],
  },
  {
    id: 'codex',
    who: 'You already pay for ChatGPT Plus.',
    where: 'Desktop app, terminal, inside your code editor, or on the web',
    ease: 2,
    link: 'https://developers.openai.com/codex',
    facts: ['Made by OpenAI.', 'Included with ChatGPT Plus ($20/mo) and higher plans.', 'Works in a safe "sandbox" so it only changes your project folder.'],
  },
  {
    id: 'opencode',
    who: "You want to spend $0, and you're okay typing a command or two.",
    where: 'Terminal (and a desktop app)',
    ease: 1,
    link: 'https://opencode.ai',
    facts: ['Free and open source.', 'Comes with some free AI models (they change often). Can also use free AI on your computer (LM Studio or Ollama).', 'Free AIs are a bit less smart, so keep projects small.'],
  },
  {
    id: 'cursor',
    who: 'You like seeing the code in an editor while the AI works.',
    where: 'Its own code editor app',
    ease: 2,
    link: 'https://cursor.com',
    facts: ['A code editor with AI built in.', 'Free "Hobby" plan with limits. Pro is $20/mo.', 'Good if you want to learn coding as you go.'],
  },
  {
    id: 'chat',
    who: 'You just want to try it, or the app is very small.',
    where: 'Claude.ai or ChatGPT in your browser',
    ease: 3,
    link: 'https://claude.ai',
    facts: ['Free plans work for small apps.', 'It gives you code to copy into files yourself, so it\'s more work for bigger apps.', 'Great for a link page, a simple tracker or a calculator.'],
  },
]

const DECIDE: { if: string; then: AgentId }[] = [
  { if: 'I already pay for ChatGPT Plus', then: 'codex' },
  { if: 'I already pay for Claude Pro', then: 'claude-code' },
  { if: 'I want to spend $0', then: 'opencode' },
  { if: 'I want to see the code as it works', then: 'cursor' },
  { if: 'I just want to try something tiny', then: 'chat' },
]

const FIRST_30 = [
  ['5 min', 'Pick your AI helper and install it', 'Use the chart above. Each one has a normal download page.'],
  ['2 min', 'Make an empty folder', 'For example, a folder on your Desktop called "my-booking-app".'],
  ['2 min', 'Open the folder in your AI helper', 'Desktop apps have an "Open folder" button. For the terminal: on a Mac, right-click the folder → "New Terminal at Folder". On Windows, right-click → "Open in Terminal".'],
  ['1 min', 'Give it the instructions', 'Download a starter kit from our Build your own page and unzip it into the folder. Then say: "Read START-HERE.md and let\'s build it."'],
  ['15 min', 'Answer its questions', 'It will ask what you want and ask permission to make files or run commands. If it\'s about your app, say yes.'],
  ['2 min', 'Open your app', 'It will tell you an address like http://localhost:5173. Paste it into your web browser. "localhost" just means "this computer".'],
  ['3 min', 'Ask for changes in plain words', 'Try: "make the buttons bigger", "add a dark mode", or "explain this like I\'m 10".'],
] as const

const SAFE = [
  "Never paste real passwords or card numbers into the chat.",
  'Keys for services go in a file named .env. The AI will help you make it. Never share that file.',
  "Read what it's about to do before you say yes, especially if it wants to delete something.",
  'Keep each project in its own folder.',
  'Ask it to "save a checkpoint" (a git commit) after each step that works. Then you can always go back.',
]

const FAQ = [
  ['Do I need to know how to code?', 'No. You describe what you want in plain words. Learning a little along the way helps, and the AI will explain anything you ask about.'],
  ['What if it breaks?', 'Copy the error message, paste it to the AI, and say "please fix this". That fixes most problems. If you saved checkpoints, you can also go back.'],
  ['How much does it cost?', 'About $20 a month for Claude Code, Codex or Cursor Pro, or $0 with OpenCode and free AI models. You can cancel when your app is done.'],
  ['Is it worth $20 a month just to build?', 'If you replace a few subscriptions, usually yes. Replacing $40 a month of apps pays for it in the first month. Then cancel the AI plan, or keep it to build more.'],
  ['How long does it take?', 'Small apps: an hour or two. Medium apps: an afternoon. Big apps: a weekend or two. Each Build your own page tells you.'],
  ['Can it see my private files?', "It works in the folder you open. Don't open it in a folder with private stuff, and read before you say yes."],
] as const

function Ease({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="text-xs font-bold text-ink-soft" aria-label={`Beginner-friendly: ${n} out of 3`}>
      Beginner-friendly: {'🟢'.repeat(n)}
      {'⚪'.repeat(3 - n)}
    </span>
  )
}

export default function AiHelpers() {
  return (
    <div className="space-y-16">
      <PageHeader eyebrow="👋 New to AI coding? Start here" title={<>Meet your <span className="hl">AI builder</span>.</>}>
        An AI coding helper is like a builder you can talk to. You say what app you want. It writes the code, runs it, and fixes its own mistakes. You don't need to know
        how to code.
      </PageHeader>

      <section>
        <h2 className="font-display text-3xl font-extrabold">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['💬', 'You describe it', 'Paste our instructions, or just say what you want.'],
            ['🗺️', 'It makes a plan', 'For bigger apps, it plans first and checks with you.'],
            ['🔨', 'It builds and tests', 'It writes the files, runs them, and fixes errors.'],
            ['🎉', 'You try it', 'Open it in your browser and ask for changes.'],
          ].map(([e, t, d], i) => (
            <li key={t} className="card p-5">
              <span className="text-3xl" aria-hidden>
                {e}
              </span>
              <p className="mt-2 font-display text-lg font-extrabold">
                {i + 1}. {t}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-display text-3xl font-extrabold">Which one should I use?</h2>
        <div className="card mt-5 divide-y-2 divide-dashed divide-line" data-testid="decide">
          {DECIDE.map((d) => (
            <p key={d.if} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <span>“{d.if}”</span>
              <span className="font-bold">
                →{' '}
                <button type="button" className="text-money underline" onClick={() => document.getElementById(d.then)?.scrollIntoView({ behavior: 'smooth' })}>
                  {AGENTS[d.then].name}
                </button>
              </span>
            </p>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {HELPERS.map((h) => (
            <article key={h.id} id={h.id} className="card scroll-mt-24 p-5">
              <h3 className="flex flex-wrap items-center gap-2 font-display text-xl font-extrabold">
                {AGENTS[h.id].name}
                <Badge className="bg-hilite/40 text-ink">💳 {AGENTS[h.id].cost}</Badge>
              </h3>
              <p className="mt-1 text-sm">
                <strong>Best if:</strong> {h.who}
              </p>
              <p className="text-sm">
                <strong>Where:</strong> {h.where}
              </p>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">
                {h.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Ease n={h.ease} />
                <a href={h.link} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
                  Get it ↗
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-soft">Prices and plans checked October 2026. They change often, so check the official page before you pay.</p>
      </section>

      <section>
        <h2 className="font-display text-3xl font-extrabold">Your first 30 minutes</h2>
        <ol className="mt-5 space-y-3" data-testid="first-30">
          {FIRST_30.map(([time, title, text], i) => (
            <li key={title} className="card flex gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-hilite font-display font-extrabold">{i + 1}</span>
              <span>
                <span className="font-bold">{title}</span> <span className="text-xs text-ink-soft">· {time}</span>
                <span className="mt-0.5 block text-sm text-ink-soft">
                  <Plain text={text} />
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-2xl font-extrabold">🌍 Putting your app online</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <strong>Keep it on your computer:</strong> free, private, and works while your computer is on.
            </li>
            <li>
              <strong>Free website:</strong> ask your AI helper <em>"Help me put this online with Cloudflare Pages"</em>. Netlify and Vercel work too (Vercel's free plan is for
              personal use).
            </li>
            <li>
              <strong>Your own server:</strong> rent a small one (about $6 a month) and use Coolify to run all your apps in one place.
            </li>
          </ul>
          <Link to="/toolbox" className="mt-3 inline-block text-sm font-bold text-money underline">
            See all the free building blocks →
          </Link>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-2xl font-extrabold">🛡️ Stay safe</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            {SAFE.map((s) => (
              <li key={s}>
                <Plain text={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-extrabold">Questions people ask</h2>
        <div className="mt-5 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card p-4">
              <summary className="cursor-pointer font-bold">{q}</summary>
              <p className="mt-2 text-sm text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pop rounded-3xl bg-ink p-8 text-center text-paper">
        <p className="font-display text-3xl font-extrabold">Ready to build your first app?</p>
        <p className="mt-2 text-paper/80">Pick an app you pay for. We'll write the instructions and pack a starter kit for you.</p>
        <Link to="/remake" className="btn mt-5 border-2 border-paper bg-hilite text-ink">
          Pick an app to build →
        </Link>
      </section>
    </div>
  )
}
