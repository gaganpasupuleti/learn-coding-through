# Fixture Cohort – 20 Synthetic Students

Seeds 20 students into a dedicated (or shared) database so the student dashboard, jobs page, and KPI tiles can be tested with realistic, varied data.

## Quick Start (local)

```powershell
cd <repo-root>
$env:ALLOW_FIXTURE_SEED = "1"
python backend/scripts/seed_fixture_cohort.py --confirm
```

This writes to `backend/fixture_portal.db` by default.
To seed into the main dev DB instead:

```powershell
$env:ALLOW_FIXTURE_SEED = "1"
python backend/scripts/seed_fixture_cohort.py --confirm --database-url sqlite:///./career_portal.db
```

## Options

| Flag | Purpose |
|------|---------|
| `--confirm` | Required safety gate (or set `ALLOW_FIXTURE_SEED=1`) |
| `--database-url <url>` | Target DB; defaults to `backend/fixture_portal.db` |
| `--purge-fixture-users` | Delete all `@codequest-fixture.test` rows first |
| `--i-really-mean-it-production` | Allow running when `ENVIRONMENT=production` |

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `ALLOW_FIXTURE_SEED` | (none) | Set to `1` to allow the script to run |
| `FIXTURE_COHORT_PASSWORD` | `FixtureStudent@123` | Shared password for all 20 accounts |
| `DATABASE_URL` | `sqlite:///./fixture_portal.db` | Overridden by `--database-url` if provided |

## Student Archetypes

| # | Email pattern | Archetype | Behaviour |
|---|---------------|-----------|-----------|
| 1–4 | `fixture01`–`fixture04` | **topper** | High quiz scores, many lessons, fast typing, approved projects, 3 job apps |
| 5–14 | `fixture05`–`fixture14` | **average** | Moderate progress, mixed pass/fail, some job apps |
| 15–20 | `fixture15`–`fixture20` | **skipper** | Minimal progress, failed submissions, low typing WPM, no job apps |

## Output

After a successful run the script writes `backend/fixture_cohort_logins.json` (gitignored) containing every student's email, archetype, batch, and credit balance.

A sanitised template lives at `backend/fixture_cohort_logins.example.json`.

## Railway Staging

1. Set `ALLOW_FIXTURE_SEED=1` and `DATABASE_URL` to the staging Postgres URL in the Railway service environment.
2. Run:
   ```bash
   python backend/scripts/seed_fixture_cohort.py --confirm --purge-fixture-users
   ```
3. After verification, remove `ALLOW_FIXTURE_SEED` from the environment to prevent accidental re-runs.
