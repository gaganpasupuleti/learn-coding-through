"""One-shot export for legacy Railway Postgres---1t before service deletion.

Usage (do not commit the URL):
  set LEGACY_DATABASE_PUBLIC_URL=postgresql://...
  python scripts/export_legacy_postgres_1t.py
"""

from __future__ import annotations

import json
import os
import sys
from datetime import date, datetime, time
from decimal import Decimal
from pathlib import Path
from uuid import UUID

import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor


def _json_default(value: object) -> str:
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, (bytes, memoryview)):
        return bytes(value).decode("utf-8", errors="replace")
    return str(value)


def main() -> int:
    database_url = (os.environ.get("LEGACY_DATABASE_PUBLIC_URL") or "").strip()
    if not database_url:
        print("Set LEGACY_DATABASE_PUBLIC_URL to Postgres---1t DATABASE_PUBLIC_URL.", file=sys.stderr)
        return 1

    out_dir = Path("pre-deleted-files/postgres---1t-2026-07-09")
    tables_dir = out_dir / "tables"
    tables_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, object] = {
        "source_service": "Postgres---1t",
        "source_project": "nurturing-empathy",
        "exported_at_utc": datetime.utcnow().isoformat() + "Z",
        "tables": [],
    }

    with psycopg2.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name
                """
            )
            table_names = [row[0] for row in cur.fetchall()]

        for table in table_names:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql.SQL("SELECT * FROM {}").format(sql.Identifier(table)))
                rows = cur.fetchall()

            payload = [dict(row) for row in rows]
            table_path = tables_dir / f"{table}.json"
            table_path.write_text(
                json.dumps(payload, indent=2, default=_json_default),
                encoding="utf-8",
            )
            manifest["tables"].append({"name": table, "row_count": len(payload), "file": str(table_path.as_posix())})

    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
