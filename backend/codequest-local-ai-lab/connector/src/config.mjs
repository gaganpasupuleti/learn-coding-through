const DEFAULT_ORIGINS = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5000',
  'http://localhost:5000',
];

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getConfig(overrides = {}) {
  const configuredOrigins = (process.env.CQ_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    host: process.env.CQ_CONNECTOR_HOST?.trim() || '127.0.0.1',
    port: parsePositiveInteger(process.env.CQ_CONNECTOR_PORT, 17891),
    ollamaBaseUrl: (process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(/\/$/, ''),
    allowedOrigins: configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ORIGINS,
    // Legacy lab token is disabled unless CQ_ALLOW_LEGACY_LAB_TOKEN=true (tests only).
    labToken: process.env.CQ_CONNECTOR_LAB_TOKEN ?? '',
    pairingStorePath: process.env.CQ_CONNECTOR_PAIRING_STORE || undefined,
    probeTimeoutMs: parsePositiveInteger(process.env.CQ_PROBE_TIMEOUT_MS, 2500),
    generationTimeoutMs: parsePositiveInteger(process.env.CQ_GENERATION_TIMEOUT_MS, 180000),
    maxRequestBytes: parsePositiveInteger(process.env.CQ_MAX_REQUEST_BYTES, 100000),
    ...overrides,
  };
}
