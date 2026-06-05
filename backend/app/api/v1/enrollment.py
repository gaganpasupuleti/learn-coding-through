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
    batch_start_date: str | None = None
    selected_role_id: int | None = None


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
        return EnrollmentMeResponse(
            attendance_pct=None,
            batch_names=[],
            batch_start_date=None,
            selected_role_id=current_user.selected_role_id,
        )

    batch_names = []
    seen: set[str] = set()
    start_dates: list = []
    for row in rows:
        if row.batch:
            if row.batch.name and row.batch.name not in seen:
                seen.add(row.batch.name)
                batch_names.append(row.batch.name)
            start_dates.append(row.batch.start_date)

    avg_pct = round(sum(r.attendance_pct for r in rows) / len(rows))
    earliest_start = min(start_dates).isoformat() if start_dates else None
    return EnrollmentMeResponse(
        attendance_pct=avg_pct,
        batch_names=batch_names,
        batch_start_date=earliest_start,
        selected_role_id=current_user.selected_role_id,
    )
