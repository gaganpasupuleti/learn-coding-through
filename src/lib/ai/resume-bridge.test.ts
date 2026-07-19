import { describe, expect, it, vi } from 'vitest'

import { BRIDGE_PROTOCOL, bridgeRequestSchema } from '@/lib/ai/resume-bridge-messages'
import { createResumeBridgeMessageHandler } from '@/lib/ai/resume-bridge'

const NONCE = 'a'.repeat(32)

describe('createResumeBridgeMessageHandler', () => {
  it('ignores invalid origins', async () => {
    const postMessage = vi.fn()
    const contentWindow = { postMessage } as unknown as Window
    const iframe = { contentWindow } as HTMLIFrameElement

    const handler = createResumeBridgeMessageHandler(iframe, NONCE)
    await handler({
      origin: 'https://evil.example',
      source: contentWindow,
      data: {
        protocol: BRIDGE_PROTOCOL,
        type: 'request',
        requestId: 'r1',
        sessionNonce: NONCE,
        action: 'status',
      },
    } as MessageEvent)

    expect(postMessage).not.toHaveBeenCalled()
    expect(bridgeRequestSchema.safeParse({ type: 'event' }).success).toBe(false)
  })

  it('ignores invalid sources', async () => {
    const postMessage = vi.fn()
    const contentWindow = { postMessage } as unknown as Window
    const iframe = { contentWindow } as HTMLIFrameElement
    const otherWindow = {} as Window

    const handler = createResumeBridgeMessageHandler(iframe, NONCE)
    await handler({
      origin: 'http://localhost:3000',
      source: otherWindow,
      data: {
        protocol: BRIDGE_PROTOCOL,
        type: 'request',
        requestId: 'r1',
        sessionNonce: NONCE,
        action: 'status',
      },
    } as MessageEvent)

    expect(postMessage).not.toHaveBeenCalled()
  })

  it('ignores forged session nonce', async () => {
    const postMessage = vi.fn()
    const contentWindow = { postMessage } as unknown as Window
    const iframe = { contentWindow } as HTMLIFrameElement

    const handler = createResumeBridgeMessageHandler(iframe, NONCE)
    await handler({
      origin: 'http://localhost:3000',
      source: contentWindow,
      data: {
        protocol: BRIDGE_PROTOCOL,
        type: 'request',
        requestId: 'r1',
        sessionNonce: 'b'.repeat(32),
        action: 'status',
      },
    } as MessageEvent)

    expect(postMessage).not.toHaveBeenCalled()
  })
})
