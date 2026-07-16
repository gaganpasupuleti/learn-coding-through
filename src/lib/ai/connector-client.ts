import {
  connectorModelsSchema,
  connectorStatusSchema,
  tailorResultSchema,
  type ConnectorModel,
  type ConnectorStatus,
  type TailorResult,
} from '@/lib/ai/connector-schemas'
import { readConnectorToken, resolveConnectorUrl } from '@/lib/connector-url'

const DEFAULT_TIMEOUT_MS = 30_000
const GENERATION_TIMEOUT_MS = 180_000

export class ConnectorRequestError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ConnectorRequestError'
    this.status = status
    this.code = code
  }
}

function getConnectorBaseUrl(): string {
  const resolved = resolveConnectorUrl()
  if (!resolved.ok) {
    throw new ConnectorRequestError(resolved.error, 0, 'invalid_connector_url')
  }
  return resolved.url
}

async function connectorFetch<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    auth?: boolean
    signal?: AbortSignal
    timeoutMs?: number
    schema: { parse: (value: unknown) => T }
  },
): Promise<T> {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  options.signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }
    if (options.auth) {
      headers['X-CodeQuest-Connector-Token'] = readConnectorToken()
    }

    const response = await fetch(`${getConnectorBaseUrl()}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    })

    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const errorPayload = payload as { error?: string; message?: string } | null
      throw new ConnectorRequestError(
        errorPayload?.message ?? errorPayload?.error ?? `Connector request failed (${response.status})`,
        response.status,
        errorPayload?.error,
      )
    }

    return options.schema.parse(payload)
  } catch (error) {
    if (error instanceof ConnectorRequestError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ConnectorRequestError('Connector request was cancelled or timed out', 408, 'timeout')
    }
    throw new ConnectorRequestError('Connector is unavailable on this laptop', 503, 'connector_unavailable')
  } finally {
    window.clearTimeout(timeoutId)
    options.signal?.removeEventListener('abort', onAbort)
  }
}

export async function fetchConnectorStatus(signal?: AbortSignal): Promise<ConnectorStatus> {
  return connectorFetch('/api/v1/status', {
    signal,
    schema: connectorStatusSchema,
  })
}

export async function fetchConnectorModels(signal?: AbortSignal): Promise<ConnectorModel[]> {
  const payload = await connectorFetch('/api/v1/models', {
    auth: true,
    signal,
    schema: connectorModelsSchema,
  })
  return payload.models
}

export async function tailorResume(
  input: { model: string; resumeText: string; jobDescription: string },
  options?: { signal?: AbortSignal },
): Promise<TailorResult> {
  return connectorFetch('/api/v1/resume/tailor', {
    method: 'POST',
    auth: true,
    body: {
      model: input.model,
      resume_text: input.resumeText,
      job_description: input.jobDescription,
    },
    signal: options?.signal,
    timeoutMs: GENERATION_TIMEOUT_MS,
    schema: tailorResultSchema,
  })
}
