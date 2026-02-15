import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.models import DifficultyLevel, Role
from app.schemas.role import RoleCreate, RoleResponse


router = APIRouter(prefix="/roles", tags=["Roles"])


def to_role_response(role: Role) -> RoleResponse:
    return RoleResponse(
        id=role.id,
        name=role.name,
        skills_required=json.loads(role.skills_required),
        salary_range=role.salary_range,
        companies_hiring=json.loads(role.companies_hiring),
        difficulty_level=role.difficulty_level.value,
        estimated_duration_weeks=role.estimated_duration_weeks,
    )


@router.post("", response_model=RoleResponse)
def create_role(payload: RoleCreate, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    role = Role(
        name=payload.name,
        skills_required=json.dumps(payload.skills_required),
        salary_range=payload.salary_range,
        companies_hiring=json.dumps(payload.companies_hiring),
        difficulty_level=DifficultyLevel(payload.difficulty_level),
        estimated_duration_weeks=payload.estimated_duration_weeks,
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return to_role_response(role)


@router.get("", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).order_by(Role.name).all()
    return [to_role_response(role) for role in roles]
