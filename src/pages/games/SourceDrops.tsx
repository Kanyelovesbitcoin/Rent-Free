import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DropCard } from '../../components/GameParts'
import { PageHeader, REPO_URL } from '../../components/ui'
import { allDrops, getGame } from '../../lib/gameData'

// Each reason links to where we read it. Plain words first, details on tap.
export const WHY = [
  {
    emoji: '🔌',
    title: 'Games die when servers turn off',
    text: 'Many games need a company computer (a server) to work. When the company turns it off, the game you paid for can stop working. Over 1.29 million people in Europe signed "Stop Killing Games" to change that. In June 2026 the EU said it won\'t make a new law yet. It will start talks with game companies by the end of 2026 instead. Some studios now share their code so fans can keep games alive.',
    links: [
      { label: 'EU response (June 2026)', href: 'https://www.lewissilkin.com/insights/2026/06/24/european-commission-stops-short-of-imposing-mandatory-requirements-following-citi-102n4yy' },
      { label: 'Unturned: "a lasting legacy"', href: 'https://www.pcgamer.com/games/survival-crafting/blocky-zombie-survival-sim-unturned-releases-its-source-code-so-players-can-build-a-lasting-legacy-for-the-game-regardless-of-the-changes-we-make/' },
    ],
  },
  {
    emoji: '🏚️',
    title: 'Old games break on new computers',
    text: 'Computers change, and old games stop running. With the code, fans can fix them. EA dug up the code for its old Command & Conquer games from old backups. Microsoft worked with the Internet Archive to share Zork.',
    links: [
      { label: 'EA and Command & Conquer', href: 'https://www.gamesradar.com/games/command-conquer/ea-is-releasing-the-fully-recovered-source-code-for-4-classic-command-and-conquer-titles-and-its-the-best-thing-a-major-publisher-can-do-for-game-preservation/' },
      { label: 'Microsoft and Zork', href: 'https://opensource.microsoft.com/blog/2025/11/20/preserving-code-that-shaped-generations-zork-i-ii-and-iii-go-open-source/' },
    ],
  },
  {
    emoji: '🧩',
    title: 'Mods keep games alive (and selling)',
    text: 'When fans can change a game, they make new maps, units and fixes for years. EA shared its code together with new modding tools. The art stays theirs, so people still buy the game.',
    links: [{ label: 'EA: Steam Workshop and code', href: 'https://www.ea.com/games/command-and-conquer/news/steam-workshop-support' }],
  },
  {
    emoji: '🛠️',
    title: 'Free game engines got really good',
    text: 'Free, open-source game makers like Godot can now power real hit games. Even big engines are opening up: COCOS 4 went MIT in January 2026, and the engine behind EVE Online was opened in July 2026.',
    links: [
      { label: 'COCOS 4 goes open source', href: 'https://itsfoss.com/news/cocos-4-game-engine/' },
      { label: 'EVE Online\'s Carbon engine', href: 'https://www.opensourceforu.com/2026/07/fenris-creations-carbon-game-engine-goes-open-source-on-github/' },
    ],
  },
  {
    emoji: '🤖',
    title: 'AI can rebuild old code much faster',
    text: 'AI helpers like Claude Code can now help turn finished games back into code ("decompile" them) much faster. One fan rebuilt a Nintendo 64 game in 84 days with lots of AI help. Its sequel took him 596 days, though he says his own practice helped too. In October 2026, hundreds of AI-rebuilt copies of famous games showed up in web browsers. Most of these copies break copyright, and companies can take them down. That is why Rent-Free only shows you the legal ways.',
    links: [
      { label: '84 days with AI help', href: 'https://blog.chrislewis.au/decompiling-a-nintendo-64-game-in-84-days/' },
      { label: 'Kotaku on AI browser ports', href: 'https://kotaku.com/we-might-be-cooked-as-these-vibe-coded-web-browser-ports-of-halo-the-simpsons-hit-and-run-and-gta-vice-city-seem-to-work-perfectly-2000743300' },
    ],
  },
]

const FAQ = [
  {
    q: "Can I just ask an AI to copy a game's code?",
    a: "Please don't. Code an AI rebuilds from a game you bought still belongs to the company, and sharing it (or the game's art and music) usually breaks copyright. Instead, use code the company released, play a fan-made rebuild with your own copy, or make your own original game. Our prompts tell the AI to never decompile or copy.",
  },
  {
    q: 'If the code is free, is the game free?',
    a: "Not always. The code is the engine. The art, music, maps and name are often still owned by the company, so you may need your own bought copy to play. Each drop shows this with a 💿 or ✅ tag.",
  },
  {
    q: 'Is it legal to make a game "like" another game?',
    a: 'Usually yes, if you make it your own. In the US, the rules and ideas of a game cannot be owned. Its name, art, music, story, characters and exact look can. In 2012 a court ruled against a game that copied Tetris\'s look too closely. Copy the fun, not the stuff.',
  },
  {
    q: 'What is "source-available"?',
    a: 'You can see and change the code, but the license has limits, often "no selling". It is not truly open source. Unturned is like this: great for learning and mods, not for selling.',
  },
  {
    q: 'Can I sell a game I make with Rent-Free?',
    a: 'Your own original game: yes. If you build on released code, follow its license. GPL means you share your code too; source-available often means no selling.',
  },
]

export default function SourceDrops() {
  const { state } = useLocation() as { state?: { scrollTo?: string } }
  useEffect(() => {
    if (state?.scrollTo) setTimeout(() => document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [state])

  return (
    <div>
      <PageHeader eyebrow="📦 Source drops" title={<>Games going <span className="hl">open source</span> right now</>}>
        A "source drop" is when a company shares a game's code with everyone. Here are the newest ones, plus why it keeps happening.
      </PageHeader>

      <section className="mb-8 grid gap-3 sm:grid-cols-3" data-testid="license-kinds">
        <div className="card p-4">
          <p className="font-bold">🔓 Truly open</p>
          <p className="mt-1 text-sm text-ink-soft">MIT, GPL and friends. Anyone can use, change and share the code.</p>
        </div>
        <div className="card p-4">
          <p className="font-bold">🎁 No rules</p>
          <p className="mt-1 text-sm text-ink-soft">Public domain (CC0). A gift to everyone. Use it for anything.</p>
        </div>
        <div className="card p-4">
          <p className="font-bold">👀 Open with limits</p>
          <p className="mt-1 text-sm text-ink-soft">"Source-available". You can learn and make mods, but the license has extra rules, often "no selling".</p>
        </div>
        <div className="card p-4 sm:col-span-3">
          <p className="font-bold">🎨 Code ≠ art</p>
          <p className="mt-1 text-sm text-ink-soft">
            The code is the game's engine. The pictures, music and levels are separate, and often still belong to the company. That's why some drops say "you need your own copy".
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2" data-testid="drops">
        {allDrops.map((d) => (
          <DropCard key={d.id} drop={d} tinkerable={!!d.gameId && getGame(d.gameId)?.openness === 'code-out'} />
        ))}
      </div>

      <section id="why" className="mt-14 scroll-mt-24" data-testid="why">
        <h2 className="font-display text-3xl font-extrabold">❓ Why is this happening?</h2>
        <p className="mt-1 max-w-2xl text-ink-soft">Five big reasons, in plain words. Tap a link to read where we found it.</p>
        <ol className="mt-5 space-y-4">
          {WHY.map((w, i) => (
            <li key={w.title} className="card flex gap-4 p-5">
              <span className="pixel flex h-11 w-11 shrink-0 items-center justify-center bg-paper-2 text-2xl" aria-hidden>
                {w.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-extrabold">
                  {i + 1}. {w.title}
                </h3>
                <p className="mt-1 text-sm">{w.text}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
                  {w.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-money underline">
                      {l.label} ↗
                    </a>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14" data-testid="games-faq">
        <h2 className="font-display text-3xl font-extrabold">Questions people ask</h2>
        <div className="mt-4 space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="card p-4">
              <summary className="cursor-pointer font-bold">{f.q}</summary>
              <p className="mt-2 text-sm">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pop mt-12 rounded-3xl bg-card p-6 text-center">
        <p className="font-display text-2xl font-extrabold">Spotted a new source drop?</p>
        <p className="mt-1 text-ink-soft">Tell us and we'll add it. It takes 2 minutes and helps everyone.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a href={`${REPO_URL}/issues/new?template=source-drop.yml`} target="_blank" rel="noreferrer" className="btn-primary">
            📦 Tell us about a drop
          </a>
          <Link to="/games/build" className="btn-ghost">
            🛠️ Make your own game
          </Link>
        </div>
      </section>
    </div>
  )
}
