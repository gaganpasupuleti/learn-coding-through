"""Code execution API endpoint."""

from collections import Counter, deque
from datetime import datetime, timezone
import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from models.schemas import ExecuteRequest, ExecuteResponse
from security.validator import validate_code
from executors import (
    execute_python,
    execute_javascript,
    execute_java,
    execute_sql,
    get_practice_schema,
)
from executors.java_executor import verify_java_runtime_setup

# router must be defined before it is used as a decorator
router = APIRouter()
logger = logging.getLogger(__name__)


_EXECUTION_METRICS = {
    "total_requests": 0,
    "success_count": 0,
    "failure_count": 0,
    "fallback_count": 0,
    "by_language": Counter(),
    "by_error_code": Counter(),
    "recent_failures": deque(maxlen=50),
}


def _normalize_language(language: str) -> str:
    normalized = language.lower()
    if normalized == "js":
        return "javascript"
    if normalized == "py":
        return "python"
    return normalized


def _record_result(language: str, result: dict, request_id: str) -> None:
    """Track execution telemetry for reliability monitoring."""
    _EXECUTION_METRICS["total_requests"] += 1
    _EXECUTION_METRICS["by_language"][language] += 1

    success = bool(result.get("success"))
    error_code = result.get("error_code")

    if success:
        _EXECUTION_METRICS["success_count"] += 1
        return

    _EXECUTION_METRICS["failure_count"] += 1
    if error_code:
        _EXECUTION_METRICS["by_error_code"][error_code] += 1
    if result.get("fallback_used"):
        _EXECUTION_METRICS["fallback_count"] += 1

    _EXECUTION_METRICS["recent_failures"].appendleft(
        {
            "request_id": request_id,
            "language": language,
            "error_code": error_code or "unknown",
            "timed_out": bool(result.get("timed_out")),
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        }
    )


def _build_fallback_result(language: str, request_id: str, detail: str) -> dict:
    """Return deterministic degraded response when executor crashes unexpectedly."""
    return {
        "success": False,
        "output": "",
        "error": f"Sandbox temporarily degraded: {detail}",
        "execution_time": 0.0,
        "language": language,
        "error_code": "executor_error",
        "timed_out": False,
        "truncated": False,
        "degraded_mode": True,
        "fallback_used": True,
        "request_id": request_id,
    }


@router.post("/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest) -> ExecuteResponse:
    """
    Execute code in specified language.

    Raises:
        HTTPException 400: code fails security validation or unsupported language
        HTTPException 500: executor raised an unexpected error
    """
    request_id = uuid4().hex[:12]
    is_valid, error_message = validate_code(request.code, request.language)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    language = _normalize_language(request.language)
    timeout = request.timeout_seconds
    executor_map = {
        "python": execute_python,
        "javascript": execute_javascript,
        "java": execute_java,
        "sql": execute_sql,
    }

    try:
        if language not in executor_map:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: {request.language}",
            )
        result = executor_map[language](request.code, timeout=timeout)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("sandbox_executor_crash request_id=%s language=%s", request_id, language)
        result = _build_fallback_result(language, request_id, str(exc))

    if not isinstance(result, dict):
        result = _build_fallback_result(language, request_id, "Invalid executor response payload")

    result.setdefault("language", language)
    result.setdefault("timed_out", False)
    result.setdefault("truncated", False)
    result.setdefault("degraded_mode", False)
    result.setdefault("fallback_used", False)
    result.setdefault("request_id", request_id)

    if not result.get("success") and result.get("error_code") in {"runtime_unavailable", "executor_error"}:
        result["degraded_mode"] = True
        result["fallback_used"] = True
        if result.get("error"):
            result["error"] = f"{result['error']} (request_id={request_id})"

    _record_result(language, result, request_id)
    return ExecuteResponse(**result)


@router.get("/sql/schema")
async def sql_practice_schema():
    """Return SQL practice schema metadata for frontend helper UI."""
    return get_practice_schema()


@router.get("/execute/health")
async def execution_health() -> dict:
    """Lightweight per-language executor smoke tests."""
    java_ready = True
    java_error = None
    try:
        verify_java_runtime_setup()
    except Exception as exc:
        java_ready = False
        java_error = str(exc)

    checks = {
        "python": execute_python("print('ok')", timeout=3),
        "javascript": execute_javascript("console.log('ok')", timeout=3),
        "sql": execute_sql("SELECT 1 as ok;", timeout=3),
    }

    checks["java"] = (
        execute_java(
            "public class Main { public static void main(String[] args) { System.out.println(\"ok\"); } }",
            timeout=3,
        )
        if java_ready
        else {
            "success": False,
            "output": "",
            "error": java_error,
            "execution_time": 0.0,
            "language": "java",
            "error_code": "runtime_unavailable",
            "timed_out": False,
            "truncated": False,
        }
    )

    all_ok = all(check.get("success") for check in checks.values())
    return {
        "status": "ok" if all_ok else "degraded",
        "checks": checks,
        "fallback_count": _EXECUTION_METRICS["fallback_count"],
        "recent_failure_count": len(_EXECUTION_METRICS["recent_failures"]),
    }


@router.get("/execute/metrics")
async def execution_metrics() -> dict:
    """Expose lightweight runtime telemetry for reliability diagnostics."""
    return {
        "total_requests": _EXECUTION_METRICS["total_requests"],
        "success_count": _EXECUTION_METRICS["success_count"],
        "failure_count": _EXECUTION_METRICS["failure_count"],
        "fallback_count": _EXECUTION_METRICS["fallback_count"],
        "by_language": dict(_EXECUTION_METRICS["by_language"]),
        "by_error_code": dict(_EXECUTION_METRICS["by_error_code"]),
        "recent_failures": list(_EXECUTION_METRICS["recent_failures"]),
    }
