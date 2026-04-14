import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Resume, Role, User


router = APIRouter(prefix="/resume", tags=["Resume"])


# ── Schemas ─────────────────────────────────────────────────────────────────────


class ExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class EducationItem(BaseModel):
    degree: str = ""
    school: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: str = ""
    url: str = ""


class ResumeCreateRequest(BaseModel):
    title: str = "Untitled Resume"
    template: str = "modern"
    full_name: str
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    website: str | None = None
    summary: str = ""
    skills: list[str] = []
    experience: list[ExperienceItem] = []
    education: list[EducationItem] = []
    projects: list[ProjectItem] = []
    certifications: list[str] = []
    role_id: int | None = None


class ResumeUpdateRequest(BaseModel):
    title: str | None = None
    template: str | None = None
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    website: str | None = None
    summary: str | None = None
    skills: list[str] | None = None
    experience: list[ExperienceItem] | None = None
    education: list[EducationItem] | None = None
    projects: list[ProjectItem] | None = None
    certifications: list[str] | None = None
    role_id: int | None = None


# ── Helpers ─────────────────────────────────────────────────────────────────────


def _serialize_resume(r: Resume) -> dict:
    return {
        "id": r.id,
        "user_id": r.user_id,
        "role_id": r.role_id,
        "title": r.title,
        "template": r.template,
        "full_name": r.full_name,
        "email": r.email,
        "phone": r.phone,
        "location": r.location,
        "website": r.website,
        "summary": r.summary,
        "skills": json.loads(r.skills) if r.skills else [],
        "experience": json.loads(r.experience) if r.experience else [],
        "education": json.loads(r.education) if r.education else [],
        "projects": json.loads(r.projects) if r.projects else [],
        "certifications": json.loads(r.certifications) if r.certifications else [],
        "ats_score": r.ats_score,
        "pdf_url": r.pdf_url,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def _calculate_ats_score(role_skills: list[str], user_skills: list[str]) -> int:
    if not role_skills:
        return 0
    normalized_role = {s.strip().lower() for s in role_skills}
    normalized_user = {s.strip().lower() for s in user_skills}
    matched = len(normalized_role.intersection(normalized_user))
    return int((matched / len(normalized_role)) * 100)


def _get_user_resume(db: Session, resume_id: int, user_id: int) -> Resume:
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


# ── Endpoints ───────────────────────────────────────────────────────────────────


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
    return [_serialize_resume(r) for r in resumes]


@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_user_resume(db, resume_id, current_user.id)
    return _serialize_resume(resume)


@router.post("/build")
def create_resume(
    payload: ResumeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role_skills: list[str] = []
    if payload.role_id:
        role = db.query(Role).filter(Role.id == payload.role_id).first()
        if role:
            role_skills = json.loads(role.skills_required) if role.skills_required else []

    ats_score = _calculate_ats_score(role_skills, payload.skills)

    resume = Resume(
        user_id=current_user.id,
        role_id=payload.role_id,
        title=payload.title,
        template=payload.template,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        location=payload.location,
        website=payload.website,
        summary=payload.summary,
        skills=json.dumps(payload.skills),
        experience=json.dumps([e.model_dump() for e in payload.experience]),
        education=json.dumps([e.model_dump() for e in payload.education]),
        projects=json.dumps([p.model_dump() for p in payload.projects]),
        certifications=json.dumps(payload.certifications),
        ats_score=ats_score,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


@router.patch("/{resume_id}")
def update_resume(
    resume_id: int,
    payload: ResumeUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_user_resume(db, resume_id, current_user.id)

    if payload.title is not None:
        resume.title = payload.title
    if payload.template is not None:
        resume.template = payload.template
    if payload.full_name is not None:
        resume.full_name = payload.full_name
    if payload.email is not None:
        resume.email = payload.email
    if payload.phone is not None:
        resume.phone = payload.phone
    if payload.location is not None:
        resume.location = payload.location
    if payload.website is not None:
        resume.website = payload.website
    if payload.summary is not None:
        resume.summary = payload.summary
    if payload.skills is not None:
        resume.skills = json.dumps(payload.skills)
    if payload.experience is not None:
        resume.experience = json.dumps([e.model_dump() for e in payload.experience])
    if payload.education is not None:
        resume.education = json.dumps([e.model_dump() for e in payload.education])
    if payload.projects is not None:
        resume.projects = json.dumps([p.model_dump() for p in payload.projects])
    if payload.certifications is not None:
        resume.certifications = json.dumps(payload.certifications)
    if payload.role_id is not None:
        resume.role_id = payload.role_id

    # Recalculate ATS if skills or role changed
    if payload.skills is not None or payload.role_id is not None:
        skills = payload.skills if payload.skills is not None else json.loads(resume.skills)
        role_skills: list[str] = []
        if resume.role_id:
            role = db.query(Role).filter(Role.id == resume.role_id).first()
            if role and role.skills_required:
                role_skills = json.loads(role.skills_required)
        resume.ats_score = _calculate_ats_score(role_skills, skills)

    resume.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(resume)
    return _serialize_resume(resume)


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_user_resume(db, resume_id, current_user.id)
    db.delete(resume)
    db.commit()
    return {"detail": "Resume deleted"}
