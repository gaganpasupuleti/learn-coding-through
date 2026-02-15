import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Resume, Role, User


router = APIRouter(prefix="/resume", tags=["Resume"])


class ResumeCreateRequest(BaseModel):
    role_id: int
    full_name: str
    summary: str
    skills: list[str]
    experience: str


def calculate_ats_score(role_skills: list[str], user_skills: list[str]) -> int:
    if not role_skills:
        return 0
    normalized_role = {item.strip().lower() for item in role_skills}
    normalized_user = {item.strip().lower() for item in user_skills}
    matched = len(normalized_role.intersection(normalized_user))
    return int((matched / len(normalized_role)) * 100)


@router.post("/build")
def build_resume(
    payload: ResumeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = db.query(Role).filter(Role.id == payload.role_id).first()
    role_skills = json.loads(role.skills_required) if role else []
    ats_score = calculate_ats_score(role_skills, payload.skills)

    resume = Resume(
        user_id=current_user.id,
        role_id=payload.role_id,
        full_name=payload.full_name,
        summary=payload.summary,
        skills=json.dumps(payload.skills),
        experience=payload.experience,
        ats_score=ats_score,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {"resume_id": resume.id, "ats_score": resume.ats_score}
