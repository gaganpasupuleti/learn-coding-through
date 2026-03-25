#!/usr/bin/env node
// Starts the Vite dev server, optionally overriding the port via the PORT env var.
// Usage: npm run dev:auto
//        PORT=3000 npm run dev:auto
import { createServer } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Only override port if PORT is explicitly set; otherwise use the port from vite.config.ts
const serverOverrides = process.env.PORT
  ? { port: parseInt(process.env.PORT, 10) }
  : {};

try {
  const server = await createServer({
    configFile: resolve(__dirname, '..', 'vite.config.ts'),
    server: serverOverrides,
  });

  await server.listen();
  server.printUrls();
} catch (err) {
  if (err.code === 'EADDRINUSE') {
    const port = serverOverrides.port ?? 5000;
    console.error(
      `\nError: Port ${port} is already in use.\n` +
      `Set the PORT environment variable to use a different port:\n` +
      `  PORT=3000 npm run dev:auto\n`
    );
    process.exit(1);
  }
  throw err;
}
