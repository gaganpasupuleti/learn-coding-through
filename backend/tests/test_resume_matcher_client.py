"""Unit tests for Resume Matcher outbound client (no live upstream required)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.services import resume_matcher_client as rm


@pytest.fixture(autouse=True)
def _enable_matcher(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_enabled", True)
    monkeypatch.setattr(rm.settings, "resume_matcher_base_url", "http://127.0.0.1:8001")
    monkeypatch.setattr(rm.settings, "resume_matcher_service_token", "")
    monkeypatch.setattr(rm.settings, "resume_matcher_max_response_bytes", 2_000_000)


def test_rejects_non_http_base_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_base_url", "ftp://evil.example")
    with pytest.raises(rm.ResumeMatcherClientError) as exc:
        rm.health()
    assert exc.value.code == "invalid_resume_matcher_url"


def test_disabled_returns_stable_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_enabled", False)
    with pytest.raises(rm.ResumeMatcherClientError) as exc:
        rm.health()
    assert exc.value.code == "resume_matcher_disabled"
    assert exc.value.status_code == 503


def test_service_token_optional_when_empty() -> None:
    response = MagicMock()
    response.status_code = 200
    response.content = b'{"status":"healthy","llm":{}}'
    response.json.return_value = {"status": "healthy", "llm": {}}
    with patch("app.services.resume_matcher_client.requests.request", return_value=response) as request:
        result = rm.health()
        assert "X-CodeQuest-Service-Token" not in request.call_args.kwargs["headers"]
    assert result["status"] == "healthy"


def test_service_token_sent_when_configured(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_service_token", "test-service-token")
    response = MagicMock()
    response.status_code = 200
    response.content = b'{"status":"healthy","llm":{}}'
    response.json.return_value = {"status": "healthy", "llm": {}}
    with patch("app.services.resume_matcher_client.requests.request", return_value=response) as request:
        rm.health()
        assert request.call_args.kwargs["headers"]["X-CodeQuest-Service-Token"] == "test-service-token"


def test_arbitrary_path_rejected() -> None:
    with pytest.raises(rm.ResumeMatcherClientError) as exc:
        rm._request("GET", "/api/v1/config/api-keys")
    assert exc.value.code == "resume_matcher_path_rejected"


def test_path_traversal_rejected() -> None:
    with pytest.raises(rm.ResumeMatcherClientError) as exc:
        rm._request("GET", "/api/v1/resumes/../config/api-keys")
    assert exc.value.code == "resume_matcher_path_rejected"


def test_timeout_maps_to_stable_code() -> None:
    with patch("app.services.resume_matcher_client.requests.request") as request:
        request.side_effect = rm.requests.Timeout()
        with pytest.raises(rm.ResumeMatcherClientError) as exc:
            rm.health()
        assert exc.value.code == "resume_matcher_timeout"


def test_redirect_rejected() -> None:
    response = MagicMock()
    response.status_code = 302
    response.content = b""
    with patch("app.services.resume_matcher_client.requests.request", return_value=response):
        with pytest.raises(rm.ResumeMatcherClientError) as exc:
            rm.health()
        assert exc.value.code == "resume_matcher_redirect_rejected"


def test_oversized_response_rejected() -> None:
    response = MagicMock()
    response.status_code = 200
    response.content = b"x" * 3_000_000
    with patch("app.services.resume_matcher_client.requests.request", return_value=response):
        with pytest.raises(rm.ResumeMatcherClientError) as exc:
            rm.health()
        assert exc.value.code == "resume_matcher_response_too_large"


def test_health_accepts_degraded() -> None:
    response = MagicMock()
    response.status_code = 200
    response.content = b'{"status":"degraded","llm":{}}'
    response.json.return_value = {"status": "degraded", "llm": {}}
    with patch("app.services.resume_matcher_client.requests.request", return_value=response):
        result = rm.health()
    assert result["status"] == "degraded"


def test_analyze_job_is_local_deterministic() -> None:
    result = rm.analyze_job(
        {"summary": "Python FastAPI engineer"},
        "Looking for Python engineers with FastAPI and strong skills.",
    )
    assert "python" in result.matched_keywords
    assert result.extraction_mode == "deterministic"
    assert result.keyword_coverage_percent > 0


def test_upstream_stack_trace_not_returned() -> None:
    response = MagicMock()
    response.status_code = 500
    response.content = b'{"detail":"Traceback (most recent call last): http://127.0.0.1:8001/secret"}'
    response.json.return_value = {
        "detail": "Traceback (most recent call last): http://127.0.0.1:8001/secret"
    }
    with patch("app.services.resume_matcher_client.requests.request", return_value=response):
        with pytest.raises(rm.ResumeMatcherClientError) as exc:
            rm.health()
        assert "http://" not in exc.value.message.lower()
        assert "traceback" not in exc.value.message.lower()
