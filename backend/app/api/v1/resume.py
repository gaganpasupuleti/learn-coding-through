import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Resume, Role, User


router = APIRouter(prefix="/resume", tags=["Resume"])


# ── Schemas ───────────────────────────────────────────────────────────


class PersonalInfo(BaseModel):
    name: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str | None = None
    linkedin: str | None = None
    github: str | None = None


class ExperienceItem(BaseModel):
    id: int | None = None
    job_title: str = ""
    company: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    id: int | None = None
    institution: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class ProjectItem(BaseModel):
    id: int | None = None
    name: str = ""
    role: str = ""
    dates: str = ""
    url: str = ""
    bullets: list[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    id: int | None = None
    name: str = ""
    issuer: str = ""
    date: str = ""
    url: str = ""


class ResumeCreateRequest(BaseModel):
    title: str = "Untitled Resume"
    template: str = "modern"
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    role_id: int | None = None


class ResumeUpdateRequest(BaseModel):
    title: str | None = None
    template: str | None = None
    personal_info: PersonalInfo | None = None
    summary: str | None = None
    skills: list[str] | None = None
    experience: list[ExperienceItem] | None = None
    education: list[EducationItem] | None = None
    projects: list[ProjectItem] | None = None
    certifications: list[CertificationItem] | None = None
    languages: list[str] | None = None
    role_id: int | None = None
    is_primary: bool | None = None


class ResumeResponse(BaseModel):
    id: int
    title: str
    template: str
    personal_info: dict
    summary: str
    skills: list
    experience: list
    education: list
    projects: list
    certifications: list
    languages: list
    custom_sections: dict
    role_id: int | None
    ats_score: int
    is_primary: bool
    created_at: str
    updated_at: str


class ResumeListItem(BaseModel):
    id: int
    title: str
    template: str
    ats_score: int
    is_primary: bool
    updated_at: str


# ── Helpers ───────────────────────────────────────────────────────────


def _serialize_resume(r: Resume) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "template": r.template,
        "personal_info": json.loads(r.personal_info or "{}"),
        "summary": r.summary,
        "skills": json.loads(r.skills or "[]"),
        "experience": json.loads(r.experience or "[]"),
        "education": json.loads(r.education or "[]"),
        "projects": json.loads(r.projects or "[]"),
        "certifications": json.loads(r.certifications or "[]"),
        "languages": json.loads(r.languages or "[]"),
        "custom_sections": json.loads(r.custom_sections or "{}"),
        "role_id": r.role_id,
        "ats_score": r.ats_score,
        "is_primary": r.is_primary,
        "created_at": r.created_at.isoformat() if r.created_at else "",
        "updated_at": r.updated_at.isoformat() if r.updated_at else "",
    }


def _calculate_ats_score(role_skills: list[str], user_skills: list[str]) -> int:
    if not role_skills:
        return 0
    normalized_role = {s.strip().lower() for s in role_skills}
    normalized_user = {s.strip().lower() for s in user_skills}
    matched = len(normalized_role & normalized_user)
    return int((matched / len(normalized_role)) * 100)


def _apply_payload_to_resume(resume: Resume, payload: ResumeCreateRequest | ResumeUpdateRequest, db: Session) -> None:
    field_map = {
        "title": "title",
        "template": "template",
        "summary": "summary",
        "role_id": "role_id",
    }
    json_fields = {
        "personal_info": lambda v: v.model_dump() if v else {},
        "skills": lambda v: v if v is not None else [],
        "experience": lambda v: [i.model_dump() for i in v] if v else [],
        "education": lambda v: [i.model_dump() for i in v] if v else [],
        "projects": lambda v: [i.model_dump() for i in v] if v else [],
        "certifications": lambda v: [i.model_dump() for i in v] if v else [],
        "languages": lambda v: v if v is not None else [],
    }

    for attr, col in field_map.items():
        val = getattr(payload, attr, None)
        if val is not None:
            setattr(resume, col, val)

    for attr, serializer in json_fields.items():
        val = getattr(payload, attr, None)
        if val is not None:
            setattr(resume, attr, json.dumps(serializer(val)))

    if hasattr(payload, "is_primary") and getattr(payload, "is_primary", None) is not None:
        resume.is_primary = payload.is_primary

    # Recalculate ATS score
    skills = json.loads(resume.skills or "[]")
    rid = resume.role_id
    if rid:
        role = db.query(Role).filter(Role.id == rid).first()
        role_skills = json.loads(role.skills_required) if role else []
        resume.ats_score = _calculate_ats_score(role_skills, skills)


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/list")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "title": r.title,
            "template": r.template,
            "ats_score": r.ats_score,
            "is_primary": r.is_primary,
            "updated_at": r.updated_at.isoformat() if r.updated_at else "",
        }
        for r in resumes
    ]


@router.post("/create")
def create_resume(
    payload: ResumeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = Resume(user_id=current_user.id)
    _apply_payload_to_resume(resume, payload, db)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _serialize_resume(resume)


@router.patch("/{resume_id}")
def update_resume(
    resume_id: int,
    payload: ResumeUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    _apply_payload_to_resume(resume, payload, db)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"detail": "Resume deleted"}


@router.post("/{resume_id}/set-primary")
def set_primary_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    # Unset all other primaries
    db.query(Resume).filter(Resume.user_id == current_user.id, Resume.id != resume_id).update({"is_primary": False})
    resume.is_primary = True
    db.add(resume)
    db.commit()
    return {"detail": "Primary resume set"}


@router.post("/{resume_id}/duplicate")
def duplicate_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    source = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Resume not found")

    copy = Resume(
        user_id=current_user.id,
        title=f"{source.title} (Copy)",
        template=source.template,
        personal_info=source.personal_info,
        summary=source.summary,
        skills=source.skills,
        experience=source.experience,
        education=source.education,
        projects=source.projects,
        certifications=source.certifications,
        languages=source.languages,
        custom_sections=source.custom_sections,
        role_id=source.role_id,
        ats_score=source.ats_score,
        is_primary=False,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return _serialize_resume(copy)


# Legacy compatibility
@router.post("/build")
def build_resume(
    payload: ResumeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = Resume(user_id=current_user.id)
    _apply_payload_to_resume(resume, payload, db)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {"resume_id": resume.id, "ats_score": resume.ats_score}
