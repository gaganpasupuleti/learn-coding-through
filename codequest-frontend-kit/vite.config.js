import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

const STATIC = resolve(__dirname, 'static');
const PROGRESS_FILE = resolve(STATIC, 'progress/index.html');

const APP_ROUTES = [
  '/dashboard',
  '/classes',
  '/practice-studio',
  '/materials',
  '/assignments',
];

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

export default defineConfig({
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
  },
});
