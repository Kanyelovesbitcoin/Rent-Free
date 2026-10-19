import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { allDrops, allGames, allGenres, gameDataErrors, getDrop, getGame, getGenre } from '../src/lib/gameData'
import { allApis } from '../src/lib/data'
import { selectedApis } from '../src/lib/apiSuggest'
import { defaultGameConfig, gameTier, suggestGameApis, type GameConfig } from '../src/lib/games'
import { CREDITS_TEMPLATE, OPEN_SOURCE_GUIDE, gameDoc, gamePrompt, tinkerPrompt } from '../src/lib/gamePrompt'
import { starterKitFiles, starterKitZip } from '../src/lib/starterKit'
import { renderGameSketch } from '../src/lib/wireframes/game'
import { gradeLevel } from '../src/lib/readability'

const ids = (xs: { id: string }[]) => xs.map((x) => x.id)

describe('game data', () => {
  it('loads cleanly with cross-links intact', () => {
    expect(gameDataErrors).toEqual([])
    expect(allGames.length).toBeGreaterThanOrEqual(20)
    expect(allDrops.length).toBeGreaterThanOrEqual(10)
    for (const g of allGames) if (g.openness === 'code-out') expect(getDrop(g.dropId), g.id).toBeDefined()
  })
  it('lists source drops newest first', () => {
    const dates = allDrops.map((d) => d.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })
  it('every sketch renders', () => {
    for (const g of allGenres) expect(renderGameSketch(g.sketch, 'Test')).toContain('<!doctype html>')
  })
})

describe('how big a game is', () => {
  it('a browser, one-player survivor game is a mini-game', () => {
    const genre = getGenre('survivor-like')
    expect(gameTier({ base: genre.base, features: genre.defaultFeatures, players: 'solo', platform: 'browser' }).id).toBe('quick')
  })
  it('an online 3D kart racer is epic', () => {
    const genre = getGenre('kart-racer')
    const features = [...genre.defaultFeatures, '3D tracks', 'Online races with friends']
    expect(gameTier({ base: genre.base, features, players: 'online', platform: 'browser' }).id).toBe('platform')
  })
  it('a block-building sandbox is never small', () => {
    const genre = getGenre('block-sandbox')
    expect(['big', 'platform']).toContain(gameTier({ base: genre.base, features: genre.defaultFeatures.slice(0, 2), players: 'solo', platform: 'browser' }).id)
  })
})

describe('game building blocks', () => {
  it('browser games get Phaser and a free place to publish; desktop/3D games get Godot', () => {
    expect(ids(suggestGameApis({ features: [], players: 'solo', platform: 'browser' }))).toEqual(expect.arrayContaining(['phaser', 'kenney', 'github-pages']))
    expect(ids(suggestGameApis({ features: ['A 3D world made of blocks'], players: 'solo', platform: 'browser' }))).toContain('godot')
    expect(ids(suggestGameApis({ features: [], players: 'solo', platform: 'desktop' }))).toEqual(expect.arrayContaining(['godot', 'itch-io']))
  })
  it('only online games get an online database', () => {
    expect(ids(suggestGameApis({ features: [], players: 'solo', platform: 'browser' }))).not.toContain('supabase')
    expect(ids(suggestGameApis({ features: [], players: 'online', platform: 'browser' }))).toContain('supabase')
  })
  it('every suggestion is a real toolbox entry', () => {
    for (const s of suggestGameApis({ features: ['3D', 'online'], players: 'online', platform: 'desktop' })) expect(allApis.some((a) => a.id === s.id), s.id).toBe(true)
  })
})

describe('build-my-own prompt', () => {
  const game = getGame('stardew-valley')!
  const genre = getGenre(game.genre)
  const config: GameConfig = { ...defaultGameConfig(game.lovedFeatures), twist: 'You are a cat running a bakery.' }
  const tier = gameTier({ base: genre.base, features: config.features, players: config.players, platform: config.platform })
  const apis = selectedApis(suggestGameApis({ features: config.features, players: config.players, platform: config.platform }), [], [], allApis)
  const prompt = gamePrompt({ game, inspiredBy: game.name, genre, config, tier, apis })

  it('has the core loop, the features and the twist', () => {
    expect(prompt).toContain(genre.coreLoop)
    for (const f of game.lovedFeatures) expect(prompt).toContain(f)
    expect(prompt).toContain('You are a cat running a bakery.')
  })
  it('keeps people on the legal side', () => {
    expect(prompt).toContain('Copy the fun, not the stuff')
    expect(prompt).toMatch(/Never decompile/)
    expect(prompt).not.toMatch(/use the original('s)? (art|music|sprites)/i)
  })
  it('ends with an open-source release', () => {
    expect(prompt).toContain('## Release it as open source')
    expect(prompt).toContain('LICENSE')
    expect(prompt).toContain('MIT')
    expect(prompt).toContain('CREDITS.md')
    const gpl = gamePrompt({ game, inspiredBy: game.name, genre, config: { ...config, codeLicense: 'gpl' }, tier, apis })
    expect(gpl).toContain('GPL-3.0')
  })
  it('adds extra legal care where companies protect their look', () => {
    const tetris = getGame('tetris')!
    const t = gamePrompt({ game: tetris, inspiredBy: tetris.name, genre: getGenre(tetris.genre), config: defaultGameConfig(tetris.lovedFeatures), tier, apis })
    expect(t).toContain('2012')
  })
  it('epic games are told to start with a small slice and look at fan projects', () => {
    const mc = getGame('minecraft')!
    const g = getGenre(mc.genre)
    const big = gameTier({ base: g.base, features: [...mc.lovedFeatures, 'Play together online'], players: 'online', platform: 'desktop' })
    const p = gamePrompt({ game: mc, inspiredBy: mc.name, genre: g, config: { ...defaultGameConfig(mc.lovedFeatures), players: 'online' }, tier: big, apis })
    expect(big.id).toBe('platform')
    expect(p).toMatch(/vertical slice/)
    expect(p).toContain('Luanti')
  })
})

describe('tinker prompt (released code only)', () => {
  const game = getGame('command-and-conquer')!
  const drop = getDrop(game.dropId)!
  const prompt = tinkerPrompt({ game, drop, config: { ...defaultGameConfig([]), tinkerGoal: 'mod', device: 'steam-deck' } })
  it('points at the official code and follows its license', () => {
    expect(drop.repoUrl).toBeTruthy()
    expect(prompt).toContain(drop.repoUrl!)
    expect(prompt).toContain('GPL-3.0')
    expect(prompt).toMatch(/same license/)
  })
  it('never ships the game files', () => {
    expect(prompt).toContain('Never add the game\'s files to git')
    expect(prompt).toMatch(/No piracy/)
    expect(prompt).toContain('Steam Deck')
  })
  it('only code-out games can be tinkered with', () => {
    for (const g of allGames) if (g.openness !== 'code-out') expect(getDrop(g.dropId), g.id).toBeUndefined()
  })
})

describe('quest kit', () => {
  const game = getGame('vampire-survivors')!
  const genre = getGenre(game.genre)
  const config = defaultGameConfig(game.lovedFeatures)
  const tier = gameTier({ base: genre.base, features: config.features, players: 'solo', platform: 'browser' })
  const input = { game, inspiredBy: game.name, genre, config, tier, apis: [] }
  const kit = {
    slug: game.id,
    name: `${game.name}-style game`,
    prompt: gamePrompt(input),
    agent: 'claude-code' as const,
    apis: [],
    wireframeHtml: renderGameSketch(genre.sketch, 'Test'),
    heading: `Start here: make your own game inspired by ${game.name}`,
    folderPrefix: 'rent-free-game',
    extraFiles: { 'GAME.md': gameDoc(input), 'CREDITS.md': CREDITS_TEMPLATE, 'OPEN-SOURCE-IT.md': OPEN_SOURCE_GUIDE },
  }
  it('has the game plan, credits and open-source checklist', () => {
    const files = starterKitFiles(kit)
    expect(Object.keys(files)).toEqual(expect.arrayContaining(['START-HERE.md', 'PROMPT.md', 'CLAUDE.md', 'GAME.md', 'CREDITS.md', 'OPEN-SOURCE-IT.md', 'wireframe.html']))
    expect(files['START-HERE.md']).toContain('inspired by Vampire Survivors')
    expect(files['START-HERE.md']).toContain('GAME.md')
    expect(files['GAME.md']).toContain(genre.coreLoop)
  })
  it('zips into one rent-free-game folder', () => {
    const out = unzipSync(starterKitZip(kit))
    expect(Object.keys(out).every((k) => k.startsWith('rent-free-game-vampire-survivors/'))).toBe(true)
    expect(strFromU8(out['rent-free-game-vampire-survivors/OPEN-SOURCE-IT.md'])).toContain('MIT')
  })
})

describe('plain language in Game mode', () => {
  const avg = (xs: string[]) => xs.reduce((t, x) => t + gradeLevel(x), 0) / xs.length
  it('game descriptions are easy to read', () => {
    expect(avg(allGames.map((g) => g.what))).toBeLessThanOrEqual(6)
  })
  it('source drop explanations are easy to read', () => {
    expect(avg(allDrops.map((d) => d.what))).toBeLessThanOrEqual(7)
    expect(avg(allDrops.map((d) => d.why))).toBeLessThanOrEqual(7)
  })
  it('genre core loops are easy to read', () => {
    expect(avg(allGenres.map((g) => g.coreLoop))).toBeLessThanOrEqual(6)
  })
})
