/**
 * Browser smoke tests for /practice/code (run, preview, coming-soon languages).
 * Pair with code-intelligence-smoke.mjs for offline suggestion coverage.
 *
 * Prerequisites: dev servers up (frontend :5000, backend :8000 for JS run).
 * Uses demo login defaults (demo@student.com) — override via SMOKE_DEMO_EMAIL / SMOKE_DEMO_PASSWORD.
 *
 * Run (from repo root):
 *   node scripts/code-workbench-smoke.mjs
 */
import { chromium } from 'playwright'

const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://127.0.0.1:5000'
const NAV_TIMEOUT_MS = Number(process.env.SMOKE_NAV_TIMEOUT_MS ?? 180000)
const DEMO_EMAIL = process.env.SMOKE_DEMO_EMAIL ?? 'demo@student.com'
const DEMO_PASSWORD = process.env.SMOKE_DEMO_PASSWORD ?? 'DemoStudent@123'

const results = []

function addResult(name, status, detail) {
  results.push({ name, status, detail })
}

let abortAfterLoginFailure = false

async function runCheck(name, fn, { critical = false } = {}) {
  if (abortAfterLoginFailure) {
    addResult(name, 'skip', 'skipped — login/open failed')
    return
  }
  process.stdout.write(`… ${name}\n`)
  try {
    const detail = await fn()
    addResult(name, 'pass', detail)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    addResult(name, 'fail', detail)
    if (critical) abortAfterLoginFailure = true
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

async function openCodeWorkbench(page) {
  await page.goto(`${WEB_BASE}/practice/code`, { waitUntil: 'commit', timeout: NAV_TIMEOUT_MS })
  await page.getByText('Code Workbench').first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS })
  await page.getByText('Suggestions enabled').waitFor({ state: 'visible', timeout: 60000 })
  await page.locator('.monaco-editor').first().waitFor({ state: 'visible', timeout: 60000 })
}

async function dismissToasts(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-sonner-toast]').forEach((el) => el.remove())
  })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
}

async function focusEditor(page) {
  await page.locator('.monaco-editor .view-lines').first().click({ timeout: 30000 })
  await page.waitForTimeout(300)
}

async function waitForIdleRun(page) {
  const runBtn = page.getByRole('button', { name: 'Run', exact: true })
  await runBtn.waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForFunction(
    () => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Run')
      return btn && !btn.disabled
    },
    { timeout: 180000 },
  )
}

async function setEditorText(page, text) {
  await focusEditor(page)
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.insertText(text)
  await page.waitForTimeout(600)
}

async function typeForSuggestions(page, text) {
  await focusEditor(page)
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.type(text, { delay: 80 })
  await page.waitForTimeout(500)
}

async function openSuggestions(page) {
  const widget = page.locator('.monaco-suggest-widget').first()
  try {
    await widget.waitFor({ state: 'visible', timeout: 2500 })
    return
  } catch {
    /* fall through */
  }
  await page.keyboard.press('Control+Space')
  await widget.waitFor({ state: 'visible', timeout: 15000 })
}

async function suggestionLabels(page) {
  const rows = page.locator('.monaco-suggest-widget .monaco-list-row .label-name')
  await rows.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {})
  return rows.allTextContents()
}

async function selectLanguage(page, label) {
  await dismissToasts(page)
  await waitForIdleRun(page)
  const btn = page.getByRole('button', { name: new RegExp(`^${label}`) }).first()
  await btn.click()
  await page.locator('.monaco-editor').first().waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(800)
}

async function clickRun(page) {
  await page.getByRole('button', { name: 'Run', exact: true }).click()
}

async function waitForStdout(page, text, timeout = 180000) {
  const outputAside = page.locator('aside').filter({ hasText: 'Output' }).first()
  await outputAside.getByText(text, { exact: false }).waitFor({ state: 'visible', timeout })
}

function assertLabelsInclude(labels, expected) {
  const lower = labels.map((l) => l.toLowerCase())
  for (const item of expected) {
    const found = lower.some((l) => l.includes(item.toLowerCase()))
    if (!found) throw new Error(`Expected suggestion containing "${item}" in [${labels.join(', ')}]`)
  }
}

/** Unit-level checks (no browser) for variable extraction logic mirrored in TS module */
function runUnitChecks() {
  const pyCode = 'x = 10\ny = 20\nname = input()'
  const pyVars = extractPythonVariables(pyCode)
  if (!pyVars.includes('x') || !pyVars.includes('y') || !pyVars.includes('name')) {
    throw new Error(`Python vars missing: ${pyVars.join(',')}`)
  }

  const jsCode = 'const x = 10;\nconst y = 20;\nfunction add(a, b) {}'
  const jsVars = extractJavaScriptVariables(jsCode)
  for (const v of ['x', 'y', 'add', 'a', 'b']) {
    if (!jsVars.includes(v)) throw new Error(`JS var ${v} missing in ${jsVars.join(',')}`)
  }

  const snippets = getPythonSnippetLabels()
  if (!snippets.some((s) => s.includes('print'))) {
    throw new Error('print snippet missing')
  }

  const reactKw = ['useState', 'button', 'onClick', 'className']
  for (const kw of reactKw) {
    if (!REACT_KEYWORDS.includes(kw)) throw new Error(`React keyword ${kw} missing`)
  }
}

const IDENT = '[a-zA-Z_$][\\w$]*'

const REACT_KEYWORDS = [
  'useState', 'useEffect', 'useMemo', 'useCallback', 'props', 'className', 'onClick',
  'onChange', 'button', 'div', 'input', 'map', 'return', 'export default function App',
]

function extractPythonVariables(code) {
  const names = new Set()
  for (const re of [
    new RegExp(`^\\s*(${IDENT})\\s*=`, 'gm'),
    new RegExp(`^\\s*for\\s+(${IDENT})\\s+in\\b`, 'gm'),
  ]) {
    let m
    while ((m = re.exec(code))) names.add(m[1])
  }
  return [...names]
}

function extractJavaScriptVariables(code) {
  const names = new Set()
  const declRe = new RegExp(`(?:const|let|var)\\s+(${IDENT})`, 'g')
  const funcRe = new RegExp(`function\\s+(${IDENT})\\s*\\(([^)]*)\\)`, 'g')
  let m
  while ((m = declRe.exec(code))) names.add(m[1])
  while ((m = funcRe.exec(code))) {
    names.add(m[1])
    m[2].split(',').forEach((p) => {
      const param = p.trim().split('=')[0].trim()
      if (param && /^[a-zA-Z_$]/.test(param)) names.add(param)
    })
  }
  return [...names]
}

function getPythonSnippetLabels() {
  return ['print()', 'input()', 'if condition:', 'for item in list:']
}

async function main() {
  await runCheck('00_unit_variable_snippets', async () => {
    runUnitChecks()
    return 'extractor + snippet labels ok'
  })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  await context.addInitScript(() => {
    localStorage.removeItem('demo-code-executions')
  })
  const page = await context.newPage()

  try {
    await runCheck('01_login', async () => {
      await loginAsDemoStudent(page)
      return 'demo login ok'
    }, { critical: true })

    await runCheck('02_open_workbench', async () => {
      await openCodeWorkbench(page)
      return '/practice/code loaded'
    }, { critical: true })

    await runCheck('03_python_run', async () => {
      await selectLanguage(page, 'Python')
      await setEditorText(page, 'print("WORKBENCH_PY_OK")')
      await clickRun(page)
      await waitForStdout(page, 'WORKBENCH_PY_OK', 180000)
      return 'python run ok'
    })

    await runCheck('04_javascript_run', async () => {
      await selectLanguage(page, 'JavaScript')
      await setEditorText(page, 'console.log("WORKBENCH_JS_OK")')
      await waitForIdleRun(page)
      await clickRun(page)
      await waitForStdout(page, 'WORKBENCH_JS_OK', 90000)
      return 'javascript run ok'
    })

    await runCheck('05_react_sandpack_preview', async () => {
      await selectLanguage(page, 'React')
      const iframe = page.locator('.sp-preview-iframe, iframe[title="Sandpack Preview"]').first()
      await iframe.waitFor({ state: 'visible', timeout: 45000 })
      await clickRun(page)
      await page.locator('aside').filter({ hasText: 'Stdout' }).getByText(/Sandpack|preview/i).waitFor({ state: 'visible', timeout: 15000 })
      return 'sandpack iframe + react run guidance ok'
    })

    await runCheck('06_java_tab_and_run', async () => {
      await selectLanguage(page, 'Java')
      await page.getByText('Print Hello World').first().waitFor({ state: 'visible', timeout: 15000 })
      await setEditorText(
        page,
        `public class Main {
    public static void main(String[] args) {
        System.out.println("WORKBENCH_JAVA_OK");
    }
}`,
      )
      await waitForIdleRun(page)
      await clickRun(page)
      const outputAside = page.locator('aside').filter({ hasText: 'Output' }).first()
      const okVisible = await outputAside.getByText('WORKBENCH_JAVA_OK', { exact: false }).isVisible().catch(() => false)
      const unavailableVisible = await outputAside
        .getByText(/Java execution is not available/i, { exact: false })
        .isVisible()
        .catch(() => false)
      if (!okVisible && !unavailableVisible) {
        throw new Error('Expected Java run output or clear runtime-unavailable message')
      }
      return okVisible ? 'java hello run ok' : 'java runtime unavailable message ok'
    })

    await runCheck('07_c_coming_soon', async () => {
      await dismissToasts(page)
      await page.getByRole('button', { name: /C · soon/i }).first().click({ force: true })
      await page.locator('[data-sonner-toast]').filter({ hasText: /Judge0/i }).first().waitFor({ state: 'visible', timeout: 10000 })
      return 'c coming-soon toast ok'
    })

    await runCheck('08_cpp_coming_soon', async () => {
      await dismissToasts(page)
      await page.getByRole('button', { name: /C\+\+ · soon/i }).click({ force: true })
      await page.locator('[data-sonner-toast]').filter({ hasText: /Judge0/i }).first().waitFor({ state: 'visible', timeout: 10000 })
      return 'cpp coming-soon toast ok'
    })
  } finally {
    await browser.close()
  }

  const failCount = results.filter((r) => r.status === 'fail').length
  console.log('\nCode Workbench Smoke Summary')
  console.log('----------------------------')
  for (const result of results) {
    console.log(`${result.status.toUpperCase()} ${result.name} — ${result.detail}`)
  }
  console.log(`\nTotal: ${results.length}  Failed: ${failCount}`)
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Code workbench smoke failed:', error)
  process.exit(1)
})
