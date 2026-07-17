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

async function handleBridgeRequest(
  request: BridgeRequest,
  signal: AbortSignal,
): Promise<BridgeResponse> {
  try {
    switch (request.action) {
      case 'status': {
        const data = await fetchConnectorStatus(signal)
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
      }
      case 'list-models': {
        const models = await fetchConnectorModels(signal)
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data: { models },
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
      }
      case 'prepare-cover-letter': {
        const payload = z
          .object({
            resume: z.record(z.unknown()),
            jobDescription: z.string().min(20).max(30000),
          })
          .parse(request.payload)
        const data = await prepareCoverLetterPrompt(payload, signal)
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
      }
      case 'prepare-application-email': {
        const payload = z
          .object({
            resume: z.record(z.unknown()),
            jobDescription: z.string().min(20).max(30000),
          })
          .parse(request.payload)
        const data = await prepareApplicationEmailPrompt(payload, signal)
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
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
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data,
        }
      }
      case 'cancel': {
        const entry = pendingRequests.get(request.requestId)
        entry?.abortController.abort()
        return {
          protocol: BRIDGE_PROTOCOL,
          type: 'response',
          requestId: request.requestId,
          ok: true,
          data: { cancelled: true },
        }
      }
      default: {
        const exhaustive: never = request.action
        return exhaustive
      }
    }
  } catch (error) {
    return {
      protocol: BRIDGE_PROTOCOL,
      type: 'response',
      requestId: request.requestId,
      ok: false,
      error: error instanceof Error ? error.message : 'Bridge request failed',
    }
  }
}

export function createResumeBridgeMessageHandler(iframe: HTMLIFrameElement | null) {
  return async (event: MessageEvent) => {
    const allowedOrigin = getAllowedChildOrigin()
    if (!allowedOrigin || event.origin !== allowedOrigin) return
    if (!iframe?.contentWindow || event.source !== iframe.contentWindow) return

    const parsed = bridgeRequestSchema.safeParse(event.data)
    if (!parsed.success) return

    const request = parsed.data
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
      postResponse(event.source, allowedOrigin, response)
    } finally {
      window.clearTimeout(timeoutId)
      pendingRequests.delete(request.requestId)
    }
  }
}

export function attachResumeBridge(iframe: HTMLIFrameElement | null): () => void {
  const handler = createResumeBridgeMessageHandler(iframe)
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
