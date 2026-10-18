// How big a "remake" is. Drives how much structure the coding-agent prompt asks for:
// a one-shot MVP for a link-in-bio page, a spec + milestone plan for a Netflix-style media server.

export type Audience = 'me' | 'family' | 'team'
export type RunsOn = 'local' | 'free-cloud' | 'own-server'
export type Platform = 'web' | 'desktop' | 'mobile'

export interface ComplexityInput {
  base: 1 | 2 | 3 | 4 // from the subscription's `complexity`
  features: string[] // everything selected, including the user's own
  audience: Audience
  runsOn: RunsOn
  platform: Platform
}

export type TierId = 'quick' | 'standard' | 'big' | 'platform'

export interface Tier {
  id: TierId
  emoji: string
  label: string
  likeA: string // a kid-friendly comparison
  effort: string
  summary: string
}

export const TIERS: Record<TierId, Tier> = {
  quick: { id: 'quick', emoji: '🧩', label: 'Small build', likeA: 'like a puzzle', effort: 'about 1–2 hours', summary: 'The AI can build it all in one go.' },
  standard: { id: 'standard', emoji: '🧱', label: 'Medium build', likeA: 'like a big LEGO set', effort: 'an afternoon or two', summary: 'The AI makes a plan first, then builds it in 3 steps.' },
  big: { id: 'big', emoji: '🏠', label: 'Big build', likeA: 'like building a treehouse', effort: '1–2 weekends', summary: 'The AI writes a plan, builds one piece at a time, and checks in with you after each piece.' },
  platform: { id: 'platform', emoji: '🏰', label: 'Huge build', likeA: 'like building a castle', effort: 'weeks, little by little', summary: 'Start with a free app that is close, then change it. Do not build it all from zero.' },
}

// Feature words that usually mean real engineering work.
const HARD_PARTS: [RegExp, string][] = [
  [/real.?time|collaborat|live |co-edit|sync/i, 'keeping devices in sync'],
  [/payment|stripe|invoice|checkout/i, 'taking payments'],
  [/video|audio|transcri|stream|record/i, 'video or audio'],
  [/\bAI\b|generat|summar|recogni|clone/i, 'AI features'],
  [/email|sms|notification|reminder/i, 'sending emails or texts'],
  [/integrat|api|webhook|connect to/i, 'connecting to other apps'],
]

export function hardParts(features: string[]): string[] {
  return HARD_PARTS.filter(([re]) => features.some((f) => re.test(f))).map(([, name]) => name)
}

export function complexityScore({ base, features, audience, runsOn, platform }: ComplexityInput): number {
  let score = base * 2
  score += Math.max(0, Math.floor((features.length - 3) / 3))
  score += { me: 0, family: 1, team: 2 }[audience]
  score += runsOn === 'own-server' ? 1 : 0
  score += platform === 'mobile' ? 1 : 0
  score += hardParts(features).length
  return score
}

export function tierFor(input: ComplexityInput): Tier {
  const score = complexityScore(input)
  // A platform-sized product (base 4) never gets a "quick" prompt, however few boxes are ticked.
  if (score >= 13 || (input.base === 4 && score >= 11)) return TIERS.platform
  if (score >= 9 || input.base === 4) return TIERS.big
  if (score >= 6) return TIERS.standard
  return TIERS.quick
}
