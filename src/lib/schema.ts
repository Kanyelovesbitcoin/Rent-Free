import { z } from 'zod'

// Every JSON file in /data is checked against these schemas (scripts/validate-data.ts).
// If you're adding a tool, this file is the reference for what each field means.

const id = z.string().regex(/^[a-z0-9-]+$/, 'ids are lowercase-with-dashes')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD')

export const CategorySchema = z.object({
  id,
  name: z.string(),
  emoji: z.string(),
  // Which wireframe template the build kit shows (see src/lib/wireframes).
  wireframe: z.enum(['scheduling', 'video-editing', 'ai-chat', 'notes', 'forms', 'link-in-bio', 'email', 'generic']),
})

export const PlanSchema = z
  .object({
    id,
    name: z.string(),
    // Price per month when billed month-to-month. null if the plan can't be billed monthly.
    monthlyPrice: z.number().nonnegative().nullable(),
    // Total price per YEAR when billed annually. null if there's no annual option.
    annualPrice: z.number().nonnegative().nullable(),
    perSeat: z.boolean().default(false),
  })
  .refine((p) => p.monthlyPrice !== null || p.annualPrice !== null, 'a plan needs a monthly or annual price')

export const SubscriptionSchema = z.object({
  id,
  name: z.string(),
  category: id,
  website: z.string().url(),
  // One plain-English sentence: what do people actually use it for?
  description: z.string(),
  // The handful of features that matter. These feed the build prompt.
  coreFeatures: z.array(z.string()).min(3),
  plans: z.array(PlanSchema).min(1),
  defaultPlan: id,
  // Where the price came from, and when someone last checked it.
  sourceUrl: z.string().url(),
  lastVerified: isoDate,
  priceNote: z.string().optional(),
  // Alternative ids, best first. The first one is the "Pick for me" choice.
  alternatives: z.array(id).min(1),
  // Show the Local AI advisor on this tool's page.
  localAI: z.boolean().default(false),
})

export const HostingSchema = z.enum([
  'desktop', // install an app, runs on your computer, $0
  'browser', // free web app / free hosted tier, $0
  'self-host', // runs on a small server you rent (shared across all your self-hosted apps)
  'pay-as-you-go', // you pay only for what you use
])

export const AlternativeSchema = z.object({
  id,
  name: z.string(),
  website: z.string().url(),
  repo: z.string().url().optional(),
  license: z.string(),
  hosting: HostingSchema,
  // Typical monthly cost for pay-as-you-go tools. Everything else is $0 (self-host server is counted once, separately).
  monthlyCost: z.number().nonnegative().default(0),
  platforms: z.array(z.string()).min(1),
  difficulty: z.enum(['easy', 'medium', 'weekend']),
  setupHours: z.number().positive(),
  summary: z.string(),
  gains: z.array(z.string()).min(1),
  tradeoffs: z.array(z.string()).min(1),
  setupSteps: z.array(z.string()).min(2),
  freeTierLimits: z.string().optional(),
})

export const LocalModelSchema = z.object({
  id,
  name: z.string(),
  ollamaTag: z.string(),
  paramsB: z.number().positive(),
  // For mixture-of-experts models: how many params are active per token (why they feel fast).
  activeParamsB: z.number().positive().optional(),
  // Approx. download / memory size at the default 4-bit quantization.
  sizeGB: z.number().positive(),
  bestFor: z.array(z.enum(['chat', 'writing', 'coding', 'reasoning'])).min(1),
  notes: z.string(),
})

export type Category = z.infer<typeof CategorySchema>
export type Plan = z.infer<typeof PlanSchema>
export type Subscription = z.infer<typeof SubscriptionSchema>
export type Hosting = z.infer<typeof HostingSchema>
export type Alternative = z.infer<typeof AlternativeSchema>
export type LocalModel = z.infer<typeof LocalModelSchema>
export type Difficulty = Alternative['difficulty']
