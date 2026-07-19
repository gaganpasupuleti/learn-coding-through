export type AIProviderId = 'codequest-local' | 'huggingface'

export interface AIModel {
  id: string
  name: string
  provider: AIProviderId
  size?: number
  capabilities?: string[]
}

export type AIGenerationTask =
  | 'resume-improvement'
  | 'job-match-analysis'
  | 'ats-explanation'
  | 'cover-letter'
  | 'code-help'

export interface AIGenerationRequest {
  task: AIGenerationTask
  prompt: string
  model?: string
  context?: Record<string, unknown>
}

export interface AIGenerationResponse {
  text: string
  model: string
  provider: AIProviderId
  durationMs?: number
}

export interface AIProvider {
  id: AIProviderId
  checkConnection(): Promise<boolean>
  listModels(): Promise<AIModel[]>
  generate(
    request: AIGenerationRequest,
    options?: { signal?: AbortSignal },
  ): Promise<AIGenerationResponse>
}

export class ProviderNotEnabledError extends Error {
  constructor(provider: AIProviderId) {
    super(`${provider} is not enabled`)
    this.name = 'ProviderNotEnabledError'
  }
}
