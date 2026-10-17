import { z } from 'zod'
import { DEFAULT_SERVER_MONTHLY, yearlyCost, type Line } from './savings'
import { alternativesForCategory, getAlternative, getSubscription } from './data'
import type { Alternative, Plan, Subscription } from './schema'

// What the user picked. Kept short because it's stored in the share URL.
const BillingSchema = z.enum(['monthly', 'annual'])
const CatalogItemSchema = z.object({
  t: z.literal('c'),
  id: z.string(),
  plan: z.string(),
  billing: BillingSchema,
  seats: z.number().int().min(1).max(10000).default(1),
  alt: z.string().nullable(),
  price: z.number().nonnegative().nullable().optional(),
})
const CustomItemSchema = z.object({
  t: z.literal('u'),
  id: z.string(),
  name: z.string().max(80),
  category: z.string(),
  price: z.number().nonnegative(),
  billing: BillingSchema,
  alt: z.string().nullable(),
})
const ItemSchema = z.discriminatedUnion('t', [CatalogItemSchema, CustomItemSchema])
export const SelectionSchema = z.object({
  items: z.array(ItemSchema).max(200),
  server: z.number().nonnegative().max(10000).default(DEFAULT_SERVER_MONTHLY),
})

export type CatalogItem = z.infer<typeof CatalogItemSchema>
export type CustomItem = z.infer<typeof CustomItemSchema>
export type Item = z.infer<typeof ItemSchema>
export type Selection = z.infer<typeof SelectionSchema>

export const emptySelection = (): Selection => ({ items: [], server: DEFAULT_SERVER_MONTHLY })

export function newCatalogItem(sub: Subscription): CatalogItem {
  const plan = sub.plans.find((p) => p.id === sub.defaultPlan)!
  return {
    t: 'c',
    id: sub.id,
    plan: plan.id,
    billing: plan.monthlyPrice != null ? 'monthly' : 'annual',
    seats: 1,
    alt: sub.alternatives[0],
  }
}

export function newCustomItem(fields: Omit<CustomItem, 't' | 'id' | 'alt'>): CustomItem {
  const suggested = alternativesForCategory(fields.category)[0]
  return { t: 'u', id: 'custom-' + Math.random().toString(36).slice(2, 8), alt: suggested?.id ?? null, ...fields }
}

export interface ResolvedItem {
  item: Item
  key: string
  name: string
  category: string
  sub?: Subscription
  plan?: Plan
  currentYearly: number
  alternative: Alternative | null
  choices: Alternative[]
}

export function resolveItem(item: Item): ResolvedItem | null {
  if (item.t === 'c') {
    const sub = getSubscription(item.id)
    if (!sub) return null
    const plan = sub.plans.find((p) => p.id === item.plan) ?? sub.plans[0]
    const choices = sub.alternatives.map((a) => getAlternative(a)!).filter(Boolean)
    return {
      item,
      key: item.id,
      name: sub.name,
      category: sub.category,
      sub,
      plan,
      currentYearly: yearlyCost(plan, item.billing, item.seats, item.price),
      alternative: (item.alt && choices.find((c) => c.id === item.alt)) || null,
      choices,
    }
  }
  const choices = alternativesForCategory(item.category)
  return {
    item,
    key: item.id,
    name: item.name,
    category: item.category,
    currentYearly: item.billing === 'monthly' ? item.price * 12 : item.price,
    alternative: (item.alt && choices.find((c) => c.id === item.alt)) || null,
    choices,
  }
}

export const toLines = (resolved: ResolvedItem[]): Line[] =>
  resolved.map((r) => ({ key: r.key, currentYearly: r.currentYearly, alternative: r.alternative }))

// --- share URL encoding (base64url JSON; nothing is sent to a server) ---

export function encodeSelection(sel: Selection): string {
  const bytes = new TextEncoder().encode(JSON.stringify(sel))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeSelection(encoded: string): Selection | null {
  try {
    const bin = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
    const parsed = SelectionSchema.safeParse(JSON.parse(json))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
