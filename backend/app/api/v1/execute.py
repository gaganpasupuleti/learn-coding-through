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

# router must be defined before it is used as a decorator
router = APIRouter()


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

    language = request.language.lower()
    if language == "js":
        language = "javascript"
    elif language == "py":
        language = "python"

    try:
        if language == "python":
            result = execute_python(request.code)
        elif language == "javascript":
            result = execute_javascript(request.code)
        elif language == "java":
            result = execute_java(request.code)
        elif language == "sql":
            result = execute_sql(request.code)
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
