import { tailorResume, fetchConnectorModels, fetchConnectorStatus } from '@/lib/ai/connector-client'
import type {
  AIGenerationRequest,
  AIGenerationResponse,
  AIModel,
  AIProvider,
} from '@/lib/ai/types'

const MODEL_STORAGE_KEY = 'codequest-local-selected-model'

function taskToJobDescription(task: AIGenerationRequest['task'], prompt: string): string {
  switch (task) {
    case 'resume-improvement':
      return `Improve this resume section for clarity, impact, and ATS readability. Focus: ${prompt}`
    case 'job-match-analysis':
      return prompt
    case 'ats-explanation':
      return `Explain these ATS findings and suggest targeted improvements. Context: ${prompt}`
    case 'cover-letter':
      return `Draft a concise cover letter aligned to this role and resume context. Details: ${prompt}`
    case 'code-help':
      return `Provide concise career or resume guidance. Question: ${prompt}`
    default: {
      const exhaustive: never = task
      return exhaustive
    }
  }
}

export class CodeQuestLocalProvider implements AIProvider {
  readonly id = 'codequest-local' as const

  async checkConnection(): Promise<boolean> {
    try {
      const status = await fetchConnectorStatus()
      return status.connector.status === 'running'
    } catch {
      return false
    }
  }

  async listModels(): Promise<AIModel[]> {
    const models = await fetchConnectorModels()
    return models
      .filter((model) => model.model.trim().length > 0)
      .map((model) => ({
        id: model.model,
        name: model.name || model.model,
        provider: this.id,
        size: model.size_bytes ?? undefined,
      }))
  }

  async generate(
    request: AIGenerationRequest,
    options?: { signal?: AbortSignal },
  ): Promise<AIGenerationResponse> {
    const resumeText =
      typeof request.context?.resumeText === 'string' ? request.context.resumeText : request.prompt
    const model =
      request.model ||
      readSelectedModel() ||
      (await this.listModels())[0]?.id

    if (!model) {
      throw new Error('No local Ollama model is installed. Run: ollama pull <model-name>')
    }

    const result = await tailorResume(
      {
        model,
        resumeText,
        jobDescription: taskToJobDescription(request.task, request.prompt),
      },
      options,
    )

    return {
      text: JSON.stringify(result.result),
      model: result.meta.model,
      provider: this.id,
      durationMs: result.meta.duration_ms,
    }
  }
}

export function readSelectedModel(): string | null {
  try {
    return localStorage.getItem(MODEL_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeSelectedModel(modelId: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, modelId)
  } catch {
    // ponytail: localStorage may be unavailable in restricted contexts
  }
}

export const codeQuestLocalProvider = new CodeQuestLocalProvider()
