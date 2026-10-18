import { describe, expect, it } from 'vitest'
import { alternatives, subscriptions } from '../src/lib/data'
import { gradeLevel, syllables } from '../src/lib/readability'
import { verdict } from '../src/lib/effort'
import { TIERS } from '../src/lib/complexity'

// Rent-Free should be easy to read for anyone (goal: about a 5th-grade level).
// If this fails after you add an app, try shorter sentences and simpler words.
const texts = [
  ...subscriptions.map((s) => ({ id: `subscriptions/${s.id}`, text: s.description })),
  ...alternatives.map((a) => ({ id: `alternatives/${a.id}`, text: a.summary })),
]

describe('plain language', () => {
  it('counts syllables sensibly', () => {
    expect(syllables('cat')).toBe(1)
    expect(syllables('movie')).toBe(2)
    expect(syllables('subscription')).toBe(3)
  })

  it('catalog descriptions read at about a 5th–6th grade level on average', () => {
    const avg = texts.reduce((s, t) => s + gradeLevel(t.text), 0) / texts.length
    expect(avg).toBeLessThanOrEqual(6)
  })

  it('no single description is too hard to read', () => {
    const hard = texts.filter((t) => gradeLevel(t.text) > 10).map((t) => `${t.id} (grade ${gradeLevel(t.text).toFixed(1)}): ${t.text}`)
    expect(hard).toEqual([])
  })

  it('build sizes and verdicts are written simply', () => {
    for (const t of Object.values(TIERS)) expect(gradeLevel(t.summary)).toBeLessThanOrEqual(9)
    expect(gradeLevel(verdict({ difficulty: 'weekend', setupHours: 4 }, 36).why)).toBeLessThanOrEqual(9)
  })
})

describe('replace verdict', () => {
  it('says "keep paying" when the savings are tiny and the work is big (like iCloud 200 GB)', () => {
    expect(verdict({ difficulty: 'weekend', setupHours: 4 }, 35.88).id).toBe('keep')
  })
  it('says "do it" for easy swaps', () => {
    expect(verdict({ difficulty: 'easy', setupHours: 0.25 }, 180).id).toBe('do-it')
  })
  it('says "maybe" for medium work with medium savings', () => {
    expect(verdict({ difficulty: 'medium', setupHours: 3 }, 100).id).toBe('maybe')
  })
  it('never says "do it" when nothing is saved', () => {
    expect(verdict(null, 200).id).toBe('keep')
    expect(verdict({ difficulty: 'easy', setupHours: 0.25 }, 0).id).toBe('keep')
  })
})

describe('smart defaults', () => {
  it('starts on "keep paying" when no swap is worth it, and on a good swap otherwise', async () => {
    const { getSubscription, subscriptions } = await import('../src/lib/data')
    const { newCatalogItem, resolveItem } = await import('../src/lib/selection')
    // Never default to a swap we'd tell you not to make.
    for (const s of subscriptions) {
      const r = resolveItem(newCatalogItem(s))!
      if (r.alternative) {
        const saved = r.currentYearly - (r.alternative.hosting === 'partial' ? r.currentYearly * (r.alternative.keepFraction ?? 1) : r.alternative.hosting === 'pay-as-you-go' ? r.alternative.monthlyCost * 12 : 0)
        expect(verdict(r.alternative, saved).id, s.id).not.toBe('keep')
      }
    }
    // iCloud 200 GB skips Immich (a weekend for $36/yr) and starts on the simpler Syncthing.
    expect(newCatalogItem(getSubscription('icloud')!).alt).toBe('syncthing')
    expect(newCatalogItem(getSubscription('netflix')!).alt).toBe('rotate-subscriptions')
    expect(newCatalogItem(getSubscription('calendly')!).alt).toBe('calcom')
    expect(newCatalogItem(getSubscription('chatgpt')!).alt).toBe('lm-studio')
  })
})
