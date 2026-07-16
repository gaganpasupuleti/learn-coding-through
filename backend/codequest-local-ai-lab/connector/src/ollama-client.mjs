import {
  TAILOR_RESULT_SCHEMA,
  addEvidenceFlags,
  validateTailorResult,
} from './contracts.mjs';
import { buildTailorMessages } from './prompt.mjs';

export class OllamaError extends Error {
  constructor(message, code = 'ollama_error', status = 502) {
    super(message);
    this.name = 'OllamaError';
    this.code = code;
    this.status = status;
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!response.ok) {
    let message = `Ollama request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || message;
    } catch {
      // Do not return raw upstream content.
    }
    throw new OllamaError(message, 'ollama_request_failed', 502);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new OllamaError('Ollama returned malformed JSON', 'ollama_malformed_response', 502);
  }
}

export class OllamaClient {
  constructor({ baseUrl, probeTimeoutMs, generationTimeoutMs, fetchImpl = fetch }) {
    this.baseUrl = baseUrl;
    this.probeTimeoutMs = probeTimeoutMs;
    this.generationTimeoutMs = generationTimeoutMs;
    this.fetchImpl = fetchImpl;
  }

  async #request(path, options = {}, timeoutMs = this.probeTimeoutMs) {
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      return await parseJsonResponse(response);
    } catch (error) {
      if (error instanceof OllamaError) throw error;
      const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      throw new OllamaError(
        timedOut ? 'Ollama connection timed out' : 'Ollama is not reachable on this laptop',
        timedOut ? 'ollama_timeout' : 'ollama_unavailable',
        503,
      );
    }
  }

  async listModels() {
    const payload = await this.#request('/api/tags');
    const models = Array.isArray(payload.models) ? payload.models : [];
    return models.map((item) => ({
      name: String(item.name || item.model || ''),
      model: String(item.model || item.name || ''),
      modified_at: item.modified_at || null,
      size_bytes: Number.isFinite(item.size) ? item.size : null,
      parameter_size: item.details?.parameter_size || null,
      quantization_level: item.details?.quantization_level || null,
    }));
  }

  async status() {
    try {
      const models = await this.listModels();
      return {
        connected: true,
        model_count: models.length,
        models,
        error_code: null,
      };
    } catch (error) {
      if (!(error instanceof OllamaError)) throw error;
      return {
        connected: false,
        model_count: 0,
        models: [],
        error_code: error.code,
      };
    }
  }

  async tailor(request) {
    const startedAt = performance.now();
    const payload = await this.#request(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({
          model: request.model,
          messages: buildTailorMessages(request),
          stream: false,
          format: TAILOR_RESULT_SCHEMA,
          options: { temperature: 0.1 },
        }),
      },
      this.generationTimeoutMs,
    );

    const content = payload.message?.content;
    let parsed;
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      throw new OllamaError(
        'The local model did not return valid structured output',
        'model_output_invalid',
        502,
      );
    }

    let validated;
    try {
      validated = validateTailorResult(parsed);
    } catch {
      throw new OllamaError(
        'The local model output did not match the resume schema',
        'model_schema_invalid',
        502,
      );
    }

    return {
      result: addEvidenceFlags(validated, request.resumeText),
      meta: {
        provider: 'ollama',
        model: request.model,
        local_only: true,
        duration_ms: Math.round(performance.now() - startedAt),
        prompt_tokens: payload.prompt_eval_count ?? null,
        output_tokens: payload.eval_count ?? null,
      },
    };
  }
}

