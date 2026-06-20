const TOKEN_KEY = 'career-portal-token';
const USER_KEY = 'career-portal-user';

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function getAuthToken() {
  const token = safeStorageGet(TOKEN_KEY);
  return token && token.trim() ? token : null;
}

export function getStoredUser() {
  const raw = safeStorageGet(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      safeStorageRemove(USER_KEY);
      return null;
    }
    return parsed;
  } catch {
    safeStorageRemove(USER_KEY);
    return null;
  }
}

export function hasAuth() {
  return Boolean(getAuthToken());
}

export function isLoggedIn() {
  return hasAuth();
}

export function clearAuth() {
  safeStorageRemove(TOKEN_KEY);
  safeStorageRemove(USER_KEY);
}

export function getAuthDisplayName() {
  const user = getStoredUser();
  if (!user) return null;
  return user.full_name || user.email || null;
}
