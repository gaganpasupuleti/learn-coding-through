/**
 * Normalizes Monaco editor code into a Sandpack React /App.js entry.
 * Monaco remains the source of truth; this transform is preview-only.
 */
export function buildSandpackAppCode(editorCode: string): string {
  const withoutConsole = editorCode
    .split('\n')
    .filter((line) => !/^\s*console\.log\s*\(/.test(line))
    .join('\n')
    .trim()

  if (!withoutConsole) {
    return `export default function App() {
  return <p style={{ color: '#94a3b8' }}>Write React code in the editor…</p>;
}
`
  }

  if (/export\s+default/.test(withoutConsole)) {
    return withoutConsole
  }

  const appMatch = withoutConsole.match(/function\s+App\s*\(/)
  if (appMatch) {
    return `${withoutConsole}\n\nexport default App;`
  }

  const namedMatch = withoutConsole.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/)
  if (namedMatch) {
    const componentName = namedMatch[1]
    return `${withoutConsole}\n\nexport default function App() {\n  return <${componentName} />;\n}\n`
  }

  return `${withoutConsole}\n\nexport default function App() {\n  return <div>Check your component syntax.</div>;\n}\n`
}
