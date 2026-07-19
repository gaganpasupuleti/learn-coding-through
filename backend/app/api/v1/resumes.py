"""CodeQuest Resume Lab — student resume CRUD (CQ JWT only)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import StudentResume, User

router = APIRouter(prefix="/resumes", tags=["resumes"])


def _default_resume_data() -> dict[str, Any]:
    return {
        "picture": {"hidden": True, "url": ""},
        "basics": {
            "name": "",
            "headline": "",
            "email": "",
            "phone": "",
            "location": "",
            "website": {"url": "", "label": ""},
        },
        "summary": {"title": "Summary", "columns": 1, "hidden": False, "content": ""},
        "sections": {
            "experience": {"title": "Experience", "columns": 1, "hidden": False, "items": []},
            "education": {"title": "Education", "columns": 1, "hidden": False, "items": []},
            "skills": {"title": "Skills", "columns": 1, "hidden": False, "items": []},
            "projects": {"title": "Projects", "columns": 1, "hidden": False, "items": []},
            "certifications": {"title": "Certifications", "columns": 1, "hidden": False, "items": []},
        },
        "metadata": {"template": "onyx", "notes": ""},
    }


class ResumeCreate(BaseModel):
    title: str = Field(default="My Resume", min_length=1, max_length=255)


class ResumeUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    data: dict[str, Any] | None = None


class ResumeSummaryOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class ResumeOut(ResumeSummaryOut):
    data: dict[str, Any]


def _owned_or_404(db: Session, resume_id: int, user: User) -> StudentResume:
    row = (
        db.query(StudentResume)
        .filter(StudentResume.id == resume_id, StudentResume.user_id == user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail={"code": "resume_not_found", "message": "Resume not found"})
    return row


@router.get("", response_model=list[ResumeSummaryOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[StudentResume]:
    return (
        db.query(StudentResume)
        .filter(StudentResume.user_id == current_user.id)
        .order_by(StudentResume.updated_at.desc())
        .all()
    )


@router.post("", response_model=ResumeOut)
def create_resume(
    body: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentResume:
    data = _default_resume_data()
    data["basics"]["email"] = (current_user.email or "").strip()
    data["basics"]["name"] = (current_user.full_name or "").strip()
    row = StudentResume(
        user_id=current_user.id,
        title=body.title.strip() or "My Resume",
        data=data,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentResume:
    return _owned_or_404(db, resume_id, current_user)


@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: int,
    body: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentResume:
    row = _owned_or_404(db, resume_id, current_user)
    if body.title is not None:
        row.title = body.title.strip() or row.title
    if body.data is not None:
        if not isinstance(body.data, dict):
            raise HTTPException(
                status_code=400,
                detail={"code": "invalid_resume_data", "message": "Resume data must be an object"},
            )
        row.data = body.data
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    row = _owned_or_404(db, resume_id, current_user)
    db.delete(row)
    db.commit()
