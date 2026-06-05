"""Aggregate student calendar events from existing schedule tables."""

from __future__ import annotations

from datetime import date, time, timedelta

from sqlalchemy.orm import Session

from app.models.models import (
    BatchEnrollment,
    ClassSession,
    ClassSessionStatus,
    LearningBatch,
    ProgressTracking,
    Quiz,
    Stage,
    Submission,
    SubmissionStatus,
    User,
)
from app.schemas.schedule import CalendarEventResponse

# Default blocks for date-only deadlines (quizzes / stage milestones)
DEFAULT_QUIZ_START = time(14, 0)
DEFAULT_QUIZ_END = time(15, 0)
DEFAULT_PROJECT_START = time(9, 0)
DEFAULT_PROJECT_END = time(11, 0)

MAX_RANGE_DAYS = 93


def _duration_minutes(start: time, end: time) -> int:
    start_m = start.hour * 60 + start.minute
    end_m = end.hour * 60 + end.minute
    return max(0, end_m - start_m)


def _enrolled_batch_ids(db: Session, user_id: int) -> list[int]:
    return [
        row.batch_id
        for row in db.query(BatchEnrollment.batch_id)
        .filter(BatchEnrollment.user_id == user_id)
        .all()
    ]


def _class_events(
    db: Session,
    batch_ids: list[int],
    start_date: date,
    end_date: date,
    batch_map: dict[int, str],
) -> list[CalendarEventResponse]:
    if not batch_ids:
        return []

    rows = (
        db.query(ClassSession)
        .filter(
            ClassSession.batch_id.in_(batch_ids),
            ClassSession.status != ClassSessionStatus.CANCELLED,
            ClassSession.session_date >= start_date,
            ClassSession.session_date <= end_date,
        )
        .order_by(ClassSession.session_date.asc(), ClassSession.start_time.asc())
        .all()
    )

    return [
        CalendarEventResponse(
            id=f"class-{s.id}",
            event_type="class",
            title=s.title,
            subtitle=s.topic,
            event_date=s.session_date,
            start_time=s.start_time,
            end_time=s.end_time,
            batch_name=batch_map.get(s.batch_id),
            status=s.status.value,
            entity_id=s.id,
            stage_id=None,
            all_day=False,
            description=s.topic,
            duration_minutes=_duration_minutes(s.start_time, s.end_time),
        )
        for s in rows
    ]


def _quiz_events(
    db: Session,
    user: User,
    start_date: date,
    end_date: date,
    passed_quiz_ids: set[int],
) -> list[CalendarEventResponse]:
    role_id = user.selected_role_id
    if not role_id:
        return []

    quizzes = (
        db.query(Quiz)
        .join(Stage, Quiz.stage_id == Stage.id)
        .filter(
            Stage.role_id == role_id,
            Quiz.due_date.isnot(None),
            Quiz.due_date >= start_date,
            Quiz.due_date <= end_date,
        )
        .order_by(Quiz.due_date.asc())
        .all()
    )

    events: list[CalendarEventResponse] = []
    for q in quizzes:
        assert q.due_date is not None
        events.append(
            CalendarEventResponse(
                id=f"quiz-{q.id}",
                event_type="quiz",
                title=q.title,
                subtitle="Quiz due",
                event_date=q.due_date,
                start_time=DEFAULT_QUIZ_START,
                end_time=DEFAULT_QUIZ_END,
                status="passed" if q.id in passed_quiz_ids else "due",
                entity_id=q.id,
                stage_id=q.stage_id,
                all_day=True,
                description=f"Stage quiz — {q.title}",
                duration_minutes=_duration_minutes(DEFAULT_QUIZ_START, DEFAULT_QUIZ_END),
            )
        )
    return events


def _project_events(
    db: Session,
    user: User,
    start_date: date,
    end_date: date,
) -> list[CalendarEventResponse]:
    """Stage milestones with due dates (shown as Projects in the calendar UI)."""
    role_id = user.selected_role_id
    if not role_id:
        return []

    stages = (
        db.query(Stage)
        .filter(
            Stage.role_id == role_id,
            Stage.due_date.isnot(None),
            Stage.due_date >= start_date,
            Stage.due_date <= end_date,
        )
        .order_by(Stage.due_date.asc())
        .all()
    )

    progress_map: dict[int, bool] = {}
    for pt in db.query(ProgressTracking).filter(
        ProgressTracking.user_id == user.id,
        ProgressTracking.role_id == role_id,
    ).all():
        progress_map[pt.stage_id] = pt.unlocked

    events: list[CalendarEventResponse] = []
    for stage in stages:
        assert stage.due_date is not None
        events.append(
            CalendarEventResponse(
                id=f"project-{stage.id}",
                event_type="project",
                title=stage.title,
                subtitle="Stage milestone",
                event_date=stage.due_date,
                start_time=DEFAULT_PROJECT_START,
                end_time=DEFAULT_PROJECT_END,
                status="unlocked" if progress_map.get(stage.id, False) else "locked",
                entity_id=stage.id,
                stage_id=stage.id,
                all_day=True,
                description=stage.description,
                duration_minutes=_duration_minutes(DEFAULT_PROJECT_START, DEFAULT_PROJECT_END),
            )
        )
    return events


def get_calendar_events(
    db: Session,
    user: User,
    start_date: date,
    end_date: date,
    *,
    include_classes: bool = True,
    include_quizzes: bool = True,
    include_projects: bool = True,
) -> list[CalendarEventResponse]:
    if end_date < start_date:
        return []
    if (end_date - start_date).days > MAX_RANGE_DAYS:
        end_date = start_date + timedelta(days=MAX_RANGE_DAYS)

    batch_ids = _enrolled_batch_ids(db, user.id)
    batch_map = {
        b.id: b.name
        for b in db.query(LearningBatch).filter(LearningBatch.id.in_(batch_ids)).all()
    } if batch_ids else {}

    passed_quiz_ids: set[int] = set()
    if include_quizzes and user.selected_role_id:
        for sub in db.query(Submission).filter(
            Submission.user_id == user.id,
            Submission.quiz_id.isnot(None),
            Submission.status == SubmissionStatus.PASSED,
        ).all():
            if sub.quiz_id is not None:
                passed_quiz_ids.add(sub.quiz_id)

    events: list[CalendarEventResponse] = []
    if include_classes:
        events.extend(_class_events(db, batch_ids, start_date, end_date, batch_map))
    if include_quizzes:
        events.extend(_quiz_events(db, user, start_date, end_date, passed_quiz_ids))
    if include_projects:
        events.extend(_project_events(db, user, start_date, end_date))

    events.sort(key=lambda e: (e.event_date, e.start_time or time.min, e.event_type))
    return events
