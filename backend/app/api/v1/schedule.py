from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
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
from app.schemas.schedule import (
    DeadlineQuizItem,
    DeadlineStageItem,
    UpcomingDeadlinesResponse,
    UpcomingSessionResponse,
)

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.get("/upcoming", response_model=list[UpcomingSessionResponse])
def upcoming_sessions(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batch_ids = [
        row.batch_id
        for row in db.query(BatchEnrollment.batch_id)
        .filter(BatchEnrollment.user_id == current_user.id)
        .all()
    ]
    if not batch_ids:
        return []

    rows = (
        db.query(ClassSession)
        .filter(
            ClassSession.batch_id.in_(batch_ids),
            ClassSession.status == ClassSessionStatus.SCHEDULED,
            ClassSession.session_date >= date.today(),
        )
        .order_by(ClassSession.session_date.asc(), ClassSession.start_time.asc())
        .limit(limit)
        .all()
    )

    batch_map = {
        b.id: b.name
        for b in db.query(LearningBatch).filter(LearningBatch.id.in_(batch_ids)).all()
    }

    return [
        UpcomingSessionResponse(
            id=s.id,
            batch_name=batch_map.get(s.batch_id, ""),
            title=s.title,
            topic=s.topic,
            session_date=s.session_date,
            start_time=s.start_time,
            end_time=s.end_time,
            status=s.status.value,
        )
        for s in rows
    ]


@router.get("/deadlines", response_model=UpcomingDeadlinesResponse)
def upcoming_deadlines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role_id = current_user.selected_role_id
    if not role_id:
        return UpcomingDeadlinesResponse(quizzes=[], stages=[])

    stages = (
        db.query(Stage)
        .filter(Stage.role_id == role_id, Stage.due_date.isnot(None))
        .order_by(Stage.due_date.asc())
        .all()
    )

    progress_map: dict[int, bool] = {}
    for pt in db.query(ProgressTracking).filter(
        ProgressTracking.user_id == current_user.id,
        ProgressTracking.role_id == role_id,
    ).all():
        progress_map[pt.stage_id] = pt.unlocked

    stage_items = [
        DeadlineStageItem(
            stage_id=s.id,
            title=s.title,
            due_date=s.due_date,
            unlocked=progress_map.get(s.id, False),
        )
        for s in stages
    ]

    quizzes = (
        db.query(Quiz)
        .join(Stage, Quiz.stage_id == Stage.id)
        .filter(Stage.role_id == role_id, Quiz.due_date.isnot(None))
        .order_by(Quiz.due_date.asc())
        .all()
    )

    passed_quiz_ids: set[int] = set()
    for sub in db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.quiz_id.isnot(None),
        Submission.status == SubmissionStatus.PASSED,
    ).all():
        if sub.quiz_id is not None:
            passed_quiz_ids.add(sub.quiz_id)

    quiz_items = [
        DeadlineQuizItem(
            quiz_id=q.id,
            title=q.title,
            due_date=q.due_date,
            passed=q.id in passed_quiz_ids,
        )
        for q in quizzes
    ]

    return UpcomingDeadlinesResponse(quizzes=quiz_items, stages=stage_items)
