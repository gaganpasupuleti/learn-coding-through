# Taste Skill → CodeQuest application guide

**PR:** [#58 — Upgrade student dashboard, calendar, progress tracker, and resume builder](https://github.com/gaganpasupuleti/learn-coding-through/pull/58)  
**Branch:** `ui-upgrade-final-integration`  
**Reference:** [gaganpasupuleti/taste-skill](https://github.com/gaganpasupuleti/taste-skill) — **guidance only, not runtime code**

## Non-negotiables

- **Do not copy** Taste Skill repo files, SKILL.md bodies, or AGPL/external code into CodeQuest.
- **Do not install** Taste Skill as an app dependency or import it at build/runtime.
- **Do not rewrite** working features (auth, practice execution, JobSpy contract, admin, backend, DB).
- **Do not add** new UI libraries unless they already exist in root `package.json`.
- CodeQuest is a **student learning SaaS**, not an experimental marketing landing page or portfolio demo.

## What Taste Skill is for here

Taste Skill is a set of **prompt/design guardrails** for agents polishing PR #58 surfaces. Use it to audit and refine layout, typography, spacing, hierarchy, and states—not to replace product logic.

| Taste Skill install name | How we use it on CodeQuest | Intensity |
| --- | --- | --- |
| `redesign-existing-projects` (**redesign-skill**) | Primary: audit existing dashboard, calendar, progress, resume, `StudentShell` | **Full** |
| `design-taste-frontend` (**taste-skill**) | Light pass on login, resume preview, landing-adjacent promo panels | **Light** |
| `minimalist-ui` (**minimalist-skill**) | Light pass on dashboard/product density, card hierarchy, nav | **Light** |
| `brandkit` | **Not now** — defer until brand tokens are finalized | — |

## Product design direction

CodeQuest should feel like a **modern student learning SaaS**:

| Aim for | Avoid |
| --- | --- |
| Clean, trustworthy, sharp | Childish illustrations or gamified clutter |
| Strong spacing and typographic hierarchy | Generic AI purple/blue gradient heroes |
| Purposeful cards with clear primary actions | Random cards everywhere with equal visual weight |
| Polished empty, loading, and error states | Blank panels or silent failures |
| Mobile-first `StudentShell` navigation | Outdated Bootstrap-style dense forms |
| Subtle motion only where it aids orientation | Heavy scroll animations or magnetic cursors in learning tools |

**Palette note:** Keep CodeQuest blue as the primary accent where already established; refine contrast and neutrals rather than swapping to trendy gradient stacks.

## In-scope surfaces (PR #58)

| Area | Files (indicative) | Taste Skill focus |
| --- | --- | --- |
| Dashboard | `StudentDashboardPage`, `student-dashboard/*` | Hierarchy: today → deadlines → progress → practice; reduce card noise |
| Calendar | `StudentCalendarPage`, `student-calendar/*` | Month + detail split; clear selected date; demo empty states |
| Progress | `StudentProgressPage`, `student-progress/*` | Metrics row, skill grid scanability, mistakes CTA |
| Resume | `ResumeBuilderPage`, `resume/*` | Editor/preview balance, print typography, form grouping |
| Login | `LoginPage`, `AuthPromoPanel` | Trust, clarity, no landing-page theatrics |
| Shell | `StudentShell.tsx` | Nav density, active states, mobile scroll, account menu |

## Out of scope (do not change in Taste Skill passes)

- `/practice/code`, `/practice/sql`, `/practice/typing` **execution** and workbench internals
- SQL editor, schema viewer, code runner, typing engine
- JobSpy API contract and job listing behavior
- Backend routes, models, migrations, production DB
- Admin portal (unless explicitly requested in a separate PR)

## Redesign audit protocol (from redesign-skill, adapted)

Before changing JSX/CSS on an in-scope page:

1. **Inventory** — List primary user goal on this screen in one sentence.
2. **Hierarchy** — One hero/primary block; secondary metrics; tertiary links.
3. **Spacing** — Use consistent section rhythm (`p-4 md:p-6`, `gap-6`, card `p-6`); avoid nested boxes without purpose.
4. **Typography** — Page title `text-2xl md:text-3xl font-bold`; section `text-lg font-semibold`; meta `text-sm text-slate-500`.
5. **States** — Every list/calendar block needs loading skeleton or copy, empty illustration/text, and error/retry where API can fail.
6. **Diff discipline** — Prefer editing existing components over new abstractions; match `dashboard-styles.ts` / shadcn patterns.

## Minimalist checks (light)

- Remove duplicate CTAs (e.g. two “open calendar” paths with same weight).
- Align card headers: title left, action link right, one line of helper text max.
- Limit gradient usage to **one** hero per page (dashboard welcome is enough).

## Taste checks (light — login / resume / promo)

- Login: form legibility, focus rings, promo panel does not compete with sign-in.
- Resume: ATS preview stays single-column, high contrast, no decorative fonts.
- No em-dash spam, no “AI slop” marketing copy in student product chrome.

## Libraries

Use what CodeQuest already ships:

- Tailwind CSS v4, Radix/shadcn primitives, Lucide icons, existing `Card`, `Button`, `CircularProgress`, etc.
- `react-day-picker` / `date-fns` for calendar (already installed).
- **Do not add** GSAP, Framer-heavy new deps, or chart libraries for this PR unless already in `package.json`.

## Workflow for agents

1. Read this doc + `.cursor/rules/codequest-ui-redesign.mdc`.
2. Open the Taste Skill SKILL.md in the reference repo **in the browser or a separate tab** — do not vendor it into `src/`.
3. Apply audit to **one page at a time**; run `npm run build` after each batch.
4. Log what was inspired (not copied) in `ui-repo-review-registry.md`.

## Related docs

- [prompt-guideline-map.md](./prompt-guideline-map.md)
- [ui-repo-review-registry.md](./ui-repo-review-registry.md)
- Cursor rule: `.cursor/rules/codequest-ui-redesign.mdc`
