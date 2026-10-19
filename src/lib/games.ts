// Game mode logic: how big a game is to build, which free building blocks fit, and the saved choices.
import { TIERS, type Tier, type TierId } from './complexity'
import type { Suggestion } from './apiSuggest'
import type { AgentId } from './agentPrompt'
import type { Openness } from './schema'

export type Players = 'solo' | 'couch' | 'online'
export type GamePlatform = 'browser' | 'desktop' | 'phone'
export type ArtPlan = 'shapes' | 'free-pack' | 'my-art'
export type CodeLicense = 'mit' | 'gpl'
export type TinkerGoal = 'run' | 'mod' | 'fix' | 'port'
export type Device = 'windows' | 'mac' | 'linux' | 'steam-deck'

export interface GameConfig {
  gameName: string
  features: string[]
  customFeatures: string[]
  twist: string // "make it yours": a new setting, hero or rule
  players: Players
  platform: GamePlatform
  art: ArtPlan
  style: string
  codeLicense: CodeLicense
  apiOff: string[]
  apiExtra: string[]
  agent: AgentId
  tinkerGoal: TinkerGoal
  tinkerIdea: string
  device: Device
}

// Same sizes as app remakes, with game words.
export const GAME_TIER: Record<TierId, { label: string; likeA: string }> = {
  quick: { label: 'Mini-game', likeA: 'like a puzzle' },
  standard: { label: 'A few levels', likeA: 'like a big LEGO set' },
  big: { label: 'Big game', likeA: 'like building a treehouse' },
  platform: { label: 'Epic', likeA: 'like building a castle' },
}
export const gameTierView = (t: Tier) => ({ ...t, ...GAME_TIER[t.id] })

// Words that usually mean real work in a game. The weight is how much bigger the job gets.
const GAME_HARD: [RegExp, string, number][] = [
  [/online|multiplayer|room code|join on their phones|leaderboard|with strangers/i, 'online play', 2],
  [/\b3d\b|first.?person|third.?person/i, '3D graphics', 1],
  [/open world|huge map|big world|thousands/i, 'a big world', 1],
  [/random|endless|procedural|infinite/i, 'random worlds', 1],
  [/drift|physics|ragdoll|bounce/i, 'physics', 1],
  [/editor|build their own|mods?\b/i, 'a level editor or mods', 1],
  [/computer players|bots|find their own path|pathfinding/i, 'computer players that think', 1],
  [/season|day and night|day\/night|calendar|bedtime/i, 'a game clock and calendar', 1],
  [/story|choices change/i, 'a story with choices', 1],
]

export function gameHardParts(features: string[]): string[] {
  return GAME_HARD.filter(([re]) => features.some((f) => re.test(f))).map(([, name]) => name)
}

export interface GameSizeInput {
  base: number // from the genre (1 mini-game … 4 epic)
  features: string[]
  players: Players
  platform: GamePlatform
}

export function gameScore({ base, features, players, platform }: GameSizeInput): number {
  let score = base * 2
  score += Math.floor(features.length / 4)
  score += { solo: 0, couch: 1, online: 3 }[players]
  score += platform === 'phone' ? 1 : 0
  score += GAME_HARD.filter(([re]) => features.some((f) => re.test(f))).reduce((t, [, , w]) => t + w, 0)
  return score
}

export function gameTier(input: GameSizeInput): Tier {
  const score = gameScore(input)
  if (score >= 13 || (input.base === 4 && score >= 11)) return TIERS.platform
  if (score >= 9 || input.base === 4) return TIERS.big
  if (score >= 5) return TIERS.standard
  return TIERS.quick
}

const has = (features: string[], re: RegExp) => features.some((f) => re.test(f))

// Picks the engine and free building blocks for a game. Free and simple first.
export function suggestGameApis({ features, players, platform }: { features: string[]; players: Players; platform: GamePlatform }): Suggestion[] {
  const out: Suggestion[] = []
  const add = (id: string, why: string) => {
    if (!out.some((s) => s.id === id)) out.push({ id, why })
  }
  const threeD = has(features, /\b3d\b|first.?person|third.?person|world made of blocks/i)
  if (platform === 'desktop' || threeD) add('godot', 'A free game maker for 2D and 3D games. Runs on Windows, Mac and Linux.')
  else add('phaser', 'A free tool for 2D games that run in a web browser. Easy to share with a link.')
  add('kenney', 'Thousands of free game pictures and sounds you can use for anything.')
  add('freesound', 'Free sound effects: jumps, coins, explosions. Check each sound\'s license.')
  if (players === 'online' || has(features, /online|room code|join on their phones|leaderboard/i))
    add('supabase', 'Saves scores and lets players connect online. Free to start.')
  if (platform === 'desktop' || threeD) add('itch-io', 'Put your game online so anyone can download or play it. Free.')
  else add('github-pages', 'Puts your browser game online for free, right from your code.')
  return out
}

// Games whose openness lets you play or tinker right away.
export const OPENNESS: Record<Openness, { emoji: string; label: string; short: string; step: number }> = {
  closed: { emoji: '🔒', label: 'Still closed', short: 'Nothing open yet. Build your own!', step: 0 },
  'look-alike': { emoji: '🧩', label: 'Free look-alike', short: 'A free open-source game plays a lot like it.', step: 1 },
  'fans-rebuilt': { emoji: '🛠️', label: 'Fans rebuilt it', short: 'Fans made a free engine. Bring your own copy of the game.', step: 2 },
  'code-out': { emoji: '🔓', label: 'Code is out', short: 'The company released the code.', step: 3 },
}

export const defaultGameConfig = (features: string[], players: Players = 'solo'): GameConfig => ({
  gameName: '',
  features,
  customFeatures: [],
  twist: '',
  players,
  platform: 'browser',
  art: 'shapes',
  style: '',
  codeLicense: 'mit',
  apiOff: [],
  apiExtra: [],
  agent: 'claude-code',
  tinkerGoal: 'run',
  tinkerIdea: '',
  device: 'windows',
})
