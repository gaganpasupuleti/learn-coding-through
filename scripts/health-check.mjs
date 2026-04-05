#!/usr/bin/env node

const args = process.argv.slice(2)
const options = {
  frontendUrl: process.env.FRONTEND_URL || '',
  backendUrl: process.env.BACKEND_URL || '',
}

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if ((arg === '--frontend-url' || arg === '-f') && args[i + 1]) {
    options.frontendUrl = args[i + 1]
    i += 1
  } else if ((arg === '--backend-url' || arg === '-b') && args[i + 1]) {
    options.backendUrl = args[i + 1]
    i += 1
  } else if (arg === '--help' || arg === '-h') {
    printUsage()
    process.exit(0)
  }
}

if (!options.backendUrl) {
  console.error('Missing backend URL. Set BACKEND_URL or pass --backend-url.')
  printUsage()
  process.exit(1)
}

if (!options.frontendUrl) {
  console.error('Missing frontend URL. Set FRONTEND_URL or pass --frontend-url.')
  printUsage()
  process.exit(1)
}

const frontend = stripTrailingSlash(options.frontendUrl)
const backend = stripTrailingSlash(options.backendUrl)

const checks = [
  {
    name: 'Frontend runtime config',
    run: async () => {
      const response = await fetch(`${frontend}/runtime-config.js`)
      const body = await response.text()
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      if (!body.includes('VITE_API_URL')) {
        throw new Error('runtime-config.js missing VITE_API_URL')
      }
      return 'ok'
    },
  },
  {
    name: 'Backend health',
    run: async () => {
      const response = await fetch(`${backend}/health`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return 'ok'
    },
  },
  {
    name: 'SQL schema endpoint',
    run: async () => {
      const response = await fetch(`${backend}/api/v1/sql/schema`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return 'ok'
    },
  },
  {
    name: 'CORS preflight execute',
    run: async () => {
      const response = await fetch(`${backend}/api/v1/execute`, {
        method: 'OPTIONS',
        headers: {
          Origin: frontend,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,authorization',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const allowOrigin = response.headers.get('access-control-allow-origin')
      if (!(allowOrigin === frontend || allowOrigin === '*')) {
        throw new Error(`unexpected access-control-allow-origin: ${allowOrigin || '<empty>'}`)
      }
      return allowOrigin
    },
  },
  {
    name: 'Execute API request',
    run: async () => {
      const response = await fetch(`${backend}/api/v1/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: "print('ok')", language: 'python' }),
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`)
      }
      const payload = await response.json()
      if (!payload?.success) {
        throw new Error('execute response success=false')
      }
      return payload.output || '<empty output>'
    },
  },
]

let hasFailures = false
for (const check of checks) {
  try {
    const result = await check.run()
    console.log(`[PASS] ${check.name}: ${result}`)
  } catch (error) {
    hasFailures = true
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[FAIL] ${check.name}: ${message}`)
  }
}

if (hasFailures) {
  process.exit(1)
}

console.log('All checks passed.')

function stripTrailingSlash(url) {
  return (url || '').replace(/\/$/, '')
}

function printUsage() {
  console.log('Usage: npm run health:check -- --frontend-url <url> --backend-url <url>')
  console.log('Or set environment variables FRONTEND_URL and BACKEND_URL.')
}
