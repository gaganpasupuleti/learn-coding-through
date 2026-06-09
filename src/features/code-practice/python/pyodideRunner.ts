import { loadPyodide, type PyodideInterface } from 'pyodide'

/**
 * Browser Python runner for beginner Code Practice Ground tasks.
 * Pyodide executes locally in the tab — not a full security sandbox.
 * Pre-run checks live in pythonSafetyValidator.ts; worker timeouts may follow later.
 */

/** CDN assets for the installed pyodide npm version (lazy-loaded on first Python run). */
const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/'

/** Cap stdout size so runaway print loops do not exhaust browser memory. */
export const MAX_PYODIDE_OUTPUT_CHARS = 20_000
const OUTPUT_TRUNCATION_SUFFIX = '\n[Output truncated for browser safety]'

export function truncatePyodideOutput(raw: string): string {
  if (raw.length <= MAX_PYODIDE_OUTPUT_CHARS) return raw
  return raw.slice(0, MAX_PYODIDE_OUTPUT_CHARS) + OUTPUT_TRUNCATION_SUFFIX
}

export interface PyodideRunResult {
  output: string
  error: string | null
  executionTimeMs: number
  runtime: 'pyodide'
  note?: string
}

let pyodideInstance: PyodideInterface | null = null
let loadPromise: Promise<PyodideInterface> | null = null

export function isPyodideReady(): boolean {
  return pyodideInstance !== null
}

async function ensurePyodideLoaded(onLoading?: () => void): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance

  if (!loadPromise) {
    onLoading?.()
    loadPromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL })
      .then((py) => {
        pyodideInstance = py
        return py
      })
      .catch((err) => {
        loadPromise = null
        throw err
      })
  } else {
    onLoading?.()
  }

  return loadPromise
}

function formatPyodideError(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

function isLoadFailure(err: unknown): boolean {
  const msg = formatPyodideError(err).toLowerCase()
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('load pyodide') ||
    msg.includes('wasm')
  )
}

const LOAD_ERROR_MESSAGE =
  'Python browser runtime failed to load. Please refresh and try again.'

/**
 * Execute Python in the browser via Pyodide (Code Practice Ground only).
 * Stdin is wired for input() using StringIO.
 */
export async function runPythonWithPyodide(
  code: string,
  stdin?: string,
  onRuntimeLoading?: () => void,
  onRuntimeReady?: () => void,
): Promise<PyodideRunResult> {
  const started = performance.now()

  try {
    const py = await ensurePyodideLoaded(onRuntimeLoading)
    onRuntimeReady?.()

    const stdinLine = stdin
      ? `sys.stdin = io.StringIO(${JSON.stringify(stdin)})`
      : ''

    await py.runPythonAsync(`
import sys
import io
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture
${stdinLine}
`)

    try {
      await py.runPythonAsync(code)
    } catch (runErr) {
      let partial = ''
      try {
        partial = String(py.runPython('_stdout_capture.getvalue()')).trimEnd()
      } catch {
        /* ignore */
      }
      try {
        await py.runPythonAsync('sys.stdout = sys.__stdout__; sys.stdin = sys.__stdin__')
      } catch {
        /* ignore */
      }
      return {
        output: truncatePyodideOutput(partial),
        error: formatPyodideError(runErr),
        executionTimeMs: Math.round(performance.now() - started),
        runtime: 'pyodide',
      }
    }

    const output = truncatePyodideOutput(
      String(py.runPython('_stdout_capture.getvalue()')).trimEnd(),
    )
    await py.runPythonAsync('sys.stdout = sys.__stdout__; sys.stdin = sys.__stdin__')

    return {
      output,
      error: null,
      executionTimeMs: Math.round(performance.now() - started),
      runtime: 'pyodide',
      note: 'Runtime: Pyodide',
    }
  } catch (err) {
    return {
      output: '',
      error: isLoadFailure(err) ? LOAD_ERROR_MESSAGE : formatPyodideError(err),
      executionTimeMs: Math.round(performance.now() - started),
      runtime: 'pyodide',
    }
  }
}
