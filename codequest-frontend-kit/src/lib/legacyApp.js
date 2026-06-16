import { LEGACY_PAGES, LEGACY_PRACTICE } from '../config/legacyRoutes';

/** Main Code Quest app origin (root SPA on port 5000 in local dev). */
export function getLegacyAppOrigin() {
  const fromEnv = import.meta.env.VITE_LEGACY_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:5000';
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return '';
}

/** Same-origin practice URL — proxied to legacy app in dev. */
export function practiceHref(path) {
  return path;
}

/** Full URL to a legacy in-app page (state-routed in main App.tsx). */
export function legacyPageHref(pageKey) {
  const origin = getLegacyAppOrigin();
  return `${origin}/?page=${pageKey}`;
}

export { LEGACY_PAGES, LEGACY_PRACTICE };
