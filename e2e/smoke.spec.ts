import { expect, test, type Page } from '@playwright/test'

// Tap a tool tile in the picker (search first, since only the top 20 show under "Popular").
async function pick(page: Page, name: string) {
  const search = page.getByLabel('Search tools')
  await search.fill(name)
  await page.getByLabel(`I pay for ${name}`).check()
  await search.fill('')
}
const seeSavings = (page: Page) => page.getByRole('link', { name: 'See what I could keep →' }).click()

test('pick Calendly + Descript + ChatGPT and see savings', async ({ page }) => {
  await page.goto('/#/start')
  for (const name of ['Calendly', 'Descript', 'ChatGPT']) await pick(page, name)
  await seeSavings(page)

  // Default plans, monthly billing: Calendly Standard $144 + Descript Creator $420 + ChatGPT Plus $240 = $804/yr.
  await expect(page.getByTestId('stat-pay')).toContainText('$804')
  // All three default alternatives are $0 desktop/free-tier apps, so nothing is self-hosted.
  await expect(page.getByTestId('stat-keep')).toContainText('$804')
  for (const id of ['calendly', 'descript', 'chatgpt']) await expect(page.getByTestId(`swap-${id}`)).toBeVisible()
  await expect(page.getByTestId('swap-calendly')).toContainText('Cal.com')

  // Switching to a self-hosted option adds the shared server once.
  await page.getByTestId('swap-calendly').getByRole('combobox').selectOption('easyappointments')
  await expect(page.getByText('Shared server')).toBeVisible()
  await expect(page.getByTestId('stat-keep')).toContainText('$732')

  // Keep paying → no savings counted for that line.
  await page.getByTestId('swap-descript').getByRole('combobox').selectOption('')
  await expect(page.getByTestId('stat-keep')).toContainText('$312')

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '⬇ Download image' }).click()
  expect((await download).suggestedFilename()).toBe('rent-free-receipt.png')
})

test('starter stack loads a typical household and rotating streaming counts honestly', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('stack-household').click()
  await expect(page).toHaveURL(/#\/results/)
  for (const id of ['netflix', 'spotify', 'amazon-prime', 'disney-plus', 'icloud', 'chatgpt']) await expect(page.getByTestId(`swap-${id}`)).toBeVisible()
  // Netflix Standard $239.88/yr, rotated 3 months a year → keep 75% = $180.
  await expect(page.getByTestId('swap-netflix')).toContainText('$180')
})

test('share link restores the selection', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#/start')
  await pick(page, 'Notion')
  await page.goto('/#/results')
  await page.getByRole('button', { name: '🔗 Copy share link' }).click()
  const url = await page.evaluate(() => navigator.clipboard.readText())
  expect(url).toContain('#/results?s=')

  const fresh = await context.browser()!.newPage()
  await fresh.goto(url)
  await expect(fresh.getByText("You're viewing a shared result")).toBeVisible()
  await expect(fresh.getByTestId('swap-notion')).toBeVisible()
})

test('remake studio: customize features and pick a coding agent', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#/remake/notion')
  const prompt = page.getByTestId('agent-prompt')
  const first = 'Pages with rich text, headings, checklists and embeds'
  await expect(prompt).toHaveValue(new RegExp(first))
  await page.getByLabel(first).uncheck()
  await expect(prompt).not.toHaveValue(new RegExp(first))

  await page.getByLabel('Add your own feature').fill('Kanban board for video ideas')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(prompt).toHaveValue(/Kanban board for video ideas/)

  await expect(prompt).toHaveValue(/CLAUDE\.md/)
  await page.getByRole('tab', { name: 'Codex' }).click()
  await expect(prompt).toHaveValue(/AGENTS\.md/)
  await page.getByRole('button', { name: 'Copy Codex prompt' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Kanban board for video ideas')

  // Big products get a bigger plan.
  await page.goto('/#/remake/netflix')
  await expect(page.getByTestId('tier')).toHaveText(/Big build|Huge build/)
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/SPEC\.md/)
})

test('custom subscription with a description gets its own remake prompt', async ({ page }) => {
  await page.goto('/#/start')
  await page.getByText('+ Add something not listed').click()
  const form = page.getByRole('form', { name: 'Add a custom subscription' })
  await form.getByLabel('Name').fill('Kajabi')
  await form.getByLabel('Price').fill('149')
  await form.getByLabel('What does it do? (optional)').fill('Hosts my online course and community')
  await form.getByRole('button', { name: '+ Add to receipt' }).click()
  await seeSavings(page)
  await page.getByTestId(/swap-custom-/).getByRole('link', { name: '✨ Build your own' }).click()
  await expect(page.getByRole('heading', { name: /Build your own Kajabi/ })).toBeVisible()
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/Hosts my online course and community/)
})

test('tool page: switch tab, remake tab and wireframe', async ({ page }) => {
  await page.goto('/#/tool/calendly')
  await expect(page.getByTestId('alt-calcom')).toContainText('Pick for me')
  await page.getByRole('tab', { name: '✨ Build your own' }).click()
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/Do not copy any existing product/)
  await page.getByText('5. Add a sketch of the screen (optional)').click()
  const frame = page.frameLocator('iframe[title="Wireframe preview"]')
  await expect(frame.getByText('Select a date')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '⬇ Download PNG' }).click()
  expect((await download).suggestedFilename()).toBe('wireframe.png')
})

test('local AI advisor: 16 GB Mac', async ({ page }) => {
  await page.goto('/#/local-ai')
  await page.getByLabel('RAM in GB').selectOption('16')
  const card = page.getByTestId('model-card').first()
  await expect(card).toContainText(/Search for "(Qwen3 8B|Gemma 3 12B|Qwen3 14B|Llama 3\.1 8B)"/)
  await page.getByLabel('Upgrade cost').fill('1200')
  await expect(page.getByTestId('break-even')).toContainText('5.0 years')
})

test('no horizontal scroll on any page', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('stack-creator').click()
  for (const path of ['/', '/#/start', '/#/results', '/#/tool/descript', '/#/tool/netflix?tab=remake', '/#/remake', '/#/remake/netflix', '/#/local-ai', '/#/contribute', '/#/about', '/#/plan', '/#/toolbox', '/#/ai-helpers', '/#/games', '/#/games/drops', '/#/games/stardew-valley', '/#/games/build/stardew-valley', '/#/games/build/command-and-conquer?mode=tinker', '/#/games/build']) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('legal: disclaimer, license notes, and no third-party requests', async ({ page }) => {
  const thirdParty: string[] = []
  page.on('request', (r) => {
    const host = new URL(r.url()).hostname
    if (host !== 'localhost' && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) thirdParty.push(r.url())
  })
  await page.goto('/')
  await expect(page.getByTestId('disclaimer')).toContainText('not affiliated')
  await page.goto('/#/tool/zapier')
  await expect(page.getByTestId('before-cancel')).toContainText('Export your data')
  await expect(page.getByTestId('alt-n8n').getByTestId('commercial-note')).toContainText('hosted service')
  await page.goto('/#/tool/netflix?tab=remake')
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/content I own or have the rights to/)
  await page.goto('/#/local-ai')
  await expect(page.getByText('Apache-2.0').first()).toBeVisible()
  await page.goto('/#/about')
  await expect(page.getByRole('heading', { name: 'Independent, not affiliated' })).toBeVisible()
  expect(thirdParty).toEqual([])
})

test('honest verdicts: how hard is it to replace, and is it worth it?', async ({ page }) => {
  // iCloud 200 GB: the best swap is a "maybe"; the big photo server (Immich) isn't worth a weekend for $36/yr.
  await page.goto('/#/tool/icloud')
  await expect(page.getByTestId('replace-meter')).toContainText('Takes an afternoon')
  await expect(page.getByTestId('replace-meter').getByTestId('verdict')).toContainText('Maybe')
  await page.getByRole('button', { name: '+ I pay for iCloud+' }).click()
  await page.goto('/#/results')
  await page.getByTestId('swap-icloud').getByRole('combobox').selectOption('immich')
  await expect(page.getByTestId('swap-icloud').getByTestId('verdict')).toContainText('Probably keep paying')
  await page.getByTestId('swap-icloud').getByRole('combobox').selectOption('')
  await expect(page.getByTestId('swap-icloud').getByTestId('verdict')).toContainText('Keeping it')
  // Netflix: rotating is easy → do it.
  await page.goto('/#/tool/netflix')
  await expect(page.getByTestId('replace-meter').getByTestId('verdict')).toContainText('Do it')
  // Tap a tech word to see what it means.
  await page.goto('/#/tool/zapier')
  await page.getByRole('button', { name: 'self-host', exact: false }).first().click()
  await expect(page.getByRole('tooltip')).toContainText('You run the app on a computer you control')
})

test('home quick-add: type, tap, see savings', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('What do you pay for?').fill('netf')
  await page.getByRole('button', { name: 'Add Netflix' }).click()
  await expect(page.getByTestId('quick-add')).toContainText('1 on your receipt')
  await page.getByTestId('quick-add').getByRole('link', { name: 'See what I could keep →' }).click()
  await expect(page.getByTestId('swap-netflix')).toBeVisible()
})

test('switch plan: tick a swap and watch savings grow; get calendar reminders', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('stack-household').click()
  await page.getByTestId('make-plan').click()
  await expect(page).toHaveURL(/#\/plan/)
  await expect(page.getByTestId('saved-so-far')).toContainText('$0')
  await page.getByLabel('Done: Netflix').check()
  await expect(page.getByTestId('saved-so-far')).toContainText('$180')
  await expect(page.getByTestId('plan-progress')).toContainText('1 of')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '📅 Add reminders to my calendar' }).click()
  expect((await download).suggestedFilename()).toBe('rent-free-reminders.ics')
})

test('build your own: building blocks, beginner guide and starter kit', async ({ page }) => {
  await page.goto('/#/remake/calendly')
  const blocks = page.getByTestId('building-blocks')
  await expect(blocks).toContainText('Resend')
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/## Services to use/)
  await blocks.getByLabel('Use Resend').uncheck()
  await expect(page.getByTestId('agent-prompt')).not.toHaveValue(/Resend/)
  await expect(page.getByTestId('ai-helpers-banner')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '⬇ Download starter kit (.zip)' }).click()
  expect((await download).suggestedFilename()).toBe('rent-free-starter-calendly.zip')
})

test('toolbox and beginner guide pages', async ({ page }) => {
  await page.goto('/#/toolbox')
  await expect(page.getByTestId('api-resend')).toContainText('3,000 emails a month')
  await page.getByRole('tab', { name: '💚 Free forever' }).click()
  await expect(page.getByTestId('api-lm-studio-server')).toBeVisible()
  await expect(page.getByTestId('api-stripe')).toHaveCount(0)
  await page.goto('/#/ai-helpers')
  await expect(page.getByRole('heading', { name: /Meet your AI builder/ })).toBeVisible()
  await expect(page.getByTestId('decide')).toContainText('Codex')
  await expect(page.getByTestId('first-30')).toContainText('localhost')
})

test('game mode: arcade skin, search a game, build it, download the quest kit', async ({ page }, info) => {
  await page.goto('/#/games')
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'game')
  await expect(page.getByTestId('game-mode-badge')).toBeVisible()
  if (info.project.name === 'phone') await expect(page.getByTestId('game-tab-bar')).toBeVisible()
  await page.getByLabel('What game do you love?').fill('Stardew')
  await page.getByRole('link', { name: /Stardew Valley/ }).first().click()
  await expect(page).toHaveURL(/#\/games\/stardew-valley$/)
  await expect(page.getByTestId('open-meter')).toContainText('Still closed')
  await expect(page.getByTestId('fun-not-stuff')).toBeVisible()
  await page.getByTestId('make-your-own').getByRole('link', { name: /PRESS START/ }).click()

  await expect(page.getByTestId('quest-bar')).toContainText('LEVEL 2/6')
  await page.getByTestId('level-love').getByRole('button', { name: /Next level/ }).click()
  await expect(page.getByTestId('quest-bar')).toContainText('XP 200/600')
  await page.getByLabel('My twist').fill('You are a cat running a bakery.')
  await expect(page.getByTestId('game-prompt')).toHaveValue(/cat running a bakery/)
  await expect(page.getByTestId('game-prompt')).toHaveValue(/Copy the fun, not the stuff/)
  await expect(page.getByTestId('game-blocks').getByLabel('Use Phaser')).toBeChecked()

  // Going online makes the job bigger and adds an online database.
  await page.getByTestId('level-play').getByRole('radio', { name: 'Online' }).click()
  await expect(page.getByTestId('game-blocks').getByLabel('Use Supabase')).toBeChecked()
  await expect(page.getByTestId('game-tier')).toContainText(/Big game|Epic/)

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /Download quest kit/ }).click()
  expect((await download).suggestedFilename()).toBe('rent-free-game-stardew-valley.zip')

  // Leaving Game mode puts the normal look back.
  await page.goto('/#/')
  await expect(page.locator('html')).not.toHaveAttribute('data-mode', 'game')
})

test('game mode: source drops explain why, and released code can be tinkered with', async ({ page }) => {
  await page.goto('/#/games/drops')
  const cnc = page.getByTestId('drop-command-and-conquer')
  await expect(cnc).toContainText('GPL-3.0')
  await expect(cnc.getByTestId('license-badge')).toContainText('Truly open')
  await expect(cnc).toContainText('You need your own copy')
  await expect(page.getByTestId('why')).toContainText('Games die when servers turn off')
  await expect(page.getByTestId('games-faq')).toContainText("Can I just ask an AI to copy a game's code?")

  await cnc.getByRole('link', { name: /Tinker with the code/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tinker with')
  await expect(page.getByTestId('level-rules')).toBeVisible()
  await page.getByTestId('level-goal').getByRole('radio', { name: 'Make a mod' }).click()
  await expect(page.getByTestId('game-prompt')).toHaveValue(/Make a mod for Command & Conquer/)
  await expect(page.getByTestId('game-prompt')).toHaveValue(/github\.com\/electronicarts/)
  await expect(page.getByTestId('game-prompt')).toHaveValue(/Never add the game's files to git/)
})

test('game mode: my own idea from any genre', async ({ page }) => {
  await page.goto('/#/games/build?inspired=Wordle')
  await expect(page.getByLabel('A game that inspires you')).toHaveValue('Wordle')
  await page.getByRole('radio', { name: /Puzzle game/ }).click()
  await expect(page.getByTestId('game-tier')).toContainText('Mini-game')
  await expect(page.getByTestId('game-prompt')).toHaveValue(/^# Make my own open-source puzzle game\n/)
})
