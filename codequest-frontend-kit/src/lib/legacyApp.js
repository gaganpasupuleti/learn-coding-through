import { LEGACY_PAGES, LEGACY_PRACTICE } from '../config/legacyRoutes';

/** Main Code Quest app origin — proxy target in dev. */
export function getLegacyAppOrigin() {
  const fromEnv = import.meta.env.VITE_LEGACY_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://127.0.0.1:5000';
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** True when legacy app is on a different origin than the sandbox (e.g. :5000 vs :3000). */
export function isCrossOriginLegacy() {
  const legacy = getLegacyAppOrigin();
  if (!legacy) return false;
  if (typeof window === 'undefined') {
    return import.meta.env.DEV;
  }
  try {
    return new URL(legacy).origin !== window.location.origin;
  } catch {
    return import.meta.env.DEV;
  }
}

/** Practice routes — in dev always hit main app on :5000 (sandbox proxy breaks Vite assets). */
export function practiceHref(path) {
  if (import.meta.env.DEV || isCrossOriginLegacy()) {
    return `${getLegacyAppOrigin()}${path}`;
  }
  return path;
}

/** Legacy in-app page (?page= deep link). */
export function legacyPageHref(pageKey) {
  const query = `page=${encodeURIComponent(pageKey)}`;
  if (import.meta.env.DEV || isCrossOriginLegacy()) {
    return `${getLegacyAppOrigin()}/?${query}`;
  }
  return `/open?${query}`;
}

export { LEGACY_PAGES, LEGACY_PRACTICE };
