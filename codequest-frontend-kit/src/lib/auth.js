const TOKEN_KEY = 'career-portal-token';
const USER_KEY = 'career-portal-user';

/** Dev-only: copy auth from main app (:5000) via redirect hash. */
export function syncAuthFromDevHash() {
  if (!import.meta.env.DEV) return;

  const match = window.location.hash.match(/^#cq-auth=(.+)$/);
  if (!match) return;

  try {
    const payload = JSON.parse(atob(decodeURIComponent(match[1])));
    if (payload.token) localStorage.setItem(TOKEN_KEY, payload.token);
    if (payload.user) {
      localStorage.setItem(
        USER_KEY,
        typeof payload.user === 'string' ? payload.user : JSON.stringify(payload.user),
      );
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch {
    /* ignore malformed dev auth payload */
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}
