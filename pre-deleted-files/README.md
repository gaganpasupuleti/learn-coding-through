# Pre-deleted Railway backups

Local snapshots taken **before** removing legacy Railway services.

## `postgres---1t-2026-07-09/`

Backup of legacy **JobSpy** database (`Postgres---1t`) from project `nurturing-empathy`.

**Exported:** 2026-07-09 — 12 tables, ~38,852 rows total (`jobs` 19,492, `job_keywords` 16,576, `scrape_runs` 1,418, …).

| File | Purpose |
|------|---------|
| `manifest.json` | Table list + row counts + export timestamp |
| `tables/*.json` | One JSON array per table |

### Regenerate

```bash
# Use Railway Postgres---1t DATABASE_PUBLIC_URL (never commit this URL)
set LEGACY_DATABASE_PUBLIC_URL=postgresql://...
python scripts/export_legacy_postgres_1t.py
```

### Git

**Do not commit** `tables/*.json` or connection URLs — they may contain production data.  
This folder is listed in `.gitignore`.
