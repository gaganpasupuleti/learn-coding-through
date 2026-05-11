import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    },
    // Spark / hoisted deps can otherwise resolve a second copy of React; Radix then hits
    // "Cannot read properties of null (reading 'useMemo')" inside Popover/useScope.
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // true: listen on all local addresses (incl. IPv6) so http://localhost:5000 works on Windows where `localhost` → ::1.
    host: true,
    port: 5000,
    // If something else is already bound to 5000, fail fast instead of silently picking another port
    // (opening the old URL would look like a blank page).
    strictPort: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
      '/health': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
