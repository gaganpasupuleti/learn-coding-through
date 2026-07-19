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
let mockServer;
let connectorServer;
let connectorUrl;
let storePath;
let pairing;

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
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
}

before(async () => {
  storePath = path.join(os.tmpdir(), `cq-pairing-${process.pid}.json`);
  try {
    fs.unlinkSync(storePath);
  } catch {
    /* ignore */
  }
  delete process.env.CQ_TEST_BEARER_TOKEN;
  delete process.env.CQ_ALLOW_LEGACY_LAB_TOKEN;
  process.env.CQ_CONNECTOR_EXPOSE_PAIRING_CODE = 'true';

  mockServer = createMockOllamaServer();
  const mockAddress = await listen(mockServer);
  pairing = createPairingStore({ storePath });
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
  try {
    fs.unlinkSync(storePath);
  } catch {
    /* ignore */
  }
  delete process.env.CQ_CONNECTOR_EXPOSE_PAIRING_CODE;
});

test('status reports unpaired without auth', async () => {
  const boot = pairing.regeneratePairingCode();
  assert.ok(boot.code);
  const response = await connectorFetch('/api/v1/status');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.pairing.state, 'unpaired');
  assert.equal(body.pairing.pairing_required, true);
  assert.equal(body.connector.bind, 'loopback-only');
});

test('rejects missing and incorrect tokens', async () => {
  pairing.regeneratePairingCode();
  const missing = await connectorFetch('/api/v1/models');
  assert.equal(missing.status, 401);
  assert.equal((await missing.json()).error, 'pairing_required');

  const wrong = await connectorFetch('/api/v1/models', {
    headers: { 'X-CodeQuest-Connector-Token': 'definitely-wrong-token' },
  });
  assert.equal(wrong.status, 401);
});

test('pairs with one-time code and rejects reuse/expiry', async () => {
  const { code } = pairing.regeneratePairingCode();
  const paired = await connectorFetch('/api/v1/pair', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  assert.equal(paired.status, 200);
  const body = await paired.json();
  assert.equal(body.paired, true);
  assert.equal(typeof body.token, 'string');
  assert.ok(body.token.length >= 32);

  const reuse = await connectorFetch('/api/v1/pair', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  assert.equal(reuse.status, 401);

  const models = await connectorFetch('/api/v1/models', {
    headers: { 'X-CodeQuest-Connector-Token': body.token },
  });
  assert.equal(models.status, 200);

  // Expired code
  const expiredBoot = pairing.regeneratePairingCode();
  pairing.expirePendingForTests();
  const expired = pairing.pairWithCode(expiredBoot.code);
  assert.equal(expired.ok, false);
  assert.equal(expired.error, 'pairing_code_expired');
});

test('revokes token and requires re-pair', async () => {
  const { code } = pairing.regeneratePairingCode();
  const paired = await (
    await connectorFetch('/api/v1/pair', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  ).json();

  const revoked = await connectorFetch('/api/v1/pair/revoke', {
    method: 'POST',
    headers: { 'X-CodeQuest-Connector-Token': paired.token },
  });
  assert.equal(revoked.status, 200);

  const after = await connectorFetch('/api/v1/models', {
    headers: { 'X-CodeQuest-Connector-Token': paired.token },
  });
  assert.equal(after.status, 401);
});

test('disallowed origin receives no permissive CORS header', async () => {
  const response = await fetch(`${connectorUrl}/api/v1/status`, {
    headers: { Origin: 'https://malicious.example' },
  });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('restart preserves a valid pairing hash', async () => {
  const { code } = pairing.regeneratePairingCode();
  const paired = await (
    await connectorFetch('/api/v1/pair', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  ).json();

  const reloaded = createPairingStore({ storePath });
  assert.equal(reloaded.authorizeToken(paired.token), true);
  assert.equal(reloaded.publicStatus().state, 'paired');
});

test('secrets are not echoed in error bodies', async () => {
  const { code } = pairing.regeneratePairingCode();
  const response = await connectorFetch('/api/v1/pair', {
    method: 'POST',
    body: JSON.stringify({ code: 'BADCODE1' }),
  });
  const text = await response.text();
  assert.equal(response.status, 401);
  assert.doesNotMatch(text, new RegExp(code, 'i'));
  assert.doesNotMatch(text, /Bearer /i);
});
