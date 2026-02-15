"""Request/Response schemas for code execution API."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional


class ExecuteRequest(BaseModel):
    """Request model for code execution."""
    
    code: str = Field(..., description="Code to execute")
    language: str = Field(..., description="Programming language (javascript, python, java, sql)")
    
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
