from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import (
    ProgressTracking,
    ProjectStepCompletion,
    ProjectCatalog,
    ProjectCatalogStep,
    QuizCatalog,
    Submission,
    User
)
from app.schemas.progress import ProgressResponse, ProgressUpdateRequest


router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/update", response_model=ProgressResponse)
def update_progress(
    payload: ProgressUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress = (
        db.query(ProgressTracking)
        .filter(
            ProgressTracking.user_id == current_user.id,
            ProgressTracking.role_id == payload.role_id,
            ProgressTracking.stage_id == payload.stage_id,
        )
        .first()
    )

    if not progress:
        progress = ProgressTracking(
            user_id=current_user.id,
            role_id=payload.role_id,
            stage_id=payload.stage_id,
        )

    progress.lessons_completed = payload.lessons_completed
    progress.total_lessons = payload.total_lessons
    progress.exercises_completed_pct = payload.exercises_completed_pct
    progress.latest_quiz_score = payload.latest_quiz_score
    progress.unlocked = payload.latest_quiz_score >= 70

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return ProgressResponse(
        stage_id=progress.stage_id,
        lessons_completed=progress.lessons_completed,
        total_lessons=progress.total_lessons,
        exercises_completed_pct=progress.exercises_completed_pct,
        latest_quiz_score=progress.latest_quiz_score,
        unlocked=progress.unlocked,
    )


@router.get("/me", response_model=list[ProgressResponse])
def my_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(ProgressTracking).filter(ProgressTracking.user_id == current_user.id).all()
    return [
        ProgressResponse(
            stage_id=item.stage_id,
            lessons_completed=item.lessons_completed,
            total_lessons=item.total_lessons,
            exercises_completed_pct=item.exercises_completed_pct,
            latest_quiz_score=item.latest_quiz_score,
            unlocked=item.unlocked,
        )
        for item in records
    ]


# ── Catalog project-step progress ──────────────────────────────────────────────

@router.get("/catalog")
def get_catalog_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all completed project steps for the current user."""
    rows = (
        db.query(ProjectStepCompletion)
        .filter(ProjectStepCompletion.user_id == current_user.id)
        .all()
    )
    return {
        "completedSteps": [
            {"projectSlug": r.project_slug, "stepId": r.step_id}
            for r in rows
        ]
    }


@router.post("/project/{slug}/step/{step_id}", status_code=200)
def complete_project_step(
    slug: str,
    step_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Idempotent upsert: mark a project step as completed."""
    existing = (
        db.query(ProjectStepCompletion)
        .filter_by(user_id=current_user.id, project_slug=slug, step_id=step_id)
        .first()
    )
    if existing is None:
        db.add(ProjectStepCompletion(
            user_id=current_user.id,
            project_slug=slug,
            step_id=step_id,
        ))
        db.commit()
    return {"projectSlug": slug, "stepId": step_id, "completed": True}


@router.get("/mastery/{node_id}")
def get_mastery_status(
    node_id: str,
    quiz_slug: str | None = None,
    project_slug: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns mastery status for a specific node.
    - Quizzes: Submission score > 80%
    - Projects: All steps in project_step_completions are true AND passed is true.
    """
    completed = False

    if quiz_slug:
        quiz_catalog = db.query(QuizCatalog).filter_by(slug=quiz_slug).first()
        if quiz_catalog:
            submission = (
                db.query(Submission)
                .filter(Submission.user_id == current_user.id, Submission.quiz_id == quiz_catalog.id)
                .order_by(Submission.score.desc())
                .first()
            )
            if submission and float(submission.score) >= 80:
                completed = True

    elif project_slug:
        total_steps = (
            db.query(ProjectCatalogStep)
            .join(ProjectCatalog)
            .filter(ProjectCatalog.slug == project_slug)
            .count()
        )
        if total_steps > 0:
            completed_steps = (
                db.query(ProjectStepCompletion)
                .filter(
                    ProjectStepCompletion.user_id == current_user.id,
                    ProjectStepCompletion.project_slug == project_slug,
                    ProjectStepCompletion.passed == True
                )
                .count()
            )
            if completed_steps >= total_steps:
                completed = True

    return {
        "node_id": node_id,
        "status": "completed" if completed else "pending"
    }
