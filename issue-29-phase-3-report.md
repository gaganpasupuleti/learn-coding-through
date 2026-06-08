# Phase 3 Report — Issue #29

## A. Summary

Connected **Sandpack live preview** for React practice mode in the Code Workbench. Monaco remains the main editor; Sandpack renders only the preview/runtime panel. React starter questions updated to `export default function App()` patterns preview-friendly with Sandpack. Python, JavaScript, and legacy flows unchanged.

## B. Files created

- `src/features/code-practice/utils/sandpackReact.ts`
- `issue-29-phase-3-report.md`

## C. Files modified

- `package.json`
- `package-lock.json`
- `src/features/code-practice/components/LivePreviewPanel.tsx`
- `src/features/code-practice/components/CodePracticePage.tsx`
- `src/features/code-practice/data/codeQuestions.ts`

## D. Sandpack dependency added

```bash
npm install @codesandbox/sandpack-react
```

- Added to `dependencies` in `package.json` / lockfile only.
- No unrelated packages installed.

## E. React live preview behavior

- **React mode:** `SandpackProvider` + `SandpackPreview` with `template="react"`, dark theme.
- Editor code → `buildSandpackAppCode()` → `/App.js` (strips `console.log` for preview only).
- Preview updates as Monaco code changes (`recompileMode: 'immediate'`).
- Header: **Live Preview** · **Powered by Sandpack**.
- Sandpack compile/runtime errors surface in the preview iframe overlay.
- **Non-React:** placeholder text — *"Live preview is available for React practice."*

## F. What was intentionally not changed

- Monaco `CodeEditor` as main editor (no Sandpack code editor).
- Python / JavaScript Run + Submit + stdin adapter.
- Backend `/api/v1/execute` (no stdin backend work).
- Pyodide, Judge0, AI/LLM features.
- Legacy Practice Hub (SQL intact).
- Java / C / C++ coming-soon behavior.

## G. SQL boundary check

- No SQL added to Issue #29 module.
- Issue #30 SQL practice untouched.

## H. AI/token check

- No AI, LLM, or paid model/API usage.
- Sandpack runs client-side bundling only; no external AI services.
- No secrets committed.

## I. Build/lint result

- `npm run build`: **passed** (exit code 0)
- `npm run lint`: pre-existing repo errors (~388); no new errors in Phase 3 files

## J. Manual test steps

1. Open `/practice/code`
2. Switch to **React** → Sandpack preview panel visible
3. **Create a button** → preview shows button
4. Edit button text in Monaco → preview updates
5. **Create a card** → card layout in preview
6. **Create a counter** → `useState` +1 works in preview
7. Switch to **Python** → Sandpack not shown
8. Python Hello World Run → still works
9. Switch to **JavaScript** → JS Run/Submit unchanged
10. Confirm no SQL in Code Workbench module
11. Legacy Practice Hub → SQL tab still present

## K. Risks before Phase 4

1. Sandpack adds bundle weight (~47 npm packages).
2. React Run/Submit still uses `console.log` + JS executor — visual truth is preview, not stdout.
3. Invalid JSX may show Sandpack error overlay; students may need clearer error copy later.
4. Python stdin still client-mocked; backend stdin remains future work.
5. Judge0 for Java/C/C++ still Phase 4+.

---
*Phase 3 complete. Phase 4 not started.*
