/**
 * Browser smoke for Code Quest Resume Lab + Resume Matcher + Local Connector.
 * Reactive Resume steps removed — builder iframe loads Resume Matcher.
 */
import { chromium } from 'playwright'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync, spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const WEB_BASE = process.env.SMOKE_WEB_BASE ?? 'http://127.0.0.1:5000'
const API_BASE = process.env.SMOKE_API_BASE ?? 'http://127.0.0.1:8000'
const RM_WEB_BASE = process.env.SMOKE_RM_WEB_BASE ?? 'http://localhost:3000'
const RM_BASE = process.env.SMOKE_RM_BASE ?? 'http://127.0.0.1:8001'
const CONNECTOR = process.env.SMOKE_CONNECTOR ?? 'http://127.0.0.1:17891'
const CONNECTOR_BEARER =
  process.env.CQ_TEST_BEARER_TOKEN || crypto.randomBytes(24).toString('base64url')
const CONNECTOR_PAIRING_STORE =
  process.env.CQ_CONNECTOR_PAIRING_STORE ||
  path.join(os.tmpdir(), `cq-e2e-pairing-${process.pid}.json`)

const results = []
function pass(name, detail = '') {
  results.push({ name, status: 'pass', detail })
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`)
}
function fail(name, detail) {
  results.push({ name, status: 'fail', detail })
  console.error(`FAIL  ${name} — ${detail}`)
}
async function step(name, fn) {
  try {
    const detail = await fn()
    const detailText =
      detail == null ? '' : typeof detail === 'string' ? detail : JSON.stringify(detail)
    pass(name, detailText)
    return detail
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error))
    throw error
  }
}

function stopPort(port) {
  try {
    execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
      { stdio: 'ignore' },
    )
  } catch {
    /* ignore */
  }
}

function startResumeMatcher() {
  const rmDir = path.resolve(root, '..', 'Resume-Matcher', 'apps', 'backend')
  const venvPy = path.join(rmDir, '.venv', 'Scripts', 'python.exe')
  const py = fs.existsSync(venvPy) ? venvPy : 'python'
  const child = spawn(
    py,
    ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8001'],
    {
      cwd: rmDir,
      env: {
        ...process.env,
        // Standalone builder mode — not CODEQUEST_INTEGRATION_MODE
        CODEQUEST_INTEGRATION_MODE: 'false',
        PORT: '8001',
        LLM_PROVIDER: process.env.LLM_PROVIDER || 'ollama',
        LLM_API_BASE: process.env.LLM_API_BASE || 'http://127.0.0.1:11434',
      },
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    },
  )
  child.unref()
}

async function waitForResumeMatcher(ok) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${RM_BASE}/api/v1/health`)
      if (ok && res.ok) return
      if (!ok && !res.ok) return
    } catch {
      if (!ok) return
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  if (ok) throw new Error('Resume Matcher did not come back')
}

function startConnector() {
  const connectorDir = path.join(root, 'backend', 'codequest-local-ai-lab', 'connector')
  try {
    fs.unlinkSync(CONNECTOR_PAIRING_STORE)
  } catch {
    /* ignore */
  }
  const child = spawn('node', ['src/start.mjs'], {
    cwd: connectorDir,
    env: {
      ...process.env,
      CQ_ALLOWED_ORIGINS: 'http://localhost:5000,http://127.0.0.1:5000,http://127.0.0.1:5173',
      CQ_TEST_BEARER_TOKEN: CONNECTOR_BEARER,
      CQ_CONNECTOR_PAIRING_STORE: CONNECTOR_PAIRING_STORE,
      CQ_CONNECTOR_EXPOSE_PAIRING_CODE: 'true',
    },
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
}

async function waitForConnector(ok) {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${CONNECTOR}/api/v1/status`, {
        headers: { Origin: 'http://localhost:5000' },
      })
      if (ok && res.ok) {
        const body = await res.json()
        if (body?.connector?.status === 'running') return
      }
      if (!ok && !res.ok) return
    } catch {
      if (!ok) return
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  if (ok) throw new Error('Connector did not come back')
}

async function main() {
  const credsPath = path.join(root, '.e2e-credentials.json')
  if (!fs.existsSync(credsPath)) {
    throw new Error('Missing .e2e-credentials.json — create a student JWT fixture first')
  }
  const cqCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
  let modelNames = []

  await step('preflight_services', async () => {
    try {
      await fetch(`${CONNECTOR}/api/v1/status`, {
        headers: { Origin: 'http://localhost:5000' },
      })
    } catch {
      startConnector()
      await waitForConnector(true)
    }
    try {
      const rmProbe = await fetch(`${RM_BASE}/api/v1/health`)
      if (!rmProbe.ok) throw new Error('rm unhealthy')
    } catch {
      startResumeMatcher()
      await waitForResumeMatcher(true)
    }

    const [web, api, rmWeb, rm, statusRes] = await Promise.all([
      fetch(`${WEB_BASE}/`).then((r) => r.status),
      fetch(`${API_BASE}/health`).then((r) => r.status),
      fetch(`${RM_WEB_BASE}/`).then((r) => r.status).catch(() => 0),
      fetch(`${RM_BASE}/api/v1/health`).then((r) => r.status).catch(() => 0),
      fetch(`${CONNECTOR}/api/v1/status`, {
        headers: { Origin: 'http://localhost:5000' },
      }),
    ])
    if (web !== 200) throw new Error(`CQ web ${web}`)
    if (api !== 200) throw new Error(`CQ api ${api}`)
    if (rm !== 200) throw new Error(`Resume Matcher health ${rm}`)
    if (rmWeb !== 200) throw new Error(`Resume Matcher frontend ${rmWeb}`)
    const status = await statusRes.json()
    if (!status?.ollama?.connected) throw new Error('Ollama not connected')
    return `ollama_models=${status.ollama.model_count}; rm=ok; rm_web=ok`
  })

  await step('dynamic_models', async () => {
    const payload = await fetch(`${CONNECTOR}/api/v1/models`, {
      headers: {
        Origin: 'http://localhost:5000',
        'X-CodeQuest-Connector-Token': CONNECTOR_BEARER,
      },
    }).then((r) => r.json())
    modelNames = (payload.models ?? []).map((m) => m.model)
    if (modelNames.length < 1) throw new Error('No models discovered')
    return modelNames.join(', ')
  })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.setDefaultTimeout(60000)

  try {
    await step('cq_sign_in_resume_lab', async () => {
      await page.goto(WEB_BASE, { waitUntil: 'domcontentloaded' })
      await page.evaluate(
        ({ token, email, connectorBearer }) => {
          localStorage.setItem('career-portal-token', token)
          localStorage.setItem(
            'career-portal-user',
            JSON.stringify({ id: 2, email, full_name: 'Demo Student', role: 'student' }),
          )
          sessionStorage.setItem('codequest.connector.paired-token', connectorBearer)
        },
        { token: cqCreds.token, email: cqCreds.email, connectorBearer: CONNECTOR_BEARER },
      )
      await page.goto(`${WEB_BASE}/?page=resume`, { waitUntil: 'networkidle' })
      await page.getByRole('heading', { name: /Resume Lab/i }).waitFor()
      return 'ok'
    })

    await step('connector_pairing_session', async () => {
      const panel = page.getByLabel(/Local AI connector status/i)
      await panel.waitFor()
      await panel.getByRole('button', { name: /Refresh/i }).click().catch(() => {})
      await page.waitForTimeout(1000)
      const text = await panel.innerText()
      if (!/Paired|Local AI ready|Installed Ollama/i.test(text)) {
        throw new Error(`Expected paired connector UI, got: ${text.slice(0, 180)}`)
      }
      return text.slice(0, 120)
    })

    await step('open_builder_iframe_resume_matcher', async () => {
      await page.getByRole('button', { name: /Open resume builder/i }).click()
      await page.waitForURL(/page=resume-builder|resume-builder/i, { timeout: 15000 }).catch(() => {})
      const iframe = page.locator('iframe[title*="Resume Matcher" i], iframe[title*="resume builder" i]')
      await iframe.waitFor({ timeout: 20000 })
      const src = await iframe.getAttribute('src')
      if (!src || !/localhost:3000|127\.0\.0\.1:3000/i.test(src)) {
        throw new Error(`Unexpected iframe src: ${src}`)
      }
      // Wait for RM document to load inside iframe
      const frame = page.frameLocator('iframe[title*="Resume Matcher" i], iframe[title*="resume builder" i]')
      await frame.locator('body').waitFor({ timeout: 30000 })
      return src
    })

    await step('rm_public_health', async () => {
      const health = await fetch(`${RM_BASE}/api/v1/health`).then((r) => r.json())
      const status = String(health.status || '').toLowerCase()
      if (!['healthy', 'degraded', 'ok', 'ready'].includes(status)) {
        throw new Error(`Unexpected RM health: ${JSON.stringify(health)}`)
      }
      return status
    })

    await step('cq_proxy_unauthenticated_rejected', async () => {
      const res = await fetch(`${API_BASE}/api/v1/resume-matcher/health`)
      if (res.status !== 401 && res.status !== 403) {
        throw new Error(`expected 401/403, got ${res.status}`)
      }
      return String(res.status)
    })

    await step('cq_proxy_authenticated_health', async () => {
      const res = await fetch(`${API_BASE}/api/v1/resume-matcher/health`, {
        headers: { Authorization: `Bearer ${cqCreds.token}` },
      })
      if (!res.ok) {
        // Proxy may be disabled in env — still acceptable if RM direct health passed
        if (res.status === 503) return 'proxy_disabled'
        throw new Error(`proxy health ${res.status}`)
      }
      const body = await res.json()
      return `enabled=${body.enabled}`
    })

    await step('secret_leak_scan', async () => {
      const runtime = await fetch(`${WEB_BASE}/runtime-config.js`).then((r) => r.text())
      if (/VITE_CONNECTOR_TOKEN\s*:\s*'[^']+'/i.test(runtime) && !/VITE_CONNECTOR_TOKEN\s*:\s*''/.test(runtime)) {
        throw new Error('runtime-config still exposes a connector token')
      }
      if (runtime.includes(CONNECTOR_BEARER)) {
        throw new Error('runtime-config leaked temporary credentials')
      }
      if (runtime.includes(cqCreds.token)) {
        throw new Error('runtime-config leaked CQ access token')
      }
      return 'runtime-config clean'
    })

    await step('huggingface_disabled', async () => {
      const statusRes = await fetch(`${API_BASE}/api/v1/ai/huggingface/status`)
      const statusBody = await statusRes.json()
      if (statusBody.enabled === true) throw new Error('HF enabled unexpectedly')
      return `status.enabled=${statusBody.enabled}`
    })
  } finally {
    fs.writeFileSync(
      path.join(root, '.e2e-resume-lab-results.json'),
      JSON.stringify({ results, modelNames }, null, 2),
    )
    await browser.close()
  }

  const failed = results.filter((r) => r.status === 'fail')
  console.log('\n=== SUMMARY ===')
  console.log(`pass=${results.filter((r) => r.status === 'pass').length} fail=${failed.length}`)
  console.log(`models=${modelNames.join(', ')}`)
  if (failed.length) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
