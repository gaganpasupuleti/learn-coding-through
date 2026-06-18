/**
 * Browser smoke tests for current practice pages (/practice/code, /practice/sql, /practice/typing).
 *
 * Prerequisites: dev servers up (frontend :5000). Uses demo login defaults.
 *
 * Run (from repo root):
 *   npm run qa:practice-smoke
 */
import { chromium } from 'playwright'

import {
  openCodePracticeFromPracticeMenu,
  openSqlPracticeFromPracticeMenu,
  openTypingPracticeFromPracticeMenu,
  waitForStudentShell,
} from './smoke-nav-helpers.mjs'

const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://127.0.0.1:5000'
const NAV_TIMEOUT_MS = Number(process.env.SMOKE_NAV_TIMEOUT_MS ?? 120000)
const DEMO_EMAIL = process.env.SMOKE_DEMO_EMAIL ?? 'demo@student.com'
const DEMO_PASSWORD = process.env.SMOKE_DEMO_PASSWORD ?? 'DemoStudent@123'
const results = []

function addResult(name, status, detail) {
  results.push({ name, status, detail })
}

async function runCheck(name, fn) {
  try {
    const detail = await fn()
    addResult(name, 'pass', detail)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    addResult(name, 'fail', detail)
  }
}

async function loginAsDemoStudent(page) {
  await page.goto(WEB_BASE, { waitUntil: 'commit', timeout: NAV_TIMEOUT_MS })
  await page.getByRole('heading', { name: 'Sign in' }).waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS })
  await page.locator('#email').fill(DEMO_EMAIL)
  await page.locator('#password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  const shell = await waitForStudentShell(page, NAV_TIMEOUT_MS)
  return shell
}

async function assertNoCrashUi(page) {
  const body = await page.locator('body').innerText()
  if (/Something went wrong|Application error/i.test(body)) {
    throw new Error('Crash UI visible on page')
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  try {
    await runCheck('01_demo_login', async () => {
      const shell = await loginAsDemoStudent(page)
      return `student shell loaded (${shell})`
    })

    await runCheck('02_open_code_workbench', async () => {
      const nav = await openCodePracticeFromPracticeMenu(page, NAV_TIMEOUT_MS)
      await assertNoCrashUi(page)
      return nav
    })

    await runCheck('03_code_workbench_surface', async () => {
      await page.getByText('Code Workbench', { exact: false }).first().waitFor({ state: 'visible', timeout: 60000 })
      await page.locator('.monaco-editor').first().waitFor({ state: 'visible', timeout: 60000 })
      await page.getByRole('button', { name: 'Run', exact: true }).waitFor({ state: 'visible', timeout: 60000 })
      return 'editor + Run button visible'
    })

    await runCheck('04_open_sql_practice', async () => {
      const nav = await openSqlPracticeFromPracticeMenu(page, NAV_TIMEOUT_MS)
      await assertNoCrashUi(page)
      return nav
    })

    await runCheck('05_sql_practice_surface', async () => {
      await page.getByText('SQL Practice Ground', { exact: false }).first().waitFor({ state: 'visible', timeout: 60000 })
      await page.locator('.monaco-editor').first().waitFor({ state: 'visible', timeout: 60000 })
      await page.getByRole('button', { name: 'Run', exact: true }).waitFor({ state: 'visible', timeout: 60000 })
      await page.getByRole('button', { name: 'Check Answer' }).waitFor({ state: 'visible', timeout: 60000 })
      return 'question area + Run + Check Answer visible'
    })

    await runCheck('06_open_typing_practice', async () => {
      const nav = await openTypingPracticeFromPracticeMenu(page, NAV_TIMEOUT_MS)
      await assertNoCrashUi(page)
      return nav
    })

    await runCheck('07_typing_practice_surface', async () => {
      await page.getByRole('heading', { name: 'Typing Practice' }).waitFor({ state: 'visible', timeout: 60000 })
      await page.getByRole('button', { name: 'Start', exact: true }).waitFor({ state: 'visible', timeout: 60000 })
      await page.locator('textarea').first().waitFor({ state: 'visible', timeout: 60000 })
      return 'Start button + typing input visible'
    })

    await runCheck('08_direct_routes_load', async () => {
      for (const path of ['/practice/code', '/practice/sql', '/practice/typing']) {
        await page.goto(`${WEB_BASE}${path}`, { waitUntil: 'commit', timeout: NAV_TIMEOUT_MS })
        await page.waitForTimeout(800)
        await assertNoCrashUi(page)
        const main = await page.locator('main, body').first().innerText()
        if (main.length < 40) throw new Error(`${path} rendered too little content`)
      }
      return 'direct routes render without crash'
    })

    await runCheck('09_no_console_errors', async () => {
      const ignored = [
        'favicon',
        'DevTools',
        'GSI_LOGGER',
        'google',
        '401',
        '403',
        '429',
        'Failed to fetch KV key',
        'Failed to set key',
        'rate limit',
        'too many requests',
      ]
      const critical = consoleErrors.filter((line) => !ignored.some((token) => line.includes(token)))
      if (critical.length > 0) throw new Error(critical.join(' | '))
      return 'no critical console errors'
    })
  } finally {
    await browser.close()
  }

  const failCount = results.filter((r) => r.status === 'fail').length
  console.log('\nPractice Pages Smoke Summary')
  console.log('----------------------------')
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name} — ${result.detail}`)
  }
  console.log(`\nTotal: ${results.length}  Failed: ${failCount}`)
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Practice pages smoke runner failed:', error)
  process.exit(1)
})
