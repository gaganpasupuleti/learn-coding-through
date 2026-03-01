# Release Notes — V2 Experience Rollout

Date: 2026-02-18  
Commit: dd41ddcc7f73051a2d75d13c7ee9536b0b8f8e04

## Summary
This release introduces a full V2 experience across the product with palette-based theming, route-level V2 pages, expanded admin/roadmap capabilities, and clearer progress tracking UX.

## Frontend
- Added app-wide V2 mode and persistent palette switching (`Executive`, `Sapphire`, `Royal`).
- Added V1/V2 experience toggles on landing and backward-compatible query handling.
- Added route-level V2 pages:
  - `LandingPageV2`
  - `ProjectsPageV2`
  - `PracticePageV2`
  - `QuizPageV2`
  - `RoadmapperPageV2`
  - `AdminPageV2`
  - `ProjectLearningPageV2`
- Added V2 surface styling in global CSS for cards, navigation, and page shells.
- Improved Roadmapper stage representation with:
  - Completed stage visibility
  - Current stage status
  - Pending assignments checklist to unlock next stage
- Updated Practice V2 to use pill-based tracks with assignment cards and focused workspace sections.

## Backend
- Added admin API module with expanded endpoints for:
  - students/metrics/activity
  - batches and class insights
  - jobs and role-split insights
- Extended data models for learning operations and job portal workflows.
- Added and exported dedicated admin schemas.

## Database Migrations
- `20260217_02_admin_student_fields_and_audit.py`
  - Admin student profile fields and audit log support.
- `20260218_03_learning_ops_and_job_portal.py`
  - Learning batches, enrollments, jobs, applications, and enum-backed workflow fields.

## Validation
- Frontend build passes with `npm run build`.
- Existing warnings are non-blocking (CSS optimizer media parsing and bundle chunk-size notices).

## Next Suggested Steps
1. Continue deep V2 rewrite for Roadmapper and Admin page internals (beyond wrapper-level polish).
2. Add per-track auto-sync in Practice V2 (pill selects default language in workspace).
3. Add release tags and changelog link in README.
