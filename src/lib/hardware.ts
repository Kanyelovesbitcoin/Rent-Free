import type { LocalModel } from './schema'

export type Machine = 'mac' | 'nvidia' | 'cpu'
export type UseCase = LocalModel['bestFor'][number]

export interface HardwareInput {
  machine: Machine
  ramGB: number
  vramGB?: number
  useCases: UseCase[]
}

// Rules of thumb (4-bit models):
// - Apple Silicon shares memory between CPU and GPU; macOS lets the GPU use roughly 70% of it.
// - On a PC with an NVIDIA card, the card's VRAM is what matters for speed.
// - Without a GPU, models run on the CPU from system RAM: they work, just slowly.
// - A model needs its file size plus ~1.2 GB for the conversation (context) and runtime.
export const CONTEXT_OVERHEAD_GB = 1.2
const COMFORT = 0.9

export function usableMemoryGB({ machine, ramGB, vramGB }: Pick<HardwareInput, 'machine' | 'ramGB' | 'vramGB'>): number {
  if (machine === 'mac') return ramGB * 0.7
  if (machine === 'nvidia') return Math.max(0, (vramGB ?? 0) - 0.5)
  return ramGB * 0.6
}

export const memoryNeededGB = (m: LocalModel) => m.sizeGB + CONTEXT_OVERHEAD_GB

export type Fit = 'comfortable' | 'tight' | 'too-big'
export function fit(m: LocalModel, usable: number): Fit {
  const need = memoryNeededGB(m)
  if (need <= usable * COMFORT) return 'comfortable'
  if (need <= usable) return 'tight'
  return 'too-big'
}

export interface Tier {
  id: 'tiny' | 'small' | 'medium' | 'large' | 'xl'
  label: string
  verdict: string
}

// The tier follows the best model that fits comfortably, so the label always matches the pick.
export function tierFor(best: LocalModel | null): Tier {
  const b = best?.paramsB ?? 0
  if (b < 5) return { id: 'tiny', label: 'Starter (3–4B models)', verdict: 'Good for quick drafts, summaries and simple questions, not heavy reasoning. A great way to try local AI for free.' }
  if (b < 10) return { id: 'small', label: 'Everyday (7–8B models)', verdict: 'A solid everyday assistant for writing, emails and brainstorming. Keep a paid model (or pay-as-you-go) for hard problems.' }
  if (b < 25) return { id: 'medium', label: 'Strong (12–21B models)', verdict: 'Genuinely useful daily driver. Most people can drop a $20/mo subscription and use pay-as-you-go for the rare hard task.' }
  if (b < 60) return { id: 'large', label: 'Power user (27–30B models)', verdict: 'Strong writing, coding help and reasoning. Close to paid models for most everyday work.' }
  return { id: 'xl', label: 'Workstation (70B+ models)', verdict: 'Near older frontier-model quality, fully private. Slower per word, but very capable.' }
}

export interface Recommendation {
  usableGB: number
  tier: Tier
  best: LocalModel | null
  stretch: LocalModel | null
  byUseCase: { useCase: UseCase; model: LocalModel | null }[]
  fits: { model: LocalModel; fit: Fit }[]
  slow: boolean
}

// "Bigger is better" is a decent proxy within one generation of open models.
const quality = (m: LocalModel) => m.paramsB

export function recommend(input: HardwareInput, models: LocalModel[]): Recommendation {
  const usable = usableMemoryGB(input)
  const fits = models.map((model) => ({ model, fit: fit(model, usable) }))
  const comfortable = fits.filter((f) => f.fit === 'comfortable').map((f) => f.model)
  const tight = fits.filter((f) => f.fit === 'tight').map((f) => f.model)
  const top = (xs: LocalModel[]) => [...xs].sort((a, b) => quality(b) - quality(a))[0] ?? null
  const useCases: UseCase[] = input.useCases.length ? input.useCases : ['chat']

  const best = top(comfortable.filter((m) => useCases.some((u) => m.bestFor.includes(u)))) ?? top(comfortable)
  const stretchPick = top(tight)
  return {
    usableGB: usable,
    tier: tierFor(best),
    best,
    stretch: stretchPick && best && quality(stretchPick) > quality(best) ? stretchPick : null,
    byUseCase: useCases.map((useCase) => ({ useCase, model: top(comfortable.filter((m) => m.bestFor.includes(useCase))) })),
    fits,
    slow: input.machine === 'cpu',
  }
}

// --- money math for the AI page ---

// Assumptions for the pay-as-you-go estimate, shown in the UI so nobody is misled.
export const API_ASSUMPTIONS = {
  inputTokensPerMessage: 2000,
  outputTokensPerMessage: 500,
  inputPricePerMillion: 3,
  outputPricePerMillion: 15,
}
export const USAGE_LEVELS = {
  light: { label: 'Light (~5 hard questions a day)', messagesPerMonth: 150 },
  medium: { label: 'Medium (~20 a day)', messagesPerMonth: 600 },
  heavy: { label: 'Heavy (~50 a day)', messagesPerMonth: 1500 },
} as const
export type UsageLevel = keyof typeof USAGE_LEVELS

export function costPerMessage(a = API_ASSUMPTIONS): number {
  return (a.inputTokensPerMessage * a.inputPricePerMillion + a.outputTokensPerMessage * a.outputPricePerMillion) / 1_000_000
}
export const apiMonthlyCost = (level: UsageLevel) => USAGE_LEVELS[level].messagesPerMonth * costPerMessage()

// How many months until a hardware purchase pays for itself. null = never (no monthly saving).
export function breakEvenMonths(upgradeCost: number, subscriptionMonthly: number, newMonthly = 0): number | null {
  const saving = subscriptionMonthly - newMonthly
  if (saving <= 0) return null
  return Math.ceil(upgradeCost / saving)
}
