import type { CatalogItem } from '../lib/selection'
import type { Subscription } from '../lib/schema'
import { effectiveBilling } from '../lib/savings'
import { useSelection } from '../state'

// Plan / billing / seats / "I actually pay" controls for one selected catalog tool.
export default function ItemEditor({ sub, item }: { sub: Subscription; item: CatalogItem }) {
  const { upsertItem } = useSelection()
  const plan = sub.plans.find((p) => p.id === item.plan) ?? sub.plans[0]
  const billing = effectiveBilling(plan, item.billing)
  const update = (patch: Partial<CatalogItem>) => upsertItem({ ...item, ...patch })
  const priceFor = (b: typeof billing) => (b === 'monthly' ? plan.monthlyPrice : plan.annualPrice)

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-paper-2 p-3">
      <label>
        <span className="label">Plan</span>
        <select className="field" value={plan.id} onChange={(e) => update({ plan: e.target.value, price: null })}>
          {sub.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <div>
        <span className="label">Billing</span>
        <div className="flex rounded-xl border-2 border-line bg-card p-0.5">
          {(['monthly', 'annual'] as const).map((b) => {
            const available = priceFor(b) != null
            return (
              <button
                key={b}
                type="button"
                disabled={!available}
                onClick={() => update({ billing: b, price: null })}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold capitalize transition ${
                  billing === b ? 'bg-ink text-paper' : 'text-ink-soft'
                } disabled:cursor-not-allowed disabled:opacity-40`}
                title={available ? undefined : `${plan.name} has no ${b} option`}
              >
                {b === 'annual' ? 'Yearly' : 'Monthly'}
              </button>
            )
          })}
        </div>
      </div>
      {plan.perSeat && (
        <label>
          <span className="label">{plan.unitLabel ? `${plan.unitLabel[0].toUpperCase()}${plan.unitLabel.slice(1)}s` : 'Seats'}</span>
          <input
            className="field"
            type="number"
            min={1}
            value={item.seats}
            onChange={(e) => update({ seats: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
          />
        </label>
      )}
      <label>
        <span className="label">I actually pay ({billing === 'monthly' ? 'per month' : 'per year'}{plan.perSeat ? `, per ${plan.unitLabel ?? 'seat'}` : ''})</span>
        <input
          className="field"
          type="number"
          min={0}
          step="0.01"
          placeholder={String(priceFor(billing) ?? '')}
          value={item.price ?? ''}
          onChange={(e) => update({ price: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
        />
      </label>
    </div>
  )
}
