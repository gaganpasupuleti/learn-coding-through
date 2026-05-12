from pydantic import BaseModel
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import BatchEnrollment, EnrollmentRole, User

router = APIRouter(prefix="/enrollment", tags=["Enrollment"])


class EnrollmentMeResponse(BaseModel):
    attendance_pct: int | None
    batch_names: list[str]


@router.get("/me", response_model=EnrollmentMeResponse)
def my_enrollment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(BatchEnrollment)
        .filter(
            BatchEnrollment.user_id == current_user.id,
            BatchEnrollment.enrollment_role == EnrollmentRole.STUDENT,
        )
        .all()
    )
    if not rows:
        return EnrollmentMeResponse(attendance_pct=None, batch_names=[])

    batch_names = []
    seen: set[str] = set()
    for row in rows:
        name = row.batch.name if row.batch else ""
        if name and name not in seen:
            seen.add(name)
            batch_names.append(name)

    avg_pct = round(sum(r.attendance_pct for r in rows) / len(rows))
    return EnrollmentMeResponse(attendance_pct=avg_pct, batch_names=batch_names)
