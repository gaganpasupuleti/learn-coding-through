const DEFAULT_CONNECTOR_ORIGIN = 'http://127.0.0.1:17891'
const PAIRED_TOKEN_STORAGE_KEY = 'codequest.connector.paired-token'

type RuntimeConfig = {
  VITE_CODEQUEST_CONNECTOR_URL?: string
}

export type ConnectorUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export type ConnectorTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string; code: 'pairing_required' | 'missing' }

function readRuntimeConfig(): RuntimeConfig | undefined {
  return typeof window !== 'undefined'
    ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
    : undefined
}

function readConfiguredRaw(): string {
  const runtimeConfig = readRuntimeConfig()
  return (
    runtimeConfig?.VITE_CODEQUEST_CONNECTOR_URL?.trim() ||
    import.meta.env.VITE_CODEQUEST_CONNECTOR_URL?.trim() ||
    ''
  )
}

export function resolveConnectorUrl(rawInput?: string): ConnectorUrlResult {
  const raw = (rawInput ?? readConfiguredRaw()).trim()
  const candidate = raw || DEFAULT_CONNECTOR_ORIGIN

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return { ok: false, error: 'Connector URL is malformed.' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Connector URL must use HTTP or HTTPS.' }
  }

  return { ok: true, url: parsed.origin }
}

/** Read the paired-device bearer token from session storage (never from Vite env). */
export function resolveConnectorToken(): ConnectorTokenResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Local Connector pairing is required.', code: 'pairing_required' }
  }
  try {
    const token = sessionStorage.getItem(PAIRED_TOKEN_STORAGE_KEY)?.trim() || ''
    if (!token) {
      return {
        ok: false,
        error: 'Local Connector pairing is required.',
        code: 'pairing_required',
      }
    }
    return { ok: true, token }
  } catch {
    return { ok: false, error: 'Local Connector pairing is required.', code: 'pairing_required' }
  }
}

export function storePairedConnectorToken(token: string): void {
  sessionStorage.setItem(PAIRED_TOKEN_STORAGE_KEY, token.trim())
}

export function clearPairedConnectorToken(): void {
  try {
    sessionStorage.removeItem(PAIRED_TOKEN_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function hasPairedConnectorToken(): boolean {
  return resolveConnectorToken().ok
}
