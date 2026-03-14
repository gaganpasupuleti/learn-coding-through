"""Runner: seed quiz and project catalog data into the database.

Usage (from the backend/ directory):
    python -m scripts.seed_db
"""
import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

sys.path.insert(0, ".")

from app.core.database import SessionLocal  # noqa: E402
from app.services.seed import seed_catalog_data  # noqa: E402

db = SessionLocal()
try:
    seed_catalog_data(db)
    print("Catalog seed complete.")
except Exception as exc:
    db.rollback()
    logging.exception("Seed failed: %s", exc)
    sys.exit(1)
finally:
    db.close()
