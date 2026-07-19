"""Remove dev/test/seed users and their dependent rows.

Matches emails used by seed_auth_users.py, smoke tests, and local fixtures:
  - *@example.com
  - *@codequest.dev
  - demo@student.com

Usage (from backend/):
    python scripts/cleanup_test_seed_users.py          # dry-run
    python scripts/cleanup_test_seed_users.py --confirm
"""

from __future__ import annotations

import argparse
import logging
import sys

sys.path.insert(0, ".")

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import (
    AdminActivityLog,
    BatchEnrollment,
    CreditTransaction,
    JobApplication,
    JobPost,
    LearningBatch,
    ProgressTracking,
    Project,
    ProjectStepCompletion,
    QuizCatalogAttempt,
    RegistrationWaitlist,
    StudentFeedback,
    Submission,
    TypingAttempt,
    User,
    UserActivityLog,
    UserRole,
)

logger = logging.getLogger("cleanup_test_seed_users")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

TEST_EMAIL_PATTERNS = (
    "%@example.com",
    "%@codequest.dev",
    "demo@student.com",
)


def _test_user_filter():
    return or_(*[User.email.ilike(p) for p in TEST_EMAIL_PATTERNS])


def _waitlist_filter():
    return or_(*[RegistrationWaitlist.email.ilike(p) for p in TEST_EMAIL_PATTERNS])


def _fallback_admin_id(db: Session, test_user_ids: set[int]) -> int | None:
    admin = (
        db.query(User)
        .filter(
            or_(User.role == UserRole.ADMIN, User.role == UserRole.SUPER_ADMIN),
            ~User.id.in_(test_user_ids),
        )
        .order_by(User.id)
        .first()
    )
    return admin.id if admin else None


def cleanup_test_seed_users(db: Session, *, dry_run: bool = True) -> list[str]:
    users = db.query(User).filter(_test_user_filter()).order_by(User.email).all()
    emails = [u.email for u in users]
    uids = [u.id for u in users]
    if not uids:
        logger.info("No test/seed users matched.")
        return emails

    test_id_set = set(uids)
    fallback_admin_id = _fallback_admin_id(db, test_id_set)

    logger.info("Matched %d test/seed user(s):", len(emails))
    for email in emails:
        logger.info("  - %s", email)

    if dry_run:
        logger.info("Dry run only — pass --confirm to delete.")
        return emails

    if fallback_admin_id is None:
        raise SystemExit("Refused: no non-test admin remains to reassign job posts.")

    db.query(JobApplication).filter(JobApplication.student_user_id.in_(uids)).delete(
        synchronize_session=False
    )
    db.query(JobPost).filter(JobPost.created_by_user_id.in_(uids)).update(
        {JobPost.created_by_user_id: fallback_admin_id},
        synchronize_session=False,
    )
    db.query(LearningBatch).filter(LearningBatch.mentor_user_id.in_(uids)).update(
        {LearningBatch.mentor_user_id: None},
        synchronize_session=False,
    )
    db.query(AdminActivityLog).filter(AdminActivityLog.admin_user_id.in_(uids)).delete(
        synchronize_session=False
    )
    db.query(AdminActivityLog).filter(AdminActivityLog.target_user_id.in_(uids)).update(
        {AdminActivityLog.target_user_id: None},
        synchronize_session=False,
    )
    db.query(BatchEnrollment).filter(BatchEnrollment.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(ProgressTracking).filter(ProgressTracking.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(Submission).filter(Submission.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(Project).filter(Project.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(ProjectStepCompletion).filter(ProjectStepCompletion.user_id.in_(uids)).delete(
        synchronize_session=False
    )
    db.query(CreditTransaction).filter(CreditTransaction.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(TypingAttempt).filter(TypingAttempt.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(QuizCatalogAttempt).filter(QuizCatalogAttempt.user_id.in_(uids)).delete(
        synchronize_session=False
    )
    db.query(UserActivityLog).filter(UserActivityLog.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(StudentFeedback).filter(StudentFeedback.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(StudentFeedback).filter(StudentFeedback.reviewed_by_user_id.in_(uids)).update(
        {StudentFeedback.reviewed_by_user_id: None},
        synchronize_session=False,
    )
    db.query(RegistrationWaitlist).filter(_waitlist_filter()).delete(synchronize_session=False)
    deleted = db.query(User).filter(User.id.in_(uids)).delete(synchronize_session=False)
    db.commit()
    logger.info("Deleted %d test/seed user(s). Remaining users: %d", deleted, db.query(User).count())
    return emails


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Delete test/seed Code Quest users")
    parser.add_argument("--confirm", action="store_true", help="Actually delete matched users")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    db = SessionLocal()
    try:
        cleanup_test_seed_users(db, dry_run=not args.confirm)
        return 0
    except Exception as exc:
        db.rollback()
        logger.exception("Cleanup failed: %s", exc)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
