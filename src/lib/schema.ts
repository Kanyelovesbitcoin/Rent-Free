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
  wireframe: z.enum(['scheduling', 'video-editing', 'ai-chat', 'notes', 'forms', 'link-in-bio', 'email', 'media-library', 'website', 'tracker', 'generic']),
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
    // What a "seat" is for this plan, e.g. "channel" for Buffer. Defaults to "seat".
    unitLabel: z.string().optional(),
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
  // software = you can replace or rebuild it; content = you pay for movies/music/books;
  // membership = perks (shipping, game libraries). Content and memberships can't be "open-sourced".
  kind: z.enum(['software', 'content', 'membership']).default('software'),
  // How hard it is to remake: 1 simple, 2 standard, 3 complex, 4 platform. Drives the Remake prompt's depth.
  complexity: z.number().int().min(1).max(4),
  // Optional features people can switch on in the Remake studio (core features are on by default).
  extraFeatures: z.array(z.string()).default([]),
  // What you'd actually build when remaking it, e.g. "a personal media server for movies you own".
  remakeTarget: z.string().optional(),
  // An honest warning shown in the Remake studio and included in the prompt.
  remakeNote: z.string().optional(),
  // Rough "most people pay for this" order (1 = most common). Editorial, not a survey rank.
  popularity: z.number().int().positive(),
})

export const HostingSchema = z.enum([
  'desktop', // install an app, runs on your computer, $0
  'browser', // free web app / free hosted tier, $0
  'self-host', // runs on a small server you rent (shared across all your self-hosted apps)
  'pay-as-you-go', // you pay only for what you use
  'partial', // keep paying for part of the year (e.g. rotate streaming services); see keepFraction
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
  // For 'partial' hosting: the share of the current bill you still pay (0.25 = 3 months a year).
  keepFraction: z.number().min(0).max(1).optional(),
  platforms: z.array(z.string()).min(1),
  difficulty: z.enum(['easy', 'medium', 'weekend']),
  setupHours: z.number().positive(),
  summary: z.string(),
  gains: z.array(z.string()).min(1),
  tradeoffs: z.array(z.string()).min(1),
  setupSteps: z.array(z.string()).min(2),
  freeTierLimits: z.string().optional(),
  // License rules that matter once money is involved (reselling, hosting for clients, modifying).
  commercialNote: z.string().optional(),
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
  // Model license, e.g. "Apache-2.0" or "Meta Llama Community License".
  license: z.string(),
  notes: z.string(),
})

// A "building block" service people can plug into an app they build (data/apis.json).
export const ApiCategorySchema = z.enum(['ai', 'email', 'database', 'login', 'hosting', 'payments', 'storage', 'speech', 'search', 'maps', 'images', 'video'])
export const ApiSchema = z.object({
  id,
  name: z.string(),
  category: ApiCategorySchema,
  // One plain sentence: what does it do for your app?
  what: z.string(),
  freeTier: z.string(),
  paidFrom: z.string(),
  openSource: z.boolean(),
  // Runs on your own computer (no account, no bill).
  runsLocally: z.boolean(),
  website: z.string().url(),
  docsUrl: z.string().url(),
  signupSteps: z.array(z.string()).min(1),
  // Settings the app will need, e.g. RESEND_API_KEY. Goes into .env.example.
  envVars: z.array(z.string()),
  goodFor: z.array(z.string()).min(1),
  sourceUrl: z.string().url(),
  lastVerified: isoDate,
  note: z.string().optional(),
})
export type ApiCategory = z.infer<typeof ApiCategorySchema>
export type Api = z.infer<typeof ApiSchema>

export type Category = z.infer<typeof CategorySchema>
export type Plan = z.infer<typeof PlanSchema>
export type Subscription = z.infer<typeof SubscriptionSchema>
export type Hosting = z.infer<typeof HostingSchema>
export type Alternative = z.infer<typeof AlternativeSchema>
export type LocalModel = z.infer<typeof LocalModelSchema>
export type Difficulty = Alternative['difficulty']
