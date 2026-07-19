import { createMockOllamaServer } from './server.mjs';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.MOCK_OLLAMA_PORT || '11435', 10);
const server = createMockOllamaServer();

server.listen(port, host, () => {
  console.log(`[mock-ollama] running at http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

