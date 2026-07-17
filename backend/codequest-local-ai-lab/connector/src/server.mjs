import http from 'node:http';
import { InputError, validatePromptGenerateRequest, validateTailorRequest } from './contracts.mjs';
import { OllamaClient, OllamaError } from './ollama-client.mjs';

export const CONNECTOR_VERSION = '0.1.0-lab';

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function corsHeaders(origin) {
  return origin
    ? {
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin',
      }
    : {};
}

async function readJson(request, maxBytes) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new InputError('Request body is too large', 'body');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new InputError('Request body must contain valid JSON', 'body');
  }
}

function isAuthorized(request, config) {
  return request.headers['x-codequest-connector-token'] === config.labToken;
}

export function createConnectorServer({ config, ollamaClient } = {}) {
  if (!config) throw new Error('Connector config is required');
  const ollama =
    ollamaClient ||
    new OllamaClient({
      baseUrl: config.ollamaBaseUrl,
      probeTimeoutMs: config.probeTimeoutMs,
      generationTimeoutMs: config.generationTimeoutMs,
    });

  return http.createServer(async (request, response) => {
    const origin = request.headers.origin;
    const originAllowed = !origin || config.allowedOrigins.includes(origin);
    const headers = corsHeaders(originAllowed ? origin : null);

    if (!originAllowed) {
      sendJson(response, 403, { error: 'origin_not_allowed' });
      return;
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        ...headers,
        'Access-Control-Allow-Headers': 'Content-Type, X-CodeQuest-Connector-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '600',
      });
      response.end();
      return;
    }

    const requestUrl = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);

    try {
      if (request.method === 'GET' && requestUrl.pathname === '/api/v1/status') {
        const status = await ollama.status();
        sendJson(
          response,
          200,
          {
            connector: {
              status: 'running',
              version: CONNECTOR_VERSION,
              bind: 'loopback-only',
            },
            ollama: {
              connected: status.connected,
              model_count: status.model_count,
              error_code: status.error_code,
            },
          },
          headers,
        );
        return;
      }

      if (!isAuthorized(request, config)) {
        sendJson(response, 401, { error: 'connector_token_required' }, headers);
        return;
      }

      if (request.method === 'GET' && requestUrl.pathname === '/api/v1/models') {
        const models = await ollama.listModels();
        sendJson(response, 200, { models }, headers);
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/resume/tailor') {
        const body = await readJson(request, config.maxRequestBytes);
        const validated = validateTailorRequest(body);
        const result = await ollama.tailor(validated);
        sendJson(response, 200, result, headers);
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/cover-letter/generate') {
        const body = await readJson(request, config.maxRequestBytes);
        const validated = validatePromptGenerateRequest(body);
        const result = await ollama.generateCoverLetter(validated);
        sendJson(response, 200, result, headers);
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/application-email/generate') {
        const body = await readJson(request, config.maxRequestBytes);
        const validated = validatePromptGenerateRequest(body);
        const result = await ollama.generateApplicationEmail(validated);
        sendJson(response, 200, result, headers);
        return;
      }

      sendJson(response, 404, { error: 'not_found' }, headers);
    } catch (error) {
      if (error instanceof InputError) {
        sendJson(
          response,
          error.status || 422,
          { error: 'invalid_request', field: error.field, message: error.message },
          headers,
        );
        return;
      }
      if (error instanceof OllamaError) {
        sendJson(response, error.status, { error: error.code, message: error.message }, headers);
        return;
      }
      console.error('[connector] request failed without logging request content', error);
      sendJson(response, 500, { error: 'connector_internal_error' }, headers);
    }
  });
}

