# Backend

This directory contains the FastAPI application along with directory structures for different language executions.

## Supabase DB Setup

Config source: settings are read from `backend/.env` regardless of where commands are executed.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your Supabase connection string.
3. For first bootstrapping run, keep `AUTO_CREATE_TABLES=true` once, then switch it to `false`.
4. Set frontend origins in `CORS_ORIGINS` (comma-separated).

Example:

```
DATABASE_URL=postgresql+psycopg2://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
AUTO_CREATE_TABLES=false
CORS_ORIGINS=http://localhost:5000,http://localhost:5173
```

## Admin Portal Bootstrap (First Admin)

The UI opens the Admin portal only when `/api/v1/auth/me` returns `role: "admin"`.
To bootstrap your first admin account, set these values in `backend/.env` before starting the API:

```
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=Admin@12345
BOOTSTRAP_ADMIN_FULL_NAME=Platform Admin
```

On startup, the backend creates (or upgrades) that user to admin automatically. Then login from the frontend with the same credentials.

## One-Click User Seeding (Admin + Students)

To create a ready-to-use admin and sample student accounts in the current database:

```
python scripts/seed_auth_users.py
```

Default credentials after running:

- Admin: `admin@example.com` / `Admin@12345`
- Students: `student1@codequest.dev`, `student2@codequest.dev`, `student3@codequest.dev` / `Student@123`

Optional flags:

```
python scripts/seed_auth_users.py --student-count 10 --student-password "Student@123" --student-prefix student
```

## Optional: Auto-start Resume Module Backend

If you want `backend/app/main.py` to start the Resume-Matcher backend automatically,
set the following in `backend/.env`:

```
AUTO_START_RESUME_BACKEND=true
RESUME_BACKEND_HOST=127.0.0.1
RESUME_BACKEND_PORT=8001
```

Optional override:

```
RESUME_BACKEND_PYTHON=C:/absolute/path/to/python.exe
```

Notes:

- This auto-start only launches the Resume-Matcher backend API, not the Resume-Matcher frontend UI.
- If `RESUME_BACKEND_HOST:RESUME_BACKEND_PORT` is already in use, auto-start is skipped.
- The expected Resume-Matcher backend directory is `resume app/Resume-Matcher/apps/backend` relative to repo root.

## Migrations (Alembic)

Install dependencies and run migrations from the `backend` directory:

```
pip install -r requirements.txt
alembic upgrade head
python scripts/db_preflight.py
```

Create a new migration after model changes:

```
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## DB-Only Workflow (No Hosting Yet)

If you want to focus only on Supabase/database setup now:

1. Copy `.env.supabase.example` to `.env`.
2. Fill your real Supabase `DATABASE_URL` and `SECRET_KEY`.
3. Run migrations:

```
alembic upgrade head
```

4. Run DB preflight check:

```
python scripts/db_preflight.py
```

Expected result: `All required tables are present`.

## Railway Deployment (Backend)

The repo includes a ready Railway config at project root: `railway.toml`.

### 1) Create Railway service

1. In Railway, create a new project from this GitHub repo.
2. Keep default root (repo root). Railway reads `railway.toml` automatically.
3. Deploy once to validate build/start.

### 2) Set environment variables in Railway

Set these values in Railway service variables:

- `ENVIRONMENT=production`
- `SECRET_KEY=<strong-random-secret>`
- `DATABASE_URL=<supabase-pooler-url-with-sslmode=require>`
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440`
- `AUTO_CREATE_TABLES=false`
- `CORS_ORIGINS=https://<your-frontend-domain>`

### 3) Redeploy and verify

- Railway start command runs migrations first (`alembic upgrade head`).
- Health check path is `/health`.
- Verify:

```
GET /health
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/credits/balance
```

### Notes

- `railway.toml` uses `backend/requirements.txt` for install and `backend/scripts/railway_start.sh` for startup.
- If frontend domain changes, update `CORS_ORIGINS` and redeploy.