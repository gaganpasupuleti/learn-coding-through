// Local dev fallback. Production containers overwrite this file at start (see frontend-entrypoint.sh).
window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {
  VITE_API_URL: '',
  VITE_GOOGLE_CLIENT_ID: '',
  VITE_JOBS_API_URL: '',
  VITE_JOBS_ADMIN_API_KEY: '',
};
