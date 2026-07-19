"""Code Quest proxy routes for Resume Matcher public API (JWT at CQ boundary)."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.models import User
from app.services import resume_matcher_client as rm

router = APIRouter(prefix="/resume-matcher", tags=["resume-matcher"])

_ALLOWED_SUFFIXES = {".pdf", ".docx"}
_ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream",
}
_UNSAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


class AnalyzeRequest(BaseModel):
    resume: dict[str, Any] = Field(default_factory=dict)
    job_description: str = Field(min_length=20, max_length=30000)
    resume_text: str | None = Field(default=None, max_length=50000)


class MatchRequest(BaseModel):
    resume: dict[str, Any] = Field(default_factory=dict)
    job_description: str | None = Field(default=None, max_length=30000)
    job_keywords: dict[str, Any] = Field(default_factory=dict)


class PromptRequest(BaseModel):
    resume: dict[str, Any] = Field(default_factory=dict)
    job_description: str = Field(min_length=20, max_length=30000)


def _map_error(exc: rm.ResumeMatcherClientError) -> HTTPException:
    return HTTPException(
        status_code=exc.status_code,
        detail={"code": exc.code, "message": exc.message},
    )


def _safe_filename(name: str | None) -> str:
    raw = Path(name or "upload.bin").name
    cleaned = _UNSAFE_NAME.sub("_", raw).strip("._") or "upload.bin"
    return cleaned[:120]


@router.get("/health")
def resume_matcher_health(_user: User = Depends(get_current_user)) -> dict[str, Any]:
    try:
        payload = rm.health()
    except rm.ResumeMatcherClientError as exc:
        raise _map_error(exc) from exc
    return {
        "enabled": settings.resume_matcher_enabled,
        "upstream": payload,
    }


@router.post("/resumes/parse")
async def parse_resume(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
) -> dict[str, Any]:
    original = _safe_filename(file.filename)
    suffix = Path(original).suffix.lower()
    if suffix not in _ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail={"code": "unsupported_file_type", "message": "Only PDF and DOCX are allowed."},
        )

    content_type = (file.content_type or "application/octet-stream").split(";")[0].strip().lower()
    if content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail={"code": "unsupported_mime_type", "message": "MIME type not allowed."},
        )

    data = await file.read(settings.resume_matcher_max_upload_bytes + 1)
    if len(data) > settings.resume_matcher_max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail={"code": "file_too_large", "message": "File exceeds upload limit."},
        )
    if not data:
        raise HTTPException(
            status_code=400,
            detail={"code": "empty_file", "message": "Uploaded file is empty."},
        )

    try:
        parsed = rm.parse_resume(original, data, content_type)
    except rm.ResumeMatcherClientError as exc:
        raise _map_error(exc) from exc
    return parsed.model_dump()


@router.post("/jobs/analyze")
def analyze_job(body: AnalyzeRequest, _user: User = Depends(get_current_user)) -> dict[str, Any]:
    try:
        result = rm.analyze_job(body.resume, body.job_description, body.resume_text)
    except rm.ResumeMatcherClientError as exc:
        raise _map_error(exc) from exc
    return result.model_dump()


@router.post("/resumes/match")
def match_resume(body: MatchRequest, _user: User = Depends(get_current_user)) -> dict[str, Any]:
    try:
        result = rm.match_resume(
            body.resume,
            job_keywords=body.job_keywords,
            job_description=body.job_description,
        )
    except rm.ResumeMatcherClientError as exc:
        raise _map_error(exc) from exc
    return result.model_dump()


@router.post("/prompts/cover-letter")
def cover_letter_prompt(body: PromptRequest, _user: User = Depends(get_current_user)) -> dict[str, Any]:
    try:
        result = rm.prepare_cover_letter_prompt(body.resume, body.job_description)
    except rm.ResumeMatcherClientError as exc:
        raise _map_error(exc) from exc
    return result.model_dump()


@router.post("/prompts/application-email")
def application_email_prompt(
    body: PromptRequest, _user: User = Depends(get_current_user)
) -> dict[str, Any]:
    try:
        result = rm.prepare_application_email_prompt(body.resume, body.job_description)
    except rm.ResumeMatcherClientError as exc:
        raise _map_error(exc) from exc
    return result.model_dump()
