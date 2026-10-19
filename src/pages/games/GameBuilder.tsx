import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { toPng } from 'html-to-image'
import { LevelCard, LicenseBadge, OpenMeter, QuestBar } from '../../components/arcade'
import { AgentPicker, BlockList, toggleBlock } from '../../components/BuildParts'
import { Chip, FunNotStuff } from '../../components/GameParts'
import { CopyButton, Segmented, ToolTile, prefersReducedMotion, useToast } from '../../components/ui'
import { AGENTS } from '../../lib/agentPrompt'
import { selectedApis } from '../../lib/apiSuggest'
import { allApis } from '../../lib/data'
import { allGenres, getDrop, getGame, getGenre } from '../../lib/gameData'
import { CREDITS_TEMPLATE, OPEN_SOURCE_GUIDE, gameDoc, gamePrompt, tinkerPrompt } from '../../lib/gamePrompt'
import {
  defaultGameConfig,
  gameHardParts,
  gameTier,
  gameTierView,
  suggestGameApis,
  type ArtPlan,
  type CodeLicense,
  type Device,
  type GameConfig,
  type GamePlatform,
  type Players,
  type TinkerGoal,
} from '../../lib/games'
import { downloadFile } from '../../lib/ics'
import { useStoredConfig } from '../../lib/remakeStore'
import { starterKitZip } from '../../lib/starterKit'
import { renderGameSketch } from '../../lib/wireframes/game'
import type { Game, GameGenre } from '../../lib/schema'

const BUILD_LEVELS = [
  { id: 'pick', label: 'Pick' },
  { id: 'love', label: 'What you love' },
  { id: 'play', label: 'How it plays' },
  { id: 'boss', label: 'Boss check' },
  { id: 'prompt', label: 'Your prompt' },
  { id: 'share', label: 'Share it' },
]
const TINKER_LEVELS = [
  { id: 'pick', label: 'Pick' },
  { id: 'goal', label: 'Your goal' },
  { id: 'rules', label: 'The rules' },
  { id: 'tprompt', label: 'Your prompt' },
]
const TIER_ORDER = ['quick', 'standard', 'big', 'platform'] as const
// Building blocks that make sense for games (the full toolbox is one tap away).
const GAME_POOL = allApis.filter((a) => a.category.startsWith('game-') || ['github-pages', 'itch-io', 'supabase', 'pocketbase', 'cloudflare-pages', 'lm-studio-server'].includes(a.id))
const unique = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) === i)
const scrollTo = (id: string) => setTimeout(() => document.getElementById(`lvl-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)

export default function GameBuilder() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const game = id ? getGame(id) : undefined
  const [pick, setPick] = useStoredConfig('rent-free:game-pick', { genreId: '', inspiredBy: '' })
  useEffect(() => {
    const inspired = params.get('inspired')
    if (inspired && !game) setPick((p) => ({ ...p, inspiredBy: inspired.slice(0, 60) }))
    // Only on first load: the link that brought you here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const genre = game ? getGenre(game.genre) : pick.genreId ? getGenre(pick.genreId) : undefined
  const canTinker = game?.openness === 'code-out' && !!getDrop(game.dropId)
  const [mode, setMode] = useState<'build' | 'tinker'>(canTinker && params.get('mode') === 'tinker' ? 'tinker' : 'build')

  const header = (
    <header className="mb-6">
      <p className="mb-3 text-sm font-bold text-ink-soft">
        <Link to="/games" className="hover:text-ink">
          🎮 Games
        </Link>{' '}
        / {game ? <Link to={`/games/${game.id}`} className="hover:text-ink">{game.name}</Link> : 'Make a game'}
      </p>
      <h1 className="font-display text-3xl leading-tight font-extrabold sm:text-5xl">
        {game && mode === 'tinker' ? (
          <>
            Tinker with <span className="hl">{game.name}</span>
          </>
        ) : game ? (
          <>
            Make your own <span className="hl">{game.name}-style</span> game
          </>
        ) : (
          <>
            Make your <span className="hl">own game</span>
          </>
        )}
      </h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-soft">
        {mode === 'tinker'
          ? 'Clear each level. At the end you get instructions for an AI helper that works with the official code with you, the legal way.'
          : 'Clear each level. At the end you get instructions for an AI helper that builds the game for you, and a plan to share it as open source.'}
      </p>
    </header>
  )

  const genrePicker = (
    <LevelCard n={1} title="What kind of game?" id="lvl-pick" testId="level-pick">
      <label className="block">
        <span className="label">A game that inspires you (optional)</span>
        <input
          className="field"
          placeholder="e.g. Animal Crossing, Wordle, Fall Guys"
          value={pick.inspiredBy}
          onChange={(e) => setPick((p) => ({ ...p, inspiredBy: e.target.value.slice(0, 60) }))}
          aria-label="A game that inspires you"
        />
      </label>
      <p className="label mt-4">Pick a kind of game</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Kind of game">
        {allGenres.map((g) => (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={pick.genreId === g.id}
            onClick={() => {
              setPick((p) => ({ ...p, genreId: g.id }))
              scrollTo('love')
            }}
            className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition ${pick.genreId === g.id ? 'border-ink bg-money-soft' : 'border-line hover:border-ink'}`}
          >
            <span className="text-2xl" aria-hidden>
              {g.emoji}
            </span>
            <span className="font-bold">{g.name}</span>
          </button>
        ))}
      </div>
    </LevelCard>
  )

  if (!genre)
    return (
      <div>
        {header}
        <QuestBar levels={BUILD_LEVELS.map((l) => l.label)} done={BUILD_LEVELS.map(() => false)} />
        {genrePicker}
      </div>
    )

  const gameSummary = game && (
    <LevelCard n={1} title="Your game" id="lvl-pick" testId="level-pick">
      <div className="flex flex-wrap items-center gap-4">
        <ToolTile name={game.name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-extrabold">{game.name}</p>
          <p className="text-sm font-bold text-ink-soft">
            {genre.emoji} {genre.name}
          </p>
        </div>
        <Link to="/games" className="text-sm font-bold text-ink-soft underline">
          Change game
        </Link>
      </div>
      <div className="mt-4">
        <OpenMeter openness={game.openness} />
      </div>
    </LevelCard>
  )

  return (
    <div>
      {header}
      <BuilderBody
        key={`${game?.id ?? `custom-${genre.id}`}:${mode}`} // each mode keeps its own quest progress
        game={game}
        genre={genre}
        inspiredBy={game?.name ?? pick.inspiredBy.trim()}
        level1={gameSummary || genrePicker}
        mode={mode}
        setMode={setMode}
      />
    </div>
  )
}

type Mode = 'build' | 'tinker'
function BuilderBody({ game, genre, inspiredBy, level1, mode, setMode }: { game?: Game; genre: GameGenre; inspiredBy: string; level1: ReactNode; mode: Mode; setMode: (m: Mode) => void }) {
  const notify = useToast()
  const drop = getDrop(game?.dropId)
  const canTinker = game?.openness === 'code-out' && !!drop
  const key = game?.id ?? `custom-${genre.id}`
  const loved = game?.lovedFeatures ?? genre.defaultFeatures
  const options = unique([...loved, ...(game?.extraFeatures ?? []), ...genre.extraFeatures])
  const defaults = useMemo(() => defaultGameConfig(loved, genre.defaultPlayers), [loved, genre.defaultPlayers])
  const [config, setConfig, reset] = useStoredConfig<GameConfig>(`rent-free:game:${key}`, defaults)
  const [quest, setQuest] = useStoredConfig(`rent-free:game-quest:${key}:${mode}`, { cleared: [] as string[] })
  const [newFeature, setNewFeature] = useState('')
  const [kitBusy, setKitBusy] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)
  const set = (patch: Partial<GameConfig>) => setConfig((c) => ({ ...c, ...patch }))

  const features = [...config.features, ...config.customFeatures]
  const tier = gameTier({ base: genre.base, features, players: config.players, platform: config.platform })
  const view = gameTierView(tier)
  const hard = gameHardParts(features)
  const suggestions = suggestGameApis({ features, players: config.players, platform: config.platform })
  const apis = selectedApis(suggestions, config.apiOff, config.apiExtra, allApis)
  const promptInput = { game, inspiredBy: inspiredBy || genre.name, genre, config, tier, apis }
  const prompt = mode === 'tinker' && game && drop ? tinkerPrompt({ game, drop, config }) : gamePrompt(promptInput)
  const sketch = useMemo(() => renderGameSketch(genre.sketch, config.gameName.trim() || 'My game'), [genre.sketch, config.gameName])
  const levels = mode === 'tinker' ? TINKER_LEVELS : BUILD_LEVELS
  const done = levels.map((l) => l.id === 'pick' || quest.cleared.includes(l.id))
  const slug = game?.id ?? `my-${genre.id}-game`

  // Clearing a level: XP, a little celebration, and on to the next one.
  const clear = (id: string) => {
    if (quest.cleared.includes(id)) return
    const cleared = [...quest.cleared, id]
    setQuest({ cleared })
    const n = levels.findIndex((l) => l.id === id) + 1
    const all = levels.every((l) => l.id === 'pick' || cleared.includes(l.id))
    if (all) {
      notify('🏆 Quest complete! Now go make it')
      if (!prefersReducedMotion()) confetti({ particleCount: 160, spread: 90, origin: { y: 0.3 }, colors: ['#22d3ee', '#f472b6', '#facc15'] })
    } else notify(`⭐ Level ${n} clear! +100 XP`)
    const next = levels[n]
    if (next) scrollTo(next.id)
  }
  const Next = ({ id, label = 'Next level ▶' }: { id: string; label?: string }) => (
    <button type="button" className="btn-dark mt-5 font-pixel" onClick={() => clear(id)}>
      {quest.cleared.includes(id) ? '★ Cleared' : label}
    </button>
  )

  const toggle = (f: string) => set({ features: config.features.includes(f) ? config.features.filter((x) => x !== f) : options.filter((o) => o === f || config.features.includes(o)) })
  const addFeature = () => {
    const f = newFeature.trim()
    if (!f) return
    set({ customFeatures: [...config.customFeatures, f.slice(0, 200)] })
    setNewFeature('')
  }
  const downloadMd = () => {
    downloadFile(prompt, `${mode === 'tinker' ? 'tinker' : 'game'}-${slug}-${config.agent}.md`, 'text/markdown')
    notify('Prompt downloaded')
    clear(mode === 'tinker' ? 'tprompt' : 'prompt')
  }
  const downloadKit = async () => {
    setKitBusy(true)
    try {
      let png: Uint8Array | undefined
      const body = frame.current?.offsetParent ? frame.current.contentDocument?.body : null
      if (body) {
        try {
          const dataUrl = await toPng(body, { pixelRatio: 2 })
          png = Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0))
        } catch {
          // The sketch picture is optional; the HTML version is always included.
        }
      }
      const zip = starterKitZip({
        slug,
        name: config.gameName.trim() || (game ? `${game.name}-style game` : 'My game'),
        prompt,
        agent: config.agent,
        apis,
        wireframeHtml: sketch,
        wireframePng: png,
        heading: game ? `Start here: make your own game inspired by ${game.name}` : 'Start here: make your own game',
        folderPrefix: 'rent-free-game',
        extraFiles: { 'GAME.md': gameDoc(promptInput), 'CREDITS.md': CREDITS_TEMPLATE, 'OPEN-SOURCE-IT.md': OPEN_SOURCE_GUIDE },
      })
      downloadFile(zip, `rent-free-game-${slug}.zip`, 'application/zip')
      notify('🎁 Quest kit downloaded. Unzip it and open the folder in your AI helper')
      clear('prompt')
    } finally {
      setKitBusy(false)
    }
  }

  const promptBox = (
    <>
      <AgentPicker agent={config.agent} onChange={(agent) => set({ agent })} />
      <p className="mt-4 text-sm font-bold">
        Your instructions for the AI <span className="font-normal text-ink-soft">(you don't need to read them, just copy and paste)</span>
      </p>
      <textarea readOnly value={prompt} aria-label="Game prompt" className="field mt-2 h-64 resize-y font-mono text-xs leading-relaxed" data-testid="game-prompt" />
      <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => (e.target as HTMLElement).closest('[data-copy]') && clear(mode === 'tinker' ? 'tprompt' : 'prompt')}>
        <span data-copy>
          <CopyButton text={prompt} label={`Copy ${AGENTS[config.agent].name} prompt`} toast="Prompt copied. Paste it into your AI helper" className="btn-primary" />
        </span>
        <button type="button" className="btn-ghost" onClick={downloadMd}>
          ⬇ Download .md
        </button>
      </div>
    </>
  )

  return (
    <div className="space-y-6" data-testid="game-builder">
      <QuestBar levels={levels.map((l) => l.label)} done={done} onJump={(i) => scrollTo(levels[i].id)} />

      {canTinker && (
        <div className="card p-4" data-testid="mode-switch">
          <p className="label">What do you want to do?</p>
          <Segmented<Mode>
            label="What do you want to do?"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'build', label: '✨ Make my own game' },
              { value: 'tinker', label: '🛠️ Tinker with the released code' },
            ]}
          />
        </div>
      )}

      {level1}

      {mode === 'tinker' && game && drop ? (
        <>
          <LevelCard n={2} title="What do you want to do with it?" id="lvl-goal" testId="level-goal">
            <div className="space-y-4">
              <div>
                <span className="label">Your goal</span>
                <Segmented<TinkerGoal>
                  label="Your goal"
                  value={config.tinkerGoal}
                  onChange={(tinkerGoal) => set({ tinkerGoal })}
                  options={[
                    { value: 'run', label: 'Get it running' },
                    { value: 'mod', label: 'Make a mod' },
                    { value: 'fix', label: 'Fix or improve' },
                    { value: 'port', label: 'New device' },
                  ]}
                />
              </div>
              <div>
                <span className="label">Your computer</span>
                <Segmented<Device>
                  label="Your computer"
                  value={config.device}
                  onChange={(device) => set({ device })}
                  options={[
                    { value: 'windows', label: 'Windows' },
                    { value: 'mac', label: 'Mac' },
                    { value: 'linux', label: 'Linux' },
                    { value: 'steam-deck', label: 'Steam Deck' },
                  ]}
                />
              </div>
              <label className="block">
                <span className="label">Your idea (optional)</span>
                <textarea
                  className="field h-20 resize-y"
                  placeholder="e.g. Add a new unit that heals others. Or: make the screen work in widescreen."
                  value={config.tinkerIdea}
                  onChange={(e) => set({ tinkerIdea: e.target.value.slice(0, 600) })}
                />
              </label>
            </div>
            <Next id="goal" />
          </LevelCard>

          <LevelCard n={3} title="The rules for this code" id="lvl-rules" testId="level-rules">
            <div className="flex flex-wrap gap-2">
              <LicenseBadge drop={drop} />
              <Chip tone={drop.includesArt ? 'good' : 'warn'}>{drop.includesArt ? '🎨 Art included' : '🎨 Art not included'}</Chip>
              <Chip tone={drop.needsYourCopy ? 'warn' : 'good'}>{drop.needsYourCopy ? '💿 Use your own bought copy' : '✅ Nothing to buy'}</Chip>
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              <li>Only use the official code{drop.repoUrl ? ' (linked below)' : ''}, and keep its license file.</li>
              {drop.needsYourCopy && <li>The pictures, music and levels come from your own copy. Never upload or share them.</li>}
              <li>No cracks, no downloads from unofficial sites.</li>
              {drop.licenseKind === 'source-available' && <li>This license has limits (often no selling). Your AI helper will read it with you.</li>}
            </ul>
            {drop.repoUrl && (
              <a href={drop.repoUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-4">
                See the official code ↗
              </a>
            )}
            <Next id="rules" label="I understand ▶" />
          </LevelCard>

          <LevelCard n={4} title="Get your prompt" id="lvl-tprompt" testId="level-tprompt">
            {promptBox}
          </LevelCard>
        </>
      ) : (
        <>
          <LevelCard n={2} title="What do you love about it?" id="lvl-love" testId="level-love">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-ink-soft">Tick the parts that make it fun for you. Fewer ticks = a faster build.</p>
              <button type="button" className="shrink-0 text-xs font-bold text-ink-soft underline" onClick={reset}>
                Reset
              </button>
            </div>
            <p className="mt-3 rounded-xl bg-paper-2 p-3 text-sm">
              <span className="font-bold">The core loop: </span>
              {genre.coreLoop}
            </p>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {options.map((f) => (
                <label key={f} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 text-sm hover:bg-paper-2">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--money)]" checked={config.features.includes(f)} onChange={() => toggle(f)} />
                  <span>{f}</span>
                </label>
              ))}
              {config.customFeatures.map((f, i) => (
                <div key={f + i} className="flex items-start gap-2.5 rounded-lg bg-hilite/25 p-1.5 text-sm">
                  <span aria-hidden>✨</span>
                  <span className="flex-1">{f}</span>
                  <button type="button" aria-label={`Remove ${f}`} className="text-ink-soft hover:text-rent" onClick={() => set({ customFeatures: config.customFeatures.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="field"
                placeholder="Something else you love…"
                aria-label="Add your own feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <button type="button" className="btn-ghost px-3" onClick={addFeature}>
                Add
              </button>
            </div>
            <label className="mt-4 block">
              <span className="label">My twist: what makes it yours? (optional)</span>
              <textarea
                className="field h-20 resize-y"
                placeholder="e.g. You're a cat running a bakery. Or: it all happens on the moon."
                value={config.twist}
                onChange={(e) => set({ twist: e.target.value.slice(0, 600) })}
                aria-label="My twist"
              />
            </label>
            <label className="mt-3 block">
              <span className="label">Game name (optional)</span>
              <input className="field" placeholder="Leave blank and the AI will suggest original names" value={config.gameName} onChange={(e) => set({ gameName: e.target.value.slice(0, 40) })} />
            </label>
            <Next id="love" />
          </LevelCard>

          <LevelCard n={3} title="How should it play?" id="lvl-play" testId="level-play">
            <div className="space-y-4">
              <div>
                <span className="label">Who plays?</span>
                <Segmented<Players>
                  label="Who plays?"
                  value={config.players}
                  onChange={(players) => set({ players })}
                  options={[
                    { value: 'solo', label: 'One player' },
                    { value: 'couch', label: 'Same screen' },
                    { value: 'online', label: 'Online' },
                  ]}
                />
              </div>
              <div>
                <span className="label">Where does it run?</span>
                <Segmented<GamePlatform>
                  label="Where does it run?"
                  value={config.platform}
                  onChange={(platform) => set({ platform })}
                  options={[
                    { value: 'browser', label: 'Web browser' },
                    { value: 'desktop', label: 'Computer app' },
                    { value: 'phone', label: 'Phone' },
                  ]}
                />
              </div>
              <div>
                <span className="label">Art</span>
                <Segmented<ArtPlan>
                  label="Art"
                  value={config.art}
                  onChange={(art) => set({ art })}
                  options={[
                    { value: 'shapes', label: 'Simple shapes' },
                    { value: 'free-pack', label: 'Free art packs' },
                    { value: 'my-art', label: 'My own art' },
                  ]}
                />
              </div>
              <label className="block">
                <span className="label">Look & feel (optional)</span>
                <input className="field" placeholder="e.g. cozy pixel art, bright and silly, spooky" value={config.style} onChange={(e) => set({ style: e.target.value.slice(0, 120) })} />
              </label>
            </div>
            <div className="mt-5" data-testid="game-blocks">
              <p className="font-bold">🧱 Tools and free building blocks</p>
              <p className="text-sm text-ink-soft">We picked these for your game. They're free to start.</p>
              <BlockList
                suggestions={suggestions}
                chosen={apis}
                extra={config.apiExtra}
                pool={GAME_POOL}
                onToggle={(id, suggested) => set(toggleBlock(id, suggested, apis, config.apiOff, config.apiExtra))}
              />
            </div>
            <Next id="play" />
          </LevelCard>

          <LevelCard n={4} title="Boss check: how big is this job?" id="lvl-boss" testId="level-boss">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-extrabold" data-testid="game-tier">
                  {view.emoji} {view.label}, {view.likeA}
                </p>
                <p className="text-sm text-ink-soft">
                  Time: {tier.effort}. {tier.summary}
                </p>
              </div>
              <div className="flex gap-1" aria-hidden>
                {TIER_ORDER.map((t, i) => (
                  <span key={t} className={`h-8 w-3 rounded-full border-2 border-ink ${i <= TIER_ORDER.indexOf(tier.id) ? (tier.id === 'platform' ? 'bg-rent' : tier.id === 'big' ? 'bg-hilite' : 'bg-money') : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            {hard.length > 0 && (
              <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-ink-soft">Harder parts:</span>
                {hard.map((h) => (
                  <Chip key={h}>{h}</Chip>
                ))}
              </p>
            )}
            {game?.scopeNote && <p className="mt-3 rounded-xl border-2 border-hilite bg-hilite/15 p-3 text-sm">⚠️ {game.scopeNote}</p>}
            {(tier.id === 'big' || tier.id === 'platform') && (
              <div className="mt-3 rounded-xl bg-paper-2 p-3 text-sm">
                <p className="font-bold">Want a smaller boss? Try one of these:</p>
                <ul className="mt-1 list-disc pl-5">
                  {config.players === 'online' && <li>Make it one player first. Online play is the hardest part.</li>}
                  {hard.includes('3D graphics') && <li>Try 2D first. It's much faster to build.</li>}
                  {features.length > 5 && <li>Untick a few features. Add them later as "version 2".</li>}
                  <li>Build one level, track or area that is really fun. Grow it later.</li>
                </ul>
              </div>
            )}
            <Next id="boss" label="I'm ready! ▶" />
          </LevelCard>

          <LevelCard n={5} title="Get your prompt and quest kit" id="lvl-prompt" testId="level-prompt">
            {promptBox}
            <div className="mt-5 rounded-xl border-2 border-ink bg-paper-2 p-4">
              <p className="font-display text-lg font-extrabold">🎁 Easiest way: download the quest kit</p>
              <p className="mt-1 text-sm text-ink-soft">
                One folder with the instructions, your game plan (GAME.md), a screen sketch, a credits list and the open-source checklist. Unzip it, open the folder in {AGENTS[config.agent].name}, and say{' '}
                <em>"Read START-HERE.md and PROMPT.md, then let's build it."</em>
              </p>
              <button type="button" className="btn-dark mt-3" onClick={downloadKit} disabled={kitBusy}>
                {kitBusy ? 'Packing…' : '⬇ Download quest kit (.zip)'}
              </button>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold">See the screen sketch</summary>
              <iframe ref={frame} title="Game screen sketch" srcDoc={sketch} sandbox="allow-same-origin" className="mt-3 h-96 w-full rounded-xl border-2 border-line bg-[#18181b]" />
            </details>
          </LevelCard>

          <LevelCard n={6} title="Share it as open source" id="lvl-share" testId="level-share">
            <p className="text-sm text-ink-soft">Open source means anyone can play it, learn from your code and help make it better. Your AI helper does the hard parts. You pick the rules.</p>
            <div className="mt-4">
              <span className="label">License for your code (your prompt updates)</span>
              <Segmented<CodeLicense>
                label="License for your code"
                value={config.codeLicense}
                onChange={(codeLicense) => set({ codeLicense })}
                options={[
                  { value: 'mit', label: 'MIT: simplest' },
                  { value: 'gpl', label: 'GPL: changes stay open' },
                ]}
              />
            </div>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['📄', 'LICENSE', 'The rules for your code. Your AI helper adds it.'],
                ['🎨', 'CREDITS.md', 'Where every picture and sound came from.'],
                ['🐙', 'GitHub', 'A free home for your code, so others can see and help.'],
                ['🕹️', 'itch.io or GitHub Pages', 'Free places where people can play your game.'],
              ].map(([e, t, d]) => (
                <li key={t} className="rounded-xl bg-paper-2 p-3 text-sm">
                  <span className="font-bold">
                    {e} {t}
                  </span>
                  <span className="block text-ink-soft">{d}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={() => downloadFile(OPEN_SOURCE_GUIDE, 'OPEN-SOURCE-IT.md', 'text/markdown')}>
                ⬇ Download the checklist
              </button>
              <Next id="share" label="✓ I'll share it! Finish quest" />
            </div>
          </LevelCard>
          <FunNotStuff legalNote={game?.legalNote} />
        </>
      )}
    </div>
  )
}
