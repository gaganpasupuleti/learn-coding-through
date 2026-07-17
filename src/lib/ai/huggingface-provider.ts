import type { AIGenerationRequest, AIGenerationResponse, AIModel, AIProvider } from '@/lib/ai/types'
import { ProviderNotEnabledError } from '@/lib/ai/types'

export class HuggingFaceProvider implements AIProvider {
  readonly id = 'huggingface' as const

  async checkConnection(): Promise<boolean> {
    return false
  }

  async listModels(): Promise<AIModel[]> {
    return []
  }

  async generate(
    request: AIGenerationRequest,
    options?: { signal?: AbortSignal },
  ): Promise<AIGenerationResponse> {
    void request
    void options
    throw new ProviderNotEnabledError(this.id)
  }
}

export const huggingFaceProvider = new HuggingFaceProvider()
