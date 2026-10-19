import { Link, useParams } from 'react-router-dom'
import { PressStart } from '../../components/arcade'
import { Chip, DropCard, FunNotStuff, OpenMeter } from '../../components/GameParts'
import Plain from '../../components/Plain'
import { ToolTile } from '../../components/ui'
import { getDrop, getGame, getGenre } from '../../lib/gameData'
import { gameTier, gameTierView } from '../../lib/games'

export default function GameDetail() {
  const { id = '' } = useParams()
  const game = getGame(id)
  if (!game)
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-6xl">👾</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold">Game not found</h1>
        <p className="mt-2 text-ink-soft">It's not on our list yet, but you can still make your own version.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/games" className="btn-ghost">
            ← All games
          </Link>
          <Link to="/games/build" className="btn-primary">
            Make a game
          </Link>
        </div>
      </div>
    )

  const genre = getGenre(game.genre)
  const drop = getDrop(game.dropId)
  const tier = gameTierView(gameTier({ base: genre.base, features: game.lovedFeatures, players: genre.defaultPlayers, platform: 'browser' }))

  return (
    <div>
      <p className="mb-4 text-sm font-bold text-ink-soft">
        <Link to="/games" className="hover:text-ink">
          🎮 Games
        </Link>{' '}
        / {game.name}
      </p>
      <header className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <ToolTile name={game.name} size={64} />
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-tight font-extrabold sm:text-5xl">{game.name}</h1>
              <p className="font-bold text-ink-soft">
                {genre.emoji} {genre.name}
              </p>
            </div>
          </div>
          <p className="mt-4 text-lg">{game.what}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {game.openness === 'code-out' && (
              <Link to={`/games/build/${game.id}?mode=tinker`} className="btn-primary">
                🛠️ Tinker with the released code
              </Link>
            )}
            {game.fanProjects[0] && (
              <a href={game.fanProjects[0].website} target="_blank" rel="noreferrer" className={game.openness === 'code-out' ? 'btn-ghost' : 'btn-primary'}>
                ▶ Play {game.fanProjects[0].name} free ↗
              </a>
            )}
            <Link to={`/games/build/${game.id}`} className="btn-dark">
              ✨ Make my own version
            </Link>
          </div>
        </div>
        <div className="pop min-w-0 rounded-3xl bg-card p-5">
          <OpenMeter openness={game.openness} />
        </div>
      </header>

      {drop && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-2xl font-extrabold">🔓 The official code release</h2>
          <DropCard drop={drop} showGameLink={false} />
        </section>
      )}

      {game.fanProjects.length > 0 && (
        <section className="mt-10" data-testid="fan-projects">
          <h2 className="font-display text-2xl font-extrabold">{game.openness === 'fans-rebuilt' ? '🛠️ Fans rebuilt it' : '🧩 Free games like it'}</h2>
          <p className="mt-1 text-ink-soft">Made by volunteers. Free and open source.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {game.fanProjects.map((p) => (
              <article key={p.name} className="card flex flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-extrabold">{p.name}</h3>
                  <Chip>{p.license}</Chip>
                </div>
                <p className="mt-1 text-sm">
                  <Plain text={p.what} />
                </p>
                <div className="mt-2">
                  <Chip tone={p.needsYourCopy ? 'warn' : 'good'}>{p.needsYourCopy ? `💿 Needs your own copy of ${game.name}` : '✅ Free to play, nothing to buy'}</Chip>
                </div>
                {p.howToPlay.length > 0 && (
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                    {p.howToPlay.map((s) => (
                      <li key={s}>
                        <Plain text={s} />
                      </li>
                    ))}
                  </ol>
                )}
                <a href={p.website} target="_blank" rel="noreferrer" className="btn-ghost mt-4 self-start px-3 py-1.5">
                  Get {p.name} ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="pop mt-10 rounded-3xl bg-card p-6" data-testid="make-your-own">
        <p className="font-pixel text-sm font-bold text-money">✨ MAKE YOUR OWN VERSION</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold">Love {game.name}? Make a game with the parts you love.</h2>
        <p className="mt-1 text-ink-soft">Tick what you love. We write the instructions for Claude Code, Codex or another AI helper, and you share your game as open source.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {game.lovedFeatures.map((f) => (
            <Chip key={f}>{f}</Chip>
          ))}
        </div>
        <p className="mt-4 text-sm font-bold">
          Job size: {tier.emoji} {tier.label} ({tier.likeA}, {tier.effort})
        </p>
        {game.scopeNote && <p className="mt-1 text-sm text-ink-soft">{game.scopeNote}</p>}
        <div className="mt-5">
          <PressStart to={`/games/build/${game.id}`}>PRESS START</PressStart>
        </div>
      </section>

      <div className="mt-10">
        <FunNotStuff legalNote={game.legalNote} />
      </div>
      <p className="mt-4 text-xs text-ink-soft">
        Checked {game.lastVerified}.{' '}
        <a href={game.sourceUrl} target="_blank" rel="noreferrer" className="underline">
          Source
        </a>
        . {game.name} is a trademark of its owner, used only to say which game we mean.
      </p>
    </div>
  )
}
