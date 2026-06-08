#!/usr/bin/env node

const jobsApiUrl = (process.env.JOBS_API_URL || process.env.VITE_JOBS_API_URL || 'http://127.0.0.1:8001').replace(/\/$/, '')
const adminKey = process.env.JOBS_ADMIN_API_KEY || process.env.VITE_JOBS_ADMIN_API_KEY || ''

async function check(name, run) {
  try {
    await run()
    console.log(`✓ ${name}`)
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`✗ ${name}: ${message}`)
    return false
  }
}

const results = []

results.push(
  await check('JobSpy health', async () => {
    const res = await fetch(`${jobsApiUrl}/health`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    if (body.status !== 'ok') throw new Error(`unexpected body: ${JSON.stringify(body)}`)
  }),
)

results.push(
  await check('JobSpy jobs list (anonymous)', async () => {
    const res = await fetch(`${jobsApiUrl}/api/v1/jobs?page=1&page_size=5`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    if (!Array.isArray(body.items)) throw new Error('response missing items array')
  }),
)

results.push(
  await check('JobSpy meta roles', async () => {
    const res = await fetch(`${jobsApiUrl}/api/v1/meta/roles`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    if (!Array.isArray(body)) throw new Error('expected roles array')
  }),
)

if (adminKey) {
  results.push(
    await check('JobSpy dashboard stats (admin key)', async () => {
      const res = await fetch(`${jobsApiUrl}/api/v1/dashboard/stats`, {
        headers: { 'X-Admin-Key': adminKey },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
    }),
  )
} else {
  console.log('○ JobSpy dashboard stats skipped (set JOBS_ADMIN_API_KEY to test admin endpoints)')
}

const failed = results.filter((ok) => !ok).length
if (failed > 0) {
  console.error(`\nJobSpy smoke failed (${failed} check(s)). API base: ${jobsApiUrl}`)
  process.exit(1)
}

console.log(`\nJobSpy smoke passed. API base: ${jobsApiUrl}`)
