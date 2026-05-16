"""Seed a 20-student synthetic cohort into a dedicated database (SQLite or Postgres).

Run from repository root:
  set ALLOW_FIXTURE_SEED=1
  python backend/scripts/seed_fixture_cohort.py --confirm

Or with explicit DB (recommended for parallel testing):
  set ALLOW_FIXTURE_SEED=1
  python backend/scripts/seed_fixture_cohort.py --confirm --database-url sqlite:///./fixture_portal.db

Optional password (default FixtureStudent@123):
  set FIXTURE_COHORT_PASSWORD=YourSharedPassword

Refuses ENVIRONMENT=production unless --i-really-mean-it-production (staging only).
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from datetime import date, datetime, time, timedelta
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base
from app.core.security import get_password_hash
from app.models.models import (
    BatchEnrollment,
    BatchMode,
    ClassSession,
    ClassSessionStatus,
    CreditTransaction,
    EnrollmentRole,
    JobApplication,
    JobApplicationStatus,
    JobPost,
    JobPostStatus,
    LearningBatch,
    ProgressTracking,
    Project,
    ProjectReviewStatus,
    ProjectStepCompletion,
    ProjectCatalog,
    Quiz,
    Role,
    Stage,
    Submission,
    SubmissionStatus,
    TypingAttempt,
    TypingMode,
    TypingTestType,
    User,
    UserRole,
)
from app.services.seed import seed_catalog_data, seed_default_roles

logger = logging.getLogger("seed_fixture_cohort")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

FIXTURE_DOMAIN = "codequest-fixture.test"
STUDENT_COUNT = 20
# 1-4 topper, 5-14 average, 15-20 skipper
ARCHETYPES = (
    ["topper"] * 4
    + ["average"] * 10
    + ["skipper"] * 6
)
assert len(ARCHETYPES) == STUDENT_COUNT

BATCH_NAMES = ("[Fixture] Cohort Alpha", "[Fixture] Cohort Beta")
JOB_TITLES = (
    "[Fixture cohort] Backend trainee",
    "[Fixture cohort] Frontend intern",
    "[Fixture cohort] QA analyst",
)


def normalize_database_url(raw: str) -> str:
    u = raw.strip()
    if u.startswith("postgres://"):
        return u.replace("postgres://", "postgresql+psycopg2://", 1)
    if u.startswith("sqlite:///./"):
        rel = u.replace("sqlite:///./", "", 1)
        return f"sqlite:///{(BACKEND_DIR / rel).as_posix()}"
    return u


def fixture_email(index: int) -> str:
    return f"fixture{index:02d}@{FIXTURE_DOMAIN}"


def archetype_for(index: int) -> str:
    return ARCHETYPES[index - 1]


def _require_guards(args: argparse.Namespace) -> None:
    if not args.confirm and os.environ.get("ALLOW_FIXTURE_SEED", "").strip() != "1":
        raise SystemExit(
            "Refused: pass --confirm and/or set environment variable ALLOW_FIXTURE_SEED=1"
        )
    env = os.environ.get("ENVIRONMENT", "development").lower().strip()
    if env == "production" and not args.i_really_mean_it_production:
        raise SystemExit(
            "Refused: ENVIRONMENT is production. Use a staging/disposable DB, or pass "
            "--i-really-mean-it-production if you truly intend to write fixture data there."
        )


def _purge_fixture_users(db: Session) -> None:
    """Remove prior fixture cohort rows (users matching fixture email domain)."""
    users = db.query(User).filter(User.email.like(f"%@{FIXTURE_DOMAIN}")).all()
    if not users:
        return
    uids = [u.id for u in users]
    db.query(JobApplication).filter(JobApplication.student_user_id.in_(uids)).delete(
        synchronize_session=False
    )
    fixture_posts = db.query(JobPost).filter(JobPost.title.in_(JOB_TITLES)).all()
    fp_ids = [p.id for p in fixture_posts]
    if fp_ids:
        db.query(JobApplication).filter(JobApplication.job_post_id.in_(fp_ids)).delete(synchronize_session=False)
        db.query(JobPost).filter(JobPost.id.in_(fp_ids)).delete(synchronize_session=False)
    db.query(BatchEnrollment).filter(BatchEnrollment.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(ProgressTracking).filter(ProgressTracking.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(Submission).filter(Submission.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(TypingAttempt).filter(TypingAttempt.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(Project).filter(Project.user_id.in_(uids)).delete(synchronize_session=False)
    db.query(ProjectStepCompletion).filter(ProjectStepCompletion.user_id.in_(uids)).delete(
        synchronize_session=False
    )
    db.query(CreditTransaction).filter(CreditTransaction.user_id.in_(uids)).delete(synchronize_session=False)
    for bname in BATCH_NAMES:
        fb = db.query(LearningBatch).filter(LearningBatch.name == bname).first()
        if fb:
            db.query(ClassSession).filter(ClassSession.batch_id == fb.id).delete(synchronize_session=False)
    db.query(User).filter(User.id.in_(uids)).delete(synchronize_session=False)
    db.commit()
    logger.info("Purged %d prior fixture user(s) and dependent rows.", len(uids))


def _ensure_batches(db: Session) -> list[LearningBatch]:
    out: list[LearningBatch] = []
    for name in BATCH_NAMES:
        b = db.query(LearningBatch).filter(LearningBatch.name == name).first()
        if b:
            out.append(b)
            continue
        b = LearningBatch(
            name=name,
            track="Full Stack",
            days="Mon–Fri",
            time_ist="10:00–13:00 IST",
            mode=BatchMode.ONLINE,
            start_date=date.today(),
            seats_total=50,
            seats_filled=STUDENT_COUNT,
        )
        db.add(b)
        db.flush()
        out.append(b)
    return out


def _ensure_job_posts(db: Session, batches: list[LearningBatch], creator_id: int) -> list[JobPost]:
    posts: list[JobPost] = []
    for i, title in enumerate(JOB_TITLES):
        existing = db.query(JobPost).filter(JobPost.title == title).first()
        if existing:
            posts.append(existing)
            continue
        batch = batches[i % len(batches)]
        p = JobPost(
            title=title,
            company_name="Fixture Corp",
            location="Remote",
            employment_type="full_time" if i < 2 else "internship",
            description="Synthetic job listing for fixture cohort testing.",
            status=JobPostStatus.OPEN,
            is_fixture=True,
            sort_order=i,
            eligible_batch_id=batch.id,
            created_by_user_id=creator_id,
            listing_metadata={"fixture_key": f"cohort-{i}", "source": "fixture_cohort"},
        )
        db.add(p)
        db.flush()
        posts.append(p)
    return posts


def _upsert_progress(
    db: Session,
    user_id: int,
    role_id: int,
    stages: list[Stage],
    archetype: str,
) -> None:
    for j, stage in enumerate(stages):
        row = (
            db.query(ProgressTracking)
            .filter(
                ProgressTracking.user_id == user_id,
                ProgressTracking.role_id == role_id,
                ProgressTracking.stage_id == stage.id,
            )
            .first()
        )
        if archetype == "topper":
            lc, tl, quiz, ex, unlocked = 10 + j, 12, min(95, 82 + j * 3), 88, True
        elif archetype == "average":
            if j >= 2:
                continue
            lc, tl = 5 + j, 10
            quiz = 68 + j * 5
            ex = 55 + j * 10
            unlocked = quiz >= 70
        else:
            if j > 0:
                continue
            lc, tl, quiz, ex, unlocked = 1, 8, 45, 30, False

        if row is None:
            db.add(
                ProgressTracking(
                    user_id=user_id,
                    role_id=role_id,
                    stage_id=stage.id,
                    lessons_completed=lc,
                    total_lessons=tl,
                    latest_quiz_score=quiz,
                    exercises_completed_pct=ex,
                    unlocked=unlocked,
                )
            )
        else:
            row.lessons_completed = lc
            row.total_lessons = tl
            row.latest_quiz_score = quiz
            row.exercises_completed_pct = ex
            row.unlocked = unlocked
            db.add(row)


def _seed_submissions(
    db: Session,
    user_id: int,
    stage_quiz_pairs: list[tuple[Stage, Quiz]],
    archetype: str,
) -> None:
    existing = {
        s.quiz_id
        for s in db.query(Submission).filter(Submission.user_id == user_id).all()
        if s.quiz_id is not None
    }
    if archetype == "topper":
        take = min(3, len(stage_quiz_pairs))
        scores = [92.0, 88.0, 95.0]
        statuses = [SubmissionStatus.PASSED, SubmissionStatus.PASSED, SubmissionStatus.PASSED]
    elif archetype == "average":
        take = min(2, len(stage_quiz_pairs))
        scores = [72.0, 55.0]
        statuses = [SubmissionStatus.PASSED, SubmissionStatus.FAILED]
    else:
        take = min(1, len(stage_quiz_pairs))
        scores = [40.0]
        statuses = [SubmissionStatus.FAILED]

    for idx in range(take):
        stage, quiz = stage_quiz_pairs[idx]
        if quiz.id in existing:
            continue
        db.add(
            Submission(
                user_id=user_id,
                quiz_id=quiz.id,
                score=scores[idx],
                status=statuses[idx],
            )
        )


def _seed_typing(db: Session, user_id: int, archetype: str, base: datetime) -> None:
    if archetype == "topper":
        wpms = [52, 58, 61, 55, 67, 70]
    elif archetype == "average":
        wpms = [38, 42, 44]
    else:
        wpms = [28]

    for i, wpm in enumerate(wpms):
        db.add(
            TypingAttempt(
                user_id=user_id,
                mode=TypingMode.SENTENCE,
                test_type=TypingTestType.TIMED,
                test_option="60",
                language="en",
                prompt_text="Fixture typing seed text.",
                typed_text="Fixture typing seed text.",
                wpm=float(wpm),
                raw_wpm=float(wpm + 4),
                accuracy=95.0,
                error_count=1,
                elapsed_seconds=60,
                created_at=base - timedelta(hours=i + 1),
            )
        )


def _seed_portfolio(db: Session, user_id: int, stage_id: int, archetype: str) -> None:
    title = f"[Fixture cohort] Portfolio user {user_id}"
    existing = db.query(Project).filter(Project.user_id == user_id, Project.title == title).first()
    if existing:
        return
    if archetype == "topper":
        status = ProjectReviewStatus.APPROVED
    elif archetype == "average":
        status = ProjectReviewStatus.SUBMITTED
    else:
        status = ProjectReviewStatus.REJECTED
    db.add(
        Project(
            user_id=user_id,
            stage_id=stage_id,
            title=title,
            description="Synthetic portfolio row for fixture testing.",
            github_link="https://github.com/example/fixture",
            review_status=status,
        )
    )


def _seed_catalog_steps(db: Session, user_id: int, archetype: str) -> None:
    slug = "frontend-foundations"
    if not db.query(ProjectCatalog).filter(ProjectCatalog.slug == slug).first():
        return
    if archetype == "topper":
        steps = (1, 2, 3, 4)
    elif archetype == "average":
        steps = (1, 2)
    else:
        steps = ()
    for sid in steps:
        exists = (
            db.query(ProjectStepCompletion)
            .filter(
                ProjectStepCompletion.user_id == user_id,
                ProjectStepCompletion.project_slug == slug,
                ProjectStepCompletion.step_id == sid,
            )
            .first()
        )
        if not exists:
            db.add(ProjectStepCompletion(user_id=user_id, project_slug=slug, step_id=sid))


def _seed_job_apps(
    db: Session,
    user_id: int,
    posts: list[JobPost],
    archetype: str,
    student_index: int,
) -> None:
    if archetype == "topper":
        pairs = [
            (0, JobApplicationStatus.APPLIED),
            (1, JobApplicationStatus.SHORTLISTED),
            (2, JobApplicationStatus.APPLIED),
        ]
    elif archetype == "average":
        pairs = [(0, JobApplicationStatus.APPLIED)] if student_index % 2 == 0 else []
    else:
        pairs = []

    for post_idx, status in pairs:
        post = posts[post_idx % len(posts)]
        exists = (
            db.query(JobApplication)
            .filter(
                JobApplication.job_post_id == post.id,
                JobApplication.student_user_id == user_id,
            )
            .first()
        )
        if exists:
            exists.status = status
            db.add(exists)
        else:
            db.add(
                JobApplication(
                    job_post_id=post.id,
                    student_user_id=user_id,
                    status=status,
                )
            )


def _seed_credits(db: Session, user: User, archetype: str) -> None:
    if archetype == "topper":
        user.credit_balance = 520
    elif archetype == "average":
        user.credit_balance = 120 + (user.id % 7) * 10
    else:
        user.credit_balance = 25
    db.add(user)


def run_seed(db: Session, password: str, purge: bool) -> list[dict[str, str | int]]:
    if purge:
        _purge_fixture_users(db)

    seed_default_roles(db)
    seed_catalog_data(db)

    role = db.query(Role).order_by(Role.id.asc()).first()
    if not role:
        raise RuntimeError("No role after seed_default_roles")
    stages = db.query(Stage).filter(Stage.role_id == role.id).order_by(Stage.order_number.asc()).all()
    stage_quiz_pairs: list[tuple[Stage, Quiz]] = []
    for st in stages:
        qz = db.query(Quiz).filter(Quiz.stage_id == st.id).first()
        if qz:
            stage_quiz_pairs.append((st, qz))
    if not stage_quiz_pairs:
        raise RuntimeError("No quizzes found for seeded stages")

    batches = _ensure_batches(db)
    db.flush()

    manifest: list[dict[str, str | int]] = []
    pwd_hash = get_password_hash(password)

    users: list[User] = []
    for i in range(1, STUDENT_COUNT + 1):
        email = fixture_email(i)
        arch = archetype_for(i)
        full_name = {
            "topper": f"Fixture Topper {i}",
            "average": f"Fixture Average {i}",
            "skipper": f"Fixture Skipper {i}",
        }[arch]
        u = db.query(User).filter(User.email == email).first()
        if u is None:
            u = User(
                email=email,
                full_name=full_name,
                password_hash=pwd_hash,
                role=UserRole.STUDENT,
                is_active=True,
                password_setup_required=False,
                selected_role_id=role.id,
                xp_points=500 if arch == "topper" else (200 if arch == "average" else 20),
                streak_days=14 if arch == "topper" else (5 if arch == "average" else 0),
            )
            db.add(u)
            db.flush()
        else:
            u.full_name = full_name
            u.password_hash = pwd_hash
            u.role = UserRole.STUDENT
            u.is_active = True
            u.password_setup_required = False
            u.selected_role_id = role.id
            u.xp_points = 500 if arch == "topper" else (200 if arch == "average" else 20)
            u.streak_days = 14 if arch == "topper" else (5 if arch == "average" else 0)
            db.add(u)
            db.flush()
        users.append(u)

        batch = batches[(i - 1) % len(batches)]
        enr = (
            db.query(BatchEnrollment)
            .filter(BatchEnrollment.user_id == u.id, BatchEnrollment.batch_id == batch.id)
            .first()
        )
        att = 92 if arch == "topper" else (78 if arch == "average" else 52)
        if enr is None:
            db.add(
                BatchEnrollment(
                    batch_id=batch.id,
                    user_id=u.id,
                    enrollment_role=EnrollmentRole.STUDENT,
                    attendance_pct=att,
                )
            )
        else:
            enr.attendance_pct = att
            db.add(enr)

        _seed_credits(db, u, arch)
        _upsert_progress(db, u.id, role.id, stages, arch)
        _seed_submissions(db, u.id, stage_quiz_pairs, arch)
        _seed_typing(db, u.id, arch, datetime.utcnow())
        _seed_portfolio(db, u.id, stages[0].id, arch)
        _seed_catalog_steps(db, u.id, arch)

        manifest.append(
            {
                "index": i,
                "email": email,
                "full_name": full_name,
                "archetype": arch,
                "password_env": "FIXTURE_COHORT_PASSWORD (or CLI default)",
                "batch": batch.name,
                "in_app_credits_after_seed": u.credit_balance,
            }
        )

    posts = _ensure_job_posts(db, batches, users[0].id)
    db.flush()
    for i, u in enumerate(users, start=1):
        _seed_job_apps(db, u.id, posts, archetype_for(i), i)

    _seed_fixture_class_sessions(db, batches)
    _seed_fixture_due_dates(db, stages, role)

    db.commit()
    return manifest


def _seed_fixture_class_sessions(db: Session, batches: list[LearningBatch]) -> None:
    today = date.today()
    session_templates = [
        ("Session 1: Intro & Setup", "Environment setup, tooling overview", 1),
        ("Session 2: Core Concepts", "Variables, types, control flow", 3),
        ("Session 3: Functions & Modules", "Reusable code patterns", 5),
        ("Session 4: Data Structures", "Lists, dicts, sets, complexity", 8),
        ("Session 5: Project Kickoff", "Capstone project planning", 10),
    ]
    for batch in batches:
        existing = db.query(ClassSession).filter(ClassSession.batch_id == batch.id).count()
        if existing >= 5:
            continue
        for title, topic, offset in session_templates:
            exists = (
                db.query(ClassSession)
                .filter(ClassSession.batch_id == batch.id, ClassSession.title == title)
                .first()
            )
            if not exists:
                db.add(
                    ClassSession(
                        batch_id=batch.id,
                        title=title,
                        topic=topic,
                        session_date=today + timedelta(days=offset),
                        start_time=time(10, 0),
                        end_time=time(13, 0),
                        status=ClassSessionStatus.SCHEDULED,
                    )
                )


def _seed_fixture_due_dates(db: Session, stages: list[Stage], role: Role) -> None:
    today = date.today()
    for i, stage in enumerate(stages[:4]):
        target = today + timedelta(days=7 * (i + 1))
        if stage.due_date is None:
            stage.due_date = target
        quizzes = db.query(Quiz).filter(Quiz.stage_id == stage.id).all()
        for q in quizzes:
            if q.due_date is None:
                q.due_date = target - timedelta(days=2)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Seed 20-student fixture cohort into a target database")
    default_sqlite = f"sqlite:///{(BACKEND_DIR / 'fixture_portal.db').as_posix()}"
    p.add_argument(
        "--database-url",
        default=os.environ.get("DATABASE_URL", default_sqlite),
        help="SQLAlchemy URL for the fixture database (default: backend/fixture_portal.db)",
    )
    p.add_argument(
        "--confirm",
        action="store_true",
        help="Required alongside ALLOW_FIXTURE_SEED or instead of it (see script docstring)",
    )
    p.add_argument(
        "--purge-fixture-users",
        action="store_true",
        help="Delete all users @%s and dependent rows before re-seeding" % FIXTURE_DOMAIN,
    )
    p.add_argument(
        "--i-really-mean-it-production",
        action="store_true",
        help="Allow running when ENVIRONMENT=production (disposable staging only)",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    _require_guards(args)

    raw_url = args.database_url.strip()
    url = normalize_database_url(raw_url)
    logger.info("Target database URL (normalized): %s", url.split("@")[-1] if "@" in url else url)

    engine = create_engine(url, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    password = os.environ.get("FIXTURE_COHORT_PASSWORD", "FixtureStudent@123").strip() or "FixtureStudent@123"

    db = SessionLocal()
    try:
        manifest = run_seed(db, password=password, purge=args.purge_fixture_users)
    except Exception as exc:
        db.rollback()
        logger.exception("Fixture seed failed: %s", exc)
        return 1
    finally:
        db.close()

    out_path = BACKEND_DIR / "fixture_cohort_logins.json"
    payload = {
        "fixture_domain": FIXTURE_DOMAIN,
        "student_count": STUDENT_COUNT,
        "shared_password_note": "Set FIXTURE_COHORT_PASSWORD or use default FixtureStudent@123",
        "password_used_from_env": bool(os.environ.get("FIXTURE_COHORT_PASSWORD")),
        "students": manifest,
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    logger.info("Wrote manifest: %s", out_path)

    print("\n=== Fixture cohort manifest (password not printed; see FIXTURE_COHORT_PASSWORD) ===\n")
    for row in manifest:
        print(
            f"{row['index']:02d}  {row['email']:<38}  {row['archetype']:<8}  batch={row['batch'][:28]}  credits={row['in_app_credits_after_seed']}"
        )
    print("\nLogin: use email above + password from FIXTURE_COHORT_PASSWORD or default FixtureStudent@123\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
