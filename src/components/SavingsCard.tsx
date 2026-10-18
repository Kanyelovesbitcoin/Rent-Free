import { forwardRef } from 'react'
import { toPng } from 'html-to-image'
import { formatMoney, type Summary } from '../lib/savings'
import type { ResolvedItem } from '../lib/selection'

interface Props {
  summary: Summary
  items: ResolvedItem[]
}

// The shareable "receipt". Uses inline hex colors (not theme classes) so the exported PNG
// looks the same no matter if the viewer is in light or dark mode.
const SavingsCard = forwardRef<HTMLDivElement, Props>(function SavingsCard({ summary, items }, ref) {
  const replaced = items.filter((i) => i.alternative).slice(0, 5)
  const more = items.filter((i) => i.alternative).length - replaced.length
  const checked = items.map((i) => i.sub?.lastVerified).filter(Boolean).sort()[0]
  return (
    <div
      ref={ref}
      data-testid="savings-card"
      style={{ background: 'linear-gradient(135deg,#064e3b 0%,#065f46 55%,#047857 100%)', color: '#ecfdf5', fontFamily: "'Inter Variable', system-ui, sans-serif" }}
      className="w-full max-w-[520px] overflow-hidden rounded-3xl p-7 shadow-xl"
    >
      <p style={{ color: '#6ee7b7' }} className="text-xs font-bold tracking-[0.2em] uppercase">
        🔑 Rent-Free receipt
      </p>
      <p className="mt-4 text-sm" style={{ color: '#a7f3d0' }}>
        I'm paying
      </p>
      <p className="text-3xl font-extrabold" style={{ color: '#fecaca', textDecoration: 'line-through', textDecorationThickness: 3 }}>
        {formatMoney(summary.currentYearly)}/yr
      </p>
      <p className="mt-1 text-sm" style={{ color: '#a7f3d0' }}>
        in software rent. With open-source tools, that could drop to
      </p>
      <p className="text-5xl leading-tight font-extrabold" style={{ fontFamily: "'Bricolage Grotesque Variable', 'Inter Variable', sans-serif" }}>
        {formatMoney(summary.rentFreeYearly)}/yr
      </p>
      <div className="mt-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
        {replaced.map((i) => (
          <p key={i.key} className="flex justify-between gap-3 py-0.5 text-sm">
            <span>
              {i.name} <span style={{ color: '#6ee7b7' }}>→ {i.alternative!.name}</span>
            </span>
            <span className="tabular-nums" style={{ color: '#a7f3d0' }}>
              {formatMoney(i.currentYearly)}
            </span>
          </p>
        ))}
        {more > 0 && (
          <p className="pt-1 text-xs" style={{ color: '#a7f3d0' }}>
            + {more} more
          </p>
        )}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <p>
          <span className="block text-xs" style={{ color: '#a7f3d0' }}>
            I could keep
          </span>
          <span className="text-2xl font-extrabold" style={{ color: '#fef08a' }}>
            {formatMoney(summary.savingsYearly)} a year
          </span>
        </p>
        <p className="text-right text-xs" style={{ color: '#6ee7b7' }}>
          Calculate yours
          <br />
          <strong>Rent-Free</strong> · open source
        </p>
      </div>
      <p className="mt-4 text-[10px]" style={{ color: '#6ee7b7', opacity: 0.8 }}>
        Estimate based on list prices{checked ? ` checked ${checked}` : ''}. Not affiliated with any company named.
      </p>
    </div>
  )
})

export default SavingsCard

export async function downloadNodeAsPng(node: HTMLElement, filename: string) {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
  return dataUrl
}
