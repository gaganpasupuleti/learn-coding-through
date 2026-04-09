export function isRailwayPublicHost(): boolean {
  if (typeof window === 'undefined') return false

  const host = window.location.hostname.toLowerCase()
  return host.includes('railway.app')
}
