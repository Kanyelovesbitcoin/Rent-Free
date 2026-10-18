// A small Flesch-Kincaid grade-level checker. We use it in tests so the words on the site
// stay easy to read (goal: about 5th–6th grade). It's an estimate, not a perfect score.

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups?.length ?? 1)
}

export function gradeLevel(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length)
  const words = text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w))
  if (!words.length) return 0
  const syl = words.reduce((n, w) => n + syllables(w), 0)
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59
}
