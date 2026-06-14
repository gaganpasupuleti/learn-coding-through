/** Shared Playwright nav helpers for grouped student navigation (Learn / Practice / Jobs / Career). */

export const CODE_PRACTICE_NAV_LABELS = ['Code Workbench', 'Code Practice Ground']

/** aria-label values on StudentShell dropdown triggers (see StudentShell.tsx). */
export const STUDENT_MENU_BUTTONS = {
  learn: ['Learn menu', 'Learning menu'],
  practice: ['Practice menu', 'Learning menu'],
  career: ['Career menu'],
}

export const TOP_LEVEL_NAV_BUTTONS = {
  dashboard: ['Dashboard'],
  jobs: ['Jobs', 'Job Board'],
}

async function clickFirstVisibleButton(page, labels) {
  for (const label of labels) {
    const button = page.getByRole('button', { name: label })
    if ((await button.count()) > 0 && (await button.first().isVisible().catch(() => false))) {
      await button.first().click()
      return label
    }
  }
  throw new Error(`Navigation button not found (tried: ${labels.join(', ')})`)
}

export async function openStudentMenu(page, menuKey) {
  const labels = STUDENT_MENU_BUTTONS[menuKey]
  if (!labels) {
    throw new Error(`Unknown student menu key "${menuKey}" (expected learn, practice, or career)`)
  }
  return clickFirstVisibleButton(page, labels)
}

export async function clickTopLevelNav(page, navKey) {
  const labels = TOP_LEVEL_NAV_BUTTONS[navKey]
  if (!labels) {
    throw new Error(`Unknown top-level nav key "${navKey}" (expected dashboard or jobs)`)
  }
  return clickFirstVisibleButton(page, labels)
}

export async function clickStudentMenuItem(page, itemLabels) {
  const labels = Array.isArray(itemLabels) ? itemLabels : [itemLabels]
  for (const label of labels) {
    const item = page.getByRole('menuitem', { name: label })
    if ((await item.count()) > 0) {
      await item.first().click()
      return label
    }
  }
  throw new Error(`Menu item not found (tried: ${labels.join(', ')})`)
}

export async function waitForStudentShell(page, timeoutMs = 120000) {
  const markers = [
    ...STUDENT_MENU_BUTTONS.learn,
    ...STUDENT_MENU_BUTTONS.practice,
    ...TOP_LEVEL_NAV_BUTTONS.dashboard,
  ]
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    for (const label of markers) {
      if (await page.getByRole('button', { name: label }).isVisible().catch(() => false)) {
        return label
      }
    }
    await page.waitForTimeout(250)
  }
  throw new Error(`Student shell not ready (expected one of: ${markers.join(', ')})`)
}

export async function clickCodePracticeMenuItem(page) {
  return clickStudentMenuItem(page, CODE_PRACTICE_NAV_LABELS)
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

export async function openCodePracticeFromPracticeMenu(page, timeoutMs = 120000) {
  const menu = await openStudentMenu(page, 'practice')
  const label = await clickCodePracticeMenuItem(page)
  const ready = await waitForCodePracticePage(page, timeoutMs)
  return `${menu} → ${label} → ${ready}`
}

/** @deprecated Use openCodePracticeFromPracticeMenu — kept for older script imports. */
export async function openCodePracticeFromLearningMenu(page, timeoutMs = 120000) {
  return openCodePracticeFromPracticeMenu(page, timeoutMs)
}

export async function openQuizFromPracticeMenu(page) {
  const menu = await openStudentMenu(page, 'practice')
  const item = await clickStudentMenuItem(page, 'Quiz')
  return `${menu} → ${item}`
}

export async function openFlowPathFromPracticeMenu(page) {
  const menu = await openStudentMenu(page, 'practice')
  const item = await clickStudentMenuItem(page, 'Flow Path')
  return `${menu} → ${item}`
}

export async function openProjectsFromLearnMenu(page) {
  const menu = await openStudentMenu(page, 'learn')
  const item = await clickStudentMenuItem(page, 'Projects')
  return `${menu} → ${item}`
}
