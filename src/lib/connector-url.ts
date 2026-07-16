const DEFAULT_CONNECTOR_ORIGIN = 'http://127.0.0.1:17891'

type RuntimeConfig = {
  VITE_CODEQUEST_CONNECTOR_URL?: string
  VITE_CONNECTOR_TOKEN?: string
}

export type ConnectorUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

function readConfiguredRaw(): string {
  const runtimeConfig: RuntimeConfig | undefined =
    typeof window !== 'undefined'
      ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
      : undefined

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

export function readConnectorToken(): string {
  const runtimeConfig: RuntimeConfig | undefined =
    typeof window !== 'undefined'
      ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
      : undefined

  return (
    runtimeConfig?.VITE_CONNECTOR_TOKEN?.trim() ||
    import.meta.env.VITE_CONNECTOR_TOKEN?.trim() ||
    'codequest-local-lab'
  )
}
