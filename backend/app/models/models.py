from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"


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


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    selected_role_id: Mapped[int | None] = mapped_column(ForeignKey("roles.id"), nullable=True)
    xp_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    target_role = relationship("Role", foreign_keys=[selected_role_id])
    progress_records = relationship("ProgressTracking", back_populates="user", cascade="all,delete-orphan")
    submissions = relationship("Submission", back_populates="user", cascade="all,delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all,delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all,delete-orphan")


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


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role_id: Mapped[int | None] = mapped_column(ForeignKey("roles.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="Untitled Resume", nullable=False)
    template: Mapped[str] = mapped_column(String(50), default="modern", nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    skills: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    experience: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    education: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    projects: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    certifications: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    ats_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="resumes")


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
