# UI repo reuse review registry

Living log of external repo inspiration used during the CodeQuest UI upgrade (`ui-upgrade-final-integration`).

## Phase 2 — Dashboard, Calendar, Progress

**Date:** 2026-06-14  
**Branch:** `ui-upgrade-final-integration`

### Reference repos

| Repo | Role |
| --- | --- |
| [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) | Dashboard card density, sidebar metric tiles, gradient hero patterns |
| [all3n2601/collabcore](https://github.com/all3n2601/collabcore) | Student workspace task board columns, streak/momentum cards, daily focus layout |
| [Awais512/LMS](https://github.com/Awais512/LMS) | Course/module completion percentages, syllabus progress chips (concepts only) |

### CollabCore ideas used

- Practice streak card driven by local activity dates (SQL/code/typing)
- Mistakes review summary tile linking to a dedicated progress view
- “Today’s class” + upcoming timeline split for daily orientation

### LMS concepts used

- Overall progress card with module completion counts
- Learning journey card with completed vs remaining topic chips
- Progress page aggregating course, quiz, and project submission status

### What was avoided

- CollabCore realtime collaboration / websocket task sync (no backend scope)
- LMS enrollment billing, instructor grading workflows, or AGPL-licensed code
- Heavy calendar libraries (used existing `react-day-picker` via `PlannerMonthCalendar`)
- Production DB schema changes for calendar notes (demo data + TODO markers instead)

### Prompt guidelines used (Phase 2)

From [awesome-ai-dev-prompts](https://github.com/gaganpasupuleti/awesome-ai-dev-prompts):

- `frontend/03-dashboard-ui-builder.txt` — card grid layout, metric hierarchy
- `frontend/11-react-engineer.txt` — hook composition, typed props, shadcn patterns
- `database/01-database-architect.txt` — future schema notes only (calendar notes, resume persistence)
- `debugging-quality/04-testing-qa-automation-engineer.txt` — smoke test verification after UI changes

### CodeQuest files touched (Phase 2)

- `src/components/pages/StudentDashboardPage.tsx`
- `src/components/pages/StudentCalendarPage.tsx`
- `src/components/pages/StudentProgressPage.tsx`
- `src/components/student-dashboard/*` (new cards)
- `src/components/student-calendar/*`
- `src/components/student-progress/*`
- `src/lib/practice-progress-summary.ts`
- `src/App.tsx`, `src/components/shells/StudentShell.tsx`

---

## Phase 3 — Resume builder + final UI QA

**Date:** 2026-06-14  
**Branch:** `ui-upgrade-final-integration`

### Reference repos

| Repo | Role |
| --- | --- |
| [amruthpillai/reactive-resume](https://github.com/amruthpillai/reactive-resume) | Premium resume UX: live preview pane, readiness score, print-friendly layout |
| [kavyaballa1020/Resume-Builder-React](https://github.com/kavyaballa1020/Resume-Builder-React) | Simple form sections + one-column preview structure |
| [xitanggg/open-resume](https://github.com/xitanggg/open-resume) | **Inspiration only** — AGPL; no code copied |

### Reactive Resume / Resume-Builder-React ideas used

- Split editor + live preview layout
- Section cards (personal, education, projects, links)
- Readiness/completeness score with checklist
- Browser print for PDF export (no new PDF dependency)

### What was avoided

- OpenResume source (AGPL)
- Reactive Resume server sync, OAuth, or template marketplace
- PDF libraries (`jspdf`, `@react-pdf/renderer`) in v1
- AI/LLM resume suggestions or paid APIs

### Prompt guidelines used (Phase 3)

- `frontend/01-modern-ui-design-expert.txt` — ATS-friendly typography, spacing, print layout
- `frontend/11-react-engineer.txt` — controlled form state, localStorage persistence
- `debugging-quality/04-testing-qa-automation-engineer.txt` — full smoke suite after navigation expansion
- `agent-workflows/08-documentation-agent.txt` — registry + prompt map updates

### CodeQuest files touched (Phase 3)

- `src/components/pages/ResumeBuilderPage.tsx`
- `src/components/resume/*`
- `src/lib/resume-storage.ts`, `src/lib/resume-score.ts`
- `src/components/student-dashboard/ResumeReadinessCard.tsx`
- Docs: `prompt-guideline-map.md`, `README.md`, `LAUNCH.md`

### Known limitations

- Resume, calendar notes, and some assignment rows use **local/demo data** until backend endpoints exist
- Resume readiness on dashboard reads localStorage only (not synced across devices)
- Calendar resource links are placeholder URLs in demo mode

---

## Taste Skill — UI design guardrails (PR #58)

**Date:** 2026-06-14  
**Branch:** `ui-upgrade-final-integration`  
**Reference:** [gaganpasupuleti/taste-skill](https://github.com/gaganpasupuleti/taste-skill)

### Usage

- **Guidance only** — read SKILL.md concepts in the reference repo; do **not** copy files into CodeQuest or add as a dependency.
- Documented in `docs/repo-reuse-reviews/taste-skill-codequest-application.md`.
- Enforced for agents via `.cursor/rules/codequest-ui-redesign.mdc`.

### Skills applied (prompt level)

| Skill | Role on CodeQuest |
| --- | --- |
| `redesign-existing-projects` | Audit/refine existing PR #58 surfaces (dashboard, calendar, progress, resume, shell) |
| `design-taste-frontend` | Light polish on login, resume preview, auth promo |
| `minimalist-ui` | Light dashboard/product density and hierarchy |
| `brandkit` | **Not used in PR #58** |

### What was avoided

- Vendoring taste-skill into `src/`
- New UI libraries not already in `package.json`
- Rewriting practice tools, JobSpy, backend, or auth
- Experimental landing-page aesthetics in the student product shell
- AGPL or blind copy from external repos

### Design direction captured

- Modern student learning SaaS: clean, trustworthy, sharp
- No generic AI gradient stacks, childish UI, or random card grids
- Strong spacing, typography, dashboard hierarchy, mobile-first nav
- Polished empty/loading/error states
