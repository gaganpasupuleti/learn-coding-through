"""Outbound client for Resume Matcher integration API (backend-only)."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import requests
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings


class ResumeMatcherClientError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


class ParseResponse(BaseModel):
    markdown: str
    content_type: str
    original_filename: str
    byte_size: int
    parser: str = "markitdown"


class AnalyzeResponse(BaseModel):
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    keyword_coverage_percent: float
    findings: list[str] = Field(default_factory=list)
    extraction_mode: str = "deterministic"


class MatchResponse(BaseModel):
    keyword_coverage_percent: float
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    findings: list[str] = Field(default_factory=list)


class PromptPrepResponse(BaseModel):
    task: str
    system_prompt: str
    user_prompt: str
    source: str


def _validate_base_url(url: str) -> str:
    parsed = urlparse(url.strip())
    if parsed.scheme not in ("http", "https"):
        raise ResumeMatcherClientError(
            "invalid_resume_matcher_url",
            "RESUME_MATCHER_BASE_URL must be http or https",
            500,
        )
    if not parsed.netloc:
        raise ResumeMatcherClientError(
            "invalid_resume_matcher_url",
            "RESUME_MATCHER_BASE_URL is missing a host",
            500,
        )
    return url.rstrip("/")


def _ensure_enabled() -> str:
    if not settings.resume_matcher_enabled:
        raise ResumeMatcherClientError(
            "resume_matcher_disabled",
            "Resume Matcher integration is disabled",
            503,
        )
    return _validate_base_url(settings.resume_matcher_base_url)


def _request(
    method: str,
    path: str,
    *,
    json_body: dict[str, Any] | None = None,
    files: dict[str, Any] | None = None,
    max_bytes: int = 2_000_000,
) -> Any:
    base = _ensure_enabled()
    timeout = (
        settings.resume_matcher_connect_timeout_seconds,
        settings.resume_matcher_timeout_seconds,
    )
    try:
        response = requests.request(
            method,
            f"{base}{path}",
            json=json_body,
            files=files,
            timeout=timeout,
            stream=True,
        )
    except requests.Timeout as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_timeout",
            "Resume Matcher request timed out",
            504,
        ) from exc
    except requests.RequestException as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_unavailable",
            "Resume Matcher is unavailable",
            503,
        ) from exc

    raw = response.content
    if len(raw) > max_bytes:
        raise ResumeMatcherClientError(
            "resume_matcher_response_too_large",
            "Resume Matcher response exceeded size limit",
            502,
        )

    if response.status_code >= 400:
        code = "resume_matcher_error"
        message = "Resume Matcher request failed"
        try:
            detail = response.json().get("detail")
            if isinstance(detail, dict):
                code = str(detail.get("code") or code)
                message = str(detail.get("message") or message)
            elif isinstance(detail, str):
                message = detail
        except Exception:  # noqa: BLE001
            pass
        raise ResumeMatcherClientError(code, message, response.status_code)

    try:
        return response.json()
    except ValueError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_json",
            "Resume Matcher returned invalid JSON",
            502,
        ) from exc


def health() -> dict[str, Any]:
    payload = _request("GET", "/api/v1/integration/health", max_bytes=64_000)
    if not isinstance(payload, dict) or payload.get("status") != "ok":
        raise ResumeMatcherClientError(
            "resume_matcher_unhealthy",
            "Resume Matcher health check failed",
            502,
        )
    return payload


def parse_resume(filename: str, content: bytes, content_type: str) -> ParseResponse:
    safe_name = filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1] or "upload.bin"
    try:
        payload = _request(
            "POST",
            "/api/v1/integration/resumes/parse",
            files={"file": (safe_name, content, content_type)},
            max_bytes=4_000_000,
        )
        return ParseResponse.model_validate(payload)
    except ValidationError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher parse response failed validation",
            502,
        ) from exc


def analyze_job(resume: dict[str, Any], job_description: str, resume_text: str | None = None) -> AnalyzeResponse:
    try:
        payload = _request(
            "POST",
            "/api/v1/integration/jobs/analyze",
            json_body={
                "resume": resume,
                "job_description": job_description,
                "resume_text": resume_text,
            },
        )
        return AnalyzeResponse.model_validate(payload)
    except ValidationError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher analyze response failed validation",
            502,
        ) from exc


def match_resume(
    resume: dict[str, Any],
    *,
    job_keywords: dict[str, Any] | None = None,
    job_description: str | None = None,
) -> MatchResponse:
    try:
        payload = _request(
            "POST",
            "/api/v1/integration/resumes/match",
            json_body={
                "resume": resume,
                "job_keywords": job_keywords or {},
                "job_description": job_description,
            },
        )
        return MatchResponse.model_validate(payload)
    except ValidationError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher match response failed validation",
            502,
        ) from exc


def prepare_cover_letter_prompt(resume: dict[str, Any], job_description: str) -> PromptPrepResponse:
    try:
        payload = _request(
            "POST",
            "/api/v1/integration/prompts/cover-letter",
            json_body={"resume": resume, "job_description": job_description},
        )
        return PromptPrepResponse.model_validate(payload)
    except ValidationError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher prompt response failed validation",
            502,
        ) from exc


def prepare_application_email_prompt(resume: dict[str, Any], job_description: str) -> PromptPrepResponse:
    try:
        payload = _request(
            "POST",
            "/api/v1/integration/prompts/application-email",
            json_body={"resume": resume, "job_description": job_description},
        )
        return PromptPrepResponse.model_validate(payload)
    except ValidationError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher prompt response failed validation",
            502,
        ) from exc
