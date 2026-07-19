import { spawn } from 'node:child_process';
import process from 'node:process';

const useMock = process.argv.includes('--mock');
const children = [];

function run(name, command, args, options = {}) {
  // On Windows, shell:true breaks paths with spaces (e.g. C:\Program Files\nodejs\node.exe).
  // Only use a shell for npm.cmd; spawn node directly without a shell.
  const useShell = process.platform === 'win32' && command !== process.execPath;
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: useShell,
    ...options,
  });
  child.on('exit', (code) => {
    if (code && code !== 0) console.error(`[lab] ${name} exited with code ${code}`);
  });
  children.push(child);
}

if (useMock) {
  run('mock-ollama', process.execPath, ['mock-ollama/src/start.mjs']);
}

run('connector', process.execPath, ['connector/src/start.mjs'], {
  env: {
    ...process.env,
    ...(useMock ? { OLLAMA_BASE_URL: 'http://127.0.0.1:11435' } : {}),
  },
});

run(
  'resume-lab',
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['--prefix', 'resume-lab', 'run', 'dev'],
);

console.log(`[lab] mode: ${useMock ? 'mock Ollama' : 'real Ollama'}`);
console.log('[lab] open http://127.0.0.1:5173');

function shutdown() {
  for (const child of children) child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

