import { expect, test } from '@playwright/test'

test('pick Calendly + Descript + ChatGPT and see savings', async ({ page }) => {
  await page.goto('/#/start')
  for (const name of ['Calendly', 'Descript', 'ChatGPT']) await page.getByLabel(`I pay for ${name}`).check()
  await page.getByRole('link', { name: 'See my savings →' }).click()

  // Default plans, monthly billing: Calendly Standard $144 + Descript Creator $420 + ChatGPT Plus $240 = $804/yr.
  await expect(page.getByTestId('stat-rose')).toContainText('$804')
  // All three default alternatives are $0 desktop/free-tier apps, so nothing is self-hosted.
  await expect(page.getByTestId('stat-emerald')).toContainText('$804')
  for (const id of ['calendly', 'descript', 'chatgpt']) await expect(page.getByTestId(`swap-${id}`)).toBeVisible()
  await expect(page.getByTestId('swap-calendly')).toContainText('Cal.com')

  // Switching to a self-hosted option adds the shared server once.
  await page.getByTestId('swap-calendly').getByRole('combobox').selectOption('easyappointments')
  await expect(page.getByText('Shared server')).toBeVisible()
  await expect(page.getByTestId('stat-emerald')).toContainText('$732')

  // Keep paying → no savings counted for that line.
  await page.getByTestId('swap-descript').getByRole('combobox').selectOption('')
  await expect(page.getByTestId('stat-emerald')).toContainText('$312')

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '⬇ Download image' }).click()
  expect((await download).suggestedFilename()).toBe('rent-free-receipt.png')
})

test('share link restores the selection', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#/start')
  await page.getByLabel('I pay for Notion').check()
  await page.goto('/#/results')
  await page.getByRole('button', { name: '🔗 Copy share link' }).click()
  const url = await page.evaluate(() => navigator.clipboard.readText())
  expect(url).toContain('#/results?s=')

  const fresh = await context.browser()!.newPage()
  await fresh.goto(url)
  await expect(fresh.getByText("You're viewing a shared result")).toBeVisible()
  await expect(fresh.getByTestId('swap-notion')).toBeVisible()
})

test('custom subscription gets a build kit', async ({ page }) => {
  await page.goto('/#/start')
  const form = page.getByRole('form', { name: 'Add a custom subscription' })
  await form.getByLabel('Name').fill('Kajabi')
  await form.getByLabel('Price').fill('149')
  await form.getByRole('button', { name: '+ Add' }).click()
  await expect(page.getByText('Kajabi (custom)')).toBeVisible()
  await page.getByRole('link', { name: 'See my savings →' }).click()
  await page.getByRole('link', { name: '🛠 Build my own' }).click()
  await expect(page.getByRole('heading', { name: /Build your own Kajabi replacement/ })).toBeVisible()
  await expect(page.getByLabel('Build prompt')).toHaveValue(/Kajabi/)
})

test('tool page shows alternatives and build kit', async ({ page }) => {
  await page.goto('/#/tool/calendly')
  await expect(page.getByTestId('alt-calcom')).toContainText('Pick for me')
  await expect(page.getByLabel('Build prompt')).toHaveValue(/Do not copy any existing product/)
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
  for (const path of ['/', '/#/start', '/#/results', '/#/tool/descript', '/#/local-ai', '/#/contribute', '/#/build?name=X&category=forms']) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})
