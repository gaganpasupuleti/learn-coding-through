"""Outbound client for Resume Matcher integration API (backend-only)."""

from __future__ import annotations

from typing import Any, Final
from urllib.parse import urlparse

import requests
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings

_ALLOWED_PATHS: Final[frozenset[str]] = frozenset(
    {
        "/api/v1/integration/health",
        "/api/v1/integration/resumes/parse",
        "/api/v1/integration/jobs/analyze",
        "/api/v1/integration/resumes/match",
        "/api/v1/integration/prompts/cover-letter",
        "/api/v1/integration/prompts/application-email",
    }
)


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
    if parsed.username or parsed.password:
        raise ResumeMatcherClientError(
            "invalid_resume_matcher_url",
            "RESUME_MATCHER_BASE_URL must not embed credentials",
            500,
        )
    return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")


def _ensure_enabled() -> str:
    if not settings.resume_matcher_enabled:
        raise ResumeMatcherClientError(
            "resume_matcher_disabled",
            "Resume Matcher integration is disabled",
            503,
        )
    token = (settings.resume_matcher_service_token or "").strip()
    if not token:
        raise ResumeMatcherClientError(
            "resume_matcher_service_token_missing",
            "Resume Matcher service credential is not configured",
            503,
        )
    return _validate_base_url(settings.resume_matcher_base_url)


def _assert_allowed_path(path: str) -> str:
    if not path.startswith("/") or ".." in path or path != path.split("?")[0].split("#")[0]:
        raise ResumeMatcherClientError(
            "resume_matcher_path_rejected",
            "Upstream path is not allowlisted",
            400,
        )
    if path not in _ALLOWED_PATHS:
        raise ResumeMatcherClientError(
            "resume_matcher_path_rejected",
            "Upstream path is not allowlisted",
            400,
        )
    return path


def _service_headers() -> dict[str, str]:
    token = (settings.resume_matcher_service_token or "").strip()
    return {
        "Accept": "application/json",
        "X-CodeQuest-Service-Token": token,
    }


def _sanitize_upstream_error(response: requests.Response) -> ResumeMatcherClientError:
    code = "resume_matcher_error"
    message = "Resume Matcher request failed"
    try:
        detail = response.json().get("detail")
        if isinstance(detail, dict):
            raw_code = str(detail.get("code") or code)
            # Never forward internal URLs/traces; keep machine codes only when short.
            if raw_code.isidentifier() or "_" in raw_code:
                code = raw_code[:80]
            raw_message = str(detail.get("message") or message)
            if "http://" not in raw_message.lower() and "https://" not in raw_message.lower():
                message = raw_message[:200]
        elif isinstance(detail, str) and "http://" not in detail.lower():
            message = detail[:200]
    except Exception:  # noqa: BLE001
        pass
    status = response.status_code if 400 <= response.status_code < 600 else 502
    return ResumeMatcherClientError(code, message, status)


def _request(
    method: str,
    path: str,
    *,
    json_body: dict[str, Any] | None = None,
    files: dict[str, Any] | None = None,
    max_bytes: int | None = None,
) -> Any:
    base = _ensure_enabled()
    safe_path = _assert_allowed_path(path)
    limit = max_bytes if max_bytes is not None else settings.resume_matcher_max_response_bytes
    timeout = (
        settings.resume_matcher_connect_timeout_seconds,
        settings.resume_matcher_timeout_seconds,
    )
    try:
        response = requests.request(
            method,
            f"{base}{safe_path}",
            json=json_body,
            files=files,
            headers=_service_headers(),
            timeout=timeout,
            stream=True,
            allow_redirects=False,
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

    if 300 <= response.status_code < 400:
        raise ResumeMatcherClientError(
            "resume_matcher_redirect_rejected",
            "Upstream redirects are not allowed",
            502,
        )

    raw = response.content
    if len(raw) > limit:
        raise ResumeMatcherClientError(
            "resume_matcher_response_too_large",
            "Resume Matcher response exceeded size limit",
            502,
        )

    if response.status_code >= 400:
        raise _sanitize_upstream_error(response)

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
