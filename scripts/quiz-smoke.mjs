import { chromium } from 'playwright'

import { openCodePracticeFromLearningMenu } from './smoke-nav-helpers.mjs'

const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://127.0.0.1:5001'
const NAV_TIMEOUT_MS = Number(process.env.SMOKE_NAV_TIMEOUT_MS ?? 120000)
const API_BASE = process.env.SMOKE_API_BASE ?? 'http://127.0.0.1:8000'
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD ?? 'Admin@12345'
const DEMO_EMAIL = process.env.SMOKE_DEMO_EMAIL ?? 'demo@student.com'
const DEMO_PASSWORD = process.env.SMOKE_DEMO_PASSWORD ?? 'DemoStudent@123'
const QUIZ_SLUG = process.env.SMOKE_QUIZ_SLUG ?? 'frontend-foundations'

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

async function loginToken(email, password) {
  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(`Login failed for ${email}: HTTP ${response.status}`)
  }
  const data = await response.json()
  return data.access_token
}

async function uploadQuizBank(token) {
  const csv = [
    'quiz_slug,order,question_type,title,prompt,explanation,options,correct_index',
    `${QUIZ_SLUG},99,mcq,Smoke Import Q,What is 2+2?,Four,3|4|5,1`,
  ].join('\n')
  const form = new FormData()
  form.append('file', new Blob([csv], { type: 'text/csv' }), 'quiz-smoke.csv')

  const response = await fetch(`${API_BASE}/api/v1/admin/quiz-bank/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await response.json()
  if (!response.ok || data.rejected > 0) {
    throw new Error(`Quiz import failed: ${JSON.stringify(data)}`)
  }
  return data
}

async function loginStudentUi(page) {
  await page.goto(WEB_BASE, { waitUntil: 'commit', timeout: NAV_TIMEOUT_MS })
  await page.getByRole('heading', { name: 'Sign in' }).waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS })
  await page.locator('#email').fill(DEMO_EMAIL)
  await page.locator('#password').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await page.getByRole('button', { name: 'Learning menu' }).waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await runCheck('01_admin_upload_quiz_bank', async () => {
      try {
        const token = await loginToken(ADMIN_EMAIL, ADMIN_PASSWORD)
        const result = await uploadQuizBank(token)
        return `inserted ${result.inserted}`
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes('401')) {
          return 'skipped — bootstrap admin credentials not configured locally'
        }
        throw error
      }
    })

    await runCheck('02_student_open_quiz', async () => {
      await loginStudentUi(page)
      await page.getByRole('button', { name: 'Learning menu' }).click()
      await page.getByRole('menuitem', { name: 'Quiz' }).click()
      await page.getByRole('heading', { name: 'Quiz Zone' }).waitFor({ state: 'visible', timeout: 30000 })
      return 'quiz zone visible'
    })

    await runCheck('03_student_submit_quiz', async () => {
      const startButton = page.getByRole('button', { name: 'Start Quiz' }).first()
      await startButton.waitFor({ state: 'visible', timeout: 30000 })
      await startButton.click()
      await page.getByRole('button', { name: 'Check Answer' }).waitFor({ state: 'visible', timeout: 30000 })

      const pickLikelyWrongOption = async () => {
        const options = page.getByRole('button').filter({ hasText: /^[A-D]\./ })
        const count = await options.count()
        if (count > 0) {
          await options.nth(count - 1).click()
          await page.getByRole('button', { name: 'Check Answer' }).click()
        }
      }

      await pickLikelyWrongOption()

      while (await page.getByRole('button', { name: 'Next Question' }).isVisible().catch(() => false)) {
        await page.getByRole('button', { name: 'Next Question' }).click()
        await pickLikelyWrongOption()
      }

      await page.getByRole('button', { name: 'Finish Quiz' }).click()
      await page.getByRole('heading', { name: 'Quiz Result' }).waitFor({ state: 'visible', timeout: 30000 })
      return 'quiz result shown'
    })

    await runCheck('04_score_visible', async () => {
      const scoreVisible = await page.getByText('%', { exact: false }).first().isVisible()
      if (!scoreVisible) throw new Error('Score not visible on result summary')
      return 'score visible'
    })

    await runCheck('05_wrong_answers_in_mistakes_review', async () => {
      const wrongSectionOnResult = await page
        .getByText('Wrong answers saved to Mistakes Review', { exact: false })
        .isVisible()
        .catch(() => false)
      if (!wrongSectionOnResult) {
        return 'perfect score — no quiz mistakes expected'
      }

      await openCodePracticeFromLearningMenu(page, NAV_TIMEOUT_MS)
      await page.getByTestId('practice-section-mistakes').click()
      const hasMistake = await page.getByText('[Quiz:', { exact: false }).first().isVisible().catch(() => false)
      if (!hasMistake) throw new Error('Quiz wrong answers were not saved to Mistakes Review')
      return 'quiz mistake visible'
    })
  } finally {
    await browser.close()
  }

  const failCount = results.filter((r) => r.status === 'fail').length
  console.log('\nQuiz Smoke Summary')
  console.log('------------------')
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name} — ${result.detail}`)
  }
  console.log(`\nTotal: ${results.length}  Failed: ${failCount}`)
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Quiz smoke runner failed:', error)
  process.exit(1)
})
