# Live Product Issues Tracker

Last updated: 2026-04-18

## Current Status Snapshot (2026-04-05)

### P0 #3 Authentication and environment drift
- Status: PARTIAL
- Completed now:
  - Local runtime mapping fixed so both modules run together:
    - Main UI `:5000` -> Main backend `:8000`
    - Resume UI `:3000` -> Resume backend `:8001`
  - Resume handoff from main UI no longer hard-fails in demo/no-token flow.
- Still pending:
  - Define one production auth source of truth (no mixed modes).
  - Add explicit env validation per environment (dev/stage/prod).
  - Add E2E auth matrix (admin/student/signup/invalid credentials).

### P1 #7 Resume maker not built
- Status: PARTIAL
- Completed now:
  - Resume module is reachable from main navigation in local runtime.
  - Resume backend + LLM health path verified as healthy via `/api/v1/health`.
- Still pending:
  - Full MVP completion checklist (template save/load + export hardening + role-fit scoring validation).
  - Production-grade route/entrypoint hardening and smoke tests.

### P2 #12 Supabase issues review and Railway migration strategy
- Status: PARTIAL
- Completed now:
  - Local development decoupled from broken Supabase dependency path.
  - Local stack stabilized for concurrent main + resume workflows.
- Still pending:
  - Formal migration playbook (backup, transform, verify, rollback).
  - Production environment cutover plan and post-migration verification suite.

## Planned Feature Tracks (2026-04-18)

### [FEATURE] Lean ATS Resume Analyzer Pipeline (Local Parsing + Hugging Face)

- Status: COMPLETED (2026-04-18)
- Objective: Replace the expensive, token-heavy LLM resume parser with a hybrid architecture: Local text extraction + Local algorithmic scoring + Lean AI improvement suggestions. Deploy safely to Railway.

#### Phase 1: Local Parsing and Scoring (Shift Left)
- [x] Install local dependencies: `pdfplumber`, `python-docx`, `spacy`.
- [x] Build `local_extractor.py` to pull raw text from PDFs and DOCX files locally.
- [x] Build `ats_scorer.py` using spaCy/Regex to calculate the ATS match percentage locally by comparing extracted resume text against the Job Description.
- [x] Output a structured dictionary containing `ats_score`, `matching_skills`, and `missing_skills`.

#### Phase 2: Prompt Minimization and Local AI Testing
- [x] Design the Lean Prompt: completely eliminate sending full resume text. The prompt must only contain `job_role` and `missing_skills`.
- [x] Build `ai_service.py` with an interface to test locally first (for example, pointing to a local Ollama instance running Mistral/Llama3).
- [x] Validate that token usage is drastically reduced and suggestions are highly targeted (2-3 bullet points max).

#### Phase 3: Hugging Face Integration
- [x] Swap the local AI endpoint for the Hugging Face Serverless Inference API (`huggingface_hub`).
- [x] Implement robust error handling (try/except) to catch HTTP 429 (Too Many Requests) from the free tier.
- [x] Implement a graceful fallback message if the Hugging Face API is unavailable so the app does not crash.

#### Phase 4: Railway Deployment Prep
- [x] Update `apps/backend/requirements.txt` with the new lean dependencies.
- [x] Add `HF_API_KEY` to `apps/backend/.env.example` and `apps/backend/.env.railway.example`.
- [x] Document the requirement to add the `HF_API_KEY` environment variable in the Railway project dashboard before deployment.
- [x] Verify Docker build passes with the new NLP dependencies.

## P0 - Critical (Blocks reliable production use)

### 1) [PENDING] Sandbox is unstable / unreliable
- Problem: Current sandbox behavior is inconsistent and not production-safe.
- Impact: Core learning workflows break, trust drops.
- Required outcome: Stable execution pipeline with clear language boundaries and isolation.
- Progress update (2026-04-05, pass-2):
  - Added deterministic degraded fallback path in execute API to avoid raw 500s when executors crash.
  - Added execution telemetry counters (total/success/failure/fallback, error-code distribution, recent failure log).
  - Added runtime diagnostics endpoint for sandbox telemetry visibility.
- Next actions:
  - Add persistent telemetry sink (file/DB) and dashboard wiring for long-term trend analysis.
  - Add alert thresholds for fallback spikes and timeout anomalies.
  - Add explicit operator runbook for degraded mode and service recovery steps.

### 2) [PENDING] SQL sandbox approach needs redesign
- Problem: Existing SQL practice execution path is fragile and hard to scale safely.
- Impact: SQL learning module can fail or be unsafe.
- Required outcome: New SQL sandbox architecture with strict isolation and repeatable state.
- Next actions:
  - Choose model: ephemeral DB per session or resettable shared template.
  - Enforce statement allowlist/denylist and execution limits.
  - Version and seed SQL practice schema separately from app DB.
  - Add deterministic validator outputs for SQL tasks.

### 3) [PARTIAL] Authentication and environment drift (Supabase vs backend auth vs hosted DB)
- Problem: Login behavior differs by environment; invalid API key appears in some setups.
- Impact: Users cannot log in reliably.
- Required outcome: Single source of truth for auth in production with explicit fallback rules.
- Next actions:
  - Standardize production auth mode and document it.
  - Validate frontend env values per environment (dev/stage/prod).
  - Add startup diagnostics banner/log for active auth mode.
  - Add E2E tests for admin login, student login, signup, invalid credentials.

### 13) [PARTIAL] Assessment integrity controls missing (no screenshot/screen-recording safeguards)
- Problem: Quiz/typing assessments currently do not enforce integrity controls against easy answer capture and sharing.
- Impact: Students can capture and redistribute answers; scoring reliability drops for evaluative use cases.
- Required outcome: Add practical anti-cheat controls and explicit policy for assessment mode.
- Next actions:
  - Add assessment mode flags that disable copy, context menu, and text selection where possible.
  - Add blur/visibility-change detection to auto-pause or flag attempts when app loses focus.
  - Add mobile guidance + deterrence UI for screenshots/screen recording (best effort; platform limits apply).
  - Add server-side attempt flags (focus loss count, suspicious timing, repeated perfect attempts) for reviewer audit.
  - Split "practice mode" and "assessment mode" behavior so anti-cheat controls are opt-in and auditable.

## P1 - High (Major product gaps)

### 4) [PENDING] Main student login should have full feature parity (not demo-like restrictions)
- Problem: Real student experience has friction/parity mismatch with expected full product behavior.
- Impact: Paying/real users experience constraints similar to demo.
- Required outcome: Real students have full unlocked path according to role/progress policy.
- Next actions:
  - Audit all feature gates (projects, quizzes, practice, roadmap, execution limits).
  - Separate demo gating from authenticated student gating in one policy layer.
  - Add tests for demo user vs student user entitlement matrix.

### 5) [PENDING] Projects appear locked unexpectedly
- Problem: Lock/unlock logic is confusing or over-restrictive.
- Impact: Users cannot start intended learning paths.
- Required outcome: Transparent unlock rules with predictable progression.
- Next actions:
  - Define unlock rule contract per project/role/stage.
  - Expose lock reason in UI when blocked.
  - Ensure backend progress persistence and unlock checks are consistent.

### 6) [PENDING] Career Mapper UI needs improvement
- Problem: Current career mapper UX/UI quality is not at target.
- Impact: Lower engagement and clarity for role planning.
- Required outcome: Cleaner, consistent, production-ready mapper UX.
- Next actions:
  - Run UI/UX review for hierarchy, readability, and responsiveness.
  - Unify typography, spacing, and interaction patterns with app shell.
  - Validate desktop/mobile behavior with accessibility checks.

### 7) [PARTIAL] Resume maker not built
- Problem: Resume creation workflow is incomplete/missing as a full product module.
- Impact: Missing core placement feature.
- Required outcome: End-to-end resume builder with export and role-fit scoring.
- Next actions:
  - Define MVP sections (profile, skills, projects, experience, links).
  - Implement save/load templates and markdown/pdf export path.
  - Integrate role-skill matching and ATS-style score.

### 8) [PENDING] Job portal not complete
- Problem: Job portal capability is incomplete for live operations.
- Impact: Placement pipeline not production-ready.
- Required outcome: Full recruiter/job workflow with student eligibility and application tracking.
- Next actions:
  - Finalize job posting CRUD + eligibility rules + status transitions.
  - Add student application flow and admin/recruiter review views.
  - Add metrics for conversion funnel (applied/shortlisted/hired).

### 9) [PARTIAL] Typing test module missing (email writing + code typing)
- Problem: No dedicated typing practice to improve speed and accuracy for real interview tasks.
- Impact: Students cannot benchmark or improve practical typing performance over time.
- Required outcome: Built-in typing tests for professional email writing and coding syntax typing with score tracking.
- Next actions:
  - Add two test modes: email composition typing and code typing drills.
  - Track WPM, accuracy percentage, error count, and completion time per attempt.
  - Store per-user score history and show progress trend charts.
  - Add timed difficulty levels and weekly improvement goals.
  - Add leaderboard or percentile comparison for motivation (optional first release).

### 10) [PENDING] Learning library module missing (books, PDFs, articles)
- Problem: There is no centralized place for students to view and read learning resources shared by admins.
- Impact: Study materials are fragmented and hard to discover during learning flow.
- Required outcome: In-app content library for books, PDFs, and articles with filtering and progress-friendly UX.
- Next actions:
  - Add content types: book, PDF, article with title, author/source, topic, difficulty, and URL/file reference.
  - Build admin upload/publish workflow for adding and updating resources.
  - Add student library UI with search, filters, and open/read actions.
  - Track per-user resource interactions (opened/read/bookmarked).
  - Add role/category tagging to map resources to career paths and syllabus weeks.

### 14) [IMPLEMENTED] Resume module split into two explicit flows (With AI / Without AI)
- Problem: Resume workflow currently mixes AI-required actions (tailor, enrichment, cover-letter generation) with non-AI actions (upload/edit/export), causing user confusion when LLM is not configured.
- Impact: Students cannot clearly understand which resume actions are always available versus which require AI setup.
- Required outcome: Two explicit resume tracks with clear UX boundaries:
  - Without AI: upload/create, edit, save, reorder sections, and export PDF.
  - With AI: tailoring to JD, enrichment/regeneration, role-fit enhancement, cover letter/outreach generation.
- Next actions:
  - Add Resume landing chooser with two cards: "Resume Builder (No AI)" and "AI Resume Assistant".
  - Route "Resume Builder (No AI)" directly to dashboard/builder path even when `llm_configured=false`.
  - Keep "AI Resume Assistant" path gated by `llm_configured` and show setup CTA to Settings.
  - Gate master resume enrichment button by LLM readiness to avoid AI action failures in non-AI mode.
  - Add badges/labels in UI: "AI required" vs "No AI required" on actions and entrypoints.
  - Add E2E matrix: no-key user can complete full non-AI resume lifecycle; configured-key user can complete both flows.
- Exit criteria:
  - User can build and export a full resume without API key setup.
  - AI actions are visible but blocked with clear reason and one-click setup path.
  - No broken AI endpoint calls occur from the non-AI flow.

### 15) [PENDING] Resume module production hosting completeness
- Problem: Resume module works locally but production hardening/checklist for hosted path is incomplete.
- Impact: Risk of broken handoff, CORS mismatch, and partial rollout in production.
- Required outcome: Resume module hosted and verified end-to-end with main app handoff.
- Next actions:
  - Define final production URLs for main app, resume frontend, and resume backend.
  - Validate handoff token/user payload from main app to resume app in hosted environment.
  - Lock CORS for production domains and verify preflight for all resume APIs.
  - Add smoke checks: upload, edit, tailor (if AI enabled), PDF export, return-to-main link.
  - Add rollback notes and incident fallback route if resume app is unavailable.
- Exit criteria:
  - Main app -> Resume handoff works in production without manual URL changes.
  - Resume upload/edit/export passes hosted smoke tests.

### 16) [PENDING] Resume template/design library expansion
- Problem: Current resume design options are limited compared to expected market variety.
- Impact: Lower user adoption and weaker perceived quality.
- Required outcome: Multi-template resume library with modern, ATS-safe variants.
- Next actions:
  - Define template catalog v1: Minimal ATS, Modern Single, Modern Two-Column, Executive, Creative, Compact.
  - Create shared design token contract (spacing/typography/color) so all templates remain editable.
  - Add template preview gallery with quick apply and compare mode.
  - Add template quality checks: ATS readability, print/PDF consistency, mobile preview compatibility.
  - Build phased backlog for +20 templates (v2) with localization-safe typography handling.
- Exit criteria:
  - At least 6 production-ready templates with stable PDF output and no content loss.

### 17) [PENDING] Resume module mobile-first usability
- Problem: Resume flow is desktop-oriented; mobile experience is inconsistent.
- Impact: High friction for users creating/editing resumes on phones.
- Required outcome: Mobile-first resume editing/viewing with responsive controls and readable preview.
- Next actions:
  - Add mobile breakpoints for dashboard, builder controls, and viewer actions.
  - Introduce sticky action bar on mobile for Save / Preview / Export.
  - Add touch-friendly section editing, reorder handles, and input spacing.
  - Optimize preview rendering for small screens with zoom and section collapse.
  - Run device matrix QA (Android Chrome, iOS Safari, tablet).
- Exit criteria:
  - Core flow (upload/create/edit/save/export) works cleanly on mobile viewport.

### 18) [PENDING] Authentication roadmap (email auth, password reset, support mailbox)
- Problem: Basic login/register exists, but password recovery and support-email workflow are missing.
- Impact: Account recovery and support operations are not production-ready.
- Required outcome: Complete auth lifecycle with recoverability and support contact process.
- Next actions:
  - Decide auth provider path: in-house JWT + SMTP OR managed auth provider.
  - Implement forgot-password request + tokenized reset flow with expiry.
  - Add transactional email sender configuration (free-tier compatible for MVP).
  - Add support mailbox routing and SLA workflow (support@... with ticket triage notes).
  - Add anti-abuse controls (rate limit reset requests, token replay protections).
- Exit criteria:
  - User can request password reset, receive mail, and set a new password securely.

### 19) [PENDING] Login personas cleanup (master logins, testing logins, demo registration flow)
- Problem: Current login mixes direct demo entry with regular auth; seeded operational accounts need clearer policy.
- Impact: Confusing QA and production onboarding behavior.
- Required outcome: Clear persona-based login paths for production, testing, and demo.
- Next actions:
  - Create seeded master/admin + test student accounts using controlled script/config.
  - Move demo experience from instant login to explicit demo registration/start flow.
  - Keep production login path strict (email/password) and separate non-prod shortcuts.
  - Add environment guardrails so test/demo accounts are not exposed unintentionally in prod.
  - Document credentials lifecycle and rotation policy for seeded accounts.
- Exit criteria:
  - Distinct flows exist for production users, testers, and demo users with no ambiguity.

### 20) [PARTIAL] Skill Gap Analyzer modal layout and responsiveness issues
- Problem: The Skill Gap Analyzer view in Career Map shows layout breakage (horizontal overflow, cramped cards, clipped labels/chips, and nested scrollbars) inside the modal on common desktop viewport sizes.
- Impact: Readability and usability are degraded, roadmap details are hard to scan, and users may miss recommendations/actions.
- Required outcome: A stable, fully responsive Skill Gap Analyzer modal with clean vertical flow and no unintended horizontal scroll.
- Next actions:
  - Enforce modal width/height constraints with responsive breakpoints and predictable internal spacing.
  - Remove horizontal overflow from roadmap month cards; use wrap/stack behavior instead of overflow scrolling.
  - Fix chip/label positioning so badges (for example, focus hints) stay inside card bounds.
  - Normalize card typography/line-height so readiness metrics and recommendations remain readable on small/medium screens.
  - Ensure one primary scroll container only (modal body), avoiding nested scrollbar conflicts.
  - Add visual regression checks for Skill Gap Analyzer at key widths (1366, 1024, 768, 390).
- Exit criteria:
  - No horizontal scrollbar appears in the Skill Gap Analyzer modal at supported breakpoints.
  - All roadmap cards, labels, and readiness metrics render fully without clipping.
  - Desktop and mobile viewport QA passes for the Career Map -> Skill Gap Analyzer flow.

## Tonight Delivery Plan (Target: 2026-04-07 01:00)

### Can finish by 01:00 (realistic cutline)
1. Resume split UX implementation (With AI / Without AI entry + clear gating labels).
2. Resume production-hosting checklist + local/hosted smoke script updates.
3. Seeded master/test login setup + documented credentials for QA.
4. Demo flow policy update in UI copy and issue tracker (demo as explicit registration/start path).

### Likely not complete by 01:00 (requires follow-up)
1. Full forgot-password email delivery pipeline end-to-end.
2. Support mailbox/ticket automation.
3. Large template library (+6 to +20 polished designs).
4. Full mobile polish across all resume pages and devices.

### Post-01:00 continuation
1. Password reset + email sender integration.
2. Mobile-first refactor pass and cross-device QA.
3. Template expansion sprint with ATS and PDF regression suite.

## P2 - Medium (Strategic improvements)

### 11) [PENDING] Real-time syllabus and role tracking for live job outcomes
- Problem: Syllabus/roles are not fully aligned to real-time job tracking outcomes.
- Impact: Learning path relevance can drift from hiring demand.
- Required outcome: Live-updated syllabus-role-job mapping.
- Next actions:
  - Define role competency graph and syllabus mapping schema.
  - Add job-market signal inputs and periodic refresh process.
  - Show role readiness and gap trend over time.

### 12) [PARTIAL] Supabase DB issues review and migration to Railway strategy
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
- Learning library module (books, PDFs, articles).
- Typing test module (email + code) with score tracking.
- Resume maker MVP.
- Job portal full workflow.
- Career mapper UI cleanup.

## Sprint B Execution (Active)

### Goal
- Ship complete student-facing core modules needed for placements and measurable practice progress.

### Sprint 1 Focus (Immediate)
1. Learning library module (books, PDFs, articles).
2. Typing tester module (email + code) with scoring and history.

### Build Order (Do in sequence)
1. Learning library module for books, PDFs, and articles.
2. Typing test MVP (email + code) with scoring and history.
3. Resume maker MVP end-to-end (create, edit, save, export).
4. Job portal workflow completion (student apply + admin review pipeline).
5. Career mapper UI polish and consistency pass.

### Milestone B1 - Typing Test MVP
- Scope:
  - Two test modes: email writing and code typing.
  - Metrics: WPM, accuracy, errors, elapsed time.
  - Score history per user and trend chart.
  - Test integrity rule: once a test starts, lock all test configuration fields (timer, language, mode, difficulty, prompt set) until submission or restart.
  - Add no-screenshot/no-recording deterrence layer in assessment mode (with clear user disclosure and limitation notes).
  - Email writing practice is mandatory, not optional: include professional email composition scenarios as a first-class typing mode.
- Backend deliverables:
  - Typing attempts table/model.
  - APIs for submit attempt and fetch history.
- Frontend deliverables:
  - Typing test screen with timer and live metrics.
  - Score history panel and trend view.
- Exit criteria:
  - User can complete test and see saved scores across sessions.
  - User cannot change timer/language/settings mid-test.
  - User can practice professional email typing in addition to speed typing.

### Typing Trainer Product Notes (Added 2026-04-05)
- Hard lock during active test session:
  - Freeze timer, language, test type, difficulty, and prompt once countdown begins.
  - Provide only pause (if allowed), submit, restart, or quit actions.
- Expand Type Master beyond speed-only typing:
  - Professional email writing practice (subject line, greeting, body clarity, closing tone).
  - Context-based drills (leave request, follow-up, escalation, interview thank-you, status update).
- AI/spaCy-assisted coaching for email typing mode:
  - Grammar and punctuation quality checks.
  - Tone classification (formal, neutral, too casual) with corrective hints.
  - Readability and sentence-structure feedback.
  - Keyword/intent coverage checks against prompt goals.
- New Type Master ideas backlog:
  - Error heatmap by key and n-gram confusion patterns.
  - Personal weak-key drills generated from recent attempts.
  - Time-boxed workplace writing missions (compose under deadline).
  - Copy-edit mode: fix flawed emails under time pressure.
  - Role-based templates (developer, analyst, recruiter communication).
  - Weekly typing goals with streak rewards and percentile progress.
  - Real interview simulation: code + email context switching in one session.

### Milestone B2 - Resume Maker MVP
- Scope:
  - Profile, skills, projects, experience, links sections.
  - Save/load templates.
  - Export to markdown/PDF.
  - Integrate existing `resume app/Resume-Matcher` code into main app flow.
- Integration prerequisite:
  - Completed: `resume app/Resume-Matcher` has been flattened/imported into this repository as normal source files.
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

### Milestone B5 - Learning Library Module
- Scope:
  - Student-facing library for books, PDFs, and articles.
  - Admin workflow to add/publish/update resources.
  - Search and filter by topic, role, type, and difficulty.
- Exit criteria:
  - Students can reliably discover and open shared learning resources from within the app.

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
