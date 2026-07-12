"""Scrape all India job profiles (5-day window) then run skill enrichment + Excel export."""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND))

from app.core.database import SessionLocal
from app.services.job_profiles import SCRAPE_PROFILES
from app.services.job_refresh import run_profile_refresh

HOURS_OLD = 5 * 24
RANGE_LABEL = "Range: last 5 days"
PROFILES = tuple(SCRAPE_PROFILES.keys())


def scrape_all() -> None:
    db = SessionLocal()
    totals = {"found": 0, "saved": 0, "dupes": 0}
    try:
        for key in PROFILES:
            print(f"\n--- Scraping: {key} ---")
            try:
                r = run_profile_refresh(
                    db,
                    profile_key=key,
                    sources=None,
                    run_type="manual",
                    triggered_by="full_pipeline",
                    hours_old=HOURS_OLD,
                    range_label=RANGE_LABEL,
                )
                found, saved, dupes = r.get("totalFound", 0), r.get("savedCount", 0), r.get("skippedDuplicates", 0)
                totals["found"] += found
                totals["saved"] += saved
                totals["dupes"] += dupes
                print(f"  status={r.get('status')} found={found} saved={saved} dupes={dupes}")
                if r.get("errors"):
                    print(f"  errors: {r['errors'][:2]}")
            except Exception as exc:
                print(f"  FAILED: {exc}")
        print(f"\nScrape totals: found={totals['found']} saved={totals['saved']} dupes={totals['dupes']}")
    finally:
        db.close()


def main() -> int:
    print("Code Quest - full India jobs pipeline (scrape -> enrich -> Excel)\n")
    scrape_all()

    # Reuse enrichment script main (classify, commit, export)
    repo = BACKEND.parent
    sys.path.insert(0, str(repo / "scripts"))
    import run_job_skill_enrichment as enrich

    return enrich.main()


if __name__ == "__main__":
    raise SystemExit(main())
