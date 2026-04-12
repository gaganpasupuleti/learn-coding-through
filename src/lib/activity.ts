import { API_BASE_URL, getAuthToken } from '@/lib/auth'

export async function recordRouteVisit(route: string, durationMs: number): Promise<void> {
  const token = getAuthToken()
  if (!token) return

  try {
    await fetch(`${API_BASE_URL}/activity/route-visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ route, duration_ms: Math.max(0, Math.floor(durationMs)) }),
    })
  } catch {
    // Telemetry should never block the main UX.
  }
}
