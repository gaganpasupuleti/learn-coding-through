/// <reference lib="webworker" />

declare function importScripts(...urls: string[]): void
declare function loadPyodide(config?: { indexURL?: string }): Promise<any>

let pyodide: any = null

async function getPyodide() {
  if (!pyodide) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js')
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
    })
  }
  return pyodide
}

self.onmessage = async (event: MessageEvent<{ code: string }>) => {
  const { code } = event.data

  try {
    const py = await getPyodide()

    // Redirect sys.stdout to a StringIO buffer to capture print output
    py.runPython(`
import sys
import io
sys.stdout = io.StringIO()
`)

    await py.runPythonAsync(code)

    // Read captured output
    const output: string = py.runPython('sys.stdout.getvalue()')

    // Restore sys.stdout
    py.runPython('sys.stdout = sys.__stdout__')

    self.postMessage({ output, error: null })
  } catch (err: any) {
    // Attempt to restore stdout even on error
    try {
      pyodide?.runPython('sys.stdout = sys.__stdout__')
    } catch {
      // ignore
    }

    self.postMessage({ output: null, error: String(err) })
  }
}
