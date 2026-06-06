import { chromium } from 'playwright'

const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://127.0.0.1:5001'
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

async function openFlowPath(page) {
  await page.getByRole('button', { name: 'Learning menu' }).click()
  await page.getByRole('menuitem', { name: 'Flow Path' }).click()
  await page.getByRole('heading', { name: 'Flow Path' }).waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS })
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
    await runCheck('01_login', async () => {
      await loginAsDemoStudent(page)
      return 'student shell loaded'
    })

    await runCheck('02_open_flow_path', async () => {
      await openFlowPath(page)
      return 'flow path page visible'
    })

    await runCheck('03_load_roadmap', async () => {
      await page.getByText('Loading learning path…').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {})
      const canvas = page.locator('.react-flow')
      await canvas.waitFor({ state: 'visible', timeout: 60000 })
      const nodeCount = await page.locator('.react-flow__node').count()
      if (nodeCount < 1) throw new Error('No roadmap nodes rendered')
      return `${nodeCount} nodes rendered`
    })

    await runCheck('04_pan_zoom', async () => {
      const canvas = page.locator('.react-flow__pane').first()
      await canvas.waitFor({ state: 'visible', timeout: 30000 })
      const box = await canvas.boundingBox()
      if (!box) throw new Error('Canvas bounding box unavailable')
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2 - 40)
      await page.mouse.up()
      const zoomIn = page.locator('.react-flow__controls-button').first()
      if (await zoomIn.isVisible().catch(() => false)) {
        await zoomIn.click()
      }
      return 'pan and zoom ok'
    })

    await runCheck('05_node_drawer', async () => {
      const node = page.locator('.react-flow__node').first()
      await node.click()
      await page.getByLabel('Selected node details').waitFor({ state: 'visible', timeout: 15000 })
      return 'node detail panel opened'
    })

    await runCheck('06_switch_roadmap', async () => {
      await page.getByRole('button', { name: 'Backend' }).click()
      await page.getByText('Loading learning path…').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {})
      await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 60000 })
      return 'backend roadmap loaded'
    })

    await runCheck('07_no_freeze_or_blank', async () => {
      const blank = await page.getByText('Could not load this roadmap').isVisible().catch(() => false)
      const empty = await page.getByText('No roadmap data available').isVisible().catch(() => false)
      const canvasVisible = await page.locator('.react-flow').isVisible().catch(() => false)
      if (blank || empty || !canvasVisible) throw new Error('Flow path blank or error state after switch')
      const ignored = [
        'favicon',
        'DevTools',
        'GSI_LOGGER',
        'google',
        '401',
        '403',
        '429',
        'Failed to fetch KV key',
        'rate limit',
      ]
      const critical = consoleErrors.filter(
        (line) => !ignored.some((token) => line.includes(token)),
      )
      if (critical.length > 0) throw new Error(critical.join(' | '))
      return 'canvas stable, no critical console errors'
    })
  } finally {
    await browser.close()
  }

  const failCount = results.filter((r) => r.status === 'fail').length
  console.log('\nFlow Path Smoke Summary')
  console.log('-----------------------')
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name} — ${result.detail}`)
  }
  console.log(`\nTotal: ${results.length}  Failed: ${failCount}`)
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Flow path smoke runner failed:', error)
  process.exit(1)
})
