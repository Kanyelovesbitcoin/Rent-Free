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
export const ApiCategorySchema = z.enum([
  'ai',
  'email',
  'database',
  'login',
  'hosting',
  'payments',
  'storage',
  'speech',
  'search',
  'maps',
  'images',
  'video',
  'game-engine',
  'game-art',
  'game-sound',
])
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

// ---- Game mode: data/game-genres.json, data/source-drops.json, data/games/*.json ----

// A kind of game people can build (platformer, kart racer…). Feeds the Game builder and its prompt.
export const GameGenreSchema = z.object({
  id,
  name: z.string(),
  emoji: z.string(),
  // One plain sentence: what you do over and over. The heart of the game.
  coreLoop: z.string(),
  defaultFeatures: z.array(z.string()).min(2),
  extraFeatures: z.array(z.string()).default([]),
  // How big a game this usually is: 1 mini-game … 4 epic.
  base: z.number().int().min(1).max(4),
  // Which screen sketch the starter kit shows (see src/lib/wireframes/game.ts).
  sketch: z.enum(['side', 'top-down', 'track', 'cards', 'grid', 'blocks', 'board', 'text']),
  // Who plays by default in the builder.
  defaultPlayers: z.enum(['solo', 'couch', 'online']).default('solo'),
})

// When a company officially publishes a game's (or engine's) code.
export const SourceDropSchema = z.object({
  id,
  title: z.string(),
  by: z.string(),
  date: isoDate,
  kind: z.enum(['game', 'engine']),
  license: z.string(),
  // open = anyone can use, change and share it (MIT, GPL…); source-available = look and tinker, but with limits
  // (often no selling); public-domain = no rules at all (CC0).
  licenseKind: z.enum(['open', 'source-available', 'public-domain']),
  includesArt: z.boolean(), // were the pictures, music and levels released too?
  needsYourCopy: z.boolean(), // do you need to own the game to play it?
  what: z.string(),
  why: z.string(),
  repoUrl: z.string().url().optional(),
  gameId: id.optional(), // links to data/games/<id>.json
  howToPlay: z.array(z.string()).default([]),
  sourceUrl: z.string().url(),
  lastVerified: isoDate,
})

// A free project made by fans: a rebuilt engine that uses your files, or a free look-alike.
export const FanProjectSchema = z.object({
  name: z.string(),
  what: z.string(),
  license: z.string(),
  needsYourCopy: z.boolean(),
  website: z.string().url(),
  howToPlay: z.array(z.string()).default([]),
})

// How "open" a game already is, from most to least:
// code-out = the company released the code; fans-rebuilt = fans made a free engine that runs your copy;
// look-alike = a free open-source game plays a lot like it; closed = nothing yet, so build your own.
export const OpennessSchema = z.enum(['code-out', 'fans-rebuilt', 'look-alike', 'closed'])

export const GameSchema = z.object({
  id,
  name: z.string(),
  genre: id, // a data/game-genres.json id
  what: z.string(),
  openness: OpennessSchema,
  dropId: id.optional(), // a data/source-drops.json id (needed for code-out)
  fanProjects: z.array(FanProjectSchema).default([]),
  // The things people love about it, in their own words. Ticked by default in the builder.
  lovedFeatures: z.array(z.string()).min(3),
  extraFeatures: z.array(z.string()).default([]),
  // An honest warning about size, e.g. "Start with one city block, not a whole city."
  scopeNote: z.string().optional(),
  // Extra legal care for this one, e.g. companies known to protect their look.
  legalNote: z.string().optional(),
  popularity: z.number().int().positive(),
  sourceUrl: z.string().url(),
  lastVerified: isoDate,
})

export type GameGenre = z.infer<typeof GameGenreSchema>
export type SourceDrop = z.infer<typeof SourceDropSchema>
export type FanProject = z.infer<typeof FanProjectSchema>
export type Openness = z.infer<typeof OpennessSchema>
export type Game = z.infer<typeof GameSchema>

export type Category = z.infer<typeof CategorySchema>
export type Plan = z.infer<typeof PlanSchema>
export type Subscription = z.infer<typeof SubscriptionSchema>
export type Hosting = z.infer<typeof HostingSchema>
export type Alternative = z.infer<typeof AlternativeSchema>
export type LocalModel = z.infer<typeof LocalModelSchema>
export type Difficulty = Alternative['difficulty']
