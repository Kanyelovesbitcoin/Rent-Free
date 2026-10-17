import { describe, expect, it } from 'vitest'
import { alternativeYearly, effectiveBilling, summarize, yearlyCost, formatMoney } from '../src/lib/savings'
import type { Plan } from '../src/lib/schema'

const plan = (p: Partial<Plan>): Plan => ({ id: 'p', name: 'P', monthlyPrice: 12, annualPrice: 120, perSeat: false, ...p })
const alt = (hosting: 'desktop' | 'browser' | 'self-host' | 'pay-as-you-go', monthlyCost = 0) => ({ hosting, monthlyCost, setupHours: 1 })

describe('yearlyCost', () => {
  it('multiplies monthly price by 12', () => expect(yearlyCost(plan({}), 'monthly')).toBe(144))
  it('uses the annual total as-is', () => expect(yearlyCost(plan({}), 'annual')).toBe(120))
  it('multiplies by seats only for per-seat plans', () => {
    expect(yearlyCost(plan({ perSeat: true }), 'monthly', 3)).toBe(432)
    expect(yearlyCost(plan({ perSeat: false }), 'monthly', 3)).toBe(144)
  })
  it('falls back to monthly when there is no annual option', () => {
    const p = plan({ annualPrice: null, monthlyPrice: 20 })
    expect(effectiveBilling(p, 'annual')).toBe('monthly')
    expect(yearlyCost(p, 'annual')).toBe(240)
  })
  it('respects what the user says they actually pay', () => {
    expect(yearlyCost(plan({}), 'monthly', 1, 9)).toBe(108)
    expect(yearlyCost(plan({}), 'annual', 1, 99)).toBe(99)
    expect(yearlyCost(plan({ perSeat: true }), 'monthly', 2, 10)).toBe(240)
  })
})

describe('summarize', () => {
  it('desktop and free tiers cost $0', () => {
    expect(alternativeYearly(alt('desktop'))).toBe(0)
    expect(alternativeYearly(alt('browser'))).toBe(0)
  })

  it('pay-as-you-go costs its monthly estimate', () => expect(alternativeYearly(alt('pay-as-you-go', 8))).toBe(96))

  it('counts the shared server once, no matter how many self-hosted apps', () => {
    const s = summarize(
      [
        { key: 'a', currentYearly: 300, alternative: alt('self-host') },
        { key: 'b', currentYearly: 200, alternative: alt('self-host') },
        { key: 'c', currentYearly: 100, alternative: alt('desktop') },
      ],
      6,
    )
    expect(s.needsServer).toBe(true)
    expect(s.serverYearly).toBe(72)
    expect(s.currentYearly).toBe(600)
    expect(s.rentFreeYearly).toBe(72)
    expect(s.savingsYearly).toBe(528)
  })

  it('no server cost when nothing is self-hosted', () => {
    const s = summarize([{ key: 'a', currentYearly: 240, alternative: alt('desktop') }], 6)
    expect(s.serverYearly).toBe(0)
    expect(s.savingsYearly).toBe(240)
  })

  it('"keep paying" counts zero savings for that line', () => {
    const s = summarize([
      { key: 'a', currentYearly: 240, alternative: null },
      { key: 'b', currentYearly: 100, alternative: alt('browser') },
    ])
    expect(s.lines[0]).toMatchObject({ savingsYearly: 0, replaced: false })
    expect(s.rentFreeYearly).toBe(240)
    expect(s.savingsYearly).toBe(100)
  })

  it('adds up setup hours', () => {
    expect(summarize([{ key: 'a', currentYearly: 1, alternative: { ...alt('desktop'), setupHours: 2.5 } }]).setupHours).toBe(2.5)
  })
})

describe('formatMoney', () => {
  it('formats whole and fractional dollars', () => {
    expect(formatMoney(1840)).toBe('$1,840')
    expect(formatMoney(4.99)).toBe('$4.99')
    expect(formatMoney(-12)).toBe('-$12')
    expect(formatMoney(97.2)).toBe('$97.20')
    expect(formatMoney(239.88)).toBe('$240')
  })
})
