import { chromium } from 'playwright'

import { openCodePracticeFromLearningMenu } from './smoke-nav-helpers.mjs'

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
  await page.getByRole('button', { name: 'Learning menu' }).waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS })
}

async function openPracticeGround(page) {
  return openCodePracticeFromLearningMenu(page, NAV_TIMEOUT_MS)
}

async function selectSection(page, sectionId) {
  await page.getByTestId(`practice-section-${sectionId}`).click()
}

async function clearEditor(page) {
  const monaco = page.locator('.monaco-editor').first()
  await monaco.waitFor({ state: 'visible', timeout: 60000 })
  await monaco.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
}

async function runCode(page, code, { waitMs = 60000 } = {}) {
  await page.getByRole('button', { name: 'Run Code' }).waitFor({ state: 'visible', timeout: 60000 })
  await clearEditor(page)
  if (code) {
    await page.keyboard.type(code, { delay: 2 })
  }
  await page.getByRole('button', { name: 'Run Code' }).click()
  await page
    .getByRole('button', { name: 'Running…' })
    .waitFor({ state: 'visible', timeout: 10000 })
    .catch(() => {})
  await page.getByRole('button', { name: 'Run Code' }).waitFor({ state: 'visible', timeout: waitMs })
  await page.getByText('Output', { exact: true }).waitFor({ state: 'visible', timeout: waitMs }).catch(() => {})
}

async function runEmptyCode(page) {
  await page.getByRole('button', { name: 'Run Code' }).waitFor({ state: 'visible', timeout: 60000 })
  await clearEditor(page)
  await page.getByRole('button', { name: 'Run Code' }).click()
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
      await loginAsDemoStudent(page)
      return 'student shell loaded'
    })

    await runCheck('02_open_practice_ground', async () => {
      await openPracticeGround(page)
      return 'hub visible'
    })

    await runCheck('03_typing_section', async () => {
      await selectSection(page, 'typing')
      await page.getByRole('button', { name: 'Start Test' }).waitFor({ state: 'visible', timeout: 10000 })
      return 'typing section loaded'
    })

    await runCheck('04_typing_attempt', async () => {
      await page.getByRole('button', { name: 'Start Test' }).click()
      await page.locator('textarea').fill('practice smoke test typing')
      await page.getByRole('button', { name: 'Finish Test' }).click()
      await page.getByText('Typing result saved.').waitFor({ state: 'visible', timeout: 15000 })
      return 'typing attempt saved'
    })

    await runCheck('05_python_valid', async () => {
      await selectSection(page, 'python')
      await runCode(page, 'print("PYTHON_SMOKE_OK")')
      await page.locator('pre').filter({ hasText: 'PYTHON_SMOKE_OK' }).first().waitFor({ state: 'visible', timeout: 20000 })
      return 'valid python ran'
    })

    await runCheck('06_python_invalid', async () => {
      await runCode(page, 'raise ValueError("PYTHON_SMOKE_FAIL")')
      await page.getByText('Error:', { exact: false }).waitFor({ state: 'visible', timeout: 20000 })
      return 'invalid python logged output'
    })

    await runCheck('07_sql_schema', async () => {
      await selectSection(page, 'sql')
      await page.getByText('Practice Database Schema').waitFor({ state: 'visible', timeout: 15000 })
      const loading = await page.getByText('Loading schema…').isVisible().catch(() => false)
      if (loading) {
        await page.getByText('Loading schema…').waitFor({ state: 'hidden', timeout: 15000 })
      }
      const tableVisible = await page.locator('table').first().isVisible()
      if (!tableVisible) throw new Error('SQL schema table not visible')
      return 'sql schema loaded'
    })

    await runCheck('08_sql_valid', async () => {
      await runCode(page, 'SELECT 1 AS smoke_ok;')
      await page.getByText('1 row(s) returned').waitFor({ state: 'visible', timeout: 20000 })
      return 'valid sql ran'
    })

    await runCheck('09_sql_invalid', async () => {
      await runCode(page, 'SELECT * FROM definitely_missing_table_xyz;')
      await page.getByText('Error:', { exact: false }).waitFor({ state: 'visible', timeout: 20000 })
      return 'invalid sql logged output'
    })

    await runCheck('10_java_valid', async () => {
      await selectSection(page, 'java')
      await runCode(
        page,
        'public class Practice { public static void main(String[] args) { System.out.println("JAVA_SMOKE_OK"); } }',
      )
      const ok = await page
        .locator('pre')
        .filter({ hasText: 'JAVA_SMOKE_OK' })
        .first()
        .waitFor({ state: 'visible', timeout: 30000 })
        .then(() => true)
        .catch(() => false)
      const runtimeMissing = await page.getByText('Java runtime not available', { exact: false }).isVisible().catch(() => false)
      if (!ok && !runtimeMissing) throw new Error('Java valid run produced neither success nor known runtime warning')
      return ok ? 'valid java ran' : 'java runtime missing on host (skipped assertion)'
    })

    await runCheck('11_java_invalid', async () => {
      await runCode(page, 'public class Practice { public static void main(String[] args) { int x = } }')
      const err = await page.getByText('Error:', { exact: false }).isVisible().catch(() => false)
      const compileErr = await page.getByText('Compilation error:', { exact: false }).isVisible().catch(() => false)
      const runtimeMissing = await page.getByText('Java runtime not available', { exact: false }).isVisible().catch(() => false)
      if (!err && !compileErr && !runtimeMissing) throw new Error('Java invalid run produced no error output')
      return 'invalid java handled'
    })

    await runCheck('11a_java_empty', async () => {
      await runEmptyCode(page)
      await page.getByText('Please write some code first!').waitFor({ state: 'visible', timeout: 10000 })
      return 'empty java blocked safely'
    })

    await runCheck('11b_java_timeout', async () => {
      await runCode(
        page,
        'public class Practice { public static void main(String[] args) { while(true){} } }',
        { waitMs: 20000 },
      )
      const timeoutVisible = await page.getByText(/Execution timeout:/i).isVisible().catch(() => false)
      const runtimeMissing = await page.getByText('Java runtime not available', { exact: false }).isVisible().catch(() => false)
      if (!timeoutVisible && !runtimeMissing) throw new Error('Java infinite loop did not surface timeout output')
      return timeoutVisible ? 'java timeout handled' : 'java runtime missing on host (skipped assertion)'
    })

    await runCheck('12_mistakes_review', async () => {
      await selectSection(page, 'mistakes')
      const empty = await page.getByText('No mistakes logged yet').isVisible().catch(() => false)
      const hasItems = await page.getByRole('button', { name: 'Retry' }).first().isVisible().catch(() => false)
      if (!empty && !hasItems) throw new Error('Mistakes review neither empty nor populated')
      return empty ? 'mistakes empty state ok' : `mistakes count visible`
    })

    await runCheck('13_mistakes_retry', async () => {
      const retry = page.getByRole('button', { name: 'Retry' }).first()
      const visible = await retry.isVisible().catch(() => false)
      if (!visible) return 'no mistakes to retry (skipped)'
      await retry.click()
      await page.getByText('Loaded code from Mistakes Review.').waitFor({ state: 'visible', timeout: 10000 })
      await page.getByRole('button', { name: 'Run Code' }).waitFor({ state: 'visible', timeout: 10000 })
      return 'retry navigation ok'
    })

    await runCheck('14_no_console_errors', async () => {
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
      const critical = consoleErrors.filter(
        (line) => !ignored.some((token) => line.includes(token)),
      )
      if (critical.length > 0) throw new Error(critical.join(' | '))
      return 'no critical console errors'
    })
  } finally {
    await browser.close()
  }

  const failCount = results.filter((r) => r.status === 'fail').length
  console.log('\nCode Practice Ground Smoke Summary')
  console.log('----------------------------------')
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name} — ${result.detail}`)
  }
  console.log(`\nTotal: ${results.length}  Failed: ${failCount}`)
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Practice ground smoke runner failed:', error)
  process.exit(1)
})
