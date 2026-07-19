"""Outbound client for Resume Matcher public API (backend-only).

Talks to standalone Resume Matcher (`/api/v1/health`, `/api/v1/resumes/*`, …),
not the Code Quest integration-mode sidecar (`/api/v1/integration/*`).
"""

from __future__ import annotations

import re
from typing import Any, Final
from urllib.parse import urlparse

import requests
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings

_ALLOWED_PATHS: Final[frozenset[str]] = frozenset(
    {
        "/api/v1/health",
        "/api/v1/status",
        "/api/v1/resumes/upload",
        "/api/v1/resumes",
        "/api/v1/jobs/upload",
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
    resume_id: str | None = None
    processing_status: str | None = None


class AnalyzeResponse(BaseModel):
    """Local keyword coverage helper (RM standalone has no /jobs/analyze)."""

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


def _service_headers(*, json_body: bool = False) -> dict[str, str]:
    headers = {"Accept": "application/json"}
    if json_body:
        headers["Content-Type"] = "application/json"
    token = (settings.resume_matcher_service_token or "").strip()
    # Optional: only send when configured (standalone RM ignores it).
    if token:
        headers["X-CodeQuest-Service-Token"] = token
    return headers


def _sanitize_upstream_error(response: requests.Response) -> ResumeMatcherClientError:
    code = "resume_matcher_error"
    message = "Resume Matcher request failed"
    try:
        detail = response.json().get("detail")
        if isinstance(detail, dict):
            raw_code = str(detail.get("code") or code)
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
    params: dict[str, Any] | None = None,
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
            params=params,
            headers=_service_headers(json_body=json_body is not None and files is None),
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
    payload = _request("GET", "/api/v1/health", max_bytes=64_000)
    if not isinstance(payload, dict):
        raise ResumeMatcherClientError(
            "resume_matcher_unhealthy",
            "Resume Matcher health check failed",
            502,
        )
    status = str(payload.get("status") or "").lower()
    # Standalone RM: "healthy" | "degraded". Accept both as reachable.
    if status not in ("healthy", "degraded", "ok", "ready"):
        raise ResumeMatcherClientError(
            "resume_matcher_unhealthy",
            "Resume Matcher health check failed",
            502,
        )
    return payload


def parse_resume(filename: str, content: bytes, content_type: str) -> ParseResponse:
    safe_name = filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1] or "upload.bin"
    try:
        upload = _request(
            "POST",
            "/api/v1/resumes/upload",
            files={"file": (safe_name, content, content_type)},
            max_bytes=4_000_000,
        )
        if not isinstance(upload, dict) or not upload.get("resume_id"):
            raise ResumeMatcherClientError(
                "resume_matcher_invalid_response",
                "Resume Matcher upload response missing resume_id",
                502,
            )
        resume_id = str(upload["resume_id"])
        fetched = _request(
            "GET",
            "/api/v1/resumes",
            params={"resume_id": resume_id},
            max_bytes=4_000_000,
        )
        data = fetched.get("data") if isinstance(fetched, dict) else None
        raw = data.get("raw_resume") if isinstance(data, dict) else None
        markdown = ""
        content_type_out = "md"
        if isinstance(raw, dict):
            markdown = str(raw.get("content") or "")
            content_type_out = str(raw.get("content_type") or "md")
        if not markdown.strip():
            raise ResumeMatcherClientError(
                "resume_matcher_invalid_response",
                "Resume Matcher returned empty resume content",
                502,
            )
        return ParseResponse(
            markdown=markdown,
            content_type=content_type_out,
            original_filename=safe_name,
            byte_size=len(content),
            parser="markitdown",
            resume_id=resume_id,
            processing_status=str(upload.get("processing_status") or ""),
        )
    except ValidationError as exc:
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher parse response failed validation",
            502,
        ) from exc


def _tokenize_keywords(text: str) -> list[str]:
    tokens = re.findall(r"[A-Za-z][A-Za-z0-9+.#-]{1,}", text.lower())
    stop = {
        "and",
        "the",
        "for",
        "with",
        "you",
        "your",
        "our",
        "are",
        "will",
        "this",
        "that",
        "from",
        "have",
        "has",
        "been",
        "experience",
        "years",
        "year",
        "team",
        "work",
        "role",
        "job",
        "ability",
        "strong",
        "plus",
        "etc",
    }
    seen: list[str] = []
    for tok in tokens:
        if tok in stop or len(tok) < 2:
            continue
        if tok not in seen:
            seen.append(tok)
        if len(seen) >= 40:
            break
    return seen


def _resume_blob(resume: dict[str, Any], resume_text: str | None) -> str:
    if resume_text and resume_text.strip():
        return resume_text
    parts: list[str] = []
    for key in ("summary", "skills", "experience", "education", "projects"):
        val = resume.get(key)
        if isinstance(val, str):
            parts.append(val)
        elif isinstance(val, list):
            parts.extend(str(item) for item in val)
        elif isinstance(val, dict):
            parts.append(str(val))
    return "\n".join(parts)


def analyze_job(resume: dict[str, Any], job_description: str, resume_text: str | None = None) -> AnalyzeResponse:
    # ponytail: local keyword coverage only — full JD tailor lives in Resume Matcher UI/API.
    keywords = _tokenize_keywords(job_description)
    blob = _resume_blob(resume, resume_text).lower()
    matched = [k for k in keywords if k in blob]
    missing = [k for k in keywords if k not in blob]
    coverage = round(100.0 * len(matched) / len(keywords), 1) if keywords else 0.0
    return AnalyzeResponse(
        required_skills=keywords[:15],
        preferred_skills=[],
        keywords=keywords,
        matched_keywords=matched,
        missing_keywords=missing,
        keyword_coverage_percent=coverage,
        findings=[
            f"Matched {len(matched)} of {len(keywords)} keywords from the job description.",
        ],
        extraction_mode="deterministic",
    )


def match_resume(
    resume: dict[str, Any],
    *,
    job_keywords: dict[str, Any] | None = None,
    job_description: str | None = None,
) -> MatchResponse:
    keywords: list[str] = []
    if job_keywords:
        for key in ("required_skills", "preferred_skills", "keywords"):
            val = job_keywords.get(key)
            if isinstance(val, list):
                keywords.extend(str(item).lower() for item in val if str(item).strip())
    if job_description:
        keywords.extend(_tokenize_keywords(job_description))
    # de-dupe preserve order
    seen: list[str] = []
    for k in keywords:
        if k not in seen:
            seen.append(k)
    keywords = seen[:40]
    blob = _resume_blob(resume, None).lower()
    matched = [k for k in keywords if k in blob]
    missing = [k for k in keywords if k not in blob]
    coverage = round(100.0 * len(matched) / len(keywords), 1) if keywords else 0.0
    return MatchResponse(
        keyword_coverage_percent=coverage,
        matched_keywords=matched,
        missing_keywords=missing,
        findings=[f"Matched {len(matched)} of {len(keywords)} keywords."],
    )


def prepare_cover_letter_prompt(resume: dict[str, Any], job_description: str) -> PromptPrepResponse:
    blob = _resume_blob(resume, None)
    return PromptPrepResponse(
        task="cover-letter",
        system_prompt="You write concise, honest cover letters for students. Do not invent employers or skills.",
        user_prompt=(
            f"Job description:\n{job_description.strip()}\n\n"
            f"Resume excerpt:\n{blob[:8000]}\n\n"
            "Write a short cover letter tailored to this role."
        ),
        source="codequest-local",
    )


def prepare_application_email_prompt(resume: dict[str, Any], job_description: str) -> PromptPrepResponse:
    blob = _resume_blob(resume, None)
    return PromptPrepResponse(
        task="application-email",
        system_prompt="You write concise application emails. Do not invent employers or skills.",
        user_prompt=(
            f"Job description:\n{job_description.strip()}\n\n"
            f"Resume excerpt:\n{blob[:8000]}\n\n"
            "Write a short application email with a subject line and body."
        ),
        source="codequest-local",
    )


def upload_job_descriptions(job_descriptions: list[str], resume_id: str | None = None) -> dict[str, Any]:
    body: dict[str, Any] = {"job_descriptions": job_descriptions}
    if resume_id:
        body["resume_id"] = resume_id
    payload = _request("POST", "/api/v1/jobs/upload", json_body=body)
    if not isinstance(payload, dict):
        raise ResumeMatcherClientError(
            "resume_matcher_invalid_response",
            "Resume Matcher job upload failed validation",
            502,
        )
    return payload
