import { useState, type FormEvent } from 'react'
import { allCategories } from '../lib/data'
import { newCustomItem } from '../lib/selection'
import type { Billing } from '../lib/savings'
import { useSelection } from '../state'

export default function CustomEntryForm() {
  const { upsertItem } = useSelection()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [billing, setBilling] = useState<Billing>('monthly')
  const [category, setCategory] = useState('other')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const p = Number(price)
    if (!name.trim()) return setError('Give it a name')
    if (!price || !Number.isFinite(p) || p < 0) return setError('Enter what you pay')
    upsertItem(newCustomItem({ name: name.trim().slice(0, 80), price: p, billing, category }))
    setName('')
    setPrice('')
    setError('')
  }

  return (
    <form onSubmit={submit} className="card p-5" aria-label="Add a custom subscription">
      <h3 className="font-semibold">Pay for something that's not listed?</h3>
      <p className="mt-1 text-sm text-stone-500">Add it here. We'll suggest alternatives from the same category, or give you a build kit to make your own.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1.5fr_auto] sm:items-end">
        <label>
          <span className="label">Name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Later, Kajabi, Skool" />
        </label>
        <label>
          <span className="label">Price</span>
          <input className="field" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29" />
        </label>
        <label>
          <span className="label">Billed</span>
          <select className="field" value={billing} onChange={(e) => setBilling(e.target.value as Billing)}>
            <option value="monthly">Monthly</option>
            <option value="annual">Yearly</option>
          </select>
        </label>
        <label>
          <span className="label">Category</span>
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary">
          + Add
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </form>
  )
}
