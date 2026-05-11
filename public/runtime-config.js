// Injected at runtime in some deployments. Vite dev uses root `.env` instead.
window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {
  VITE_API_URL: '',
  VITE_GOOGLE_CLIENT_ID: '',
};
