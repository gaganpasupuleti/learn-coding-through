**Branch:** `phase-21b-navigation-ownership-cleanup`  
**Base:** `feature/codequest-legacy-feature-wiring`  
**PR target:** `phase-21-frontend-sandbox-integration` (after review)

## Scope

- Make sidebar/page ownership clear
- Separate native, sandbox, legacy/proxied, locked, not-ready pages
- Handle or hide Settings
- Use or remove `external` flag
- Avoid dead links

## Allowed files

- `codequest-frontend-kit/src/config/navigation.js`
- `codequest-frontend-kit/src/components/layout/CodeQuestSidebar.jsx`
- `docs/FRONTEND_PAGE_OWNERSHIP_MAP.md` (if needed)

## Must not touch

- Auth files (except logout if already done in auth branch)
- Backend files
- Jobs files
- DSA files
- Practice engines
- `/progress` baseline
- Dashboard redesign

## Acceptance criteria

- [ ] No dead Settings link
- [ ] Page ownership is visible/clear
- [ ] Legacy/proxied links are clear
- [ ] Native links are clear
- [ ] `npm run build` passes

**Parent:** Phase 21 — Frontend Sandbox Stabilization and Page Migration
