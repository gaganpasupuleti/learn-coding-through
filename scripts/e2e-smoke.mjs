import { chromium } from 'playwright'

import { openCodePracticeFromLearningMenu } from './smoke-nav-helpers.mjs'

const API_BASE = process.env.SMOKE_API_BASE ?? 'http://127.0.0.1:8000'
const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://localhost:5000'
const MAX_UI_NAV_MS = Number(process.env.SMOKE_MAX_UI_NAV_MS ?? 4000)
const MAX_SANDBOX_MS = Number(process.env.SMOKE_MAX_SANDBOX_MS ?? 5000)
const MAX_JAVA_SANDBOX_MS = Number(process.env.SMOKE_MAX_JAVA_SANDBOX_MS ?? 12000)

const results = []

function addResult(name, status, detail) {
  results.push({ name, status, detail })
}

async function runCheck(name, fn, options = {}) {
  const startedAt = Date.now()
  try {
    const detail = await fn()
    const duration = Date.now() - startedAt
    if (options.maxDurationMs && duration > options.maxDurationMs) {
      throw new Error(`duration ${duration}ms exceeded threshold ${options.maxDurationMs}ms`)
    }
    addResult(name, 'pass', `${detail} duration_ms=${duration}`)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    addResult(name, 'fail', detail)
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options)
  const text = await response.text()
  let payload = null

  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = text
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(payload)}`)
  }

  return payload
}

async function runApiChecks() {
  await runCheck('api_health', async () => {
    const payload = await requestJson('/health')
    if (payload?.status !== 'ok') throw new Error('Health status is not ok')
    return JSON.stringify(payload)
  })

  await runCheck('api_db_health', async () => {
    const payload = await requestJson('/health/db')
    if (payload?.status !== 'ok') throw new Error('Database status is not ok')
    return JSON.stringify(payload)
  })

  const email = `smoke.${Date.now()}@example.com`
  const password = 'StrongPass@123'

  await runCheck('api_auth_register', async () => {
    const payload = await requestJson('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: 'Smoke User', password }),
    })
    return `id=${payload.id} email=${payload.email}`
  })

  let token = ''
  await runCheck('api_auth_login', async () => {
    const payload = await requestJson('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!payload?.access_token) throw new Error('Missing access token')
    token = payload.access_token
    return `token_len=${token.length}`
  })

  await runCheck('api_auth_me', async () => {
    const payload = await requestJson('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (payload?.email !== email) throw new Error('Returned user does not match login user')
    return `role=${payload.role}`
  })

  await runCheck('api_roles', async () => {
    const payload = await requestJson('/api/v1/roles')
    if (!Array.isArray(payload) || payload.length === 0) throw new Error('No roles returned')
    return `count=${payload.length}`
  })

  await runCheck('api_projects_catalog', async () => {
    const payload = await requestJson('/api/v1/projects/catalog')
    if (!Array.isArray(payload) || payload.length === 0) throw new Error('No projects returned')
    return `count=${payload.length}`
  })

  await runCheck('api_quiz_catalog', async () => {
    const payload = await requestJson('/api/v1/quiz/catalog')
    if (!Array.isArray(payload) || payload.length === 0) throw new Error('No quizzes returned')
    return `count=${payload.length}`
  })

  await runCheck('api_execute_python', async () => {
    const payload = await requestJson('/api/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', code: 'print(6*7)', timeout_seconds: 5 }),
    })
    if (!payload?.success) throw new Error(payload?.error ?? 'Execution failed')
    return `output=${String(payload.output).trim()} executor_ms=${Math.round(payload.execution_time ?? 0)}`
  }, { maxDurationMs: MAX_SANDBOX_MS })

  await runCheck('api_execute_sql', async () => {
    const payload = await requestJson('/api/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'sql', code: 'SELECT 42 AS answer;', timeout_seconds: 5 }),
    })
    if (!payload?.success) throw new Error(payload?.error ?? 'Execution failed')
    return `executor_ms=${Math.round(payload.execution_time ?? 0)}`
  }, { maxDurationMs: MAX_SANDBOX_MS })

  await runCheck('api_execute_java', async () => {
    const javaCode = `
public class Main {
  public static void main(String[] args) {
    System.out.println("JAVA_SMOKE_OK");
  }
}
`
    const payload = await requestJson('/api/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'java', code: javaCode, timeout_seconds: 10 }),
    })
    if (!payload?.success) throw new Error(payload?.error ?? 'Execution failed')
    return `output=${String(payload.output).trim()} executor_ms=${Math.round(payload.execution_time ?? 0)}`
  }, { maxDurationMs: MAX_JAVA_SANDBOX_MS })
}

async function runUiChecks() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await runCheck('ui_load_login', async () => {
      await page.goto(WEB_BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(800)
      const visible = await page.getByText('CodeQuest').first().isVisible()
      if (!visible) throw new Error('Brand not visible')
      return 'CodeQuest visible'
    })

    await runCheck('ui_demo_entry', async () => {
      await page.getByRole('heading', { name: 'Sign in' }).waitFor({ state: 'visible', timeout: 15000 })
      await page.locator('#email').fill('demo@student.com')
      await page.locator('#password').fill('DemoStudent@123')
      await page.getByRole('button', { name: 'Sign In', exact: true }).click()
      await page.getByRole('button', { name: 'Learning menu' }).waitFor({ state: 'visible', timeout: 15000 })
      return 'student shell loaded'
    })

    await runCheck('ui_projects_flow', async () => {
      await page.getByRole('button', { name: 'Projects', exact: true }).click()
      await page.getByRole('button', { name: 'Start Project', exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
      const startCount = await page.getByRole('button', { name: 'Start Project', exact: true }).count()
      if (startCount === 0) throw new Error('No Start Project buttons found')
      return `start_buttons=${startCount}`
    }, { maxDurationMs: MAX_UI_NAV_MS })

    await runCheck('ui_practice_flow', async () => {
      await openCodePracticeFromLearningMenu(page, 10000)
      await page.getByTestId('practice-section-python').click()
      await page.getByRole('button', { name: 'Run Code', exact: true }).waitFor({ state: 'visible', timeout: 10000 })
      const visible = await page.getByRole('button', { name: 'Run Code', exact: true }).isVisible()
      if (!visible) throw new Error('Run Code button not visible')
      return 'practice ground loaded'
    }, { maxDurationMs: MAX_UI_NAV_MS })

    await runCheck('ui_quiz_flow', async () => {
      await page.getByRole('button', { name: 'Quiz', exact: true }).click()
      await page.getByRole('button', { name: 'Start Quiz', exact: true }).first().waitFor({ state: 'visible', timeout: 10000 })
      const startCount = await page.getByRole('button', { name: 'Start Quiz', exact: true }).count()
      if (startCount === 0) throw new Error('No Start Quiz buttons found')
      await page.getByRole('button', { name: 'Start Quiz', exact: true }).first().click()
      await page.getByRole('button', { name: 'Check Answer', exact: true }).waitFor({ state: 'visible', timeout: 10000 })
      const checkVisible = await page.getByRole('button', { name: 'Check Answer', exact: true }).isVisible()
      if (!checkVisible) throw new Error('Quiz question action button not visible')
      return 'quiz runtime loaded'
    }, { maxDurationMs: MAX_UI_NAV_MS })
  } finally {
    await browser.close()
  }
}

function printSummary() {
  const failCount = results.filter((r) => r.status === 'fail').length
  console.log('\nSmoke Test Summary')
  console.log('------------------')
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name} ${result.detail}`)
  }
  console.log(`\nTotal: ${results.length}  Failed: ${failCount}`)
  return failCount
}

async function main() {
  await runApiChecks()
  await runUiChecks()
  const failCount = printSummary()
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Smoke runner failed:', error)
  process.exit(1)
})
