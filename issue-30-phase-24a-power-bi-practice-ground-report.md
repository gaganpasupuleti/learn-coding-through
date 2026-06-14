# Issue #30 — Phase 24A: Power BI Practice Ground landing report

## A. Summary

Created a frontend-only Power BI Practice Ground landing page inside CodeQuest. Students can browse planned Power BI practice modules without Microsoft Power BI Embedded, paid APIs, Microsoft login, or backend dependencies.

## B. Files changed

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route mapping, `practice-powerbi` page key, error-boundary render block |
| `src/components/shells/StudentShell.tsx` | Learning nav link with `BarChart3` icon |
| `src/features/powerbi-practice/types/powerbiPractice.types.ts` | Route constant and module types |
| `src/features/powerbi-practice/components/PowerBiPracticePage.tsx` | Route entry component |
| `src/features/powerbi-practice/components/PowerBiLandingPage.tsx` | Landing hub UI and MVP messaging |
| `src/features/powerbi-practice/components/PowerBiModuleCard.tsx` | Reusable module card component |
| `src/features/powerbi-practice/README.md` | Feature scope and safety notes |

## C. Route

- URL: `/practice/powerbi`
- Constant: `POWERBI_PRACTICE_ROUTE`
- Internal page key: `practice-powerbi`
- Synced via existing `PRACTICE_PATH_TO_PAGE` and `syncPracticePath()` in `App.tsx`

## D. Navigation

- Added **Power BI Practice Ground** to the StudentShell **Learning** dropdown
- Icon: `BarChart3` (lucide-react)
- Page key: `practice-powerbi`

## E. Landing page

- Title: **Power BI Practice Ground**
- Dark workbench styling via shared `wb` theme tokens

**Available Soon**

- DAX Practice
- Power BI Quiz

**Coming Soon**

- Power Query Practice
- Data Modeling Practice
- Dashboard Builder Practice
- Case Studies
- Report Analysis Lab
- Power BI Embedded Report Lab

## F. MVP safety messaging

The landing page clearly states:

- This is **not a Power BI Desktop clone**
- MVP uses **frontend practice tasks** and **fictional sample datasets**
- DAX will be checked by **rules**, not real DAX execution
- **Real Power BI Embedded** comes later only after licensing/cost approval

## G. Safety confirmation

Confirmed for Phase 24A:

- No Microsoft API
- No Power BI Embedded
- No Microsoft auth / login
- No secrets
- No paid APIs
- No backend changes
- No production DB
- No real customer/banking data
- No AI / LLM

## H. Browser smoke result

Playwright smoke against preview build (demo student login):

| Check | Result |
|-------|--------|
| `/practice/powerbi` direct route | PASS |
| Learning nav → Power BI Practice Ground | PASS |
| URL sync to `/practice/powerbi` | PASS |
| All 8 module cards visible | PASS |
| MVP safety messages visible | PASS |
| `/practice/code` regression | PASS |
| `/practice/sql` regression | PASS |
| `/practice/typing` regression | PASS |

## I. Command results

| Command | Result |
|---------|--------|
| `npm run build` | PASS |
| `npx eslint src/features/powerbi-practice` | PASS |
| `npx eslint src/App.tsx src/components/shells/StudentShell.tsx` | Pre-existing unused-import warnings in `App.tsx` only (unrelated to Power BI) |

## J. Deferred work

| Phase | Scope |
|-------|-------|
| 24B | DAX Practice IDE skeleton |
| 24C | DAX validation rules + question bank |
| 24D | Power BI Quiz |
| Later | Power Query, Data Modeling, Dashboard Builder, Case Studies, Report Analysis, real Power BI Embedded |
