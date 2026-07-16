import { describe, expect, it } from 'vitest'

import { resolveConnectorUrl } from '@/lib/connector-url'
import { isBridgeRequest } from '@/lib/ai/resume-bridge-messages'

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

describe('resume bridge messages', () => {
  it('accepts valid bridge requests', () => {
    expect(
      isBridgeRequest({
        protocol: 'codequest-ai/v1',
        type: 'request',
        requestId: 'req-1',
        action: 'status',
      }),
    ).toBe(true)
  })

  it('rejects unknown message types', () => {
    expect(
      isBridgeRequest({
        protocol: 'codequest-ai/v1',
        type: 'event',
        requestId: 'req-1',
        action: 'status',
      }),
    ).toBe(false)
  })
})
