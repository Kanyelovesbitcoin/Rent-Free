// The copy-paste prompts for Game mode. Two kinds:
// 1. Build my own: an ORIGINAL open-source game inspired by one you love ("copy the fun, not the stuff").
// 2. Tinker: work with code a company officially released, following its license.
import { AGENTS, type Agent } from './agentPrompt'
import { gameHardParts, gameTierView, type Device, type GameConfig, type TinkerGoal } from './games'
import type { Tier } from './complexity'
import type { Api, Game, GameGenre, SourceDrop } from './schema'

export const FUN_NOT_STUFF =
  "Copy the fun, not the stuff. Similar gameplay ideas are fine (game rules and mechanics can't be owned), but do NOT use the original game's name, characters, story, world, art, music, sounds, logos, level layouts or code. Make everything original, or use free assets with a clear license."
export const NO_DECOMPILE =
  'Never decompile, extract or download files from the original game, and never copy its code, even if I ask. If something can only be done that way, tell me and suggest an original way instead.'

const PLAYERS = {
  solo: 'One player.',
  couch: 'Up to 2–4 players on the same screen (split keyboard or gamepads).',
  online: 'Players connect online. Keep it as simple as possible (for example, rooms with a short code) and explain what needs a server.',
}
const PLATFORM = {
  browser: 'Runs in a web browser on a computer (keyboard and gamepad), and still works on a phone if possible.',
  desktop: 'A desktop game for Windows, Mac and Linux (keyboard and gamepad).',
  phone: 'Phone-first: big touch buttons or swipe controls, works in portrait, can be added to the home screen.',
}
const ART = {
  shapes: 'Start with simple shapes and colors so the game is fun before it is pretty. Then offer to swap in free art.',
  'free-pack': 'Use free art and sounds with a clear license (Kenney is CC0, the easiest). Start with shapes until the game works, then swap them in.',
  'my-art': 'I will draw my own art. Use simple placeholder shapes with the right sizes, and tell me exactly what pictures to make (names, sizes, how many frames).',
}
const LICENSE = {
  mit: 'MIT (anyone can use and change it, they just keep my name on it)',
  gpl: 'GPL-3.0 (anyone can use and change it, but they must share their changes as open source too)',
}

export interface GamePromptInput {
  game?: Game // the game that inspires it (undefined for "my own idea")
  inspiredBy: string
  genre: GameGenre
  config: GameConfig
  tier: Tier
  apis: Api[]
}

function gameWorkflow(tier: Tier, agent: Agent, game?: Game): string[] {
  const mem = agent.memoryFile
  const steps: string[] = []
  const memStep = mem ? `Create ${mem} with: what the game is, how to run it, how to run the tests, the controls, and the rules above. Keep it updated.` : null
  const git = agent.id === 'chat' ? null : 'Use git: start a repo and commit after each working step with a clear message.'
  const chatNote = agent.id === 'chat' ? "You can't run code here, so give me complete files with their paths and the exact commands to run. One milestone per reply." : null
  const playtest = 'After each milestone, run the game yourself, fix errors, then give me a short playtest list: 3 to 5 things to try and what should happen.'

  if (tier.id === 'quick') {
    steps.push('Ask me up to 3 short questions only if something important is unclear.')
    if (memStep) steps.push(memStep)
    steps.push(
      'Milestone 1, "playable in 10 seconds": I can move and there is one thing to do. Show me how to start it.',
      'Milestone 2: the full core loop and every must-have, with a start screen, game over and restart.',
      'Milestone 3: polish (sounds, little effects, a pause menu) and the open-source release below.',
      playtest,
    )
  } else {
    if (tier.id === 'platform') {
      steps.push(
        'This is a huge game. Plan a small "vertical slice" first: one level, track or area that is fully fun. We grow it later.',
        game?.fanProjects.length
          ? `Free open-source projects already exist (${game.fanProjects.map((p) => p.name).join(', ')}). Tell me in plain words whether I should play, contribute to, or learn from one of them instead of starting from zero. Wait for my choice.`
          : 'Before building, check whether a free open-source game or engine already does most of this, and tell me if I should start from it. Wait for my choice.',
      )
    }
    steps.push(
      tier.id === 'standard'
        ? 'First, write a short plan in GAME.md: the core loop, controls, and 4 milestones (1: playable in 10 seconds, 2: core loop, 3: levels and progress, 4: polish and release). Wait for my OK.'
        : 'Before writing code, update GAME.md (core loop, controls, screens, what is NOT in version 1) and create PLAN.md (milestones with checkboxes and how we know each is done). Stop and wait for my OK.',
    )
    if (memStep) steps.push(memStep)
    steps.push(
      tier.id === 'standard' ? 'Build one milestone at a time.' : 'Work one milestone at a time, tick the boxes in PLAN.md, then STOP and wait for my OK before the next one.',
      playtest,
      'Write automated tests for the rules (score, damage, levels, saving), not for the graphics. Run them before each hand-over.',
    )
  }
  if (git) steps.push(git)
  if (chatNote) steps.push(chatNote)
  return steps
}

// 1. Build my own open-source game.
export function gamePrompt(input: GamePromptInput): string {
  const { config: c, genre, tier, apis, game } = input
  const agent = AGENTS[c.agent]
  const view = gameTierView(tier)
  const features = [...c.features, ...c.customFeatures.map((f) => f.trim()).filter(Boolean)]
  const hard = gameHardParts(features)
  const name = c.gameName.trim()
  const kind = genre.name.toLowerCase().replace(/ game$/, '') // "Puzzle game" → "puzzle", so titles don't say "game game"

  const L: string[] = []
  L.push(name ? `# Make "${name}": my own open-source ${kind} game` : `# Make my own open-source ${kind} game`)
  L.push('', '## Context')
  L.push(
    (game ? `I love ${input.inspiredBy}. I want to make my own original game that captures what I love about it, and share it as open source. ` : `I want to make my own original ${kind} game and share it as open source. `) +
      "I'm not a professional developer, so explain things in plain English and keep the setup simple. " +
      'Whenever I need to do something myself (install a tool, sign up, click something), give me click-by-click steps.',
  )
  if (!name) L.push('', 'First, suggest 3 short, original names for the game (not similar to any existing game) and use the one I pick.')
  L.push('', '## The core loop', genre.coreLoop)
  L.push('', '## Must-haves (version 1)')
  features.forEach((f, i) => L.push(`${i + 1}. ${f}`))
  if (!features.length) L.push('1. (Ask me what matters most before starting.)')
  if (c.twist.trim()) L.push('', '## My twist (what makes it mine)', c.twist.trim())

  L.push('', '## Requirements')
  L.push(`- **Players:** ${PLAYERS[c.players]}`)
  L.push(`- **Where it runs:** ${PLATFORM[c.platform]}`)
  L.push('- **Controls:** Keyboard and gamepad on computers; touch on phones. Show the controls on the start screen.')
  L.push(`- **Art & sound:** ${ART[c.art]}${c.style.trim() ? ` Look: ${c.style.trim()}.` : ''} List every art, sound and font file in CREDITS.md with its author, link and license.`)
  L.push('- **Feel:** Make it feel good: little effects when things happen (a bounce, a sound, a flash). Add a setting to turn off screen shake and flashing.')
  L.push('- **Saving:** Save progress and settings on the device. No accounts unless the game needs online play.')
  L.push('- **Speed:** Smooth (about 60 frames a second) on a normal laptop.')
  L.push(`- **Legal (important):** ${FUN_NOT_STUFF}`)
  L.push(`- **No copying code:** ${NO_DECOMPILE}`)
  if (game?.legalNote) L.push(`- **Extra care:** ${game.legalNote}`)
  if (game?.scopeNote) L.push(`- **Size:** ${game.scopeNote}`)
  if (hard.length) L.push(`- **Tricky parts to plan carefully:** ${hard.join(', ')}. Prefer proven open-source libraries over writing these from scratch.`)

  if (apis.length) {
    L.push('', '## Tools and building blocks to use')
    L.push("Use these instead of building them yourself. Prefer free options, and don't add paid services without asking me.")
    for (const a of apis) {
      const env = a.envVars.length ? ` Settings: ${a.envVars.map((v) => '`' + v.split('=')[0] + '`').join(', ')} (in .env, never committed; keep a .env.example).` : ''
      L.push(`- **${a.name}:** ${a.what} Free: ${a.freeTier}. Docs: ${a.docsUrl}.${env}`)
    }
  }

  L.push('', `## How to work (${view.emoji} ${view.label}: ${tier.effort})`)
  gameWorkflow(tier, agent, game).forEach((s, i) => L.push(`${i + 1}. ${s}`))

  L.push('', '## Release it as open source (last milestone)')
  L.push(`- Add a LICENSE file: ${LICENSE[c.codeLicense]}. My own art and music: CC BY 4.0 (people can reuse it if they credit me).`)
  L.push('- README.md with a screenshot, what the game is, how to play, the controls, and how to run or build it.')
  L.push("- CREDITS.md listing every asset. Don't use anything marked \"ND\" (no changes allowed) or with an unclear license.")
  L.push('- CONTRIBUTING.md: how other people can report bugs and help.')
  L.push(
    c.platform === 'desktop'
      ? '- Walk me through putting the code on GitHub, then uploading the game to itch.io (free), click by click.'
      : '- Walk me through putting the code on GitHub, then publishing the playable game with GitHub Pages or itch.io (both free), click by click.',
  )

  L.push('', '## Definition of done')
  L.push('- [ ] A new player can start playing within 10 seconds')
  L.push('- [ ] Every must-have works; game over and restart work')
  L.push('- [ ] Starts with one documented command, and you told me how to open it')
  if (tier.id !== 'quick') L.push('- [ ] Tests for the rules pass')
  L.push('- [ ] LICENSE, README (with a screenshot), CREDITS.md and CONTRIBUTING.md exist')
  L.push("- [ ] Nothing from the original game is in the project: no name, art, music, levels or code")
  return L.join('\n')
}

const GOALS: Record<TinkerGoal, { title: (n: string) => string; ask: string }> = {
  run: { title: (n) => `Get ${n} running on my computer from its official source code`, ask: 'Build the game from the official code and get it running on my computer.' },
  mod: { title: (n) => `Make a mod for ${n} using its official source code`, ask: 'Help me make a small mod. Keep my changes in their own folder or branch so the original stays clean.' },
  fix: { title: (n) => `Fix or improve ${n} using its official source code`, ask: 'Help me fix a bug or make a small improvement, and explain the change in plain words.' },
  port: { title: (n) => `Make ${n} run on a new device using its official source code`, ask: 'Help me get it running on my device, using existing community ports of the official code if they exist.' },
}
const DEVICE: Record<Device, string> = {
  windows: 'a Windows PC',
  mac: 'a Mac',
  linux: 'a Linux PC',
  'steam-deck': 'a Steam Deck (Linux, desktop mode)',
}

function licenseRules(drop: SourceDrop): string {
  if (drop.licenseKind === 'source-available')
    return `The license (${drop.license}) lets me look at and change the code, but it has limits (for example, no selling). Read it with me, follow it exactly, and don't help me use the code in a way it doesn't allow.`
  if (drop.licenseKind === 'public-domain') return `It's released as ${drop.license} (public domain), so there are no rules, but please still credit the original makers.`
  if (/gpl/i.test(drop.license))
    return `It's ${drop.license}. Keep the LICENSE file and copyright notices. If I share my changed version, it must stay open source under the same license, with its source code.`
  return `It's ${drop.license}. Keep the LICENSE file and copyright notices in everything I share.`
}

// 2. Tinker with code a company officially released.
export function tinkerPrompt({ game, drop, config: c }: { game: Game; drop: SourceDrop; config: GameConfig }): string {
  const agent = AGENTS[c.agent]
  const goal = GOALS[c.tinkerGoal]
  const L: string[] = []
  L.push(`# ${goal.title(game.name)}`)
  L.push('', '## Context')
  L.push(
    `${drop.by} officially released the code for ${drop.title} on ${drop.date}${drop.repoUrl ? `: ${drop.repoUrl}` : ''}. ` +
      "I'm not a professional developer, so explain things in plain English, and give me click-by-click steps for anything I must do myself.",
  )
  L.push('', '## My goal', goal.ask)
  if (c.tinkerIdea.trim()) L.push('', c.tinkerIdea.trim())
  L.push('', `My computer: ${DEVICE[c.device]}.`)
  L.push('', '## Rules')
  L.push(`- **License:** ${licenseRules(drop)}`)
  L.push(`- **Only official code:** Use only the official release${drop.repoUrl ? ` (${drop.repoUrl})` : ''} or well-known community projects built on it. Tell me which one you pick and why.`)
  if (drop.needsYourCopy)
    L.push(
      "- **Game files:** The art, music and levels are NOT part of the code release. I'll use the files from my own copy of the game that I bought. Help me find them on my computer. Never add the game's files to git, and never upload or share them.",
    )
  else if (drop.includesArt) L.push('- **Game files:** The art was released too, so we can use it under the same license.')
  L.push("- **No piracy:** Don't download game files from unofficial sites, and don't crack or get around copy protection.")
  L.push('', '## How to work')
  const steps = [
    "Read the project's README and build instructions first. Then tell me in plain words what we need to install, and how big the job is.",
    'Install the tools with me step by step. Check each step worked before moving on.',
    'Build it, run it, and fix errors until it starts.',
    agent.memoryFile ? `Create ${agent.memoryFile} with how to build and run it, and what we changed.` : null,
    agent.id === 'chat' ? "You can't run code here, so give me exact commands to run and ask me to paste back what I see." : 'Use git: keep my changes on their own branch with clear commits.',
    'Write MY-NOTES.md: how to build and play it again next time, in plain words.',
  ].filter((s): s is string => !!s)
  steps.forEach((s, i) => L.push(`${i + 1}. ${s}`))
  L.push('', '## Done when')
  L.push('- [ ] The game starts and I played it for 5 minutes')
  if (c.tinkerGoal === 'mod' || c.tinkerGoal === 'fix') L.push('- [ ] My change works, and the original game still works too')
  L.push('- [ ] MY-NOTES.md explains how to do it again')
  L.push("- [ ] No game files (art, music, levels) are in git")
  return L.join('\n')
}

// GAME.md: the one-page game plan that ships in the starter kit.
export function gameDoc({ inspiredBy, genre, config: c, tier, game }: GamePromptInput): string {
  const view = gameTierView(tier)
  const features = [...c.features, ...c.customFeatures.filter((f) => f.trim())]
  const later = [...(game?.extraFeatures ?? []), ...genre.extraFeatures].filter((f, i, a) => !features.includes(f) && a.indexOf(f) === i)
  return [
    `# ${c.gameName.trim() || 'My game'}: game plan`,
    '',
    game ? `Inspired by what I love about **${inspiredBy}**. We copy the fun, not the stuff.` : 'My own game idea.',
    '',
    '## The core loop',
    genre.coreLoop,
    '',
    '## Must-haves (version 1)',
    ...features.map((f) => `- [ ] ${f}`),
    ...(c.twist.trim() ? ['', '## My twist', c.twist.trim()] : []),
    '',
    '## Setup',
    `- Players: ${c.players}`,
    `- Runs on: ${c.platform}`,
    `- Art: ${c.art}`,
    `- Size: ${view.emoji} ${view.label} (${tier.effort})`,
    '',
    '## Ideas for later (not in version 1)',
    ...(later.length ? later.map((f) => `- ${f}`) : ['- (add ideas here)']),
    '',
  ].join('\n')
}

export const CREDITS_TEMPLATE = [
  '# Credits',
  '',
  'Every picture, sound, song and font in this game, and where it came from.',
  '',
  '| What | File | Made by | License | Link |',
  '| --- | --- | --- | --- | --- |',
  '| (example) Jump sound | sounds/jump.wav | Kenney | CC0 | https://kenney.nl |',
  '',
  'Good free places: Kenney (CC0, use for anything), OpenGameArt and Freesound (check each file\'s license).',
  "Avoid anything marked ND (no changes) or with no license. Never use files from another company's game.",
  '',
].join('\n')

export const OPEN_SOURCE_GUIDE = [
  '# Make your game open source: checklist',
  '',
  '"Open source" means anyone can see your code, learn from it, change it and share it. Here\'s how to do it right.',
  '',
  '## 1. Pick a license for your code',
  '- **MIT:** anyone can do anything with it. They just keep your name on it. Easiest choice.',
  '- **GPL-3.0:** anyone can change it, but if they share their version, it must be open source too.',
  '',
  '## 2. Pick a license for your art and music',
  '- **CC BY 4.0:** people can reuse it if they credit you.',
  '- **CC0:** a gift to everyone. No rules at all.',
  '',
  '## 3. Only include things you are allowed to share',
  '- Your own work, or free assets with a license that allows it (list them in CREDITS.md).',
  "- Never another company's art, music, names, characters or code.",
  '',
  '## 4. Put it on GitHub',
  '1. Make a free account at github.com.',
  '2. Ask your AI helper: "Put this project on GitHub for me, step by step."',
  '3. Check that LICENSE, README.md and CREDITS.md are there.',
  '',
  '## 5. Let people play it',
  '- **itch.io:** free. Upload your game and get a page people can play or download from.',
  '- **GitHub Pages:** free for browser games. Your game gets its own link.',
  '',
  '## 6. Invite help',
  '- Add CONTRIBUTING.md so people know how to report bugs and suggest ideas.',
  '- Share your link and ask for feedback. Say thank you to everyone who helps!',
  '',
].join('\n')
