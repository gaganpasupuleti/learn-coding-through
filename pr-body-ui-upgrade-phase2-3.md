## Summary

Final UI integration for CodeQuest student experience on branch `ui-upgrade-final-integration`:

- **UI shell / login polish (Phase 1)** — `StudentShell`, `LoginPage`, `AuthPromoPanel` on this branch
- **Dashboard upgrade** — today’s class, continue learning hero, deadlines, practice streak, SQL/code/typing progress, mistakes review, job + resume readiness
- **Calendar page** — month view with marked dates, class notes, assignments, resources (demo data where API gaps exist)
- **Progress tracker** — course/quiz/project overview, skill grid, mistakes summary
- **Resume builder** — ATS-friendly one-column template, localStorage save, readiness score, browser print export
- **Repo reuse registry** + **prompt-guideline workflow** documented under `docs/repo-reuse-reviews/`
- **Smoke nav tolerance** — QA scripts accept **Code Workbench** or legacy **Code Practice Ground** labels

## QA environment requirements

Before running smoke tests locally:

1. **CodeQuest stack:** `npm run dev:all` (frontend on `:5000`, API on `:8000`).
2. **Practice smoke:** rerun `npm run qa:practice-smoke` after `dev:all` is up. Login step fails if the app is not serving the sign-in page.
3. **Quiz smoke:** `npm run qa:quiz-smoke` — uses frontend + API (default web base may be `:5001` if set in script env).
4. **JobSpy smoke:** `npm run qa:jobspy-smoke` requires JobSpy API on `http://127.0.0.1:8001`. Failure is **environmental** when JobSpy is not running.

Note: `practice-ground-smoke.mjs` still targets legacy section test IDs (`practice-section-*`, `Run Code`) from the old practice hub. Nav label tolerance is fixed; full practice smoke may need a follow-up rewrite for Code Workbench UI.

## Latest QA status

| Command | Status |
| --- | --- |
| `npm run build` | **PASS** |
| `npm run lint` | Repo-wide pre-existing issues remain; Phase 2/3 files clean |
| `npm run qa:quiz-smoke` | **PASS** (when API + frontend available) |
| `npm run qa:practice-smoke` | **Blocked** without `dev:all`; login timeout if app/API down; legacy UI selectors may still fail after login |
| `npm run qa:jobspy-smoke` | **Blocked** unless JobSpy API runs on `:8001` |

## Test plan

- [ ] Login as student → dashboard loads with new cards
- [ ] Navigate Calendar, Progress, Resume from shell
- [ ] `/practice/code`, `/practice/sql`, `/practice/typing` still load (ErrorBoundary intact)
- [ ] JobSpy page loads
- [ ] Admin login still loads admin shell
- [ ] Resume: edit fields → preview updates → print dialog opens
- [ ] Resume readiness card on dashboard reflects localStorage draft

## Routes verified

| Route / page key | Status |
| --- | --- |
| Login | Manual QA |
| `dashboard` | Updated |
| `calendar` | New |
| `progress` | New |
| `resume` | New |
| `practice-code` (`/practice/code`) | Unchanged execution path |
| `practice-sql` (`/practice/sql`) | Unchanged execution path |
| `practice-typing` (`/practice/typing`) | Unchanged |
| `jobspy` | Unchanged |
| `admin` | Unchanged |

## Known limitations

- Calendar class notes, resource links, and some assignment rows use **mock/demo data** with TODO comments for backend integration
- Resume data is **localStorage-only** (not synced across devices or users)
- PDF export uses **browser print** — no server-side PDF generation in v1
- Job readiness score on dashboard remains derived from existing API + local career data (separate from resume readiness score)
- OpenResume was inspiration only; no AGPL code imported

## Repo references (UX only, rewritten for CodeQuest)

- shadcn-admin, CollabCore, LMS (Phase 2)
- Reactive Resume, Resume-Builder-React (Phase 3)
- OpenResume — inspiration only

## Do not merge checklist

- [ ] CI green on PR
- [ ] Product review of demo calendar/resume data copy
- [ ] Confirm backend calendar API timeline before removing TODO mocks
