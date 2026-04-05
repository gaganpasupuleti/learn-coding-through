"""Code execution API endpoint."""

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


def _normalize_language(language: str) -> str:
    normalized = language.lower()
    if normalized == "js":
        return "javascript"
    if normalized == "py":
        return "python"
    return normalized


@router.post("/execute", response_model=ExecuteResponse)
async def execute_code(request: ExecuteRequest) -> ExecuteResponse:
    """
    Execute code in specified language.

    Raises:
        HTTPException 400: code fails security validation or unsupported language
        HTTPException 500: executor raised an unexpected error
    """
    is_valid, error_message = validate_code(request.code, request.language)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    language = _normalize_language(request.language)
    timeout = request.timeout_seconds

    try:
        if language == "python":
            result = execute_python(request.code, timeout=timeout)
        elif language == "javascript":
            result = execute_javascript(request.code, timeout=timeout)
        elif language == "java":
            result = execute_java(request.code, timeout=timeout)
        elif language == "sql":
            result = execute_sql(request.code, timeout=timeout)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: {request.language}",
            )

        return ExecuteResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")


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
    }
