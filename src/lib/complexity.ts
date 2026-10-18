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
  label: string
  effort: string
  summary: string
}

export const TIERS: Record<TierId, Tier> = {
  quick: { id: 'quick', label: 'Quick build', effort: '1 session · about 1–2 hours', summary: 'Small enough to build in one go.' },
  standard: { id: 'standard', label: 'Standard build', effort: '2–4 sessions · an afternoon or two', summary: 'Plan first, then build in 3 milestones with tests.' },
  big: { id: 'big', label: 'Big build', effort: '1–2 weekends', summary: 'Spec and plan first, then milestones with tests and a review stop after each.' },
  platform: { id: 'platform', label: 'Platform-sized', effort: 'An ongoing project', summary: 'Extend an open-source base and cut scope to your personal MVP.' },
}

// Feature words that usually mean real engineering work.
const HARD_PARTS: [RegExp, string][] = [
  [/real.?time|collaborat|live |co-edit|sync/i, 'real-time sync'],
  [/payment|stripe|invoice|checkout/i, 'payments'],
  [/video|audio|transcri|stream|record/i, 'media processing'],
  [/\bAI\b|generat|summar|recogni|clone/i, 'AI features'],
  [/email|sms|notification|reminder/i, 'notifications'],
  [/integrat|api|webhook|connect to/i, 'integrations'],
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
