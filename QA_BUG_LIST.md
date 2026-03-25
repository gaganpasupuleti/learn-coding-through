# Strict Bug List

## P0

### BUG-001: Java runtime execution fails on environments without JDK compiler in PATH
- Priority: P0
- Severity: High
- Area: Backend execution runtime
- File references: backend/executors/java_executor.py, backend/Dockerfile
- Reproduction steps:
1. Start backend API.
2. POST to /api/v1/execute with payload language=java and a basic public class snippet.
3. Observe response.
- Expected:
- Java code executes successfully when Java support is declared.
- Actual:
- Returns error: Java compiler not found. Install JDK and add javac to PATH.
- Impact:
- Advertised Java execution is unavailable on misconfigured hosts.
- Label suggestions: runtime, backend, java, environment

## P1

### BUG-002: ESLint script is broken under ESLint v9 due missing flat config
- Priority: P1
- Severity: Medium
- Area: Dev quality gates
- File references: package.json
- Reproduction steps:
1. Run npm run lint.
2. Observe ESLint startup error.
- Expected:
- Lint executes and reports code issues.
- Actual:
- ESLint exits with error: missing eslint.config.js.
- Impact:
- CI and local static checks are blocked.
- Label suggestions: tooling, lint, ci

### BUG-003: Execute API path is version-inconsistent with v1 API surface
- Priority: P1
- Severity: Medium
- Area: API contract consistency
- File references: backend/app/main.py, backend/app/api/v1/execute.py
- Reproduction steps:
1. Inspect mounted routes.
2. Compare /api/v1 routes vs execute path.
- Expected:
- Execution endpoint is under /api/v1 for consistency.
- Actual:
- Execution endpoint is mounted under /api/v1/execute.
- Impact:
- Client integration confusion and API versioning drift.
- Label suggestions: api, consistency

## P2

### BUG-004: Railway config defaults CORS to wildcard, conflicts with strict production safety policy
- Priority: P2
- Severity: Medium
- Area: Deployment configuration
- File references: railway.toml, backend/app/core/config.py
- Reproduction steps:
1. Set ENVIRONMENT=production.
2. Use CORS_ORIGINS=* from railway.toml defaults.
3. Start backend.
- Expected:
- Config defaults should align with production safety checks.
- Actual:
- Wildcard CORS conflicts with production validation constraints.
- Impact:
- Deploy confusion and startup failures in stricter production mode.
- Label suggestions: deploy, config, cors

## Fixed In This Change

### FIXED-001: Demo project limits were hardcoded to a single hero project
- Previous behavior:
- Only password-generator appeared unlocked, conflicting with 2-project demo policy.
- Fix summary:
- Project gating now uses canStartDemoProject and recordDemoProjectStart across app and projects page.

### FIXED-002: Demo quiz limits were not consistently enforced from UI flow
- Previous behavior:
- Quiz selection flow did not enforce 2-quiz attempt policy consistently.
- Fix summary:
- Quiz selection now checks canAttemptDemoQuiz and records attempts before opening quiz runtime.
