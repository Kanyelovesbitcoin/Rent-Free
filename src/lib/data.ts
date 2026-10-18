import { loadCatalog, type RawFile } from './catalog'
import categories from '../../data/categories.json'
import localModels from '../../data/local-models.json'
import apis from '../../data/apis.json'

// Vite bundles every JSON file in /data at build time. Adding a tool = adding a file; no code changes.
const toFiles = (mods: Record<string, unknown>, dir: string): RawFile[] =>
  Object.entries(mods).map(([p, json]) => ({ path: `${dir}/${p.split('/').pop()}`, json }))

const { catalog, errors } = loadCatalog({
  categories,
  localModels,
  apis,
  subscriptions: toFiles(import.meta.glob('../../data/subscriptions/*.json', { eager: true, import: 'default' }), 'subscriptions'),
  alternatives: toFiles(import.meta.glob('../../data/alternatives/*.json', { eager: true, import: 'default' }), 'alternatives'),
})
if (errors.length) console.warn('Rent-Free data problems:\n' + errors.join('\n'))

export const { subscriptions, alternatives, categories: allCategories, localModels: allLocalModels, apis: allApis } = catalog
export { catalog, errors as dataErrors }

const subById = new Map(subscriptions.map((s) => [s.id, s]))
const altById = new Map(alternatives.map((a) => [a.id, a]))
const catById = new Map(allCategories.map((c) => [c.id, c]))

export const getSubscription = (id: string) => subById.get(id)
export const getAlternative = (id: string) => altById.get(id)
export const getCategory = (id: string) => catById.get(id) ?? catById.get('other')!

// Alternatives used by catalog tools in a category, in order. Lets custom entries get suggestions.
export function alternativesForCategory(categoryId: string) {
  const ids = subscriptions.filter((s) => s.category === categoryId).flatMap((s) => s.alternatives)
  return [...new Set(ids)].map((id) => altById.get(id)!).filter(Boolean)
}

export const byPopularity = [...subscriptions].sort((a, b) => a.popularity - b.popularity)

// Cheapest way to pay for a subscription, as a monthly figure ("from $X/mo").
export function fromMonthly(sub: (typeof subscriptions)[number]) {
  return Math.min(...sub.plans.map((p) => p.monthlyPrice ?? (p.annualPrice ?? Infinity) / 12))
}

// One-click starter stacks for the home page.
export const STARTER_STACKS = [
  { id: 'household', name: 'Typical household', emoji: '🏠', blurb: 'Streaming, music, shopping, cloud photos and AI.', ids: ['netflix', 'spotify', 'amazon-prime', 'disney-plus', 'icloud', 'chatgpt'] },
  { id: 'creator', name: 'Creator', emoji: '🎥', blurb: 'Design, editing, AI, notes, links and bookings.', ids: ['canva', 'capcut', 'chatgpt', 'notion', 'linktree', 'calendly', 'descript'] },
  { id: 'business', name: 'Small business', emoji: '💼', blurb: 'Office, books, meetings, email, website and signatures.', ids: ['microsoft-365', 'quickbooks', 'zoom', 'mailchimp', 'squarespace', 'docusign', '1password'] },
].map((s) => ({ ...s, ids: s.ids.filter((id) => subById.has(id)) }))
