from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User, UserActivityLog


router = APIRouter(prefix="/activity", tags=["Activity"])


class RouteVisitPayload(BaseModel):
    route: str = Field(min_length=1, max_length=300)
    duration_ms: int = Field(ge=0, le=86_400_000)


@router.post("/route-visit")
def record_route_visit(
    payload: RouteVisitPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activity = UserActivityLog(
        user_id=current_user.id,
        event_type="route_visit",
        route=payload.route,
        duration_ms=payload.duration_ms,
    )
    db.add(activity)
    db.commit()
    return {"status": "ok"}
