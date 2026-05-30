from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.database import get_db
from app.models.models import (
    FeedbackCategory,
    FeedbackStatus,
    StudentFeedback,
    User,
    UserRole,
)
from app.schemas.feedback import (
    AdminFeedbackItem,
    FeedbackCreate,
    FeedbackResponse,
    FeedbackReviewUpdate,
)

router = APIRouter(tags=["Feedback"])
admin_router = APIRouter(prefix="/admin/feedback", tags=["Admin Feedback"])


def _require_student(user: User) -> User:
    if user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can submit feedback")
    return user


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_student(current_user)
    row = StudentFeedback(
        user_id=current_user.id,
        category=FeedbackCategory(payload.category),
        message=payload.message.strip(),
        status=FeedbackStatus.PENDING,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@admin_router.get("", response_model=list[AdminFeedbackItem])
def list_feedback(
    status: str = Query("all", description="pending | all"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = (
        db.query(StudentFeedback, User)
        .join(User, StudentFeedback.user_id == User.id)
        .order_by(StudentFeedback.created_at.desc())
    )
    if status == "pending":
        query = query.filter(StudentFeedback.status == FeedbackStatus.PENDING)
    rows = query.limit(limit).all()

    return [
        AdminFeedbackItem(
            id=fb.id,
            user_id=fb.user_id,
            student_name=user.full_name,
            student_email=user.email,
            category=fb.category.value,
            message=fb.message,
            status=fb.status.value,
            admin_notes=fb.admin_notes,
            reviewed_by_user_id=fb.reviewed_by_user_id,
            reviewed_at=fb.reviewed_at,
            created_at=fb.created_at,
        )
        for fb, user in rows
    ]


@admin_router.patch("/{feedback_id}", response_model=AdminFeedbackItem)
def review_feedback(
    feedback_id: int,
    payload: FeedbackReviewUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    row = db.query(StudentFeedback).filter(StudentFeedback.id == feedback_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Feedback not found")

    row.status = FeedbackStatus.REVIEWED
    row.reviewed_by_user_id = admin.id
    row.reviewed_at = datetime.utcnow()
    if payload.admin_notes is not None:
        row.admin_notes = payload.admin_notes.strip() or None

    db.commit()
    db.refresh(row)
    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Submitter not found")

    return AdminFeedbackItem(
        id=row.id,
        user_id=row.user_id,
        student_name=user.full_name,
        student_email=user.email,
        category=row.category.value,
        message=row.message,
        status=row.status.value,
        admin_notes=row.admin_notes,
        reviewed_by_user_id=row.reviewed_by_user_id,
        reviewed_at=row.reviewed_at,
        created_at=row.created_at,
    )
