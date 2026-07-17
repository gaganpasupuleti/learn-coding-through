import { describe, expect, it } from 'vitest'

import { resolveConnectorUrl } from '@/lib/connector-url'
import { isBridgeHello, isBridgeRequest } from '@/lib/ai/resume-bridge-messages'

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
  it('accepts valid bridge requests with session nonce', () => {
    expect(
      isBridgeRequest({
        protocol: 'codequest-ai/v1',
        type: 'request',
        requestId: 'req-1',
        sessionNonce: 'a'.repeat(32),
        action: 'status',
      }),
    ).toBe(true)
  })

  it('rejects requests missing session nonce', () => {
    expect(
      isBridgeRequest({
        protocol: 'codequest-ai/v1',
        type: 'request',
        requestId: 'req-1',
        action: 'status',
      }),
    ).toBe(false)
  })

  it('rejects unknown message types', () => {
    expect(
      isBridgeRequest({
        protocol: 'codequest-ai/v1',
        type: 'event',
        requestId: 'req-1',
        sessionNonce: 'a'.repeat(32),
        action: 'status',
      }),
    ).toBe(false)
  })

  it('accepts hello handshake', () => {
    expect(
      isBridgeHello({
        protocol: 'codequest-ai/v1',
        type: 'hello',
        sessionNonce: 'b'.repeat(32),
      }),
    ).toBe(true)
  })

  it('accepts Resume Matcher bridge actions', () => {
    expect(
      isBridgeRequest({
        protocol: 'codequest-ai/v1',
        type: 'request',
        requestId: 'req-2',
        sessionNonce: 'c'.repeat(32),
        action: 'analyze-job',
        payload: { jobDescription: 'x'.repeat(20) },
      }),
    ).toBe(true)
  })
})
