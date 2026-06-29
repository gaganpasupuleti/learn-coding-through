**Branch:** `phase-21a-auth-logout-wiring`  
**Base:** `feature/codequest-legacy-feature-wiring`  
**PR target:** `phase-21-frontend-sandbox-integration` (after review)

## Scope

- Frontend-kit auth helper cleanup
- Real logout action in sandbox
- Missing-auth display
- Invalid/expired token behavior
- ConnectionStatus auth messaging

## Allowed files

- `codequest-frontend-kit/src/lib/auth.js`
- `codequest-frontend-kit/src/lib/api.js`
- `codequest-frontend-kit/src/components/layout/CodeQuestSidebar.jsx`
- `codequest-frontend-kit/src/components/ui/ConnectionStatus.jsx`

## Must not touch

- `backend/*`
- `src/features/sql-practice/*`
- `src/features/code-practice/*`
- `src/features/typing/*`
- Jobs files
- DSA files
- New page files
- `/progress` baseline
- Dashboard redesign

## Acceptance criteria

- [ ] Logout clears token/user
- [ ] Dashboard does not crash without token
- [ ] Auth missing/invalid state is clear
- [ ] No backend changes
- [ ] `npm run build` passes in `codequest-frontend-kit`

**Parent:** Phase 21 — Frontend Sandbox Stabilization and Page Migration
