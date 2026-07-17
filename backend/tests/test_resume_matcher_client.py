"""Unit tests for Resume Matcher outbound client (no live upstream required)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.services import resume_matcher_client as rm


def test_rejects_non_http_base_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_enabled", True)
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


def test_timeout_maps_to_stable_code(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_enabled", True)
    monkeypatch.setattr(rm.settings, "resume_matcher_base_url", "http://127.0.0.1:8001")

    with patch("app.services.resume_matcher_client.requests.request") as request:
        request.side_effect = rm.requests.Timeout()
        with pytest.raises(rm.ResumeMatcherClientError) as exc:
            rm.health()
        assert exc.value.code == "resume_matcher_timeout"


def test_validate_analyze_response(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rm.settings, "resume_matcher_enabled", True)
    monkeypatch.setattr(rm.settings, "resume_matcher_base_url", "http://127.0.0.1:8001")

    response = MagicMock()
    response.status_code = 200
    response.content = b'{"required_skills":["Python"],"preferred_skills":[],"keywords":["Python"],"matched_keywords":["Python"],"missing_keywords":[],"keyword_coverage_percent":100,"findings":["ok"],"extraction_mode":"deterministic"}'
    response.json.return_value = {
        "required_skills": ["Python"],
        "preferred_skills": [],
        "keywords": ["Python"],
        "matched_keywords": ["Python"],
        "missing_keywords": [],
        "keyword_coverage_percent": 100.0,
        "findings": ["ok"],
        "extraction_mode": "deterministic",
    }

    with patch("app.services.resume_matcher_client.requests.request", return_value=response):
        result = rm.analyze_job({"summary": "Python"}, "Looking for Python engineers with strong skills.")
    assert result.keyword_coverage_percent == 100.0
    assert result.matched_keywords == ["Python"]
