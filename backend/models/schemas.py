"""Request/Response schemas for code execution API."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ExecuteRequest(BaseModel):
    """Request model for code execution."""
    
    code: str = Field(..., description="Code to execute")
    language: str = Field(..., description="Programming language (javascript, python, java, sql)")
    timeout_seconds: int = Field(5, ge=1, le=15, description="Execution timeout in seconds (1-15)")
    
    @field_validator("language")
    @classmethod
    def validate_language(cls, v):
        """Validate language is supported."""
        supported = ["javascript", "js", "python", "py", "java", "sql"]
        if v.lower() not in supported:
            raise ValueError(f"Language must be one of: {', '.join(supported)}")
        return v.lower()
    
    @field_validator("code")
    @classmethod
    def validate_code(cls, v):
        """Validate code is not empty."""
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        return v


class ExecuteResponse(BaseModel):
    """Response model for code execution."""
    
    success: bool = Field(..., description="Whether execution was successful")
    output: str = Field(..., description="Execution output")
    error: Optional[str] = Field(None, description="Error message if execution failed")
    execution_time: float = Field(..., description="Execution time in milliseconds")
    language: Optional[str] = Field(None, description="Language executed")
    error_code: Optional[str] = Field(None, description="Stable error category code")
    timed_out: bool = Field(False, description="Whether execution hit timeout")
    truncated: bool = Field(False, description="Whether output was truncated")
    degraded_mode: bool = Field(False, description="True when executor is in degraded fallback mode")
    fallback_used: bool = Field(False, description="True when fallback response path was used")
    request_id: Optional[str] = Field(None, description="Execution request identifier for tracing")
