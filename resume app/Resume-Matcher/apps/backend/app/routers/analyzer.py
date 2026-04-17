"""Router for the Lean ATS Resume Analyzer."""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.analyzer import ATSAnalyzeResponse
from app.services.ats_scorer import score_resume
from app.services.lean_ai_service import get_suggestions
from app.services.local_extractor import ExtractionError, extract_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyzer", tags=["Analyzer"])

_ALLOWED_EXTENSIONS = {"pdf", "docx"}

_OPTIMIZED_MESSAGE = (
    "Your resume is already highly optimized for this role! "
    "Ensure your matching skills are highlighted in your recent experience."
)


@router.post("/analyze", response_model=ATSAnalyzeResponse)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    """Analyze a resume against a job description and return an ATS score
    with AI-powered improvement suggestions."""

    # Validate file extension
    filename = resume.filename or ""
    ext = Path(filename).suffix.lstrip(".").lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Upload a PDF or DOCX file.",
        )

    # Save upload to a temp file, extract text, then clean up
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
            tmp_path = tmp.name
            content = await resume.read()
            tmp.write(content)

        resume_text = extract_text(tmp_path, file_type=ext)
    except ExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)

    # Score
    result = score_resume(resume_text, job_description)

    # Generate suggestions only when there's meaningful room for improvement
    if result.ats_score < 85 and result.missing_skills:
        # Derive a rough job role from the first line of the JD
        job_role = job_description.strip().split("\n")[0][:120]
        suggestions = get_suggestions(job_role, result.missing_skills)
    else:
        suggestions = _OPTIMIZED_MESSAGE

    return ATSAnalyzeResponse(
        ats_score=result.ats_score,
        matching_skills=result.matching_skills,
        missing_skills=result.missing_skills,
        suggestions=suggestions,
    )
