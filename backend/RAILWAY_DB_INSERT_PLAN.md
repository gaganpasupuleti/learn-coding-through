# Railway DB Insert Plan

## Goal
Move to Railway-first database workflow and insert baseline data safely.

## Preconditions
- Railway Postgres is created.
- Backend service has valid `DATABASE_URL`.
- `SECRET_KEY` is set.

## Steps
1. Configure env
- Copy `.env.railway.example` to `.env`.
- Set `DATABASE_URL` to your Railway connection string.
- Set `ENVIRONMENT=production` only on hosted env (keep development locally).

2. Apply schema
- Run:
  - `python -m alembic upgrade head`

3. Insert baseline data
- Catalog:
  - `python scripts/seed_db.py`
- Users:
  - `python scripts/seed_auth_users.py`

4. Validate inserts
- Run:
  - `python scripts/db_preflight.py`
- Expect:
  - `All required tables are present`

5. One-shot command
- Use:
  - `python scripts/railway_seed_all.py`

## Rollback / Safety
- Always take a Railway DB backup snapshot before rerunning seeds on non-empty DB.
- `seed_auth_users.py` is idempotent by email and updates matching rows.
- Re-run `db_preflight.py` after any migration or seed.

### Railway Backup Checklist (Before Inserts)
1. Dashboard snapshot
- In Railway: Postgres service -> Backups -> create on-demand snapshot.

2. Logical backup (local file)
- Export `DATABASE_URL` in your shell.
- Run:
  - `pg_dump --no-owner --no-privileges --format=custom --file=backup_pre_insert.dump "$env:DATABASE_URL"`

3. Verify backup artifact
- Confirm file exists and size > 0.

### Rollback Checklist (If Insert/Migration Fails)
1. Stop application writes
- Temporarily scale down app or enable maintenance mode.

2. Restore from snapshot
- Railway dashboard restore from the pre-insert snapshot.

3. Optional local logical restore path
- `pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$env:DATABASE_URL" backup_pre_insert.dump`

4. Post-rollback verification
- `python scripts/db_preflight.py`
- `GET /health`
- `GET /health/db`

## Suggested First Insert Set
- Admin account (`admin@example.com`).
- 3 sample students.
- Project + quiz catalog baseline.

## Verification API checks
- `GET /health`
- `GET /health/db`
- `POST /api/v1/auth/login`
- `GET /api/v1/projects/catalog`
- `GET /api/v1/quiz/catalog`
