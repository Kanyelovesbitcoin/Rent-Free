import { describe, expect, it } from 'vitest'
import models from '../data/local-models.json'
import { apiMonthlyCost, breakEvenMonths, recommend, usableMemoryGB } from '../src/lib/hardware'
import type { LocalModel } from '../src/lib/schema'

const all = models as LocalModel[]
const mac = (ramGB: number) => recommend({ machine: 'mac', ramGB, useCases: ['chat'] }, all)

describe('usable memory', () => {
  it('Mac uses ~70% of unified memory', () => expect(usableMemoryGB({ machine: 'mac', ramGB: 16 })).toBeCloseTo(11.2))
  it('NVIDIA is limited by VRAM, not RAM', () => expect(usableMemoryGB({ machine: 'nvidia', ramGB: 64, vramGB: 8 })).toBe(7.5))
  it('CPU-only uses part of system RAM', () => expect(usableMemoryGB({ machine: 'cpu', ramGB: 16 })).toBeCloseTo(9.6))
})

describe('recommend', () => {
  it('8 GB Mac → a small 3–4B model', () => {
    const r = mac(8)
    expect(r.tier.id).toBe('tiny')
    expect(r.best!.paramsB).toBeLessThanOrEqual(4)
  })

  it('16 GB Mac → a 7–14B model', () => {
    const r = mac(16)
    expect(r.best!.paramsB).toBeGreaterThanOrEqual(7)
    expect(r.best!.paramsB).toBeLessThanOrEqual(14)
  })

  it('32 GB Mac → 20B+ class', () => expect(mac(32).best!.paramsB).toBeGreaterThanOrEqual(20))

  it('tier label matches the recommended model', () => {
    for (const ram of [8, 16, 32, 64, 128]) {
      const r = mac(ram)
      const range = { tiny: [0, 5], small: [5, 10], medium: [10, 25], large: [25, 60], xl: [60, 1e9] }[r.tier.id]
      expect(r.best!.paramsB).toBeGreaterThanOrEqual(range[0])
      expect(r.best!.paramsB).toBeLessThan(range[1])
    }
  })
  it('64 GB Mac can stretch to 70B', () => expect([mac(64).best, mac(64).stretch].some((m) => m?.paramsB === 70)).toBe(true))

  it('never recommends a model that does not fit', () => {
    for (const ram of [8, 16, 24, 32, 64, 128]) {
      const r = mac(ram)
      const best = r.fits.find((f) => f.model.id === r.best?.id)
      expect(best?.fit).toBe('comfortable')
    }
  })

  it('respects the use case', () => {
    const r = recommend({ machine: 'mac', ramGB: 32, useCases: ['coding'] }, all)
    expect(r.best!.bestFor).toContain('coding')
  })

  it('flags CPU-only machines as slow', () => expect(recommend({ machine: 'cpu', ramGB: 16, useCases: [] }, all).slow).toBe(true))

  it('handles a machine too small for anything', () => {
    const r = recommend({ machine: 'nvidia', ramGB: 8, vramGB: 2, useCases: ['chat'] }, all)
    expect(r.best).toBeNull()
  })
})

describe('money math', () => {
  it('API estimate scales with usage', () => {
    expect(apiMonthlyCost('light')).toBeLessThan(apiMonthlyCost('medium'))
    expect(apiMonthlyCost('medium')).toBeCloseTo(8.1, 1)
  })
  it('break-even months', () => {
    expect(breakEvenMonths(1200, 20)).toBe(60)
    expect(breakEvenMonths(1200, 20, 8)).toBe(100)
    expect(breakEvenMonths(1200, 5, 8)).toBeNull()
  })
})
