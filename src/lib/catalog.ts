import { z } from 'zod'
import { AlternativeSchema, CategorySchema, LocalModelSchema, SubscriptionSchema } from './schema'
import type { Alternative, Category, LocalModel, Subscription } from './schema'

export interface Catalog {
  categories: Category[]
  subscriptions: Subscription[]
  alternatives: Alternative[]
  localModels: LocalModel[]
}

export interface RawFile {
  // Path relative to /data, e.g. "subscriptions/calendly.json". Used for error messages + id checks.
  path: string
  json: unknown
}

const fileId = (path: string) => path.split('/').pop()!.replace(/\.json$/, '')

function formatZod(path: string, err: z.ZodError) {
  return err.issues.map((i) => `${path}: ${i.path.join('.') || '(root)'}: ${i.message}`)
}

// Parses and cross-checks every data file. Shared by the app, the CLI validator and the tests,
// so a bad PR fails CI with a readable message instead of breaking the site.
export function loadCatalog(input: {
  categories: unknown
  localModels: unknown
  subscriptions: RawFile[]
  alternatives: RawFile[]
}): { catalog: Catalog; errors: string[] } {
  const errors: string[] = []

  const cats = z.array(CategorySchema).safeParse(input.categories)
  if (!cats.success) errors.push(...formatZod('categories.json', cats.error))
  const models = z.array(LocalModelSchema).safeParse(input.localModels)
  if (!models.success) errors.push(...formatZod('local-models.json', models.error))

  const parseAll = <T>(files: RawFile[], schema: z.ZodType<T, z.ZodTypeDef, unknown>) =>
    files.flatMap((f) => {
      const r = schema.safeParse(f.json)
      if (!r.success) {
        errors.push(...formatZod(f.path, r.error))
        return []
      }
      const value = r.data as T & { id: string }
      if (value.id !== fileId(f.path)) errors.push(`${f.path}: id "${value.id}" must match the file name`)
      return [value]
    })

  const subscriptions = parseAll(input.subscriptions, SubscriptionSchema)
  const alternatives = parseAll(input.alternatives, AlternativeSchema)
  const categories = cats.success ? cats.data : []
  const localModels = models.success ? models.data : []

  const catIds = new Set(categories.map((c) => c.id))
  const altIds = new Set(alternatives.map((a) => a.id))
  const used = new Set<string>()

  for (const s of subscriptions) {
    const p = `subscriptions/${s.id}.json`
    if (!catIds.has(s.category)) errors.push(`${p}: unknown category "${s.category}" (see data/categories.json)`)
    if (!s.plans.some((pl) => pl.id === s.defaultPlan)) errors.push(`${p}: defaultPlan "${s.defaultPlan}" is not one of its plans`)
    for (const a of s.alternatives) {
      used.add(a)
      if (!altIds.has(a)) errors.push(`${p}: alternative "${a}" has no file in data/alternatives/`)
    }
    if (s.lastVerified > new Date().toISOString().slice(0, 10)) errors.push(`${p}: lastVerified is in the future`)
    if (s.kind !== 'software' && !s.remakeTarget) errors.push(`${p}: ${s.kind} subscriptions need a remakeTarget (what you'd build instead)`)
  }
  for (const a of alternatives) {
    if (!used.has(a.id)) errors.push(`alternatives/${a.id}.json: not used by any subscription`)
    if (a.hosting === 'partial' && a.keepFraction == null) errors.push(`alternatives/${a.id}.json: 'partial' hosting needs keepFraction`)
  }

  const dupes = (ids: string[]) => ids.filter((x, i) => ids.indexOf(x) !== i)
  for (const d of dupes(categories.map((c) => c.id))) errors.push(`categories.json: duplicate id "${d}"`)
  for (const d of dupes(localModels.map((m) => m.id))) errors.push(`local-models.json: duplicate id "${d}"`)

  return { catalog: { categories, subscriptions, alternatives, localModels }, errors }
}
