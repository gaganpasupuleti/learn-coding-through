import { z } from 'zod'

export const connectorStatusSchema = z.object({
  connector: z.object({
    status: z.string(),
    version: z.string(),
    bind: z.string(),
  }),
  pairing: z
    .object({
      state: z.enum(['paired', 'unpaired']),
      pairing_required: z.boolean().optional(),
      code_expires_at: z.string().optional(),
    })
    .optional(),
  ollama: z.object({
    connected: z.boolean(),
    model_count: z.number(),
    error_code: z.string().nullable().optional(),
  }),
})

export const connectorModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  modified_at: z.string().nullable().optional(),
  size_bytes: z.number().nullable().optional(),
  parameter_size: z.string().nullable().optional(),
  quantization_level: z.string().nullable().optional(),
})

export const connectorModelsSchema = z.object({
  models: z.array(connectorModelSchema),
})

export const tailorSuggestionSchema = z.object({
  id: z.string(),
  section: z.enum(['summary', 'experience', 'projects', 'skills']),
  original: z.string(),
  suggested: z.string(),
  reason: z.string(),
  evidence: z.array(z.string()),
  confidence: z.number(),
  evidence_verified: z.boolean().optional(),
})

export const tailorResultSchema = z.object({
  result: z.object({
    summary: z.string(),
    matched_keywords: z.array(z.string()),
    missing_keywords: z.array(z.string()),
    suggestions: z.array(tailorSuggestionSchema),
    warnings: z.array(z.string()),
  }),
  meta: z.object({
    provider: z.string(),
    model: z.string(),
    local_only: z.boolean(),
    duration_ms: z.number(),
    prompt_tokens: z.number().nullable().optional(),
    output_tokens: z.number().nullable().optional(),
  }),
})

export type ConnectorStatus = z.infer<typeof connectorStatusSchema>
export type ConnectorModel = z.infer<typeof connectorModelSchema>
export type TailorResult = z.infer<typeof tailorResultSchema>
