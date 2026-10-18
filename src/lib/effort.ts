import type { Alternative, Difficulty } from './schema'

// "How hard is it to replace this, and is it worth it?" in plain words.
// Honest on purpose: if the savings are tiny and the work is big, we say "keep paying".

export interface Level {
  id: Difficulty
  emoji: string
  label: string
  step: 1 | 2 | 3
}

export const LEVELS: Record<Difficulty, Level> = {
  easy: { id: 'easy', emoji: '🟢', label: 'Easy swap', step: 1 },
  medium: { id: 'medium', emoji: '🟡', label: 'Takes an afternoon', step: 2 },
  weekend: { id: 'weekend', emoji: '🔴', label: 'Weekend project', step: 3 },
}

export type VerdictId = 'do-it' | 'maybe' | 'keep'

export interface Verdict {
  id: VerdictId
  emoji: string
  label: string
  why: string
}

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
export const timeWords = (hours: number) =>
  hours <= 0.25 ? 'about 15 minutes' : hours < 1 ? `about ${Math.round(hours * 60)} minutes` : hours === 1 ? 'about 1 hour' : `about ${hours % 1 ? hours.toFixed(1) : hours} hours`

export function verdict(alt: Pick<Alternative, 'difficulty' | 'setupHours'> | null, savingsYearly: number): Verdict {
  if (!alt) {
    return { id: 'keep', emoji: '👍', label: 'Keeping it', why: "That's okay! Not every app is worth replacing. You can pick a swap above anytime." }
  }
  if (savingsYearly <= 0) {
    return { id: 'keep', emoji: '🛑', label: 'Keep it', why: "There's no money to save with this swap." }
  }
  const perHour = savingsYearly / alt.setupHours
  if ((alt.difficulty === 'easy' && savingsYearly >= 20) || perHour >= 40) {
    return {
      id: 'do-it',
      emoji: '✅',
      label: 'Do it',
      why: alt.difficulty === 'easy' ? `It's easy, and you keep ${money(savingsYearly)} a year.` : `You save about ${money(perHour)} for every hour of setup.`,
    }
  }
  if ((alt.difficulty === 'weekend' && savingsYearly < 60) || perHour < 12) {
    return {
      id: 'keep',
      emoji: '🛑',
      label: 'Probably keep paying',
      why: `You'd only save ${money(savingsYearly)} a year, and it takes ${timeWords(alt.setupHours)}. Switch only if you care about privacy or want to learn.`,
    }
  }
  return { id: 'maybe', emoji: '🤔', label: 'Maybe', why: `You'd save ${money(savingsYearly)} a year. Worth it if you have a free afternoon.` }
}
