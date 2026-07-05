"""Schemas for job enrichment read APIs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EnrichmentRoleSummaryItem(BaseModel):
    role_id: str
    role_name: str
    count: int


class EnrichmentLevelSummaryItem(BaseModel):
    role_level_id: str
    experience_level: str
    count: int


class JobEnrichmentSummaryResponse(BaseModel):
    total_enrichments: int
    pending_count: int
    needs_review_count: int
    approved_count: int
    rejected_count: int
    live_count: int
    expired_count: int
    unknown_live_status_count: int
    role_summary: list[EnrichmentRoleSummaryItem]
    level_summary: list[EnrichmentLevelSummaryItem]
    quiz_pack_linked_count: int
    quiz_pack_missing_count: int


class JobEnrichmentReviewRow(BaseModel):
    job_id: str
    actual_role_id: str
    actual_role_name: str
    role_level_id: str
    experience_level: str
    job_live_status: str
    jd_fetch_status: str
    required_skills: list[str] | None = None
    student_preparation_topics: list[str] | None = None
    mapping_confidence: float | None = None
    approved_status: str
    notes: str | None = None


class JobEnrichmentReviewResponse(BaseModel):
    rows: list[JobEnrichmentReviewRow]


class JobEnrichmentRow(BaseModel):
    job_id: str
    actual_role_id: str
    actual_role_name: str
    role_level_id: str
    experience_level: str
    job_live_status: str
    jd_fetch_status: str
    jd_summary: str | None = None
    required_skills: list[str] | None = None
    good_to_have_skills: list[str] | None = None
    tools: list[str] | None = None
    programming_languages: list[str] | None = None
    databases: list[str] | None = None
    frameworks: list[str] | None = None
    student_preparation_topics: list[str] | None = None
    quiz_pack_id: str | None = None
    mapping_confidence: float | None = None
    manual_review_needed: bool
    approved_status: str
    approved_by: int | None = None
    approved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class JobEnrichmentListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    rows: list[JobEnrichmentRow] = Field(default_factory=list)
