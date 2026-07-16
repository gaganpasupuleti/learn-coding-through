import { getConfig } from './config.mjs';
import { createConnectorServer } from './server.mjs';

const config = getConfig();
const server = createConnectorServer({ config });

server.listen(config.port, config.host, () => {
  console.log(`[connector] running at http://${config.host}:${config.port}`);
  console.log(`[connector] Ollama target: ${config.ollamaBaseUrl}`);
  console.log(`[connector] allowed origins: ${config.allowedOrigins.join(', ')}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

