import { z } from 'zod'

export const BRIDGE_PROTOCOL = 'codequest-ai/v1' as const

export const bridgeActionSchema = z.enum([
  'status',
  'list-models',
  'generate',
  'tailor',
  'cancel',
  'parse-resume',
  'analyze-job',
  'match-resume',
  'prepare-cover-letter',
  'prepare-application-email',
  'generate-cover-letter',
  'generate-application-email',
])

export const bridgeRequestSchema = z.object({
  protocol: z.literal(BRIDGE_PROTOCOL),
  type: z.literal('request'),
  requestId: z.string().min(1).max(128),
  sessionNonce: z.string().min(16).max(128),
  action: bridgeActionSchema,
  payload: z.record(z.unknown()).optional(),
})

export const bridgeResponseSchema = z.object({
  protocol: z.literal(BRIDGE_PROTOCOL),
  type: z.literal('response'),
  requestId: z.string().min(1).max(128),
  sessionNonce: z.string().min(16).max(128),
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
})

export const bridgeHelloSchema = z.object({
  protocol: z.literal(BRIDGE_PROTOCOL),
  type: z.literal('hello'),
  sessionNonce: z.string().min(16).max(128),
})

/** Child asks parent to (re)send hello — Local AI mounts after iframe load. */
export const bridgeHelloRequestSchema = z.object({
  protocol: z.literal(BRIDGE_PROTOCOL),
  type: z.literal('hello-request'),
})

export type BridgeRequest = z.infer<typeof bridgeRequestSchema>
export type BridgeResponse = z.infer<typeof bridgeResponseSchema>
export type BridgeHello = z.infer<typeof bridgeHelloSchema>
export type BridgeHelloRequest = z.infer<typeof bridgeHelloRequestSchema>

export function isBridgeRequest(value: unknown): value is BridgeRequest {
  return bridgeRequestSchema.safeParse(value).success
}

export function isBridgeResponse(value: unknown): value is BridgeResponse {
  return bridgeResponseSchema.safeParse(value).success
}

export function isBridgeHello(value: unknown): value is BridgeHello {
  return bridgeHelloSchema.safeParse(value).success
}

export function isBridgeHelloRequest(value: unknown): value is BridgeHelloRequest {
  return bridgeHelloRequestSchema.safeParse(value).success
}
