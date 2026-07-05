"""Read-only queries for saved job enrichment rows."""

from __future__ import annotations

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.models import JobEnrichment
from app.schemas.job_enrichment import (
    EnrichmentLevelSummaryItem,
    EnrichmentRoleSummaryItem,
    JobEnrichmentListResponse,
    JobEnrichmentReviewResponse,
    JobEnrichmentReviewRow,
    JobEnrichmentRow,
    JobEnrichmentSummaryResponse,
)


def _confidence_value(value: object | None) -> float | None:
    if value is None:
        return None
    return float(value)


def _to_row(row: JobEnrichment) -> JobEnrichmentRow:
    return JobEnrichmentRow(
        job_id=row.job_id,
        actual_role_id=row.actual_role_id,
        actual_role_name=row.actual_role_name,
        role_level_id=row.role_level_id,
        experience_level=row.experience_level,
        job_live_status=row.job_live_status,
        jd_fetch_status=row.jd_fetch_status,
        jd_summary=row.jd_summary,
        required_skills=row.required_skills,
        good_to_have_skills=row.good_to_have_skills,
        tools=row.tools,
        programming_languages=row.programming_languages,
        databases=row.databases,
        frameworks=row.frameworks,
        student_preparation_topics=row.student_preparation_topics,
        quiz_pack_id=row.quiz_pack_id,
        mapping_confidence=_confidence_value(row.mapping_confidence),
        manual_review_needed=row.manual_review_needed,
        approved_status=row.approved_status,
        approved_by=row.approved_by,
        approved_at=row.approved_at,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _to_review_row(row: JobEnrichment) -> JobEnrichmentReviewRow:
    return JobEnrichmentReviewRow(
        job_id=row.job_id,
        actual_role_id=row.actual_role_id,
        actual_role_name=row.actual_role_name,
        role_level_id=row.role_level_id,
        experience_level=row.experience_level,
        job_live_status=row.job_live_status,
        jd_fetch_status=row.jd_fetch_status,
        required_skills=row.required_skills,
        student_preparation_topics=row.student_preparation_topics,
        mapping_confidence=_confidence_value(row.mapping_confidence),
        approved_status=row.approved_status,
        notes=None,
    )


def _count_by_status(db: Session, status: str) -> int:
    return (
        db.query(func.count())
        .select_from(JobEnrichment)
        .filter(JobEnrichment.approved_status == status)
        .scalar()
        or 0
    )


def get_job_enrichment_summary(db: Session) -> JobEnrichmentSummaryResponse:
    total = db.query(func.count()).select_from(JobEnrichment).scalar() or 0
    live_count = (
        db.query(func.count())
        .select_from(JobEnrichment)
        .filter(JobEnrichment.job_live_status == "LIVE")
        .scalar()
        or 0
    )
    expired_count = (
        db.query(func.count())
        .select_from(JobEnrichment)
        .filter(JobEnrichment.job_live_status == "EXPIRED")
        .scalar()
        or 0
    )
    unknown_live_status_count = (
        db.query(func.count())
        .select_from(JobEnrichment)
        .filter(JobEnrichment.job_live_status == "UNKNOWN")
        .scalar()
        or 0
    )
    quiz_pack_linked_count = (
        db.query(func.count())
        .select_from(JobEnrichment)
        .filter(JobEnrichment.quiz_pack_id.isnot(None))
        .scalar()
        or 0
    )
    quiz_pack_missing_count = (
        db.query(func.count())
        .select_from(JobEnrichment)
        .filter(JobEnrichment.quiz_pack_id.is_(None))
        .scalar()
        or 0
    )

    role_rows = (
        db.query(
            JobEnrichment.actual_role_id,
            JobEnrichment.actual_role_name,
            func.count().label("count"),
        )
        .group_by(JobEnrichment.actual_role_id, JobEnrichment.actual_role_name)
        .order_by(JobEnrichment.actual_role_id)
        .all()
    )
    level_rows = (
        db.query(
            JobEnrichment.role_level_id,
            JobEnrichment.experience_level,
            func.count().label("count"),
        )
        .group_by(JobEnrichment.role_level_id, JobEnrichment.experience_level)
        .order_by(JobEnrichment.role_level_id)
        .all()
    )

    return JobEnrichmentSummaryResponse(
        total_enrichments=total,
        pending_count=_count_by_status(db, "PENDING"),
        needs_review_count=_count_by_status(db, "NEEDS_REVIEW"),
        approved_count=_count_by_status(db, "APPROVED"),
        rejected_count=_count_by_status(db, "REJECTED"),
        live_count=live_count,
        expired_count=expired_count,
        unknown_live_status_count=unknown_live_status_count,
        role_summary=[
            EnrichmentRoleSummaryItem(role_id=r[0], role_name=r[1], count=r[2]) for r in role_rows
        ],
        level_summary=[
            EnrichmentLevelSummaryItem(
                role_level_id=r[0],
                experience_level=r[1],
                count=r[2],
            )
            for r in level_rows
        ],
        quiz_pack_linked_count=quiz_pack_linked_count,
        quiz_pack_missing_count=quiz_pack_missing_count,
    )


def get_job_enrichment_review_rows(db: Session) -> JobEnrichmentReviewResponse:
    rows = (
        db.query(JobEnrichment)
        .filter(
            or_(
                JobEnrichment.approved_status == "NEEDS_REVIEW",
                JobEnrichment.manual_review_needed.is_(True),
            )
        )
        .order_by(JobEnrichment.updated_at.desc(), JobEnrichment.job_id)
        .all()
    )
    return JobEnrichmentReviewResponse(rows=[_to_review_row(row) for row in rows])


def list_job_enrichments(
    db: Session,
    *,
    approved_status: str | None = None,
    actual_role_id: str | None = None,
    experience_level: str | None = None,
    job_live_status: str | None = None,
    manual_review_needed: bool | None = None,
    limit: int = 50,
    offset: int = 0,
) -> JobEnrichmentListResponse:
    query = db.query(JobEnrichment)
    if approved_status:
        query = query.filter(JobEnrichment.approved_status == approved_status.strip().upper())
    if actual_role_id:
        query = query.filter(JobEnrichment.actual_role_id == actual_role_id.strip())
    if experience_level:
        query = query.filter(JobEnrichment.experience_level == experience_level.strip().lower())
    if job_live_status:
        query = query.filter(JobEnrichment.job_live_status == job_live_status.strip().upper())
    if manual_review_needed is not None:
        query = query.filter(JobEnrichment.manual_review_needed.is_(manual_review_needed))

    total = query.count()
    rows = (
        query.order_by(JobEnrichment.updated_at.desc(), JobEnrichment.job_id)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return JobEnrichmentListResponse(
        total=total,
        limit=limit,
        offset=offset,
        rows=[_to_row(row) for row in rows],
    )


def get_job_enrichment_by_id(db: Session, job_id: str) -> JobEnrichmentRow | None:
    row = db.get(JobEnrichment, job_id.strip())
    if not row:
        return None
    return _to_row(row)
