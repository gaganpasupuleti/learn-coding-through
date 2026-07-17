import http from 'node:http';
import { InputError, validatePromptGenerateRequest, validateTailorRequest } from './contracts.mjs';
import { OllamaClient, OllamaError } from './ollama-client.mjs';
import { createPairingStore } from './pairing.mjs';

export const CONNECTOR_VERSION = '0.2.0-lab';

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

function extractBearer(request) {
  const header = request.headers['x-codequest-connector-token'];
  if (typeof header === 'string' && header.trim()) return header.trim();
  const auth = request.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

export function createConnectorServer({ config, ollamaClient, pairingStore } = {}) {
  if (!config) throw new Error('Connector config is required');
  const pairing = pairingStore || createPairingStore({ storePath: config.pairingStorePath });
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
    // Disallowed origins get no permissive CORS header.
    const headers = originAllowed && origin ? corsHeaders(origin) : {};

    if (!originAllowed) {
      sendJson(response, 403, { error: 'origin_not_allowed' });
      return;
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        ...headers,
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-CodeQuest-Connector-Token',
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
        const pairingStatus = pairing.publicStatus();
        sendJson(
          response,
          200,
          {
            connector: {
              status: 'running',
              version: CONNECTOR_VERSION,
              bind: 'loopback-only',
            },
            pairing: pairingStatus,
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

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/pair') {
        const body = await readJson(request, 4096);
        const result = pairing.pairWithCode(body?.code);
        if (!result.ok) {
          sendJson(response, 401, { error: result.error }, headers);
          return;
        }
        sendJson(
          response,
          200,
          {
            paired: true,
            token: result.token,
            token_type: 'bearer',
          },
          headers,
        );
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/pair/regenerate') {
        // Local-only helper so an unpaired laptop can mint a fresh console code.
        // Requires no bearer (device is unpaired) but still exact-origin CORS.
        const status = pairing.publicStatus();
        if (status.state === 'paired') {
          sendJson(response, 409, { error: 'already_paired' }, headers);
          return;
        }
        const next = pairing.regeneratePairingCode();
        sendJson(
          response,
          200,
          {
            regenerated: true,
            code_expires_at: next.expiresAt
              ? new Date(next.expiresAt).toISOString()
              : null,
            // Code is only returned when CQ_CONNECTOR_EXPOSE_PAIRING_CODE=true (local CLI/tests).
            code:
              process.env.CQ_CONNECTOR_EXPOSE_PAIRING_CODE === 'true' ? next.code : undefined,
          },
          headers,
        );
        return;
      }

      const token = extractBearer(request);
      if (!pairing.authorizeToken(token)) {
        // Legacy lab token rejected unless explicit test override is set.
        const legacy =
          process.env.CQ_ALLOW_LEGACY_LAB_TOKEN === 'true' &&
          config.labToken &&
          token === config.labToken;
        if (!legacy) {
          sendJson(
            response,
            401,
            {
              error: pairing.publicStatus().state === 'paired' ? 'invalid_token' : 'pairing_required',
            },
            headers,
          );
          return;
        }
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/pair/revoke') {
        pairing.revoke();
        pairing.ensurePairingCode();
        sendJson(response, 200, { revoked: true }, headers);
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/v1/pair/rotate') {
        const rotated = pairing.rotate(token);
        if (!rotated.ok) {
          sendJson(response, 401, { error: 'invalid_token' }, headers);
          return;
        }
        sendJson(
          response,
          200,
          { rotated: true, token: rotated.token, token_type: 'bearer' },
          headers,
        );
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
      console.error('[connector] request failed without logging request content');
      sendJson(response, 500, { error: 'connector_internal_error' }, headers);
    }
  });
}

export function printPairingBanner(pairing) {
  const status = pairing.publicStatus();
  if (status.state === 'paired') {
    console.log('[connector] device pairing: paired (bearer token stored as hash only)');
    return;
  }
  const boot = pairing.ensurePairingCode();
  if (boot.code) {
    console.log('[connector] device pairing required');
    console.log(
      `[connector] enter this one-time code in CodeQuest Resume Lab (expires in 5 minutes): ${boot.code}`,
    );
  } else {
    // Code already pending but not re-displayed (single console reveal per generation).
    const fresh = pairing.regeneratePairingCode();
    console.log('[connector] device pairing required');
    console.log(
      `[connector] enter this one-time code in CodeQuest Resume Lab (expires in 5 minutes): ${fresh.code}`,
    );
  }
}
