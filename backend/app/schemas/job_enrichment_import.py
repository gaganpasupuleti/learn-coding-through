"""Schemas for job enrichment CSV import preview."""

from __future__ import annotations

from pydantic import BaseModel, Field


class JobEnrichmentRowPreview(BaseModel):
    row_number: int
    job_id: str
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class RoleSummaryItem(BaseModel):
    role_id: str
    count: int


class QuizPackSummaryItem(BaseModel):
    quiz_pack_id: str
    count: int
    exists: bool


class JobEnrichmentImportPreviewResponse(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    warning_rows: int
    row_errors: list[JobEnrichmentRowPreview]
    role_summary: list[RoleSummaryItem]
    status_summary: dict[str, dict[str, int]]
    quiz_pack_summary: list[QuizPackSummaryItem]
