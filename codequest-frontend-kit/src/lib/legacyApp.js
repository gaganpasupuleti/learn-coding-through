import { LEGACY_PAGES, LEGACY_PRACTICE } from '../config/legacyRoutes';

/** Main Code Quest app origin — proxy target in dev. */
export function getLegacyAppOrigin() {
  const fromEnv = import.meta.env.VITE_LEGACY_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://127.0.0.1:5000';
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Same-origin — proxied to main Code Quest app (see vite.config.js). */
export function practiceHref(path) {
  return path;
}

/** Legacy in-app page via /open proxy — same port as sandbox. */
export function legacyPageHref(pageKey) {
  return `/open?page=${encodeURIComponent(pageKey)}`;
}

export { LEGACY_PAGES, LEGACY_PRACTICE };
