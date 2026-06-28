import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const APP_ROUTES = ['/dashboard'];

function cqStaticRoutes() {
  const serve = (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url === '/' || url === '/index.html') {
      res.writeHead(302, { Location: '/dashboard' });
      res.end();
      return;
    }
    if (APP_ROUTES.includes(url)) {
      req.url = '/app.html';
      next();
      return;
    }
    next();
  };

  return {
    name: 'cq-static-routes',
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000';
  const jobsTarget = env.VITE_JOBS_API_PROXY_TARGET || 'http://127.0.0.1:8001';
  const legacyAppTarget = env.VITE_LEGACY_APP_URL || 'http://127.0.0.1:5000';

  return {
    plugins: [react(), cqStaticRoutes()],
    build: {
      rollupOptions: {
        input: {
          app: resolve(__dirname, 'app.html'),
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/health': { target: apiTarget, changeOrigin: true },
        '/jobs-api': { target: jobsTarget, changeOrigin: true },
        '/practice': { target: legacyAppTarget, changeOrigin: true },
        '/open': {
          target: legacyAppTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/open/, '') || '/',
        },
      },
    },
    preview: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/health': { target: apiTarget, changeOrigin: true },
        '/jobs-api': { target: jobsTarget, changeOrigin: true },
        '/practice': { target: legacyAppTarget, changeOrigin: true },
        '/open': {
          target: legacyAppTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/open/, '') || '/',
        },
      },
    },
  };
});
