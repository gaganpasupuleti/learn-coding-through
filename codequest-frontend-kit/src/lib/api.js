import { clearAuth, getAuthToken } from './auth';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE) return `${API_BASE}${p}`;
  return p;
}

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(apiUrl(path), { ...options, headers });
  } catch (error) {
    const err = new Error(error instanceof Error ? error.message : 'Network request failed');
    err.networkError = true;
    throw err;
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(data?.detail || data?.message || `API ${res.status}`);
    err.status = res.status;
    err.data = data;

    if ((res.status === 401 || res.status === 403) && token) {
      clearAuth();
      err.authExpired = true;
    }

    throw err;
  }

  return data;
}

export async function checkApiHealth() {
  try {
    const res = await fetch(apiUrl('/health'), { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchCurrentUser() {
  if (!getAuthToken()) {
    const err = new Error('Auth token missing');
    err.status = 401;
    err.authMissing = true;
    throw err;
  }
  return apiFetch('/api/v1/auth/me');
}
