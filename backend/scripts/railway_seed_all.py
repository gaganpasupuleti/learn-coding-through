"""Bootstrap Railway database with schema and seed data.

Usage (from backend/):
    python scripts/railway_seed_all.py

What it does:
1. Runs Alembic migrations
2. Seeds catalog data
3. Seeds admin + sample student users
4. Runs DB preflight validation
"""

from __future__ import annotations

import argparse
import subprocess
import sys


def run_step(name: str, cmd: list[str], *, dry_run: bool = False) -> None:
    print(f"\n== {name} ==")
    print("$", " ".join(cmd))
    if dry_run:
        print("[dry-run] skipped")
        return
    completed = subprocess.run(cmd)
    if completed.returncode != 0:
        raise SystemExit(f"Step failed: {name} (exit={completed.returncode})")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bootstrap Railway DB schema + seed data")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print bootstrap steps without executing commands",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    py = sys.executable

    run_step("Apply migrations", [py, "-m", "alembic", "upgrade", "head"], dry_run=args.dry_run)
    run_step("Seed catalog", [py, "scripts/seed_db.py"], dry_run=args.dry_run)
    run_step("Seed auth users", [py, "scripts/seed_auth_users.py"], dry_run=args.dry_run)
    run_step("DB preflight", [py, "scripts/db_preflight.py"], dry_run=args.dry_run)

    if args.dry_run:
        print("\nRailway bootstrap dry-run complete.")
    else:
        print("\nRailway bootstrap complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
