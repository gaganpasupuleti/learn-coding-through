import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { getConfig } from '../src/config.mjs';
import { createPairingStore } from '../src/pairing.mjs';
import { createConnectorServer } from '../src/server.mjs';
import { createMockOllamaServer } from '../../mock-ollama/src/server.mjs';

const allowedOrigin = 'http://127.0.0.1:5173';
const testBearer = 'test-bearer-token-for-connector-suite';
let mockServer;
let connectorServer;
let connectorUrl;
let storePath;

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address()));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function connectorFetch(path, options = {}) {
  return fetch(`${connectorUrl}${path}`, {
    ...options,
    headers: {
      Origin: allowedOrigin,
      'X-CodeQuest-Connector-Token': testBearer,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
}

before(async () => {
  storePath = path.join(os.tmpdir(), `cq-connector-${process.pid}.json`);
  try {
    fs.unlinkSync(storePath);
  } catch {
    /* ignore */
  }
  process.env.CQ_TEST_BEARER_TOKEN = testBearer;

  mockServer = createMockOllamaServer();
  const mockAddress = await listen(mockServer);
  const pairing = createPairingStore({ storePath });
  connectorServer = createConnectorServer({
    config: getConfig({
      port: 0,
      allowedOrigins: [allowedOrigin],
      labToken: '',
      pairingStorePath: storePath,
      ollamaBaseUrl: `http://127.0.0.1:${mockAddress.port}`,
      probeTimeoutMs: 1000,
      generationTimeoutMs: 2000,
    }),
    pairingStore: pairing,
  });
  const connectorAddress = await listen(connectorServer);
  connectorUrl = `http://127.0.0.1:${connectorAddress.port}`;
});

after(async () => {
  await close(connectorServer);
  await close(mockServer);
  delete process.env.CQ_TEST_BEARER_TOKEN;
  try {
    fs.unlinkSync(storePath);
  } catch {
    /* ignore */
  }
});

test('reports connector and Ollama status without authentication', async () => {
  const response = await fetch(`${connectorUrl}/api/v1/status`, {
    headers: { Origin: allowedOrigin },
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.connector.status, 'running');
  assert.equal(body.connector.bind, 'loopback-only');
  assert.equal(body.ollama.connected, true);
  assert.equal(body.ollama.model_count, 1);
  assert.equal(body.pairing.state, 'paired');
});

test('rejects browser origins outside the allowlist', async () => {
  const response = await fetch(`${connectorUrl}/api/v1/status`, {
    headers: { Origin: 'https://malicious.example' },
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, 'origin_not_allowed');
});

test('requires the connector token for model data', async () => {
  const response = await fetch(`${connectorUrl}/api/v1/models`, {
    headers: { Origin: allowedOrigin },
  });
  assert.equal(response.status, 401);
});

test('lists the model exposed by Ollama', async () => {
  const response = await connectorFetch('/api/v1/models');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.models[0].name, 'codequest-mock:latest');
});

test('returns a validated local resume suggestion', async () => {
  const response = await connectorFetch('/api/v1/resume/tailor', {
    method: 'POST',
    body: JSON.stringify({
      model: 'codequest-mock:latest',
      resume_text: 'Data Analyst\nBuilt SQL dashboards for weekly banking operations reporting.',
      job_description: 'Seeking a Data Analyst with SQL, Python, and Power BI experience.',
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.meta.provider, 'ollama');
  assert.equal(body.meta.local_only, true);
  assert.equal(body.result.suggestions.length, 1);
  assert.equal(body.result.suggestions[0].evidence_verified, true);
  assert.deepEqual(body.result.missing_keywords.sort(), ['Power BI', 'Python'].sort());
});

test('blocks malformed model output from reaching the UI', async () => {
  const response = await connectorFetch('/api/v1/resume/tailor', {
    method: 'POST',
    body: JSON.stringify({
      model: 'codequest-mock:latest',
      resume_text: '[MALFORMED] Data Analyst with SQL reporting experience.',
      job_description: 'Seeking a Data Analyst with SQL and Python experience.',
    }),
  });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, 'model_output_invalid');
});

test('generates a cover letter from a prepared prompt package', async () => {
  const response = await connectorFetch('/api/v1/cover-letter/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'codequest-mock:latest',
      system_prompt: 'You write cover letters.',
      user_prompt:
        'Write a cover letter for a Python engineer role using this resume evidence: built FastAPI services.',
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(typeof body.result.text, 'string');
  assert.ok(body.result.text.length >= 40);
  assert.equal(body.meta.local_only, true);
});

test('generates an application email with subject and body', async () => {
  const response = await connectorFetch('/api/v1/application-email/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'codequest-mock:latest',
      system_prompt: 'You write application emails.',
      user_prompt:
        'Write an application email for a backend role. Resume shows Python and PostgreSQL experience.',
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(typeof body.result.subject, 'string');
  assert.equal(typeof body.result.body, 'string');
  assert.ok(body.result.body.length >= 40);
});
