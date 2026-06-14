/** Shared Playwright nav helpers — tolerate Code Workbench vs legacy Code Practice Ground labels. */

export const CODE_PRACTICE_NAV_LABELS = ['Code Workbench', 'Code Practice Ground']

export async function clickCodePracticeMenuItem(page) {
  for (const label of CODE_PRACTICE_NAV_LABELS) {
    const item = page.getByRole('menuitem', { name: label })
    if ((await item.count()) > 0) {
      await item.click()
      return label
    }
  }
  throw new Error(`Code practice menu item not found (${CODE_PRACTICE_NAV_LABELS.join(' or ')})`)
}

export async function waitForCodePracticePage(page, timeoutMs = 120000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    for (const label of CODE_PRACTICE_NAV_LABELS) {
      const heading = page.getByRole('heading', { name: label })
      if (await heading.isVisible().catch(() => false)) {
        return `heading:${label}`
      }
    }
    if (await page.getByText('Code Workbench', { exact: false }).first().isVisible().catch(() => false)) {
      return 'text:Code Workbench'
    }
    if (await page.locator('.monaco-editor').first().isVisible().catch(() => false)) {
      return 'monaco-editor'
    }
    await page.waitForTimeout(250)
  }
  throw new Error(`Code practice page not ready (${CODE_PRACTICE_NAV_LABELS.join(' or ')})`)
}

export async function openCodePracticeFromLearningMenu(page, timeoutMs = 120000) {
  await page.getByRole('button', { name: 'Learning menu' }).click()
  const label = await clickCodePracticeMenuItem(page)
  const ready = await waitForCodePracticePage(page, timeoutMs)
  return `${label} → ${ready}`
}
