import { describe, expect, it, vi } from 'vitest'

import { DEV_CONNECTOR_LAB_TOKEN, resolveConnectorToken } from '@/lib/connector-url'

describe('resolveConnectorToken', () => {
  it('allows the development lab token outside production builds', () => {
    vi.stubEnv('VITE_CONNECTOR_TOKEN', '')
    const result = resolveConnectorToken({ isProduction: false })
    expect(result).toEqual({
      ok: true,
      token: DEV_CONNECTOR_LAB_TOKEN,
      isDevLabToken: true,
    })
  })

  it('refuses the lab token in production builds', () => {
    vi.stubEnv('VITE_CONNECTOR_TOKEN', DEV_CONNECTOR_LAB_TOKEN)
    const result = resolveConnectorToken({ isProduction: true })
    expect(result).toEqual({
      ok: false,
      error: 'Local Connector pairing is required.',
      code: 'pairing_required',
    })
  })

  it('accepts an explicit non-lab token in production', () => {
    vi.stubEnv('VITE_CONNECTOR_TOKEN', 'paired-device-token')
    const result = resolveConnectorToken({ isProduction: true })
    expect(result).toEqual({
      ok: true,
      token: 'paired-device-token',
      isDevLabToken: false,
    })
  })
})
