import { loadGameCatalog } from './gameCatalog'
import genres from '../../data/game-genres.json'
import drops from '../../data/source-drops.json'

// Game mode data, bundled at build time like the rest of /data. Adding a game = adding a file.
const files = Object.entries(import.meta.glob('../../data/games/*.json', { eager: true, import: 'default' })).map(([p, json]) => ({
  path: `games/${p.split('/').pop()}`,
  json,
}))

const { catalog, errors } = loadGameCatalog({ genres, drops, games: files })
if (errors.length) console.warn('Rent-Free game data problems:\n' + errors.join('\n'))

export const { genres: allGenres, drops: allDrops } = catalog
export const allGames = [...catalog.games].sort((a, b) => a.popularity - b.popularity)
export { errors as gameDataErrors }

const gameById = new Map(allGames.map((g) => [g.id, g]))
const genreById = new Map(allGenres.map((g) => [g.id, g]))
const dropById = new Map(allDrops.map((d) => [d.id, d]))

export const getGame = (id: string) => gameById.get(id)
export const getGenre = (id: string) => genreById.get(id) ?? allGenres[0]
export const getDrop = (id?: string) => (id ? dropById.get(id) : undefined)
