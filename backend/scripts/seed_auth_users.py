"""Seed admin + sample student users for local/dev/prod environments.

Usage (from backend/):
    python scripts/seed_auth_users.py

Optional flags:
    --student-count 5
    --student-password Student@123
    --student-prefix student

The script is idempotent for matching emails and updates existing users.
"""

from __future__ import annotations

import argparse
import logging
import sys

sys.path.insert(0, ".")

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserRole
from app.services.seed import seed_admin_user


logger = logging.getLogger("seed_auth_users")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def upsert_student_user(db, email: str, full_name: str, password: str, index: int) -> User:
    existing = db.query(User).filter(User.email == email).first()
    password_hash = get_password_hash(password)

    if existing:
        existing.full_name = full_name
        existing.password_hash = password_hash
        existing.role = UserRole.STUDENT
        existing.is_active = True
        existing.xp_points = existing.xp_points or (index * 10)
        existing.streak_days = existing.streak_days or index
        existing.credit_balance = existing.credit_balance or 100
        db.add(existing)
        return existing

    user = User(
        email=email,
        full_name=full_name,
        password_hash=password_hash,
        role=UserRole.STUDENT,
        xp_points=index * 10,
        streak_days=index,
        credit_balance=100,
        is_active=True,
    )
    db.add(user)
    return user


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed admin and sample student users")
    parser.add_argument("--student-count", type=int, default=3, help="How many student users to create")
    parser.add_argument("--student-password", type=str, default="Student@123", help="Password for all seeded students")
    parser.add_argument("--student-prefix", type=str, default="student", help="Email local-part prefix")
    parser.add_argument("--student-domain", type=str, default="codequest.dev", help="Email domain")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    db = SessionLocal()
    try:
        # Keep admin in sync with environment bootstrap values used by app startup docs.
        seed_admin_user(
            db,
            email="admin@example.com",
            password="Admin@12345",
            full_name="Platform Admin",
        )

        for i in range(1, args.student_count + 1):
            email = f"{args.student_prefix}{i}@{args.student_domain}"
            full_name = f"Student {i}"
            upsert_student_user(
                db=db,
                email=email,
                full_name=full_name,
                password=args.student_password,
                index=i,
            )

        db.commit()

        logger.info("Auth users seeded successfully")
        logger.info("Admin: admin@example.com / Admin@12345")
        logger.info(
            "Students: %d users (%s1@%s .. %s%d@%s) / %s",
            args.student_count,
            args.student_prefix,
            args.student_domain,
            args.student_prefix,
            args.student_count,
            args.student_domain,
            args.student_password,
        )
        return 0
    except Exception as exc:
        db.rollback()
        logger.exception("Seeding failed: %s", exc)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
