**Branch:** `phase-21b-dashboard-real-data-wiring`  
**Base:** `feature/codequest-legacy-feature-wiring`  
**PR target:** `phase-21-frontend-sandbox-integration` (after review)

## Scope

- Wire approved dashboard to available real API data where safe
- Keep mock fallback when APIs are missing
- Do **not** redesign dashboard
- Do **not** add backend APIs in this phase

## Allowed files

- `codequest-frontend-kit/src/pages/DashboardPage.jsx`
- `codequest-frontend-kit/src/lib/api.js` (if needed)
- `docs/FRONTEND_PAGE_OWNERSHIP_MAP.md` (if needed)

## Must not touch

- Backend files
- Jobs files
- DSA files
- Practice engines
- `/progress` baseline
- Dashboard visual redesign

## Acceptance criteria

- [ ] Dashboard still looks the same
- [ ] User name still works
- [ ] Real data used only where available
- [ ] Static fallback is safe
- [ ] No backend changes
- [ ] `npm run build` passes

**Parent:** Phase 21 — Frontend Sandbox Stabilization and Page Migration
