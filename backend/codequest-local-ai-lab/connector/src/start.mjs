import { getConfig } from './config.mjs';
import { createPairingStore } from './pairing.mjs';
import { createConnectorServer, printPairingBanner } from './server.mjs';

const config = getConfig();
const pairing = createPairingStore({ storePath: config.pairingStorePath });
const server = createConnectorServer({ config, pairingStore: pairing });

server.listen(config.port, config.host, () => {
  console.log(`[connector] running at http://${config.host}:${config.port}`);
  console.log(`[connector] Ollama target: ${config.ollamaBaseUrl}`);
  console.log(`[connector] allowed origins: ${config.allowedOrigins.join(', ')}`);
  printPairingBanner(pairing);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
