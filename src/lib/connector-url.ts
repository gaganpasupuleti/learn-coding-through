const DEFAULT_CONNECTOR_ORIGIN = 'http://127.0.0.1:17891'
/** Development-only lab token. Never treat as production authentication. */
export const DEV_CONNECTOR_LAB_TOKEN = 'codequest-local-lab'

type RuntimeConfig = {
  VITE_CODEQUEST_CONNECTOR_URL?: string
  VITE_CONNECTOR_TOKEN?: string
}

export type ConnectorUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export type ConnectorTokenResult =
  | { ok: true; token: string; isDevLabToken: boolean }
  | { ok: false; error: string; code: 'pairing_required' | 'missing' }

function readRuntimeConfig(): RuntimeConfig | undefined {
  return typeof window !== 'undefined'
    ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
    : undefined
}

function isProductionBuild(override?: boolean): boolean {
  if (typeof override === 'boolean') return override
  return Boolean(import.meta.env.PROD)
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

  parsed.pathname = parsed.pathname.replace(/\/$/, '') || ''
  return { ok: true, url: parsed.origin }
}

/**
 * Resolve the local-development connector token.
 * Production builds must set an explicit paired-device token; the lab default is refused.
 */
export function resolveConnectorToken(options?: { isProduction?: boolean }): ConnectorTokenResult {
  const runtimeConfig = readRuntimeConfig()
  const configured =
    runtimeConfig?.VITE_CONNECTOR_TOKEN?.trim() ||
    import.meta.env.VITE_CONNECTOR_TOKEN?.trim() ||
    ''

  if (isProductionBuild(options?.isProduction)) {
    if (!configured || configured === DEV_CONNECTOR_LAB_TOKEN) {
      return {
        ok: false,
        error: 'Local Connector pairing is required.',
        code: 'pairing_required',
      }
    }
    return { ok: true, token: configured, isDevLabToken: false }
  }

  const token = configured || DEV_CONNECTOR_LAB_TOKEN
  return {
    ok: true,
    token,
    isDevLabToken: token === DEV_CONNECTOR_LAB_TOKEN,
  }
}

/** @deprecated Prefer resolveConnectorToken() which enforces production pairing. */
export function readConnectorToken(): string {
  const resolved = resolveConnectorToken()
  if (!resolved.ok) {
    throw new Error(resolved.error)
  }
  return resolved.token
}
