/**
 * Legacy Code Quest ↔ iframe postMessage bridge (codequest-ai/v1).
 * Detached from ResumeBuilderWorkspacePage after Reactive Resume retirement —
 * Resume Matcher owns AI in-app. Kept for unit tests / possible future embed client.
 */
import { z } from 'zod'

import { codeQuestLocalProvider } from '@/lib/ai/codequest-local-provider'
import { tailorResultSchema } from '@/lib/ai/connector-schemas'
import {
  fetchConnectorModels,
  fetchConnectorStatus,
  generateApplicationEmailViaConnector,
  generateCoverLetterViaConnector,
  tailorResume,
} from '@/lib/ai/connector-client'
import {
  BRIDGE_PROTOCOL,
  bridgeRequestSchema,
  isBridgeHelloRequest,
  type BridgeHello,
  type BridgeRequest,
  type BridgeResponse,
} from '@/lib/ai/resume-bridge-messages'
import type { AIGenerationRequest } from '@/lib/ai/types'
import { resolveResumeAppUrl } from '@/lib/resume-app-url'
import {
  analyzeJobViaMatcher,
  matchResumeViaMatcher,
  parseResumeViaMatcher,
  prepareApplicationEmailPrompt,
  prepareCoverLetterPrompt,
} from '@/lib/resume-matcher-api'

const pendingRequests = new Map<
  string,
  { abortController: AbortController; timeoutId: number }
>()
const completedRequestIds = new Set<string>()

function createSessionNonce(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function getAllowedChildOrigin(): string | null {
  const resolved = resolveResumeAppUrl()
  if (!resolved.ok) return null
  try {
    return new URL(resolved.url).origin
  } catch {
    return null
  }
}

function postResponse(
  source: MessageEventSource | null,
  targetOrigin: string,
  response: BridgeResponse,
): void {
  if (!source || !('postMessage' in source) || typeof source.postMessage !== 'function') return
  source.postMessage(response, targetOrigin)
}

function withNonce(request: BridgeRequest, partial: Omit<BridgeResponse, 'protocol' | 'type' | 'sessionNonce'>): BridgeResponse {
  return {
    protocol: BRIDGE_PROTOCOL,
    type: 'response',
    sessionNonce: request.sessionNonce,
    ...partial,
  }
}

async function handleBridgeRequest(
  request: BridgeRequest,
  signal: AbortSignal,
): Promise<BridgeResponse> {
  try {
    switch (request.action) {
      case 'status': {
        const data = await fetchConnectorStatus(signal)
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'list-models': {
        const models = await fetchConnectorModels(signal)
        return withNonce(request, {
          requestId: request.requestId,
          ok: true,
          data: { models },
        })
      }
      case 'tailor': {
        const payload = z
          .object({
            model: z.string().min(1),
            resumeText: z.string().min(20),
            jobDescription: z.string().min(20),
          })
          .parse(request.payload)
        const data = await tailorResume(
          {
            model: payload.model,
            resumeText: payload.resumeText,
            jobDescription: payload.jobDescription,
          },
          { signal },
        )
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'generate': {
        const payload = z
          .object({
            task: z.enum([
              'resume-improvement',
              'job-match-analysis',
              'ats-explanation',
              'cover-letter',
              'code-help',
            ]),
            prompt: z.string().min(1),
            model: z.string().optional(),
            context: z.record(z.unknown()).optional(),
          })
          .parse(request.payload) satisfies AIGenerationRequest
        const data = await codeQuestLocalProvider.generate(payload, { signal })
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'parse-resume': {
        const payload = z
          .object({
            filename: z.string().min(1).max(180),
            contentBase64: z.string().min(1).max(12_000_000),
            contentType: z.string().min(3).max(120),
          })
          .parse(request.payload)
        const data = await parseResumeViaMatcher(payload, signal)
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'analyze-job': {
        const payload = z
          .object({
            resume: z.record(z.unknown()),
            jobDescription: z.string().min(20).max(30000),
            resumeText: z.string().max(50000).optional(),
          })
          .parse(request.payload)
        const data = await analyzeJobViaMatcher(payload, signal)
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'match-resume': {
        const payload = z
          .object({
            resume: z.record(z.unknown()),
            jobDescription: z.string().min(20).max(30000).optional(),
            jobKeywords: z.record(z.unknown()).optional(),
          })
          .parse(request.payload)
        const data = await matchResumeViaMatcher(payload, signal)
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'prepare-cover-letter': {
        const payload = z
          .object({
            resume: z.record(z.unknown()),
            jobDescription: z.string().min(20).max(30000),
          })
          .parse(request.payload)
        const data = await prepareCoverLetterPrompt(payload, signal)
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'prepare-application-email': {
        const payload = z
          .object({
            resume: z.record(z.unknown()),
            jobDescription: z.string().min(20).max(30000),
          })
          .parse(request.payload)
        const data = await prepareApplicationEmailPrompt(payload, signal)
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'generate-cover-letter': {
        const payload = z
          .object({
            model: z.string().min(1),
            systemPrompt: z.string().min(10),
            userPrompt: z.string().min(20),
          })
          .parse(request.payload)
        const data = await generateCoverLetterViaConnector(payload, { signal })
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'generate-application-email': {
        const payload = z
          .object({
            model: z.string().min(1),
            systemPrompt: z.string().min(10),
            userPrompt: z.string().min(20),
          })
          .parse(request.payload)
        const data = await generateApplicationEmailViaConnector(payload, { signal })
        return withNonce(request, { requestId: request.requestId, ok: true, data })
      }
      case 'cancel': {
        const targetId =
          typeof request.payload?.targetRequestId === 'string'
            ? request.payload.targetRequestId
            : request.requestId
        const entry = pendingRequests.get(targetId)
        entry?.abortController.abort()
        return withNonce(request, {
          requestId: request.requestId,
          ok: true,
          data: { cancelled: true },
        })
      }
      default: {
        const exhaustive: never = request.action
        return exhaustive
      }
    }
  } catch (error) {
    return withNonce(request, {
      requestId: request.requestId,
      ok: false,
      error: error instanceof Error ? error.message : 'Bridge request failed',
    })
  }
}

export function createResumeBridgeMessageHandler(
  iframe: HTMLIFrameElement | null,
  sessionNonce: string,
) {
  return async (event: MessageEvent) => {
    const allowedOrigin = getAllowedChildOrigin()
    if (!allowedOrigin || event.origin !== allowedOrigin) return
    if (!iframe?.contentWindow || event.source !== iframe.contentWindow) return

    const parsed = bridgeRequestSchema.safeParse(event.data)
    if (!parsed.success) return

    const request = parsed.data
    if (request.sessionNonce !== sessionNonce) return
    if (completedRequestIds.has(request.requestId) && request.action !== 'cancel') {
      postResponse(
        event.source,
        allowedOrigin,
        withNonce(request, {
          requestId: request.requestId,
          ok: false,
          error: 'duplicate_request',
        }),
      )
      return
    }

    if (request.action === 'cancel') {
      const response = await handleBridgeRequest(request, new AbortController().signal)
      postResponse(event.source, allowedOrigin, response)
      return
    }

    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => abortController.abort(), 180_000)
    pendingRequests.set(request.requestId, { abortController, timeoutId })

    try {
      const response = await handleBridgeRequest(request, abortController.signal)
      if (response.ok && request.action === 'tailor') {
        tailorResultSchema.parse(response.data)
      }
      completedRequestIds.add(request.requestId)
      if (completedRequestIds.size > 500) {
        completedRequestIds.clear()
      }
      postResponse(event.source, allowedOrigin, response)
    } finally {
      window.clearTimeout(timeoutId)
      pendingRequests.delete(request.requestId)
    }
  }
}

export function attachResumeBridge(iframe: HTMLIFrameElement | null): () => void {
  const sessionNonce = createSessionNonce()
  const requestHandler = createResumeBridgeMessageHandler(iframe, sessionNonce)
  const allowedOrigin = getAllowedChildOrigin()
  const attachedAt = performance.now()
  let helloCount = 0

  const postHello = (reason: 'iframe-load' | 'hello-request') => {
    if (!iframe?.contentWindow || !allowedOrigin) {
      console.warn('[cq-bridge] parent skip hello', { reason, allowedOrigin, hasWindow: Boolean(iframe?.contentWindow) })
      return
    }
    helloCount += 1
    const hello: BridgeHello = {
      protocol: BRIDGE_PROTOCOL,
      type: 'hello',
      sessionNonce,
    }
    console.info('[cq-bridge] parent → hello', {
      reason,
      n: helloCount,
      ms: Math.round(performance.now() - attachedAt),
      childOrigin: allowedOrigin,
      nonce: `${sessionNonce.slice(0, 8)}…`,
    })
    iframe.contentWindow.postMessage(hello, allowedOrigin)
  }

  const handler = (event: MessageEvent) => {
    if (!allowedOrigin || event.origin !== allowedOrigin) return
    if (!iframe?.contentWindow || event.source !== iframe.contentWindow) return
    // Local AI panel mounts after iframe load and often misses the first hello.
    if (isBridgeHelloRequest(event.data)) {
      console.info('[cq-bridge] parent ← hello-request', {
        ms: Math.round(performance.now() - attachedAt),
        from: event.origin,
      })
      postHello('hello-request')
      return
    }
    const started = performance.now()
    const action =
      event.data && typeof event.data === 'object' && 'action' in event.data
        ? String((event.data as { action?: unknown }).action)
        : '?'
    void Promise.resolve(requestHandler(event)).finally(() => {
      console.info('[cq-bridge] parent handled request', {
        action,
        ms: Math.round(performance.now() - started),
      })
    })
  }

  window.addEventListener('message', handler)
  console.info('[cq-bridge] parent attached', { childOrigin: allowedOrigin, ms: 0 })
  postHello('iframe-load')

  return () => {
    console.info('[cq-bridge] parent detached', {
      hellos: helloCount,
      liveMs: Math.round(performance.now() - attachedAt),
    })
    window.removeEventListener('message', handler)
  }
}
