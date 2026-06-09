# Judge0 Integration Plan — Issue #29

## Purpose

Prepare **Java, C, and C++** execution for the Code Practice Ground using [Judge0](https://github.com/judge0/judge0) as a **controlled backend service**. Phase 9 adds types, language mapping, and a placeholder client only — no live execution.

## Why Judge0 is not enabled yet

- Judge0 is **heavier infrastructure** (compiler runtimes, workers, queues, Redis/DB).
- Untrusted Java/C/C++ must not run in the main app process or in the browser.
- Language IDs, limits, and deployment topology must be verified on a real instance first.
- Issue #29 phases 0–8 intentionally delivered Python (Pyodide), JavaScript (existing sandbox), and React (Sandpack) without Judge0 cost/complexity.

## Why the frontend must not call Judge0 directly

- Judge0 API keys and admin tokens must **never** ship to the browser.
- Students could bypass rate limits, quotas, and safety policies.
- Compile/runtime output and stderr need server-side sanitization before display.
- Hidden test cases and time/memory limits belong on the backend.

**Frontend rule:** call `submitToJudge0Backend()` → future **our API** → Judge0, not Judge0 URLs from the client.

## Future backend endpoint idea

Not implemented in Phase 9. Planned shape:

```
POST /api/code/judge0/execute
Body: { sourceCode, language, stdin?, cpuTimeLimit?, memoryLimit? }
Response: Judge0SubmissionResult (normalized stdout/stderr/compileOutput/status)

POST /api/code/judge0/submit
Body: { sourceCode, language, testCases[] }
Response: { results: Judge0SubmissionResult[], passed: boolean }
```

Backend responsibilities:

1. Validate language key and map to verified `language_id`.
2. Enforce auth/rate limits per student.
3. Apply CPU time and memory caps.
4. Strip secrets from stderr/compile output when needed.
5. Poll Judge0 submission status server-side.
6. Never expose Judge0 admin token to clients.

## Required backend safety controls

- **Sandbox isolation** — Judge0 workers only; never `exec` student code in the Node API process.
- **Timeouts** — default CPU/wall limits per language.
- **Memory limits** — prevent OOM on shared hosts.
- **Output size caps** — truncate huge stdout/stderr.
- **Queue depth** — reject or queue when overloaded.
- **No network from submissions** — rely on Judge0 isolate settings where applicable.

## Java / C / C++ rollout plan

| Step | Phase | Action |
|------|-------|--------|
| 1 | 9 (this) | Types, language map, stub client, docs |
| 10+ | Deploy Judge0 (Railway/VM) | Verify language IDs via `/languages` |
| 10+ | Backend adapter | Implement `/api/code/judge0/*` |
| 10+ | Workbench | Enable Run/Submit for java/c/cpp; remove coming-soon |
| Later | Hidden cases | Server-side test cases only |

## Deployment risks

- Judge0 needs **Redis + PostgreSQL** (or compatible) and worker processes — not a single lightweight container.
- **Railway caution:** memory/CPU spikes from concurrent compilations can exhaust hobby-tier resources; use autoscaling or a dedicated VM, monitor queue latency, and set strict per-submission limits.
- Cold starts and queue backlog can make Run feel slow — show loading UX.
- Wrong `language_id` → confusing compile errors; must be verified per environment.

## Files in this folder

| File | Role |
|------|------|
| `judge0Types.ts` | Shared TypeScript contracts |
| `judge0LanguageMap.ts` | Java/C/C++ config; IDs TODO until deployment |
| `judge0Client.ts` | Placeholder `submitToJudge0Backend` (throws) |
| `judge0Readme.md` | This document |

## Current workbench behavior (unchanged)

- **Python** — Pyodide in browser.
- **JavaScript** — existing backend sandbox.
- **React** — Sandpack preview only.
- **Java / C / C++** — coming soon; no Judge0 calls.
