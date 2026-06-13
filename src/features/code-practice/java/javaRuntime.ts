/**
 * Probe backend Java runtime availability via /health/capabilities.
 */

import { fetchHealthCapabilities } from '@/lib/api'

export type JavaRuntimeStatus = {
  ready: boolean
  error: string | null
}

let cachedStatus: JavaRuntimeStatus | null = null
let inflight: Promise<JavaRuntimeStatus> | null = null

async function fetchCapabilities(): Promise<JavaRuntimeStatus> {
  const payload = await fetchHealthCapabilities()
  const java = payload.capabilities?.java
  if (java?.ready) {
    return { ready: true, error: null }
  }
  return {
    ready: false,
    error: java?.error ?? 'Could not reach backend Java runtime',
  }
}

export async function checkJavaRuntimeStatus(force = false): Promise<JavaRuntimeStatus> {
  if (!force && cachedStatus) return cachedStatus
  if (!force && inflight) return inflight

  inflight = fetchCapabilities().then((status) => {
    cachedStatus = status
    inflight = null
    return status
  })

  return inflight
}

export function clearJavaRuntimeCache(): void {
  cachedStatus = null
  inflight = null
}
