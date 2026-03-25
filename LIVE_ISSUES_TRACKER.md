# Live Product Issues Tracker

Last updated: 2026-03-25

## P0 - Critical (Blocks reliable production use)

### 1) Sandbox is unstable / unreliable
- Problem: Current sandbox behavior is inconsistent and not production-safe.
- Impact: Core learning workflows break, trust drops.
- Required outcome: Stable execution pipeline with clear language boundaries and isolation.
- Next actions:
  - Audit current sandbox failure modes and classify by language/runtime.
  - Add deterministic execution contracts (input/output/timeouts/error schema).
  - Add health checks and smoke tests for each language runtime.
  - Define rollback/fallback path when execution fails.

### 2) SQL sandbox approach needs redesign
- Problem: Existing SQL practice execution path is fragile and hard to scale safely.
- Impact: SQL learning module can fail or be unsafe.
- Required outcome: New SQL sandbox architecture with strict isolation and repeatable state.
- Next actions:
  - Choose model: ephemeral DB per session or resettable shared template.
  - Enforce statement allowlist/denylist and execution limits.
  - Version and seed SQL practice schema separately from app DB.
  - Add deterministic validator outputs for SQL tasks.

### 3) Authentication and environment drift (Supabase vs backend auth vs hosted DB)
- Problem: Login behavior differs by environment; invalid API key appears in some setups.
- Impact: Users cannot log in reliably.
- Required outcome: Single source of truth for auth in production with explicit fallback rules.
- Next actions:
  - Standardize production auth mode and document it.
  - Validate frontend env values per environment (dev/stage/prod).
  - Add startup diagnostics banner/log for active auth mode.
  - Add E2E tests for admin login, student login, signup, invalid credentials.

## P1 - High (Major product gaps)

### 4) Main student login should have full feature parity (not demo-like restrictions)
- Problem: Real student experience has friction/parity mismatch with expected full product behavior.
- Impact: Paying/real users experience constraints similar to demo.
- Required outcome: Real students have full unlocked path according to role/progress policy.
- Next actions:
  - Audit all feature gates (projects, quizzes, practice, roadmap, execution limits).
  - Separate demo gating from authenticated student gating in one policy layer.
  - Add tests for demo user vs student user entitlement matrix.

### 5) Projects appear locked unexpectedly
- Problem: Lock/unlock logic is confusing or over-restrictive.
- Impact: Users cannot start intended learning paths.
- Required outcome: Transparent unlock rules with predictable progression.
- Next actions:
  - Define unlock rule contract per project/role/stage.
  - Expose lock reason in UI when blocked.
  - Ensure backend progress persistence and unlock checks are consistent.

### 6) Career Mapper UI needs improvement
- Problem: Current career mapper UX/UI quality is not at target.
- Impact: Lower engagement and clarity for role planning.
- Required outcome: Cleaner, consistent, production-ready mapper UX.
- Next actions:
  - Run UI/UX review for hierarchy, readability, and responsiveness.
  - Unify typography, spacing, and interaction patterns with app shell.
  - Validate desktop/mobile behavior with accessibility checks.

### 7) Resume maker not built
- Problem: Resume creation workflow is incomplete/missing as a full product module.
- Impact: Missing core placement feature.
- Required outcome: End-to-end resume builder with export and role-fit scoring.
- Next actions:
  - Define MVP sections (profile, skills, projects, experience, links).
  - Implement save/load templates and markdown/pdf export path.
  - Integrate role-skill matching and ATS-style score.

### 8) Job portal not complete
- Problem: Job portal capability is incomplete for live operations.
- Impact: Placement pipeline not production-ready.
- Required outcome: Full recruiter/job workflow with student eligibility and application tracking.
- Next actions:
  - Finalize job posting CRUD + eligibility rules + status transitions.
  - Add student application flow and admin/recruiter review views.
  - Add metrics for conversion funnel (applied/shortlisted/hired).

### 9) Typing test module missing (email writing + code typing)
- Problem: No dedicated typing practice to improve speed and accuracy for real interview tasks.
- Impact: Students cannot benchmark or improve practical typing performance over time.
- Required outcome: Built-in typing tests for professional email writing and coding syntax typing with score tracking.
- Next actions:
  - Add two test modes: email composition typing and code typing drills.
  - Track WPM, accuracy percentage, error count, and completion time per attempt.
  - Store per-user score history and show progress trend charts.
  - Add timed difficulty levels and weekly improvement goals.
  - Add leaderboard or percentile comparison for motivation (optional first release).

## P2 - Medium (Strategic improvements)

### 10) Real-time syllabus and role tracking for live job outcomes
- Problem: Syllabus/roles are not fully aligned to real-time job tracking outcomes.
- Impact: Learning path relevance can drift from hiring demand.
- Required outcome: Live-updated syllabus-role-job mapping.
- Next actions:
  - Define role competency graph and syllabus mapping schema.
  - Add job-market signal inputs and periodic refresh process.
  - Show role readiness and gap trend over time.

### 11) Supabase DB issues review and migration to Railway strategy
- Problem: Current DB strategy is mixed/unclear across environments.
- Impact: Data consistency and deployment reliability risks.
- Required outcome: Clear migration plan and single production DB strategy.
- Next actions:
  - Inventory schema/data and auth dependencies tied to Supabase.
  - Decide target architecture (Railway Postgres + auth model).
  - Write migration playbook: backup, transform, verify, rollback.
  - Validate post-migration with auth/progress/quiz/project/resume/job checks.

## Execution Plan (Suggested)

### Sprint A (Stability first)
- Fix auth/env consistency.
- Stabilize generic sandbox and SQL sandbox redesign decision.
- Resolve project lock parity for real students.

### Sprint B (Core product completeness)
- Resume maker MVP.
- Job portal full workflow.
- Career mapper UI cleanup.
- Typing test module (email + code) with score tracking.

## Sprint B Execution (Active)

### Goal
- Ship complete student-facing core modules needed for placements and measurable practice progress.

### Build Order (Do in sequence)
1. Typing test MVP (email + code) with scoring and history.
2. Resume maker MVP end-to-end (create, edit, save, export).
3. Job portal workflow completion (student apply + admin review pipeline).
4. Career mapper UI polish and consistency pass.

### Milestone B1 - Typing Test MVP
- Scope:
  - Two test modes: email writing and code typing.
  - Metrics: WPM, accuracy, errors, elapsed time.
  - Score history per user and trend chart.
- Backend deliverables:
  - Typing attempts table/model.
  - APIs for submit attempt and fetch history.
- Frontend deliverables:
  - Typing test screen with timer and live metrics.
  - Score history panel and trend view.
- Exit criteria:
  - User can complete test and see saved scores across sessions.

### Milestone B2 - Resume Maker MVP
- Scope:
  - Profile, skills, projects, experience, links sections.
  - Save/load templates.
  - Export to markdown/PDF.
  - Integrate existing `resume app/Resume-Matcher` code into main app flow.
- Integration prerequisite:
  - Current state: `resume app/Resume-Matcher` is tracked as an embedded repository (gitlink), not normal source files.
  - Decide one approach before feature work:
    - Keep as submodule and define independent release/versioning.
    - Flatten/import files into this repo and remove nested `.git` metadata.
  - Add clear route/entrypoint from main student app to resume module.
- Exit criteria:
  - User can build, save, and export resume without manual formatting.
  - Resume module is directly accessible from the main app navigation in production build.

### Milestone B3 - Job Portal Completion
- Scope:
  - Job posting CRUD finalized.
  - Student application flow.
  - Admin/recruiter review and status transitions.
- Exit criteria:
  - End-to-end apply to review workflow functional with audit trail.

### Milestone B4 - Career Mapper UI Cleanup
- Scope:
  - Improve readability, spacing, visual hierarchy, and responsiveness.
  - Align components with common app design language.
- Exit criteria:
  - UX review passes on desktop/mobile with no major readability issues.

### Sprint B Definition of Done
- Typing test, resume maker, and job flow are usable in production paths.
- Career mapper has no major UI/UX blockers.
- Key user journeys are covered by smoke tests.

### Sprint C (Scale and data strategy)
- Real-time syllabus-role-job tracking.
- Supabase to Railway migration execution.

## Definition of Done (Global)
- No critical login failures across environments.
- Sandbox pass rate and timeout/error telemetry in place.
- Demo and student entitlement matrix fully tested.
- Resume + job modules usable end-to-end in production.
- DB migration validated with rollback plan.
