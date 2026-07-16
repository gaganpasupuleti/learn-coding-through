const DEFAULT_RESUME_ORIGIN = 'http://localhost:3000'
const DEFAULT_RESUME_PATH = '/dashboard/resumes'

type RuntimeConfig = {
  VITE_RESUME_APP_URL?: string
}

export type ResumeAppUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

function readConfiguredRaw(): string {
  const runtimeConfig: RuntimeConfig | undefined =
    typeof window !== 'undefined'
      ? (window as Window & { __RUNTIME_CONFIG__?: RuntimeConfig }).__RUNTIME_CONFIG__
      : undefined

  return (
    runtimeConfig?.VITE_RESUME_APP_URL?.trim() ||
    import.meta.env.VITE_RESUME_APP_URL?.trim() ||
    ''
  )
}

export function resolveResumeAppUrl(rawInput?: string): ResumeAppUrlResult {
  const raw = (rawInput ?? readConfiguredRaw()).trim()
  const fallback = `${DEFAULT_RESUME_ORIGIN}${DEFAULT_RESUME_PATH}`
  const candidate = raw || fallback

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return { ok: false, error: 'Resume application URL is malformed.' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Resume application URL must use HTTP or HTTPS.' }
  }

  if (!parsed.pathname || parsed.pathname === '/') {
    parsed.pathname = DEFAULT_RESUME_PATH
  }

  return { ok: true, url: parsed.toString() }
}
