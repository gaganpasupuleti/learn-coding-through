import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearPairedConnectorToken,
  resolveConnectorToken,
  resolveConnectorUrl,
  storePairedConnectorToken,
} from '@/lib/connector-url'

function installMemorySessionStorage() {
  const map = new Map<string, string>()
  const sessionStorage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, String(value))
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
    clear: () => map.clear(),
  }
  vi.stubGlobal('sessionStorage', sessionStorage)
  // resolveConnectorToken guards on window; Node vitest has no DOM by default.
  vi.stubGlobal('window', { sessionStorage })
}

describe('resolveConnectorUrl', () => {
  it('accepts the default loopback connector origin', () => {
    const result = resolveConnectorUrl('http://127.0.0.1:17891')
    expect(result).toEqual({ ok: true, url: 'http://127.0.0.1:17891' })
  })

  it('rejects javascript URLs', () => {
    const result = resolveConnectorUrl('javascript:alert(1)')
    expect(result.ok).toBe(false)
  })
})

describe('resolveConnectorToken', () => {
  beforeEach(() => {
    installMemorySessionStorage()
  })

  afterEach(() => {
    clearPairedConnectorToken()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('requires pairing when no session token is stored', () => {
    clearPairedConnectorToken()
    const result = resolveConnectorToken()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('pairing_required')
    }
  })

  it('returns a session-stored paired token', () => {
    storePairedConnectorToken('paired-device-token-abcdefghijklmnopqrstuvwxyz')
    const result = resolveConnectorToken()
    expect(result).toEqual({
      ok: true,
      token: 'paired-device-token-abcdefghijklmnopqrstuvwxyz',
    })
  })

  it('ignores Vite connector token env (removed from production usage)', () => {
    vi.stubEnv('VITE_CONNECTOR_TOKEN', 'should-not-be-used')
    clearPairedConnectorToken()
    const result = resolveConnectorToken()
    expect(result.ok).toBe(false)
  })
})
