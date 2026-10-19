import { Link } from 'react-router-dom'
import { getDrop, getGenre } from '../lib/gameData'
import type { Game, SourceDrop } from '../lib/schema'
import { LicenseBadge, OpenMeter } from './arcade'
import Plain from './Plain'
import { ToolTile } from './ui'

const nice = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function Chip({ children, tone = 'plain' }: { children: React.ReactNode; tone?: 'good' | 'warn' | 'plain' }) {
  const cls = tone === 'good' ? 'bg-money-soft text-money-ink' : tone === 'warn' ? 'bg-rent-soft text-rent' : 'bg-paper-2 text-ink-soft'
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{children}</span>
}

// One official code release: what came out, the rules, why they did it, and how to play.
export function DropCard({ drop, showGameLink = true, tinkerable = false }: { drop: SourceDrop; showGameLink?: boolean; tinkerable?: boolean }) {
  return (
    <article className="card p-5" data-testid={`drop-${drop.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="pixel bg-hilite px-2 py-0.5 font-pixel text-xs font-bold text-[#1b1915]">{nice(drop.date)}</span>
        <Chip>{drop.kind === 'engine' ? '⚙️ Game engine' : '🕹️ Game'}</Chip>
        <LicenseBadge drop={drop} />
      </div>
      <h3 className="mt-3 font-display text-xl font-extrabold">{drop.title}</h3>
      <p className="text-sm text-ink-soft">Released by {drop.by}</p>
      <p className="mt-2">
        <Plain text={drop.what} />
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip tone={drop.includesArt ? 'good' : 'warn'}>{drop.includesArt ? '🎨 Art and music included' : '🎨 Art and music not included'}</Chip>
        <Chip tone={drop.needsYourCopy ? 'warn' : 'good'}>{drop.needsYourCopy ? '💿 You need your own copy to play' : '✅ Free to play'}</Chip>
      </div>
      <p className="mt-3 rounded-xl bg-paper-2 p-3 text-sm">
        <span className="font-bold">Why they did it: </span>
        {drop.why}
      </p>
      {drop.howToPlay.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-bold">How to play or try it</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {drop.howToPlay.map((s) => (
              <li key={s}>
                <Plain text={s} />
              </li>
            ))}
          </ol>
        </details>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {tinkerable && drop.gameId && (
          <Link to={`/games/build/${drop.gameId}?mode=tinker`} className="btn-primary px-3 py-1.5">
            🛠️ Tinker with the code
          </Link>
        )}
        {showGameLink && drop.gameId && (
          <Link to={`/games/${drop.gameId}`} className="btn-ghost px-3 py-1.5">
            Game page →
          </Link>
        )}
        {drop.repoUrl && (
          <a href={drop.repoUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
            See the code ↗
          </a>
        )}
        <a href={drop.sourceUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5">
          Source ↗
        </a>
      </div>
      <p className="mt-2 text-xs text-ink-soft">Checked {drop.lastVerified}.</p>
    </article>
  )
}

// The one legal rule for making your own version.
export function FunNotStuff({ legalNote }: { legalNote?: string }) {
  return (
    <section className="card p-5" data-testid="fun-not-stuff">
      <h2 className="font-display text-xl font-extrabold">⚖️ Copy the fun, not the stuff</h2>
      <p className="mt-1 text-sm text-ink-soft">In the US, nobody can own the rules of a game or how it plays. But they do own how it looks and sounds, and its story.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-money-soft p-4 text-money-ink">
          <p className="font-bold">✅ OK to use</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            <li>The kind of game (a farming game, a kart racer)</li>
            <li>Rules and ideas (plant, grow, sell; drift to boost)</li>
            <li>Your own art, or free art with a license</li>
          </ul>
        </div>
        <div className="rounded-xl bg-rent-soft p-4 text-rent">
          <p className="font-bold">🚫 Not OK</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            <li>The name, logo, characters or story</li>
            <li>Its art, music, sounds or level maps</li>
            <li>Its code, or code an AI "decompiled" from it</li>
            <li>Making it look almost the same</li>
          </ul>
        </div>
      </div>
      {legalNote && <p className="mt-3 rounded-xl bg-paper-2 p-3 text-sm font-semibold">⚠️ {legalNote}</p>}
    </section>
  )
}

export function GameCard({ game }: { game: Game }) {
  const genre = getGenre(game.genre)
  const drop = getDrop(game.dropId)
  return (
    <Link to={`/games/${game.id}`} className="card group flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink" data-testid={`game-${game.id}`}>
      <div className="flex items-center gap-3">
        <ToolTile name={game.name} size={44} />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-extrabold">{game.name}</p>
          <p className="text-xs font-bold text-ink-soft">
            {genre.emoji} {genre.name}
          </p>
        </div>
      </div>
      <OpenMeter openness={game.openness} compact />
      <p className="text-sm text-ink-soft">{game.what}</p>
      <p className="mt-auto text-sm font-bold text-money">
        {game.openness === 'code-out' && drop ? `Code out under ${drop.license} →` : game.fanProjects.length ? `Free: ${game.fanProjects[0].name} →` : 'Make your own version →'}
      </p>
    </Link>
  )
}

export { OpenMeter }
