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


class ParsedResumeData(BaseModel):
    """Structured resume data extracted by the hybrid heuristic parser."""

    contact_info: str = ""
    summary: str = ""
    experience: str = ""
    education: str = ""
    projects: str = ""
    skills: str = ""


# ── Deterministically formatted output ───────────────────────────────

class ExperienceEntry(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    description: str = ""


class ProjectEntry(BaseModel):
    title: str = ""
    description: str = ""


class FinalStructuredResume(BaseModel):
    """Fully array-structured resume returned by the deterministic
    formatting layer.  No AI involved."""

    contact_info: str = ""
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    projects: list[ProjectEntry] = Field(default_factory=list)
    experience: list[ExperienceEntry] = Field(default_factory=list)
    education: list[ExperienceEntry] = Field(default_factory=list)
