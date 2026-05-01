from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import ProgressTracking, Role, Stage, User
from app.schemas.roadmap import RoleRoadmapResponse, StageResponse


router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.get("/{role_id}", response_model=RoleRoadmapResponse)
def get_role_roadmap(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    stages = db.query(Stage).filter(Stage.role_id == role_id).order_by(Stage.order_number).all()
    stage_items: list[StageResponse] = []

    previous_unlocked = True
    for index, stage in enumerate(stages):
        progress = (
            db.query(ProgressTracking)
            .filter(
                ProgressTracking.user_id == current_user.id,
                ProgressTracking.role_id == role_id,
                ProgressTracking.stage_id == stage.id,
            )
            .first()
        )
        unlocked = index == 0 or previous_unlocked
        stage_completed = progress.unlocked if progress else False
        previous_unlocked = stage_completed
        stage_items.append(
            StageResponse(
                id=stage.id,
                order_number=stage.order_number,
                title=stage.title,
                description=stage.description,
                unlock_quiz_score=stage.unlock_quiz_score,
                unlock_exercise_completion=stage.unlock_exercise_completion,
                unlocked=unlocked,
                completed=stage_completed,
            )
        )

    return RoleRoadmapResponse(role_id=role.id, role_name=role.name, stages=stage_items)
