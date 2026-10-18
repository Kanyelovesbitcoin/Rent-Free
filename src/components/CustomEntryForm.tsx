import { useState, type FormEvent } from 'react'
import { allCategories } from '../lib/data'
import { newCustomItem } from '../lib/selection'
import type { Billing } from '../lib/savings'
import { useSelection } from '../state'
import { useToast } from './ui'

// Add any subscription that isn't in the catalog, including a short description for the Remake prompt.
export default function CustomEntryForm({ compact = false }: { compact?: boolean }) {
  const { upsertItem } = useSelection()
  const notify = useToast()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [billing, setBilling] = useState<Billing>('monthly')
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const p = Number(price)
    if (!name.trim()) return setError('Give it a name')
    if (!price || !Number.isFinite(p) || p < 0) return setError('Enter what you pay')
    upsertItem(newCustomItem({ name: name.trim().slice(0, 80), price: p, billing, category, description: description.trim().slice(0, 1000) || undefined }))
    notify(`Added ${name.trim()}`)
    setName('')
    setPrice('')
    setDescription('')
    setError('')
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-3' : 'card space-y-3 p-5'} aria-label="Add a custom subscription">
      {!compact && <h3 className="font-display text-lg font-extrabold">Pay for something not listed?</h3>}
      <label className="block">
        <span className="label">Name</span>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kajabi, Later, MyFitnessPal" />
      </label>
      <div className="grid grid-cols-2 gap-3">
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
      </div>
      <label className="block">
        <span className="label">Category</span>
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
          {allCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">What does it do? (optional)</span>
        <textarea className="field h-16" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="In your own words. Helps if you build your own later." />
      </label>
      {error && <p className="text-sm font-bold text-rent">{error}</p>}
      <button type="submit" className="btn-dark w-full">
        + Add to receipt
      </button>
    </form>
  )
}
