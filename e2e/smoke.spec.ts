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
  await expect(page.getByTestId('tier')).toHaveText(/Big build|Platform-sized/)
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
  await page.getByTestId(/swap-custom-/).getByRole('link', { name: '✨ Remake with AI' }).click()
  await expect(page.getByRole('heading', { name: /Remake Kajabi/ })).toBeVisible()
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/Hosts my online course and community/)
})

test('tool page: switch tab, remake tab and wireframe', async ({ page }) => {
  await page.goto('/#/tool/calendly')
  await expect(page.getByTestId('alt-calcom')).toContainText('Pick for me')
  await page.getByRole('tab', { name: '✨ Remake with AI' }).click()
  await expect(page.getByTestId('agent-prompt')).toHaveValue(/Do not copy any existing product/)
  await page.getByText('4. Attach a wireframe (optional)').click()
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
  await expect(card).toContainText(/ollama run (qwen3:8b|gemma3:12b|qwen3:14b|llama3\.1:8b)/)
  await page.getByLabel('Upgrade cost').fill('1200')
  await expect(page.getByTestId('break-even')).toContainText('5.0 years')
})

test('no horizontal scroll on any page', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('stack-creator').click()
  for (const path of ['/', '/#/start', '/#/results', '/#/tool/descript', '/#/tool/netflix?tab=remake', '/#/remake', '/#/remake/netflix', '/#/local-ai', '/#/contribute', '/#/about']) {
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
