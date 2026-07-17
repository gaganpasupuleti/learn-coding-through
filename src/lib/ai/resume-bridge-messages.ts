import { z } from 'zod'

export const BRIDGE_PROTOCOL = 'codequest-ai/v1' as const

export const bridgeRequestSchema = z.object({
  protocol: z.literal(BRIDGE_PROTOCOL),
  type: z.literal('request'),
  requestId: z.string().min(1),
  action: z.enum([
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
  ]),
  payload: z.record(z.unknown()).optional(),
})

export const bridgeResponseSchema = z.object({
  protocol: z.literal(BRIDGE_PROTOCOL),
  type: z.literal('response'),
  requestId: z.string().min(1),
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
})

export type BridgeRequest = z.infer<typeof bridgeRequestSchema>
export type BridgeResponse = z.infer<typeof bridgeResponseSchema>

export function isBridgeRequest(value: unknown): value is BridgeRequest {
  return bridgeRequestSchema.safeParse(value).success
}

export function isBridgeResponse(value: unknown): value is BridgeResponse {
  return bridgeResponseSchema.safeParse(value).success
}
