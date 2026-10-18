import { describe, expect, it } from 'vitest'
import { catalog as loaded, dataErrors } from '../src/lib/data'
import { loadCatalog } from '../src/lib/catalog'
import { renderWireframe } from '../src/lib/wireframes'
import { decodeSelection, encodeSelection } from '../src/lib/selection'

const catalog = { catalog: loaded, errors: dataErrors }

describe('data catalog', () => {
  it('loads without errors', () => {
    expect(catalog.errors).toEqual([])
    expect(catalog.catalog.subscriptions.length).toBeGreaterThanOrEqual(50)
  })

  it('reports readable cross-reference errors', () => {
    const { errors } = loadCatalog({
      categories: [{ id: 'notes', name: 'Notes', emoji: '📝', wireframe: 'notes' }],
      localModels: [],
      subscriptions: [
        {
          path: 'subscriptions/foo.json',
          json: {
            id: 'foo', name: 'Foo', category: 'nope', website: 'https://foo.com', description: 'x', coreFeatures: ['a', 'b', 'c'],
            plans: [{ id: 'basic', name: 'Basic', monthlyPrice: 5, annualPrice: null }], defaultPlan: 'pro',
            sourceUrl: 'https://foo.com/pricing', lastVerified: '2026-01-01', alternatives: ['missing'], complexity: 2, popularity: 1,
          },
        },
      ],
      alternatives: [],
    })
    expect(errors.join('\n')).toMatch(/unknown category "nope"/)
    expect(errors.join('\n')).toMatch(/defaultPlan "pro"/)
    expect(errors.join('\n')).toMatch(/alternative "missing"/)
  })
})

describe('wireframes', () => {
  it('are standalone HTML and escape the app name', () => {
    for (const c of catalog.catalog.categories) {
      const html = renderWireframe(c.wireframe, '<b>Evil</b>')
      expect(html.startsWith('<!doctype html>')).toBe(true)
      expect(html).not.toContain('<b>Evil</b>')
    }
  })
})

describe('share links', () => {
  it('round-trips a selection', () => {
    const sel = {
      server: 6,
      items: [
        { t: 'c' as const, id: 'calendly', plan: 'standard', billing: 'monthly' as const, seats: 1, alt: 'calcom' },
        { t: 'u' as const, id: 'custom-1', name: 'Kajabi ✨', category: 'other', price: 149, billing: 'monthly' as const, alt: null },
      ],
    }
    expect(decodeSelection(encodeSelection(sel))).toEqual(sel)
  })
  it('rejects garbage', () => {
    expect(decodeSelection('not-valid')).toBeNull()
    expect(decodeSelection(btoa(JSON.stringify({ items: 'nope' })))).toBeNull()
  })
})
