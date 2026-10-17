import type { Alternative, Plan } from './schema'

export type Billing = 'monthly' | 'annual'

export const DEFAULT_SERVER_MONTHLY = 6

// What a plan costs per year. `priceOverride` is what the user says they actually pay
// per seat per billing period (a monthly amount for monthly, a yearly total for annual).
export function yearlyCost(plan: Plan, billing: Billing, seats = 1, priceOverride?: number | null): number {
  const s = plan.perSeat ? Math.max(1, seats) : 1
  if (priceOverride != null) return (billing === 'monthly' ? priceOverride * 12 : priceOverride) * s
  const effective = effectiveBilling(plan, billing)
  const perSeat = effective === 'monthly' ? plan.monthlyPrice! * 12 : plan.annualPrice!
  return perSeat * s
}

// Falls back to whatever billing the plan actually offers (e.g. ChatGPT Plus is monthly-only).
export function effectiveBilling(plan: Plan, billing: Billing): Billing {
  if (billing === 'annual' && plan.annualPrice == null) return 'monthly'
  if (billing === 'monthly' && plan.monthlyPrice == null) return 'annual'
  return billing
}

// Yearly cost of the alternative itself. Self-hosted apps are $0 here because the server
// is shared across all of them and counted once in `summarize`.
export function alternativeYearly(alt: Pick<Alternative, 'hosting' | 'monthlyCost'>): number {
  return alt.hosting === 'pay-as-you-go' ? alt.monthlyCost * 12 : 0
}

export interface Line {
  key: string
  currentYearly: number
  alternative: Pick<Alternative, 'hosting' | 'monthlyCost' | 'setupHours'> | null
}

export interface LineResult {
  key: string
  currentYearly: number
  rentFreeYearly: number
  savingsYearly: number
  replaced: boolean
}

export interface Summary {
  lines: LineResult[]
  currentYearly: number
  rentFreeYearly: number
  savingsYearly: number
  serverYearly: number
  needsServer: boolean
  setupHours: number
}

export function summarize(lines: Line[], serverMonthly = DEFAULT_SERVER_MONTHLY): Summary {
  const results = lines.map<LineResult>((l) => {
    // No alternative chosen → you keep paying for it. We never count savings we can't back up.
    const rentFreeYearly = l.alternative ? alternativeYearly(l.alternative) : l.currentYearly
    return {
      key: l.key,
      currentYearly: l.currentYearly,
      rentFreeYearly,
      savingsYearly: l.currentYearly - rentFreeYearly,
      replaced: l.alternative != null,
    }
  })
  const needsServer = lines.some((l) => l.alternative?.hosting === 'self-host')
  const serverYearly = needsServer ? Math.max(0, serverMonthly) * 12 : 0
  const currentYearly = sum(results.map((r) => r.currentYearly))
  const rentFreeYearly = sum(results.map((r) => r.rentFreeYearly)) + serverYearly
  return {
    lines: results,
    currentYearly,
    rentFreeYearly,
    savingsYearly: currentYearly - rentFreeYearly,
    serverYearly,
    needsServer,
    setupHours: sum(lines.map((l) => l.alternative?.setupHours ?? 0)),
  }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

// Cents only for small non-round amounts ($4.99, $97.20); whole dollars otherwise ($1,840).
export function formatMoney(n: number) {
  const abs = Math.abs(n)
  const digits = abs < 100 && Math.round(abs * 100) % 100 !== 0 ? 2 : 0
  return (n < 0 ? '-' : '') + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
