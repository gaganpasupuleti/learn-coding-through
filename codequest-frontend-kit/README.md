# Code Quest Frontend Sandbox

Brick-by-brick UI rebuild workspace. **Dashboard-only** in this PR — other pages come later.

## Run locally

```bash
cd codequest-frontend-kit
npm install
npm run dev
```

| URL | Status |
|-----|--------|
| http://localhost:3000/progress | Locked baseline (static HTML) |
| http://localhost:3000/dashboard | **Approved React page** |

`/` redirects to `/progress`.

## This PR includes

- Locked `static/progress/index.html` baseline
- Theme tokens + shared shell (`CodeQuestShell`, `CQ*` components)
- **`/dashboard` only** — first approved React brick

## Not in this PR

Classes, Assignments, Materials, Practice Studio, tool pages — built in follow-up PRs after dashboard is merged.

See `docs/CODEQUEST_FRONTEND_SANDBOX.md` for the full integration plan.
