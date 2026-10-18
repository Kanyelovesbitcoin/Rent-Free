import { LEVELS, timeWords, verdict } from '../lib/effort'
import type { Alternative } from '../lib/schema'
import { formatMoney } from '../lib/savings'

const VERDICT_STYLE = {
  'do-it': 'border-money bg-money-soft text-money-ink',
  maybe: 'border-hilite bg-hilite/25 text-ink',
  keep: 'border-rent bg-rent-soft text-rent',
}

// Small chip for tiles and lists: "🟢 Easy swap".
export function LevelChip({ alt }: { alt: Alternative | null | undefined }) {
  if (!alt) return null
  const level = LEVELS[alt.difficulty]
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft">
      <span aria-hidden>{level.emoji}</span>
      {level.label}
    </span>
  )
}

// The verdict line: "✅ Do it: It's easy, and you keep $180 a year."
export function VerdictLine({ alt, savings }: { alt: Alternative | null; savings: number }) {
  const v = verdict(alt, savings)
  return (
    <p className={`rounded-xl border-2 px-3 py-2 text-sm ${VERDICT_STYLE[v.id]}`} data-testid="verdict">
      <strong>
        {v.emoji} {v.label}:
      </strong>{' '}
      {v.why}
    </p>
  )
}

// The big "How hard is it to replace X?" card on tool pages.
export default function ReplaceMeter({ name, alt, savings }: { name: string; alt: Alternative | null; savings: number }) {
  const level = alt ? LEVELS[alt.difficulty] : null
  return (
    <section className="card pop p-5" data-testid="replace-meter" aria-label={`How hard is it to replace ${name}?`}>
      <h2 className="font-display text-xl font-extrabold">How hard is it to replace {name}?</h2>
      {alt && level && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
            {Object.values(LEVELS).map((l) => (
              <div key={l.id} className={`rounded-xl border-2 p-2 text-center text-xs font-bold ${l.step === level.step ? 'border-ink bg-hilite text-ink' : 'border-line text-ink-soft'}`}>
                <span className="block text-lg">{l.emoji}</span>
                {l.label}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            Best swap: <strong>{alt.name}</strong>. Setup takes <strong>{timeWords(alt.setupHours)}</strong>. You could keep{' '}
            <strong className="money text-money">{formatMoney(savings)}</strong> a year.
          </p>
        </>
      )}
      <div className="mt-3">
        <VerdictLine alt={alt} savings={savings} />
      </div>
    </section>
  )
}
