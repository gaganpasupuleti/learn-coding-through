import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

const STATIC = resolve(__dirname, 'static');
const PROGRESS_FILE = resolve(STATIC, 'progress/index.html');

const APP_ROUTES = ['/dashboard', '/classes'];

function serveProgressHtml(res) {
  const distFile = resolve('dist/static/progress/index.html');
  const file = fs.existsSync(distFile) ? distFile : PROGRESS_FILE;
  res.setHeader('Content-Type', 'text/html');
  res.end(fs.readFileSync(file, 'utf-8'));
}

function cqStaticRoutes() {
  const serve = (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url === '/' || url === '/index.html') {
      res.writeHead(302, { Location: '/progress' });
      res.end();
      return;
    }
    if (url === '/progress' || url === '/progress/') {
      serveProgressHtml(res);
      return;
    }
    if (APP_ROUTES.includes(url)) {
      req.url = '/app.html';
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
    closeBundle() {
      const distProgress = resolve('dist/static/progress/index.html');
      if (fs.existsSync(distProgress)) {
        fs.copyFileSync(distProgress, resolve('dist/index.html'));
      }
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
          progress: PROGRESS_FILE,
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
