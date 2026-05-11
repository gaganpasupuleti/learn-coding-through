"""Public / student-facing job schemas."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class StudentJobOpenResponse(BaseModel):
    id: int
    title: str
    company_name: str
    location: str
    employment_type: str
    description: str | None
    external_apply_url: str | None = None
    listing_metadata: dict[str, Any] | None = None
    eligible_batch_id: int | None
    eligible_batch_name: str | None
    created_at: datetime


class JobApplyResponse(BaseModel):
    job_id: int
    status: str = Field(..., description="Application status, e.g. applied")
    message: str = ""


class JobImportRowError(BaseModel):
    row: int
    detail: str


class JobImportResult(BaseModel):
    created: int
    skipped: int
    closed_previous: int = 0
    errors: list[JobImportRowError]
