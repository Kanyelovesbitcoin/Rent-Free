import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LicenseBadge, PressStart } from '../../components/arcade'
import { FunNotStuff, GameCard } from '../../components/GameParts'
import { allDrops, allGames } from '../../lib/gameData'
import { OPENNESS } from '../../lib/games'
import type { Openness } from '../../lib/schema'

const PATHS = [
  {
    emoji: '🔓',
    title: 'Play what is already open',
    text: 'Some companies shared their game code. Fans also rebuilt old games so they run on new computers.',
    to: '/games/drops',
    cta: 'See source drops',
  },
  {
    emoji: '🧩',
    title: 'Try a free look-alike',
    text: 'Many paid games have a free, open-source cousin that plays a lot like them.',
    to: '/games#all-games',
    cta: 'Browse games',
  },
  {
    emoji: '🛠️',
    title: 'Make your own version',
    text: 'Pick what you love about a game. We write the instructions for an AI helper, and you share the game as open source.',
    to: '/games/build',
    cta: 'Make a game',
  },
]

const REASONS = ['🔌 Servers shut down', '🏚️ Old games break', '🧩 Mods keep games alive', '🛠️ Free engines got good', '🤖 AI rebuilds code fast']

export default function GamesHome() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Openness | 'all'>('all')
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return allGames.filter((g) => g.name.toLowerCase().includes(s) || g.fanProjects.some((p) => p.name.toLowerCase().includes(s))).slice(0, 6)
  }, [q])
  const shown = allGames.filter((g) => filter === 'all' || g.openness === filter)
  const scrollToGames = () => document.getElementById('all-games')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div>
      <section className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <p className="pixel inline-block bg-neon px-3 py-1 font-pixel text-sm font-bold text-[#110c22]">🎮 GAME MODE</p>
          <h1 className="glow mt-4 font-display text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl">
            Open-source the <span className="hl">games you love.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Lots of game code is going public right now. See what's already free, play it the legal way, or make your own open-source version with an AI helper. No coding needed.
          </p>

          <div className="pop mt-6 rounded-2xl bg-card p-4" data-testid="game-search">
            <label className="block">
              <span className="font-display text-lg font-extrabold">What game do you love?</span>
              <input className="field mt-2 py-3 text-base" type="search" placeholder="Type a game… (Minecraft, Stardew Valley, Doom)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="What game do you love?" />
            </label>
            {q.trim() && (
              <ul className="mt-3 space-y-1">
                {matches.map((g) => (
                  <li key={g.id}>
                    <Link to={`/games/${g.id}`} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 font-bold hover:bg-paper-2">
                      <span>{g.name}</span>
                      <span className="text-xs text-ink-soft">
                        {OPENNESS[g.openness].emoji} {OPENNESS[g.openness].label}
                      </span>
                    </Link>
                  </li>
                ))}
                {!matches.length && (
                  <li className="px-3 py-2 text-sm">
                    Not on our list yet.{' '}
                    <Link to={`/games/build?inspired=${encodeURIComponent(q.trim())}`} className="font-bold text-money underline">
                      Make your own "{q.trim()}"-style game →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PressStart to="/games/build">PRESS START: make a game</PressStart>
            <button type="button" onClick={scrollToGames} className="btn-ghost">
              Browse {allGames.length} games
            </button>
          </div>
        </div>

        <aside className="pop min-w-0 rounded-3xl bg-card p-5" data-testid="latest-drops">
          <p className="font-pixel text-sm font-bold text-money">📦 FRESH SOURCE DROPS</p>
          <p className="mt-1 text-sm text-ink-soft">Games and engines whose code just went public.</p>
          <ul className="mt-4 space-y-3">
            {allDrops.slice(0, 5).map((d) => (
              <li key={d.id} className="border-b-2 border-dashed border-line pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-ink-soft">{d.date.slice(0, 7)}</p>
                <p className="font-bold">{d.title}</p>
                <div className="mt-1">
                  <LicenseBadge drop={d} />
                </div>
              </li>
            ))}
          </ul>
          <Link to="/games/drops" className="btn-dark mt-4 w-full">
            See all drops and why it's happening →
          </Link>
        </aside>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {PATHS.map((p, i) => (
          <div key={p.title} className="card flex flex-col p-5">
            <p className="font-pixel text-xs font-bold text-ink-soft">PATH {i + 1}</p>
            <p className="mt-1 text-3xl" aria-hidden>
              {p.emoji}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold">{p.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{p.text}</p>
            {p.to.includes('#') ? (
              <button type="button" onClick={scrollToGames} className="btn-ghost mt-4 self-start">
                {p.cta} →
              </button>
            ) : (
              <Link to={p.to} className="btn-ghost mt-4 self-start">
                {p.cta} →
              </Link>
            )}
          </div>
        ))}
      </section>

      <section className="pop mt-10 rounded-3xl bg-card p-6" data-testid="why-teaser">
        <h2 className="font-display text-2xl font-extrabold">Why is everyone opening up their games?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <span key={r} className="pixel bg-paper-2 px-3 py-1 text-sm font-bold">
              {r}
            </span>
          ))}
        </div>
        <Link to="/games/drops" state={{ scrollTo: 'why' }} className="btn-primary mt-4">
          Read the 5 reasons →
        </Link>
      </section>

      <section id="all-games" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-3xl font-extrabold">Pick a game you love</h2>
        <p className="mt-1 text-ink-soft">See how open it is, then play it free or make your own version.</p>
        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="How open">
          {(['all', 'code-out', 'fans-rebuilt', 'look-alike', 'closed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold whitespace-nowrap ${filter === f ? 'border-ink bg-ink text-paper' : 'border-line bg-card'}`}
            >
              {f === 'all' ? '✨ All' : `${OPENNESS[f].emoji} ${OPENNESS[f].label}`}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
          <Link to="/games/build" className="card flex flex-col items-center justify-center gap-2 border-dashed p-6 text-center hover:border-ink">
            <span className="text-3xl" aria-hidden>
              ➕
            </span>
            <span className="font-display text-lg font-extrabold">My game isn't here</span>
            <span className="text-sm text-ink-soft">Make your own game from any idea.</span>
          </Link>
        </div>
      </section>

      <div className="mt-14">
        <FunNotStuff />
      </div>
    </div>
  )
}
