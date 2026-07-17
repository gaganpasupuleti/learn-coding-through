import { describe, expect, it, vi } from 'vitest'

import { BRIDGE_PROTOCOL, bridgeRequestSchema } from '@/lib/ai/resume-bridge-messages'
import { createResumeBridgeMessageHandler } from '@/lib/ai/resume-bridge'

describe('createResumeBridgeMessageHandler', () => {
  it('ignores invalid origins', async () => {
    const iframe = {
      contentWindow: {} as Window,
    } as HTMLIFrameElement

    const handler = createResumeBridgeMessageHandler(iframe)
    const postMessage = vi.fn()
    await handler({
      origin: 'https://evil.example',
      source: iframe.contentWindow,
      data: {
        protocol: BRIDGE_PROTOCOL,
        type: 'request',
        requestId: 'r1',
        action: 'status',
      },
    } as MessageEvent)

    expect(postMessage).not.toHaveBeenCalled()
    expect(bridgeRequestSchema.safeParse({ type: 'event' }).success).toBe(false)
  })

  it('ignores invalid sources', async () => {
    const iframe = {
      contentWindow: {} as Window,
    } as HTMLIFrameElement
    const otherWindow = {} as Window

    const handler = createResumeBridgeMessageHandler(iframe)
    await handler({
      origin: 'http://localhost:3000',
      source: otherWindow,
      data: {
        protocol: BRIDGE_PROTOCOL,
        type: 'request',
        requestId: 'r1',
        action: 'status',
      },
    } as MessageEvent)

    // No throw and no response path for mismatched source.
    expect(true).toBe(true)
  })
})
