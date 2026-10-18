import { forwardRef } from 'react'
import { toPng } from 'html-to-image'
import { formatMoney, type Summary } from '../lib/savings'
import type { ResolvedItem } from '../lib/selection'

interface Props {
  summary: Summary
  items: ResolvedItem[]
}

// The shareable "receipt". Uses inline hex colors (not theme tokens) so the exported PNG
// looks the same whether the viewer is in light or dark mode.
const INK = '#1b1915'
const PAPER = '#fffdf7'
const MONO = "'JetBrains Mono Variable', ui-monospace, monospace"
const DISPLAY = "'Bricolage Grotesque Variable', 'Inter Variable', sans-serif"

const SavingsCard = forwardRef<HTMLDivElement, Props>(function SavingsCard({ summary, items }, ref) {
  const swapped = items.filter((i) => i.alternative)
  const shown = swapped.slice(0, 6)
  const more = swapped.length - shown.length
  const checked = items.map((i) => i.sub?.lastVerified).filter(Boolean).sort()[0]
  const dashed = { borderTop: `2px dashed ${INK}33` }
  return (
    <div
      ref={ref}
      data-testid="savings-card"
      className="w-full max-w-[460px] rounded-2xl p-6"
      style={{ background: PAPER, color: INK, border: `3px solid ${INK}`, boxShadow: `6px 6px 0 0 ${INK}`, fontFamily: "'Inter Variable', system-ui, sans-serif" }}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-md px-2 py-0.5 text-xs font-extrabold" style={{ background: '#fde047', border: `2px solid ${INK}`, transform: 'rotate(-3deg)', display: 'inline-block' }}>
          🔑 RENT-FREE
        </span>
        <span className="text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, opacity: 0.6 }}>
          Receipt
        </span>
      </div>

      <div className="mt-4 space-y-1.5 py-3 text-sm" style={{ ...dashed, fontFamily: MONO }}>
        {shown.map((i) => (
          <p key={i.key} className="flex justify-between gap-3">
            <span className="truncate">
              {i.name} <span style={{ color: '#059669' }}>→ {i.alternative!.name}</span>
            </span>
            <span style={{ color: '#e11d48', textDecoration: 'line-through' }}>{formatMoney(i.currentYearly)}</span>
          </p>
        ))}
        {more > 0 && <p style={{ opacity: 0.6 }}>+ {more} more swaps</p>}
      </div>

      <div className="space-y-1 py-3 text-sm" style={{ ...dashed, fontFamily: MONO }}>
        <p className="flex justify-between">
          <span>I PAY NOW</span>
          <span style={{ color: '#e11d48' }}>{formatMoney(summary.currentYearly)}/yr</span>
        </p>
        <p className="flex justify-between">
          <span>RENT-FREE ROUTE</span>
          <span>{formatMoney(summary.rentFreeYearly)}/yr</span>
        </p>
      </div>

      <div className="rounded-xl p-4 text-center" style={{ background: '#d1fae5', border: `2px solid ${INK}` }}>
        <p className="text-xs font-bold" style={{ color: '#065f46' }}>
          I COULD KEEP
        </p>
        <p className="text-5xl leading-tight font-extrabold" style={{ fontFamily: DISPLAY, color: '#059669' }}>
          {formatMoney(summary.savingsYearly)}
          <span className="text-xl">/yr</span>
        </p>
      </div>

      <p className="mt-4 text-center text-xs font-bold">Calculate yours · Rent-Free · free & open source</p>
      <p className="mt-1 text-center text-[10px]" style={{ opacity: 0.55 }}>
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
