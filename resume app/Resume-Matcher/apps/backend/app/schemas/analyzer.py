"""Pydantic schemas for the Lean ATS Analyzer endpoints."""

from pydantic import BaseModel, Field


class ATSAnalyzeResponse(BaseModel):
    """Response returned by the /analyzer/analyze endpoint."""

    ats_score: int = Field(..., ge=0, le=100, description="ATS match score (0-100)")
    matching_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    suggestions: str = Field(
        ...,
        description="AI-generated improvement suggestions or an optimized-resume message",
    )
