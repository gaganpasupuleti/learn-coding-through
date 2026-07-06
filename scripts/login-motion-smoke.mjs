/** Login auth-portal smoke — layout, portal visuals, auth config fetch; no credential submission. */
import { chromium } from 'playwright'

const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://127.0.0.1:5002'

async function runViewportCheck(page, label, width, height) {
  await page.setViewportSize({ width, height })
  await page.goto(`${WEB_BASE}/`, { waitUntil: 'commit', timeout: 120000 })
  await page.waitForTimeout(1500)

  const main = page.getByRole('main', { name: 'Sign in to CodeQuest' })
  await main.waitFor({ state: 'visible', timeout: 15000 })

  const portalSide = page.locator('.login-portal-side')
  const formSide = page.locator('.login-form-side')
  await portalSide.waitFor({ state: 'visible', timeout: 5000 })
  await formSide.waitFor({ state: 'visible', timeout: 5000 })

  const logo = page.locator('text=CQ').first()
  await logo.waitFor({ state: 'visible', timeout: 5000 })

  const taglineCount = await page.locator('.login-tagline-word').count()
  const statChipCount = await page.locator('.login-stat-chip').count()
  const featureChipCount = await page.locator('.login-feature-chip').count()

  const signInHeading = page.getByRole('heading', { name: 'Sign in' })
  await signInHeading.waitFor({ state: 'visible', timeout: 5000 })

  const emailInput = page.locator('#email')
  await emailInput.waitFor({ state: 'visible', timeout: 5000 })

  const bodyText = await page.locator('body').innerText()
  const authConfigMention =
    bodyText.includes('Checking sign-in options') ||
    bodyText.includes('Google login') ||
    bodyText.includes('Sign-in service') ||
    bodyText.includes('Continue with Google') ||
    bodyText.includes('Or use email')

  const googleSectionVisible = await page
    .getByText('Continue with Google', { exact: true })
    .first()
    .isVisible()
    .catch(() => false)

  let splitLayout = null
  if (width >= 1024) {
    const portalBox = await portalSide.boundingBox()
    const formBox = await formSide.boundingBox()
    splitLayout = !!(portalBox && formBox && portalBox.x < formBox.x && portalBox.width > formBox.width * 0.9)
  }

  return {
    viewport: label,
    width,
    height,
    mainVisible: true,
    portalVisible: true,
    formVisible: true,
    logoVisible: true,
    taglineWordCount: taglineCount,
    statChipCount,
    featureChipCount,
    signInHeadingVisible: true,
    emailInputVisible: true,
    authConfigLoadedOrPending: authConfigMention,
    googleSectionVisible,
    splitLayout,
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  let runtimeError = null
  page.on('pageerror', (err) => {
    runtimeError = err.message
  })

  try {
    const desktop = await runViewportCheck(page, 'desktop', 1280, 800)
    const mobile = await runViewportCheck(page, 'mobile', 390, 844)

    console.log(
      JSON.stringify(
        {
          status: 'pass',
          route: `${WEB_BASE}/`,
          runtimeError,
          desktop,
          mobile,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    const snippet = await page.locator('body').innerText().catch(() => '')
    console.error(
      JSON.stringify(
        {
          status: 'fail',
          runtimeError,
          error: error instanceof Error ? error.message : String(error),
          bodySnippet: snippet.slice(0, 400),
        },
        null,
        2,
      ),
    )
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

void main()
