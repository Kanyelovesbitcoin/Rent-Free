import { z } from 'zod'
import { GameGenreSchema, GameSchema, SourceDropSchema } from './schema'
import type { Game, GameGenre, SourceDrop } from './schema'
import type { RawFile } from './catalog'

export interface GameCatalog {
  genres: GameGenre[]
  drops: SourceDrop[]
  games: Game[]
}

const fileId = (path: string) => path.split('/').pop()!.replace(/\.json$/, '')
const formatZod = (path: string, err: z.ZodError) => err.issues.map((i) => `${path}: ${i.path.join('.') || '(root)'}: ${i.message}`)

// Parses and cross-checks the Game mode data. Shared by the app, `npm run validate` and the tests.
export function loadGameCatalog(input: { genres: unknown; drops: unknown; games: RawFile[] }): { catalog: GameCatalog; errors: string[] } {
  const errors: string[] = []
  const today = new Date().toISOString().slice(0, 10)

  const g = z.array(GameGenreSchema).safeParse(input.genres)
  if (!g.success) errors.push(...formatZod('game-genres.json', g.error))
  const d = z.array(SourceDropSchema).safeParse(input.drops)
  if (!d.success) errors.push(...formatZod('source-drops.json', d.error))
  const genres = g.success ? g.data : []
  const drops = d.success ? [...d.data].sort((a, b) => b.date.localeCompare(a.date)) : []

  const games = input.games.flatMap((f) => {
    const r = GameSchema.safeParse(f.json)
    if (!r.success) {
      errors.push(...formatZod(f.path, r.error))
      return []
    }
    if (r.data.id !== fileId(f.path)) errors.push(`${f.path}: id "${r.data.id}" must match the file name`)
    return [r.data]
  })

  const genreIds = new Set(genres.map((x) => x.id))
  const dropIds = new Set(drops.map((x) => x.id))
  const gameIds = new Set(games.map((x) => x.id))

  for (const game of games) {
    const p = `games/${game.id}.json`
    if (!genreIds.has(game.genre)) errors.push(`${p}: unknown genre "${game.genre}" (see data/game-genres.json)`)
    if (game.dropId && !dropIds.has(game.dropId)) errors.push(`${p}: dropId "${game.dropId}" is not in data/source-drops.json`)
    if (game.openness === 'code-out' && !game.dropId) errors.push(`${p}: "code-out" games need a dropId (the official release)`)
    if ((game.openness === 'fans-rebuilt' || game.openness === 'look-alike') && !game.fanProjects.length)
      errors.push(`${p}: "${game.openness}" games need at least one fanProjects entry`)
    if (game.lastVerified > today) errors.push(`${p}: lastVerified is in the future`)
  }
  for (const drop of drops) {
    if (drop.gameId && !gameIds.has(drop.gameId)) errors.push(`source-drops.json: "${drop.id}" points at unknown gameId "${drop.gameId}"`)
    if (drop.lastVerified > today) errors.push(`source-drops.json: "${drop.id}" lastVerified is in the future`)
  }

  const dupes = (ids: string[]) => ids.filter((x, i) => ids.indexOf(x) !== i)
  for (const x of dupes(genres.map((y) => y.id))) errors.push(`game-genres.json: duplicate id "${x}"`)
  for (const x of dupes(drops.map((y) => y.id))) errors.push(`source-drops.json: duplicate id "${x}"`)

  return { catalog: { genres, drops, games }, errors }
}
