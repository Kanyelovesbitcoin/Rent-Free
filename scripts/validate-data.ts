// `npm run validate`: checks every file in /data. Runs in CI on every PR.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadCatalog, type RawFile } from '../src/lib/catalog'
import { loadGameCatalog } from '../src/lib/gameCatalog'

const dataDir = join(import.meta.dirname, '..', 'data')
const errors: string[] = []

const readJson = (rel: string): unknown => {
  try {
    return JSON.parse(readFileSync(join(dataDir, rel), 'utf8'))
  } catch (e) {
    errors.push(`${rel}: invalid JSON (${(e as Error).message})`)
    return null
  }
}
const readDir = (dir: string): RawFile[] =>
  readdirSync(join(dataDir, dir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ path: `${dir}/${f}`, json: readJson(`${dir}/${f}`) }))

const { catalog, errors: catalogErrors } = loadCatalog({
  categories: readJson('categories.json'),
  localModels: readJson('local-models.json'),
  apis: readJson('apis.json'),
  subscriptions: readDir('subscriptions'),
  alternatives: readDir('alternatives'),
})
errors.push(...catalogErrors)

const { catalog: games, errors: gameErrors } = loadGameCatalog({
  genres: readJson('game-genres.json'),
  drops: readJson('source-drops.json'),
  games: readDir('games'),
})
errors.push(...gameErrors)

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in /data:\n`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log(
  `✓ data OK: ${catalog.subscriptions.length} subscriptions, ${catalog.alternatives.length} alternatives, ` +
    `${catalog.categories.length} categories, ${catalog.localModels.length} local models, ${catalog.apis.length} APIs, ` +
    `${games.games.length} games, ${games.drops.length} source drops, ${games.genres.length} game genres`,
)
