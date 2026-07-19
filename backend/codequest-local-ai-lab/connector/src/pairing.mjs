import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PAIRING_CODE_TTL_MS = 5 * 60 * 1000
const PAIRING_CODE_BYTES = 4
const BEARER_BYTES = 32

function defaultStorePath() {
  return (
    process.env.CQ_CONNECTOR_PAIRING_STORE ||
    path.join(os.homedir(), '.codequest', 'connector', 'pairing.json')
  )
}

function hashValue(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex')
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function secureWriteJson(filePath, payload) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  try {
    fs.chmodSync(dir, 0o700)
  } catch {
    // Windows may ignore POSIX modes; still write restrictively where supported.
  }
  const tmp = `${filePath}.${process.pid}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(payload, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  fs.renameSync(tmp, filePath)
  try {
    fs.chmodSync(filePath, 0o600)
  } catch {
    // best-effort
  }
}

export function createPairingStore(options = {}) {
  const storePath = options.storePath || defaultStorePath()
  /** @type {{ tokenHash: string | null, pending: { codeHash: string, expiresAt: number } | null }} */
  let state = { tokenHash: null, pending: null }

  function load() {
    try {
      if (!fs.existsSync(storePath)) return
      const raw = JSON.parse(fs.readFileSync(storePath, 'utf8'))
      state = {
        tokenHash: typeof raw.tokenHash === 'string' ? raw.tokenHash : null,
        pending:
          raw.pending &&
          typeof raw.pending.codeHash === 'string' &&
          typeof raw.pending.expiresAt === 'number'
            ? { codeHash: raw.pending.codeHash, expiresAt: raw.pending.expiresAt }
            : null,
      }
    } catch {
      state = { tokenHash: null, pending: null }
    }
  }

  function persist() {
    secureWriteJson(storePath, {
      version: 1,
      tokenHash: state.tokenHash,
      pending: state.pending,
      updatedAt: new Date().toISOString(),
    })
  }

  load()

  // Test injection: process-scoped pre-seeded bearer (never logged).
  const injectedBearer = process.env.CQ_TEST_BEARER_TOKEN?.trim()
  if (injectedBearer) {
    state.tokenHash = hashValue(injectedBearer)
    state.pending = null
    persist()
  }

  function clearExpiredPending(now = Date.now()) {
    if (state.pending && state.pending.expiresAt <= now) {
      state.pending = null
      persist()
    }
  }

  function ensurePairingCode() {
    clearExpiredPending()
    if (state.tokenHash) {
      return { state: 'paired', code: null }
    }
    if (state.pending) {
      // Do not re-display previous code over HTTP; caller may regenerate.
      return { state: 'pending', code: null, expiresAt: state.pending.expiresAt }
    }
    const code = crypto.randomBytes(PAIRING_CODE_BYTES).toString('hex').toUpperCase()
    state.pending = {
      codeHash: hashValue(code),
      expiresAt: Date.now() + PAIRING_CODE_TTL_MS,
    }
    persist()
    return { state: 'pending', code, expiresAt: state.pending.expiresAt }
  }

  function regeneratePairingCode() {
    state.tokenHash = null
    state.pending = null
    return ensurePairingCode()
  }

  function pairWithCode(code) {
    // Do not clear-then-miss: expired codes must surface pairing_code_expired.
    if (!state.pending) {
      return { ok: false, error: 'pairing_code_missing' }
    }
    if (state.pending.expiresAt <= Date.now()) {
      state.pending = null
      persist()
      return { ok: false, error: 'pairing_code_expired' }
    }
    const normalized = String(code || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-F0-9]/g, '')
    if (!normalized || !timingSafeEqualHex(hashValue(normalized), state.pending.codeHash)) {
      return { ok: false, error: 'pairing_code_invalid' }
    }

    const token = crypto.randomBytes(BEARER_BYTES).toString('base64url')
    state.tokenHash = hashValue(token)
    state.pending = null
    persist()
    return { ok: true, token }
  }

  function authorizeToken(token) {
    if (!state.tokenHash || typeof token !== 'string' || !token.trim()) return false
    return timingSafeEqualHex(hashValue(token.trim()), state.tokenHash)
  }

  function revoke() {
    state.tokenHash = null
    state.pending = null
    persist()
  }

  function rotate(token) {
    if (!authorizeToken(token)) return { ok: false, error: 'unauthorized' }
    const next = crypto.randomBytes(BEARER_BYTES).toString('base64url')
    state.tokenHash = hashValue(next)
    state.pending = null
    persist()
    return { ok: true, token: next }
  }

  function publicStatus() {
    clearExpiredPending()
    if (state.tokenHash) return { state: 'paired' }
    if (state.pending) {
      return {
        state: 'unpaired',
        pairing_required: true,
        code_expires_at: new Date(state.pending.expiresAt).toISOString(),
      }
    }
    return { state: 'unpaired', pairing_required: true }
  }

  function expirePendingForTests() {
    if (state.pending) state.pending.expiresAt = Date.now() - 1
  }

  return {
    storePath,
    ensurePairingCode,
    regeneratePairingCode,
    pairWithCode,
    authorizeToken,
    revoke,
    rotate,
    publicStatus,
    expirePendingForTests,
    // test helpers
    _debugState: () => ({ ...state, pending: state.pending ? { ...state.pending } : null }),
  }
}

export const PAIRING_CODE_TTL_MS_EXPORT = PAIRING_CODE_TTL_MS
