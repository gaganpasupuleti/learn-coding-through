from datetime import date, datetime, time
from enum import Enum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    PASSED = "passed"
    FAILED = "failed"


class ProjectReviewStatus(str, Enum):
    SUBMITTED = "submitted"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"


class CreditTransactionType(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"


class BatchMode(str, Enum):
    ONLINE = "online"
    HYBRID = "hybrid"


class EnrollmentRole(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"


class ProjectWorkStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    REVIEWED = "reviewed"


class JobPostStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class JobApplicationStatus(str, Enum):
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    HIRED = "hired"


class ClassSessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TypingMode(str, Enum):
    SENTENCE = "sentence"
    CODE = "code"


class TypingTestType(str, Enum):
    TIMED = "timed"
    LENGTH = "length"


class FeedbackCategory(str, Enum):
    GENERAL = "general"
    CONCERN = "concern"
    BUG = "bug"
    SUGGESTION = "suggestion"


class FeedbackStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # Optional external auth provider user id (provider-neutral field).
    external_auth_uid: Mapped[str | None] = mapped_column(
        String(64),
        unique=True,
        nullable=True,
        index=True,
        deferred=True,
    )
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    selected_role_id: Mapped[int | None] = mapped_column(ForeignKey("roles.id"), nullable=True)
    xp_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    credit_balance: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    cohort_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    batch_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # True until the user sets a known password (e.g. after first Google sign-in).
    password_setup_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    target_role = relationship("Role", foreign_keys=[selected_role_id])
    progress_records = relationship("ProgressTracking", back_populates="user", cascade="all,delete-orphan")
    submissions = relationship("Submission", back_populates="user", cascade="all,delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all,delete-orphan")
    credit_transactions = relationship("CreditTransaction", back_populates="user", cascade="all,delete-orphan")
    project_step_completions = relationship("ProjectStepCompletion", back_populates="user", cascade="all,delete-orphan")
    admin_actions = relationship(
        "AdminActivityLog",
        foreign_keys="AdminActivityLog.admin_user_id",
        back_populates="admin_user",
        cascade="all,delete-orphan",
    )
    targeted_admin_actions = relationship(
        "AdminActivityLog",
        foreign_keys="AdminActivityLog.target_user_id",
        back_populates="target_user",
    )
    typing_attempts = relationship("TypingAttempt", back_populates="user", cascade="all,delete-orphan")
    activity_logs = relationship("UserActivityLog", back_populates="user", cascade="all,delete-orphan")
    feedback_submissions = relationship(
        "StudentFeedback",
        foreign_keys="StudentFeedback.user_id",
        back_populates="user",
        cascade="all,delete-orphan",
    )
    feedback_reviews = relationship(
        "StudentFeedback",
        foreign_keys="StudentFeedback.reviewed_by_user_id",
        back_populates="reviewed_by",
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    skills_required: Mapped[str] = mapped_column(Text, nullable=False)
    salary_range: Mapped[str] = mapped_column(String(80), nullable=False)
    companies_hiring: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_level: Mapped[DifficultyLevel] = mapped_column(SqlEnum(DifficultyLevel), nullable=False)
    estimated_duration_weeks: Mapped[int] = mapped_column(Integer, nullable=False)

    stages = relationship("Stage", back_populates="role", cascade="all,delete-orphan")


class Stage(Base):
    __tablename__ = "stages"
    __table_args__ = (
        UniqueConstraint("role_id", "order_number", name="uq_stage_role_order"),
        Index("ix_stages_role_order", "role_id", "order_number"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    order_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    unlock_quiz_score: Mapped[int] = mapped_column(Integer, default=70, nullable=False)
    unlock_exercise_completion: Mapped[int] = mapped_column(Integer, default=80, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    role = relationship("Role", back_populates="stages")
    topics = relationship("Topic", back_populates="stage", cascade="all,delete-orphan")
    exercises = relationship("Exercise", back_populates="stage", cascade="all,delete-orphan")
    quizzes = relationship("Quiz", back_populates="stage", cascade="all,delete-orphan")
    projects = relationship("Project", back_populates="stage", cascade="all,delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("stages.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    stage = relationship("Stage", back_populates="topics")
    lessons = relationship("Lesson", back_populates="topic", cascade="all,delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    markdown_content: Mapped[str] = mapped_column(Text, nullable=False)
    code_example: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resource_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    topic = relationship("Topic", back_populates="lessons")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("stages.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(50), nullable=False)
    test_cases: Mapped[str] = mapped_column(Text, nullable=False)

    stage = relationship("Stage", back_populates="exercises")


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("stages.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    timer_seconds: Mapped[int] = mapped_column(Integer, default=900, nullable=False)
    pass_percentage: Mapped[int] = mapped_column(Integer, default=70, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    stage = relationship("Stage", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all,delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id"), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)

    quiz = relationship("Quiz", back_populates="questions")


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (Index("ix_submissions_user_exercise", "user_id", "exercise_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    exercise_id: Mapped[int | None] = mapped_column(ForeignKey("exercises.id"), nullable=True)
    quiz_id: Mapped[int | None] = mapped_column(ForeignKey("quizzes.id"), nullable=True)
    score: Mapped[float] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    status: Mapped[SubmissionStatus] = mapped_column(SqlEnum(SubmissionStatus), default=SubmissionStatus.PENDING)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="submissions")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("stages.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    github_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    review_status: Mapped[ProjectReviewStatus] = mapped_column(SqlEnum(ProjectReviewStatus), default=ProjectReviewStatus.SUBMITTED)

    user = relationship("User", back_populates="projects")
    stage = relationship("Stage", back_populates="projects")






class ProgressTracking(Base):
    __tablename__ = "progress_tracking"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", "stage_id", name="uq_progress_user_role_stage"),
        Index("ix_progress_user_role", "user_id", "role_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    stage_id: Mapped[int] = mapped_column(ForeignKey("stages.id"), nullable=False)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    exercises_completed_pct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    latest_quiz_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unlocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress_records")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    __table_args__ = (Index("ix_credit_transactions_user_created", "user_id", "created_at"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    transaction_type: Mapped[CreditTransactionType] = mapped_column(SqlEnum(CreditTransactionType), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="credit_transactions")


class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"
    __table_args__ = (
        Index("ix_admin_activity_logs_created", "created_at"),
        Index("ix_admin_activity_logs_admin_target", "admin_user_id", "target_user_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    admin_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    target_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    admin_user = relationship("User", foreign_keys=[admin_user_id], back_populates="admin_actions")
    target_user = relationship("User", foreign_keys=[target_user_id], back_populates="targeted_admin_actions")


class LearningBatch(Base):
    __tablename__ = "learning_batches"
    __table_args__ = (
        Index("ix_learning_batches_start_date", "start_date"),
        Index("ix_learning_batches_track_mode", "track", "mode"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    track: Mapped[str] = mapped_column(String(180), nullable=False)
    days: Mapped[str] = mapped_column(String(80), nullable=False)
    time_ist: Mapped[str] = mapped_column(String(80), nullable=False)
    mode: Mapped[BatchMode] = mapped_column(SqlEnum(BatchMode), default=BatchMode.ONLINE, nullable=False)
    mentor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    seats_total: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    seats_filled: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    mentor = relationship("User", foreign_keys=[mentor_user_id])
    enrollments = relationship("BatchEnrollment", back_populates="batch", cascade="all,delete-orphan")
    jobs = relationship("JobPost", back_populates="eligible_batch")
    sessions = relationship("ClassSession", back_populates="batch", cascade="all,delete-orphan")


class ClassSession(Base):
    __tablename__ = "class_sessions"
    __table_args__ = (
        Index("ix_class_sessions_batch_date", "batch_id", "session_date"),
        Index("ix_class_sessions_status_date", "status", "session_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("learning_batches.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    topic: Mapped[str | None] = mapped_column(String(300), nullable=True)
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[ClassSessionStatus] = mapped_column(
        SqlEnum(ClassSessionStatus), default=ClassSessionStatus.SCHEDULED, nullable=False
    )
    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    batch = relationship("LearningBatch", back_populates="sessions")
    created_by = relationship("User", foreign_keys=[created_by_user_id])


class BatchEnrollment(Base):
    __tablename__ = "batch_enrollments"
    __table_args__ = (
        UniqueConstraint("batch_id", "user_id", name="uq_batch_enrollments_batch_user"),
        Index("ix_batch_enrollments_batch_role", "batch_id", "enrollment_role"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("learning_batches.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    enrollment_role: Mapped[EnrollmentRole] = mapped_column(SqlEnum(EnrollmentRole), default=EnrollmentRole.STUDENT, nullable=False)
    attendance_pct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    college_info: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year_or_grad: Mapped[str | None] = mapped_column(String(80), nullable=True)
    project_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    project_status: Mapped[ProjectWorkStatus] = mapped_column(SqlEnum(ProjectWorkStatus), default=ProjectWorkStatus.NOT_STARTED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    batch = relationship("LearningBatch", back_populates="enrollments")
    user = relationship("User")


class JobPost(Base):
    __tablename__ = "job_posts"
    __table_args__ = (
        Index("ix_job_posts_status_created", "status", "created_at"),
        Index("ix_job_posts_batch", "eligible_batch_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company_name: Mapped[str] = mapped_column(String(180), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    external_apply_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    listing_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[JobPostStatus] = mapped_column(SqlEnum(JobPostStatus), default=JobPostStatus.OPEN, nullable=False)
    is_fixture: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    eligible_batch_id: Mapped[int | None] = mapped_column(ForeignKey("learning_batches.id"), nullable=True)
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    eligible_batch = relationship("LearningBatch", back_populates="jobs")
    created_by = relationship("User", foreign_keys=[created_by_user_id])
    applications = relationship("JobApplication", back_populates="job", cascade="all,delete-orphan")


class JobApplication(Base):
    __tablename__ = "job_applications"
    __table_args__ = (
        UniqueConstraint("job_post_id", "student_user_id", name="uq_job_application_job_student"),
        Index("ix_job_applications_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_post_id: Mapped[int] = mapped_column(ForeignKey("job_posts.id"), nullable=False)
    student_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[JobApplicationStatus] = mapped_column(SqlEnum(JobApplicationStatus), default=JobApplicationStatus.APPLIED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    job = relationship("JobPost", back_populates="applications")
    student = relationship("User", foreign_keys=[student_user_id])


class ScrapedJob(Base):
    """Job listings scraped via python-jobspy (distinct from internal job_posts portal)."""

    __tablename__ = "scraped_jobs"
    __table_args__ = (
        UniqueConstraint("source", "job_url", name="uq_scraped_jobs_source_url"),
        UniqueConstraint("job_id", name="uq_scraped_jobs_job_id"),
        Index("ix_scraped_jobs_created", "created_at"),
        Index("ix_scraped_jobs_source", "source"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    job_id: Mapped[str | None] = mapped_column(String(32), nullable=True, unique=True, index=True)
    source: Mapped[str] = mapped_column(String(40), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    job_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    date_posted: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    salary_min: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    salary_max: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    job_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    apply_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    link_status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")
    link_checked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ingest_profile: Mapped[str | None] = mapped_column(String(64), nullable=True)


class JobScrapeRun(Base):
    """Audit log for admin JobSpy scrape runs."""

    __tablename__ = "job_scrape_runs"
    __table_args__ = (Index("ix_job_scrape_runs_started", "started_at"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    search_term: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    sources_json: Mapped[str] = mapped_column(Text, nullable=False)
    results_wanted: Mapped[int] = mapped_column(Integer, nullable=False)
    hours_old: Mapped[int] = mapped_column(Integer, nullable=False)
    total_found: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    saved_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped_duplicates: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    errors_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_breakdown_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    run_type: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")
    profile: Mapped[str | None] = mapped_column(String(64), nullable=True)
    expired_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_link_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    triggered_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="failed")


# ---------------------------------------------------------------------------
# Job enrichment foundation (Phase 27B) — manual import overlay on scraped_jobs
# ---------------------------------------------------------------------------

class JobRole(Base):
    """Stable role taxonomy for enriched job imports."""

    __tablename__ = "job_roles"

    role_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    role_name: Mapped[str] = mapped_column(String(120), nullable=False)
    role_family: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    core_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    levels = relationship("JobRoleLevel", back_populates="role", cascade="all,delete-orphan")


class JobRoleLevel(Base):
    """Experience band within a job role (fresher / entry / experienced)."""

    __tablename__ = "job_role_levels"

    role_level_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    role_id: Mapped[str] = mapped_column(ForeignKey("job_roles.role_id"), nullable=False, index=True)
    experience_level: Mapped[str] = mapped_column(String(32), nullable=False)
    min_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    readiness_topics: Mapped[list | None] = mapped_column(JSON, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    role = relationship("JobRole", back_populates="levels")


class JobEnrichment(Base):
    """Curated enrichment overlay joined to scraped_jobs.job_id — raw scrape rows are not mutated."""

    __tablename__ = "job_enrichments"
    __table_args__ = (
        Index("ix_job_enrichments_actual_role", "actual_role_id"),
        Index("ix_job_enrichments_role_level", "role_level_id"),
        Index("ix_job_enrichments_approved_status", "approved_status"),
    )

    job_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("scraped_jobs.job_id"), primary_key=True
    )
    actual_role_id: Mapped[str] = mapped_column(ForeignKey("job_roles.role_id"), nullable=False)
    actual_role_name: Mapped[str] = mapped_column(String(120), nullable=False)
    role_level_id: Mapped[str] = mapped_column(ForeignKey("job_role_levels.role_level_id"), nullable=False)
    experience_level: Mapped[str] = mapped_column(String(32), nullable=False)
    job_live_status: Mapped[str] = mapped_column(String(16), nullable=False, default="UNKNOWN")
    jd_fetch_status: Mapped[str] = mapped_column(String(16), nullable=False, default="UNKNOWN")
    jd_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    required_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    good_to_have_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    tools: Mapped[list | None] = mapped_column(JSON, nullable=True)
    programming_languages: Mapped[list | None] = mapped_column(JSON, nullable=True)
    databases: Mapped[list | None] = mapped_column(JSON, nullable=True)
    frameworks: Mapped[list | None] = mapped_column(JSON, nullable=True)
    student_preparation_topics: Mapped[list | None] = mapped_column(JSON, nullable=True)
    quiz_pack_id: Mapped[str | None] = mapped_column(
        ForeignKey("quiz_packs.quiz_pack_id"), nullable=True, index=True
    )
    mapping_confidence: Mapped[float | None] = mapped_column(Numeric(4, 3), nullable=True)
    manual_review_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    approved_status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING")
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class QuizPack(Base):
    """Role-preparation quiz pack linked from job enrichments."""

    __tablename__ = "quiz_packs"

    quiz_pack_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    role_id: Mapped[str] = mapped_column(ForeignKey("job_roles.role_id"), nullable=False, index=True)
    role_level_id: Mapped[str] = mapped_column(ForeignKey("job_role_levels.role_level_id"), nullable=False, index=True)
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="easy")
    question_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    linked_jobs_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    questions = relationship("QuizPackQuestion", back_populates="quiz_pack", cascade="all,delete-orphan")


class QuizPackQuestion(Base):
    """Individual question within a job-enrichment quiz pack.

    ponytail: table is quiz_pack_questions — quiz_questions is owned by Stage/Role quizzes.
    """

    __tablename__ = "quiz_pack_questions"
    __table_args__ = (Index("ix_quiz_pack_questions_pack", "quiz_pack_id"),)

    question_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quiz_pack_id: Mapped[str] = mapped_column(ForeignKey("quiz_packs.quiz_pack_id"), nullable=False)
    question_type: Mapped[str] = mapped_column(String(32), nullable=False)
    skill_tag: Mapped[str] = mapped_column(String(64), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="easy")
    question: Mapped[str] = mapped_column(Text, nullable=False)
    option_a: Mapped[str | None] = mapped_column(Text, nullable=True)
    option_b: Mapped[str | None] = mapped_column(Text, nullable=True)
    option_c: Mapped[str | None] = mapped_column(Text, nullable=True)
    option_d: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_option: Mapped[str | None] = mapped_column(String(1), nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    workbench_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    starter_code_or_query: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    quiz_pack = relationship("QuizPack", back_populates="questions")


# ---------------------------------------------------------------------------
# Catalog models ΓÇö standalone learning content (quizzes & projects)
# These are NOT linked to the Stage/Role hierarchy; they are the
# self-contained modules shown on the frontend.
# ---------------------------------------------------------------------------

class QuizCatalog(Base):
    __tablename__ = "quiz_catalog"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="beginner", nullable=False)
    estimated_time: Mapped[str] = mapped_column(String(80), nullable=False)

    questions = relationship(
        "QuizCatalogQuestion",
        back_populates="quiz",
        cascade="all,delete-orphan",
        order_by="QuizCatalogQuestion.order",
    )


class QuizCatalogQuestion(Base):
    __tablename__ = "quiz_catalog_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quiz_catalog.id"), nullable=False, index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    question_type: Mapped[str] = mapped_column(String(30), nullable=False)   # multiple-choice | true-false | code-completion | code-output
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    # multiple-choice / true-false
    options_json: Mapped[str | None] = mapped_column(Text, nullable=True)     # JSON array of strings
    correct_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # code-completion
    answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    acceptable_answers_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    # code-output
    expected_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    # shared optional fields
    code_snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)

    quiz = relationship("QuizCatalog", back_populates="questions")


class QuizCatalogAttempt(Base):
    __tablename__ = "quiz_catalog_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quiz_catalog.id"), nullable=False, index=True)
    quiz_slug: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    time_taken_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    question_order_json: Mapped[str] = mapped_column(Text, nullable=False)
    option_orders_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    answers_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    wrong_answers_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="in_progress", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class ProjectCatalog(Base):
    __tablename__ = "project_catalog"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="beginner", nullable=False)
    estimated_time: Mapped[str] = mapped_column(String(80), nullable=False)

    steps = relationship(
        "ProjectCatalogStep",
        back_populates="project",
        cascade="all,delete-orphan",
        order_by="ProjectCatalogStep.order",
    )


class ProjectCatalogStep(Base):
    __tablename__ = "project_catalog_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project_catalog.id"), nullable=False, index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    step_type: Mapped[str] = mapped_column(String(30), nullable=False)  # understanding | logic | code | preview | challenge
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    points_json: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON array of strings
    code: Mapped[str | None] = mapped_column(Text, nullable=True)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    challenge: Mapped[str | None] = mapped_column(Text, nullable=True)
    hint: Mapped[str | None] = mapped_column(Text, nullable=True)
    walkthrough_gif: Mapped[str | None] = mapped_column(String(500), nullable=True)
    walkthrough_caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    # TDD fields
    slug: Mapped[str | None] = mapped_column(String(120), nullable=True)
    callable_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    initial_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    test_cases: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of TestCase objects

    project = relationship("ProjectCatalog", back_populates="steps")


class ProjectStepCompletion(Base):
    """Tracks which catalog project steps a user has completed."""
    __tablename__ = "project_step_completions"
    __table_args__ = (
        UniqueConstraint("user_id", "project_slug", "step_id", name="uq_psc_user_project_step"),
        Index("ix_psc_user_project", "user_id", "project_slug"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    project_slug: Mapped[str] = mapped_column(String(120), nullable=False)
    step_id: Mapped[int] = mapped_column(Integer, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    code_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    user = relationship("User", back_populates="project_step_completions")


class TypingAttempt(Base):
    __tablename__ = "typing_attempts"
    __table_args__ = (
        Index("ix_typing_attempts_user_created", "user_id", "created_at"),
        Index("ix_typing_attempts_mode_test", "mode", "test_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    mode: Mapped[TypingMode] = mapped_column(SqlEnum(TypingMode), nullable=False)
    test_type: Mapped[TypingTestType] = mapped_column(SqlEnum(TypingTestType), nullable=False)
    test_option: Mapped[str] = mapped_column(String(20), nullable=False)
    language: Mapped[str | None] = mapped_column(String(30), nullable=True)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    typed_text: Mapped[str] = mapped_column(Text, nullable=False)
    wpm: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)
    raw_wpm: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)
    accuracy: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    error_count: Mapped[int] = mapped_column(Integer, nullable=False)
    elapsed_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="typing_attempts")


class RegistrationWaitlist(Base):
    __tablename__ = "registration_waitlist"
    __table_args__ = (
        Index("ix_registration_waitlist_status_created", "status", "first_attempted_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="register")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    first_attempted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    last_attempted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class UserActivityLog(Base):
    __tablename__ = "user_activity_logs"
    __table_args__ = (
        Index("ix_user_activity_logs_user_occurred", "user_id", "occurred_at"),
        Index("ix_user_activity_logs_event_occurred", "event_type", "occurred_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(40), nullable=False)
    route: Mapped[str] = mapped_column(String(300), nullable=False)
    method: Mapped[str | None] = mapped_column(String(16), nullable=True)
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="activity_logs")


class StudentFeedback(Base):
    __tablename__ = "student_feedback"
    __table_args__ = (
        Index("ix_student_feedback_status_created", "status", "created_at"),
        Index("ix_student_feedback_user_created", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    category: Mapped[FeedbackCategory] = mapped_column(SqlEnum(FeedbackCategory), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[FeedbackStatus] = mapped_column(
        SqlEnum(FeedbackStatus), default=FeedbackStatus.PENDING, nullable=False
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id], back_populates="feedback_submissions")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_user_id], back_populates="feedback_reviews")

