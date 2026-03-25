import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import (
    Project,
    ProjectCatalog,
    ProjectCatalogStep,
    ProjectReviewStatus,
    ProjectStepCompletion,
    User,
)


router = APIRouter(prefix="/projects", tags=["Projects"])


# ── Public catalog endpoints (no auth required) ───────────────────────────────

@router.get("/catalog")
def list_project_catalog(db: Session = Depends(get_db)):
    """Return all projects available in the catalog."""
    projects = db.query(ProjectCatalog).order_by(ProjectCatalog.id).all()
    return [
        {
            "id": p.slug,
            "title": p.title,
            "description": p.description,
            "shortDescription": p.short_description,
            "difficulty": p.difficulty,
            "estimatedTime": p.estimated_time,
            "stepCount": db.query(ProjectCatalogStep).filter_by(project_id=p.id).count(),
        }
        for p in projects
    ]


@router.get("/catalog/{slug}")
def get_project_catalog(slug: str, db: Session = Depends(get_db)):
    """Return a specific catalog project with all its steps."""
    project = db.query(ProjectCatalog).filter_by(slug=slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    steps = (
        db.query(ProjectCatalogStep)
        .filter_by(project_id=project.id)
        .order_by(ProjectCatalogStep.order)
        .all()
    )
    return {
        "id": project.slug,
        "title": project.title,
        "description": project.description,
        "shortDescription": project.short_description,
        "difficulty": project.difficulty,
        "estimatedTime": project.estimated_time,
        "steps": [
            {
                "id": s.order,
                "slug": s.slug,
                "title": s.title,
                "type": s.step_type,
                "content": {
                    "description": s.description,
                    "points": json.loads(s.points_json) if s.points_json else None,
                    "code": s.code,
                    "language": s.language,
                    "challenge": s.challenge,
                    "hint": s.hint,
                    "walkthroughGif": s.walkthrough_gif,
                    "walkthroughCaption": s.walkthrough_caption,
                    "initialCode": s.initial_code,
                    "callableName": s.callable_name,
                    "testCases": json.loads(s.test_cases) if s.test_cases else None,
                },
            }
            for s in steps
        ],
    }


# ── TDD progress endpoint ─────────────────────────────────────────────────────

class StepProgressRequest(BaseModel):
    step_id: int
    code_snapshot: str | None = None
    passed: bool


@router.get("/{slug}/progress")
def get_project_progress(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return completed step ids and next step pointer for a catalog project."""
    rows = (
        db.query(ProjectStepCompletion)
        .filter_by(user_id=current_user.id, project_slug=slug)
        .order_by(ProjectStepCompletion.step_id.asc())
        .all()
    )
    completed_step_ids = sorted({row.step_id for row in rows})

    next_step_id = 1
    for step_id in completed_step_ids:
        if step_id == next_step_id:
            next_step_id += 1
        elif step_id > next_step_id:
            break

    return {
        "projectSlug": slug,
        "completedStepIds": completed_step_ids,
        "nextStepId": next_step_id,
    }


@router.post("/{slug}/progress")
def save_project_progress(
    slug: str,
    payload: StepProgressRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Secure upsert for project_step_completions used by interactive builders."""
    existing = (
        db.query(ProjectStepCompletion)
        .filter_by(user_id=current_user.id, project_slug=slug, step_id=payload.step_id)
        .first()
    )
    if existing:
        existing.passed = payload.passed
        existing.code_snapshot = payload.code_snapshot
        existing.completed_at = datetime.utcnow()
    else:
        db.add(ProjectStepCompletion(
            user_id=current_user.id,
            project_slug=slug,
            step_id=payload.step_id,
            passed=payload.passed,
            code_snapshot=payload.code_snapshot,
            completed_at=datetime.utcnow(),
        ))

    db.commit()
    return {
        "projectSlug": slug,
        "stepId": payload.step_id,
        "passed": payload.passed,
        "saved": True,
    }


@router.post("/catalog/{slug}/progress")
def save_step_progress(
    slug: str,
    payload: StepProgressRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upsert a step completion record for the current user."""
    existing = (
        db.query(ProjectStepCompletion)
        .filter_by(user_id=current_user.id, project_slug=slug, step_id=payload.step_id)
        .first()
    )
    if existing:
        existing.passed = payload.passed
        existing.code_snapshot = payload.code_snapshot
        existing.completed_at = datetime.utcnow()
    else:
        db.add(ProjectStepCompletion(
            user_id=current_user.id,
            project_slug=slug,
            step_id=payload.step_id,
            passed=payload.passed,
            code_snapshot=payload.code_snapshot,
            completed_at=datetime.utcnow(),
        ))
    db.commit()
    return {"ok": True}


class ProjectSubmitRequest(BaseModel):
    stage_id: int
    title: str
    description: str
    github_link: str | None = None


@router.post("/submit")
def submit_project(
    payload: ProjectSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        user_id=current_user.id,
        stage_id=payload.stage_id,
        title=payload.title,
        description=payload.description,
        github_link=payload.github_link,
        review_status=ProjectReviewStatus.SUBMITTED,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"id": project.id, "status": project.review_status.value}


@router.get("/me")
def my_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return [
        {
            "id": item.id,
            "stage_id": item.stage_id,
            "title": item.title,
            "status": item.review_status.value,
            "github_link": item.github_link,
        }
        for item in projects
    ]
