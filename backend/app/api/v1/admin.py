from datetime import date, datetime, time, timedelta
from typing import Final, Literal, TypedDict

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse, Response

from app.api.deps import require_admin
from app.core.config import settings
from app.core.database import get_db
from app.core.schema_ensure import ensure_admin_api_schema
from app.core.security import get_password_hash
from app.services.job_fixture_seed import seed_fixture_job_board
from app.services.job_import import build_job_template_xlsx, parse_job_import_xlsx, parse_linkedin_jobs_json
from app.models.models import (
    AdminActivityLog,
    BatchEnrollment,
    BatchMode,
    ClassSession,
    ClassSessionStatus,
    EnrollmentRole,
    JobApplication,
    JobApplicationStatus,
    JobPost,
    JobPostStatus,
    LearningBatch,
    ProjectCatalog,
    ProjectWorkStatus,
    QuizCatalog,
    RegistrationWaitlist,
    User,
    UserActivityLog,
    UserRole,
)
from app.schemas.jobs import JobImportResult, JobImportRowError
from app.schemas.schedule import ClassSessionCreate, ClassSessionResponse, ClassSessionUpdate
from app.schemas.admin import (
    AdminActivityLogResponse,
    AdminMetricsResponse,
    AdminMonthlyKpiResponse,
    AdminPlatformOverviewResponse,
    AdminRegistrationWaitlistResponse,
    AdminRegistrationWaitlistStatusUpdate,
    AdminStudentCreateRequest,
    AdminStudentResponse,
    AdminStudentUpdateRequest,
    AdminUserActivityResponse,
    BatchCreateRequest,
    BatchListResponse,
    BatchUpdateRequest,
    ClassInsightsResponse,
    ClassStudentDetailResponse,
    JobFixtureSeedResult,
    JobPostCreateRequest,
    JobPostResponse,
    JobPostUpdateRequest,
    JobReorderRequest,
    PieSliceResponse,
    RoleInsightItem,
    RoleSplitInsightsResponse,
)


def _admin_schema_guard() -> None:
    ensure_admin_api_schema()


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(_admin_schema_guard)],
)

# Job post tier caps (per uploading admin user, counting all rows in job_posts they created).
MAX_FREE_TIER_JOBS: Final[int] = 100
MAX_PRO_TIER_JOBS: Final[int] = -1  # Product convention: -1 means unlimited (no numeric cap).


class JobQuotaExceededDetail(TypedDict):
    error: Literal["QuotaExceeded"]
    message: str
    upgrade_required: bool


JOB_QUOTA_EXCEEDED_DETAIL: Final[JobQuotaExceededDetail] = {
    "error": "QuotaExceeded",
    "message": "You have reached your job upload limit.",
    "upgrade_required": True,
}


def _admin_job_quota_cap(admin_user: User) -> int | None:
    """Inclusive max jobs this admin may have created; ``None`` means unlimited."""
    if admin_user.role == UserRole.SUPER_ADMIN:
        return None
    if admin_user.email.strip().lower() in frozenset(settings.admin_pro_job_tier_emails):
        return None
    return MAX_FREE_TIER_JOBS


def _count_jobs_created_by_admin(db: Session, admin_user_id: int) -> int:
    total = db.query(func.count(JobPost.id)).filter(JobPost.created_by_user_id == admin_user_id).scalar()
    return int(total or 0)


def _job_post_response(db: Session, job: JobPost) -> JobPostResponse:
    applications_count = (
        db.query(JobApplication).filter(JobApplication.job_post_id == job.id).count()
    )
    return JobPostResponse(
        id=job.id,
        title=job.title,
        company_name=job.company_name,
        location=job.location,
        employment_type=job.employment_type,
        description=job.description,
        external_apply_url=job.external_apply_url,
        listing_metadata=job.listing_metadata,
        status=job.status.value,
        is_fixture=job.is_fixture,
        sort_order=job.sort_order,
        eligible_batch_id=job.eligible_batch_id,
        eligible_batch_name=job.eligible_batch.name if job.eligible_batch else None,
        applications_count=applications_count,
        created_at=job.created_at,
    )


def ensure_admin_job_create_quota(db: Session, admin_user: User, *, additional_jobs: int) -> None:
    """Raises ``HTTPException`` (402) when the admin would exceed their tier cap."""
    if additional_jobs < 0:
        raise ValueError("additional_jobs must be non-negative")
    cap = _admin_job_quota_cap(admin_user)
    if cap is None:
        return
    current = _count_jobs_created_by_admin(db, admin_user.id)
    if current + additional_jobs > cap:
        raise HTTPException(status_code=402, detail=JOB_QUOTA_EXCEEDED_DETAIL)


def _log_admin_action(
    db: Session,
    admin_user_id: int,
    action: str,
    target_user_id: int | None = None,
    details: str | None = None,
) -> None:
    db.add(
        AdminActivityLog(
            admin_user_id=admin_user_id,
            target_user_id=target_user_id,
            action=action,
            details=details,
        )
    )


def _to_batch_response(batch: LearningBatch) -> BatchListResponse:
    return BatchListResponse(
        id=batch.id,
        name=batch.name,
        track=batch.track,
        days=batch.days,
        time_ist=batch.time_ist,
        mode=batch.mode.value,
        mentor_name=batch.mentor.full_name if batch.mentor else None,
        start_date=batch.start_date.isoformat(),
        seats_total=batch.seats_total,
        seats_filled=batch.seats_filled,
    )


def _ensure_learning_ops_demo_data(db: Session, admin_user: User) -> None:
    has_batches = db.query(LearningBatch.id).first()
    if has_batches:
        return

    student_users = db.query(User).filter(User.role == UserRole.STUDENT).order_by(User.created_at.asc()).limit(8).all()
    if not student_users:
        return

    try:
        _seed_learning_ops_demo_data(db, admin_user, student_users)
    except Exception as exc:
        db.rollback()
        print(f"Warning: learning ops demo seed skipped: {exc}")


def _seed_learning_ops_demo_data(db: Session, admin_user: User, student_users: list[User]) -> None:
    today = date.today()
    batches = [
        LearningBatch(
            name="Cohort A - Weekday Evening",
            track="Full Stack + DSA",
            days="Mon-Wed-Fri",
            time_ist="7:00 PM - 9:00 PM",
            mode=BatchMode.ONLINE,
            mentor_user_id=admin_user.id,
            start_date=today + timedelta(days=5),
            seats_total=40,
            seats_filled=min(34, len(student_users)),
        ),
        LearningBatch(
            name="Cohort B - Weekend Morning",
            track="Data Science + SQL",
            days="Sat-Sun",
            time_ist="10:00 AM - 1:00 PM",
            mode=BatchMode.HYBRID,
            mentor_user_id=admin_user.id,
            start_date=today + timedelta(days=10),
            seats_total=35,
            seats_filled=min(27, len(student_users)),
        ),
    ]
    db.add_all(batches)
    db.flush()

    project_statuses = [
        ProjectWorkStatus.NOT_STARTED,
        ProjectWorkStatus.IN_PROGRESS,
        ProjectWorkStatus.SUBMITTED,
        ProjectWorkStatus.REVIEWED,
    ]

    enrollments: list[BatchEnrollment] = []
    for index, student in enumerate(student_users):
        batch = batches[index % len(batches)]
        enrollments.append(
            BatchEnrollment(
                batch_id=batch.id,
                user_id=student.id,
                enrollment_role=EnrollmentRole.STUDENT,
                attendance_pct=max(65, 95 - (index * 4)),
                college_info="Demo Engineering College",
                year_or_grad="3rd Year" if index % 2 == 0 else "Graduated 2024",
                project_title=f"Portfolio Project {index + 1}",
                project_status=project_statuses[index % len(project_statuses)],
            )
        )

    enrollments.append(
        BatchEnrollment(
            batch_id=batches[0].id,
            user_id=admin_user.id,
            enrollment_role=EnrollmentRole.FACULTY,
            attendance_pct=100,
            college_info="Mentor",
            year_or_grad="Faculty",
            project_title="",
            project_status=ProjectWorkStatus.REVIEWED,
        )
    )

    db.add_all(enrollments)
    db.flush()

    try:
        seed_fixture_job_board(
            db,
            created_by_user_id=admin_user.id,
            eligible_batch_id=batches[0].id,
        )
    except Exception as exc:
        print(f"Warning: fixture job board seed skipped in learning ops demo: {exc}")

    jobs = (
        db.query(JobPost)
        .filter(JobPost.status == JobPostStatus.OPEN)
        .order_by(JobPost.created_at.desc())
        .limit(2)
        .all()
    )
    db.flush()

    if jobs:
        for index, student in enumerate(student_users[:4]):
            db.add(
                JobApplication(
                    job_post_id=jobs[index % len(jobs)].id,
                    student_user_id=student.id,
                    status=[
                        JobApplicationStatus.APPLIED,
                        JobApplicationStatus.SHORTLISTED,
                        JobApplicationStatus.REJECTED,
                        JobApplicationStatus.HIRED,
                    ][index],
                )
            )

    _log_admin_action(db, admin_user.id, "learning_ops_seeded", details="Seeded batch and job portal demo data")
    db.commit()


@router.get("/students", response_model=list[AdminStudentResponse])
def list_students(
    search: str | None = Query(default=None, min_length=1),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User)

    if search:
        pattern = f"%{search}%"
        query = query.filter((User.full_name.ilike(pattern)) | (User.email.ilike(pattern)))

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users


@router.get("/students/{student_id}", response_model=AdminStudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/students", response_model=AdminStudentResponse)
def create_student(
    payload: AdminStudentCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role_value = payload.role.lower().strip()
    if role_value not in {UserRole.STUDENT.value, UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value}:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
        role=UserRole(role_value),
        xp_points=payload.xp_points,
        streak_days=payload.streak_days,
        credit_balance=payload.credit_balance,
        selected_role_id=payload.selected_role_id,
        cohort_name=payload.cohort_name,
        batch_name=payload.batch_name,
        is_active=payload.is_active,
    )

    db.add(user)
    db.flush()
    _log_admin_action(
        db,
        admin_user_id=admin_user.id,
        action="student_created",
        target_user_id=user.id,
        details=f"Created user {user.email} with role {user.role.value}",
    )
    db.commit()
    db.refresh(user)
    return user


@router.patch("/students/{student_id}", response_model=AdminStudentResponse)
def update_student(
    student_id: int,
    payload: AdminStudentUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    updates = payload.model_dump(exclude_unset=True)

    if "role" in updates and updates["role"] is not None:
        role_value = updates["role"].lower().strip()
        if role_value not in {UserRole.STUDENT.value, UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value}:
            raise HTTPException(status_code=400, detail="Invalid role")
        student.role = UserRole(role_value)

    changed_fields: list[str] = []

    for field_name in [
        "full_name",
        "xp_points",
        "streak_days",
        "credit_balance",
        "selected_role_id",
        "cohort_name",
        "batch_name",
        "is_active",
    ]:
        if field_name in updates:
            setattr(student, field_name, updates[field_name])
            changed_fields.append(field_name)

    if "role" in updates and updates["role"] is not None:
        changed_fields.append("role")

    db.add(student)
    _log_admin_action(
        db,
        admin_user_id=admin_user.id,
        action="student_updated",
        target_user_id=student.id,
        details=f"Updated fields: {', '.join(changed_fields)}" if changed_fields else "No-op update",
    )
    db.commit()
    db.refresh(student)
    return student


@router.get("/metrics", response_model=AdminMetricsResponse)
def get_metrics(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_admins = db.query(User).filter(User.role.in_((UserRole.ADMIN, UserRole.SUPER_ADMIN))).count()
    active_students = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active.is_(True)).count()
    inactive_students = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active.is_(False)).count()

    average_credits = db.query(func.avg(User.credit_balance)).scalar() or 0
    average_xp_points = db.query(func.avg(User.xp_points)).scalar() or 0

    return AdminMetricsResponse(
        total_students=total_students,
        total_admins=total_admins,
        active_students=active_students,
        inactive_students=inactive_students,
        average_credits=round(float(average_credits), 2),
        average_xp_points=round(float(average_xp_points), 2),
    )


@router.get("/kpis/monthly", response_model=AdminMonthlyKpiResponse)
def get_monthly_kpis(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    _ensure_learning_ops_demo_data(db, admin_user)

    today = date.today()
    month_start = today.replace(day=1)
    next_month_start = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    month_start_dt = datetime.combine(month_start, time.min)
    next_month_start_dt = datetime.combine(next_month_start, time.min)

    total_enrolled_students = (
        db.query(BatchEnrollment)
        .filter(BatchEnrollment.enrollment_role == EnrollmentRole.STUDENT)
        .count()
    )

    enquiries_this_month = (
        db.query(User)
        .filter(
            User.role == UserRole.STUDENT,
            User.created_at >= month_start_dt,
            User.created_at < next_month_start_dt,
        )
        .count()
    )

    classes_starting_this_month = (
        db.query(LearningBatch)
        .filter(
            LearningBatch.start_date >= month_start,
            LearningBatch.start_date < next_month_start,
        )
        .count()
    )

    all_batches = db.query(LearningBatch).all()
    classes_completing_this_month = 0
    active_classes_running = 0
    for batch in all_batches:
        estimated_end_date = batch.start_date + timedelta(days=120)
        if month_start <= estimated_end_date < next_month_start:
            classes_completing_this_month += 1
        if batch.start_date <= today <= estimated_end_date:
            active_classes_running += 1

    open_jobs = db.query(JobPost).filter(JobPost.status == JobPostStatus.OPEN).count()

    hires_this_month = (
        db.query(JobApplication)
        .filter(
            JobApplication.status == JobApplicationStatus.HIRED,
            JobApplication.created_at >= month_start_dt,
            JobApplication.created_at < next_month_start_dt,
        )
        .count()
    )

    return AdminMonthlyKpiResponse(
        month_label=today.strftime("%B %Y"),
        total_enrolled_students=total_enrolled_students,
        enquiries_this_month=enquiries_this_month,
        classes_starting_this_month=classes_starting_this_month,
        classes_completing_this_month=classes_completing_this_month,
        active_classes_running=active_classes_running,
        open_jobs=open_jobs,
        hires_this_month=hires_this_month,
    )


@router.get("/activity", response_model=list[AdminActivityLogResponse])
def get_admin_activity(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=25, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(AdminActivityLog)
        .order_by(AdminActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/batches", response_model=list[BatchListResponse])
def list_batches(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    _ensure_learning_ops_demo_data(db, admin_user)
    batches = db.query(LearningBatch).order_by(LearningBatch.start_date.asc(), LearningBatch.id.asc()).all()
    return [_to_batch_response(batch) for batch in batches]


@router.get("/batches/{batch_id}/insights", response_model=ClassInsightsResponse)
def get_batch_insights(
    batch_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    _ensure_learning_ops_demo_data(db, admin_user)
    batch = db.query(LearningBatch).filter(LearningBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    enrollments = (
        db.query(BatchEnrollment)
        .filter(BatchEnrollment.batch_id == batch_id)
        .order_by(BatchEnrollment.created_at.asc())
        .all()
    )

    students: list[ClassStudentDetailResponse] = []
    attendance_buckets = {"High (>=85%)": 0, "Medium (70-84%)": 0, "Low (<70%)": 0}
    project_buckets: dict[str, int] = {}

    for enrollment in enrollments:
        user = db.query(User).filter(User.id == enrollment.user_id).first()
        full_name = user.full_name if user else "Unknown"
        students.append(
            ClassStudentDetailResponse(
                user_id=enrollment.user_id,
                full_name=full_name,
                enrollment_role=enrollment.enrollment_role.value,
                college_info=enrollment.college_info,
                year_or_grad=enrollment.year_or_grad,
                attendance_pct=enrollment.attendance_pct,
                project_title=enrollment.project_title,
                project_status=enrollment.project_status.value,
            )
        )

        if enrollment.enrollment_role == EnrollmentRole.STUDENT:
            if enrollment.attendance_pct >= 85:
                attendance_buckets["High (>=85%)"] += 1
            elif enrollment.attendance_pct >= 70:
                attendance_buckets["Medium (70-84%)"] += 1
            else:
                attendance_buckets["Low (<70%)"] += 1

            label = enrollment.project_status.value.replace("_", " ").title()
            project_buckets[label] = project_buckets.get(label, 0) + 1

    attendance_pie = [PieSliceResponse(label=label, value=value) for label, value in attendance_buckets.items() if value > 0]
    project_status_pie = [PieSliceResponse(label=label, value=value) for label, value in project_buckets.items() if value > 0]

    return ClassInsightsResponse(
        batch=_to_batch_response(batch),
        attendance_pie=attendance_pie,
        project_status_pie=project_status_pie,
        students=students,
    )


@router.get("/jobs", response_model=list[JobPostResponse])
def list_jobs(
    fixture_filter: Literal["all", "fixture", "live"] = Query(default="all", alias="filter"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    _ensure_learning_ops_demo_data(db, admin_user)
    query = db.query(JobPost)
    if fixture_filter == "fixture":
        query = query.filter(JobPost.is_fixture.is_(True))
    elif fixture_filter == "live":
        query = query.filter(JobPost.is_fixture.is_(False))
    jobs = query.order_by(JobPost.sort_order.asc(), JobPost.created_at.desc()).all()
    return [_job_post_response(db, job) for job in jobs]


@router.post("/jobs", response_model=JobPostResponse)
def create_job(
    payload: JobPostCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    if payload.eligible_batch_id is not None:
        batch = db.query(LearningBatch).filter(LearningBatch.id == payload.eligible_batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail="Eligible batch not found")

    ensure_admin_job_create_quota(db, admin_user, additional_jobs=1)

    max_order = db.query(func.max(JobPost.sort_order)).scalar() or 0
    job = JobPost(
        title=payload.title,
        company_name=payload.company_name,
        location=payload.location,
        employment_type=payload.employment_type,
        description=payload.description,
        status=JobPostStatus.OPEN,
        is_fixture=False,
        sort_order=int(max_order) + 1,
        eligible_batch_id=payload.eligible_batch_id,
        created_by_user_id=admin_user.id,
    )
    db.add(job)
    db.flush()
    _log_admin_action(db, admin_user.id, "job_created", details=f"Created job {job.title}")
    db.commit()
    db.refresh(job)

    return _job_post_response(db, job)


@router.get("/jobs/import-template")
def download_job_import_template(
    admin_user: User = Depends(require_admin),
):
    _ = admin_user
    content = build_job_template_xlsx()
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="job_import_template.xlsx"'},
    )


@router.post("/jobs/import", response_model=JobImportResult)
async def import_jobs_from_spreadsheet(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    raw = await file.read()
    xfn = (file.filename or "").strip().lower()
    if xfn and not xfn.endswith(".xlsx"):
        return JSONResponse(
            status_code=400,
            content=JobImportResult(
                created=0,
                skipped=0,
                closed_previous=0,
                errors=[JobImportRowError(row=0, detail="Upload a .xlsx file (Excel)")],
            ).model_dump(mode="json"),
        )
    rows, errors, skipped = parse_job_import_xlsx(raw, db)

    if errors:
        return JSONResponse(
            status_code=400,
            content=JobImportResult(
                created=0,
                skipped=skipped,
                closed_previous=0,
                errors=[JobImportRowError(row=r, detail=d) for r, d in errors],
            ).model_dump(mode="json"),
        )

    ensure_admin_job_create_quota(db, admin_user, additional_jobs=len(rows))

    created = 0
    for row in rows:
        job = JobPost(
            title=row["title"],
            company_name=row["company_name"],
            location=row["location"],
            employment_type=row["employment_type"],
            description=row["description"],
            status=JobPostStatus.OPEN,
            eligible_batch_id=row["eligible_batch_id"],
            created_by_user_id=admin_user.id,
        )
        db.add(job)
        created += 1

    _log_admin_action(db, admin_user.id, "jobs_imported", details=f"Excel import: {created} jobs created")
    db.commit()

    return JobImportResult(created=created, skipped=skipped, closed_previous=0, errors=[])


@router.post("/jobs/import-linkedin-json", response_model=JobImportResult)
async def import_jobs_from_linkedin_json(
    file: UploadFile = File(...),
    replace_open_jobs: str = Form("false"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    replace_flag = replace_open_jobs.lower() in ("1", "true", "yes", "on")
    raw = await file.read()
    fn = (file.filename or "").strip().lower()
    # If the client omitted Content-Disposition filename, fn may be empty — still allow valid JSON bytes.
    if fn and not fn.endswith(".json"):
        return JSONResponse(
            status_code=400,
            content=JobImportResult(
                created=0,
                skipped=0,
                closed_previous=0,
                errors=[JobImportRowError(row=0, detail="Upload a .json file (or omit filename and send raw JSON bytes)")],
            ).model_dump(mode="json"),
        )
    rows, parse_errors, skipped = parse_linkedin_jobs_json(raw)

    if not rows and parse_errors and any(r == 0 for r, _ in parse_errors):
        return JSONResponse(
            status_code=400,
            content=JobImportResult(
                created=0,
                skipped=skipped,
                closed_previous=0,
                errors=[JobImportRowError(row=r, detail=d) for r, d in parse_errors],
            ).model_dump(mode="json"),
        )

    closed_previous = 0
    if replace_flag:
        open_jobs = db.query(JobPost).filter(JobPost.status == JobPostStatus.OPEN).all()
        for job in open_jobs:
            job.status = JobPostStatus.CLOSED
        closed_previous = len(open_jobs)
        db.flush()

    existing_urls = set(
        db.scalars(
            select(JobPost.external_apply_url).where(
                JobPost.external_apply_url.is_not(None),
                JobPost.status == JobPostStatus.OPEN,
            )
        ).all()
    )

    planned_creates = 0
    for row in rows:
        url = row.get("external_apply_url")
        if url and url in existing_urls:
            continue
        planned_creates += 1

    ensure_admin_job_create_quota(db, admin_user, additional_jobs=planned_creates)

    created = 0
    for row in rows:
        url = row.get("external_apply_url")
        if url and url in existing_urls:
            skipped += 1
            continue
        job = JobPost(
            title=row["title"],
            company_name=row["company_name"],
            location=row["location"],
            employment_type=row["employment_type"],
            description=row["description"],
            external_apply_url=url,
            listing_metadata=row["listing_metadata"],
            status=JobPostStatus.OPEN,
            eligible_batch_id=row["eligible_batch_id"],
            created_by_user_id=admin_user.id,
        )
        db.add(job)
        created += 1
        if url:
            existing_urls.add(url)

    err_models = [JobImportRowError(row=r, detail=d) for r, d in parse_errors]
    try:
        _log_admin_action(
            db,
            admin_user.id,
            "jobs_imported",
            details=(
                f"LinkedIn JSON import: {created} created, {skipped} skipped, "
                f"{closed_previous} previous open jobs closed"
            ),
        )
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        detail = str(exc)
        if len(detail) > 500:
            detail = detail[:497] + "..."
        return JSONResponse(
            status_code=500,
            content=JobImportResult(
                created=0,
                skipped=skipped,
                closed_previous=0,
                errors=[
                    JobImportRowError(
                        row=0,
                        detail=(
                            "Database error while saving jobs. Restart the API so startup migrations run, "
                            f"or run Alembic upgrades. Details: {detail}"
                        ),
                    )
                ],
            ).model_dump(mode="json"),
        )

    return JobImportResult(
        created=created,
        skipped=skipped,
        closed_previous=closed_previous,
        errors=err_models,
    )


@router.get("/role-split-insights", response_model=RoleSplitInsightsResponse)
def get_role_split_insights(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    _ensure_learning_ops_demo_data(db, admin_user)

    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    active_students = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active.is_(True)).count()
    open_jobs = db.query(JobPost).filter(JobPost.status == JobPostStatus.OPEN).count()
    hired_count = db.query(JobApplication).filter(JobApplication.status == JobApplicationStatus.HIRED).count()

    faculty_count = (
        db.query(BatchEnrollment)
        .filter(BatchEnrollment.enrollment_role == EnrollmentRole.FACULTY)
        .count()
    )
    total_batches = db.query(LearningBatch).count()
    avg_attendance = db.query(func.avg(BatchEnrollment.attendance_pct)).filter(BatchEnrollment.enrollment_role == EnrollmentRole.STUDENT).scalar() or 0
    projects_reviewed = db.query(BatchEnrollment).filter(BatchEnrollment.project_status == ProjectWorkStatus.REVIEWED).count()

    return RoleSplitInsightsResponse(
        student_insights=[
            RoleInsightItem(label="Total Students", value=total_students),
            RoleInsightItem(label="Active Students", value=active_students),
            RoleInsightItem(label="Open Jobs", value=open_jobs),
            RoleInsightItem(label="Students Hired", value=hired_count),
        ],
        faculty_insights=[
            RoleInsightItem(label="Faculty Mapped", value=faculty_count),
            RoleInsightItem(label="Total Batches", value=total_batches),
            RoleInsightItem(label="Avg Attendance %", value=round(float(avg_attendance))),
            RoleInsightItem(label="Projects Reviewed", value=projects_reviewed),
        ],
    )


@router.get("/registration-waitlist", response_model=list[AdminRegistrationWaitlistResponse])
def list_registration_waitlist(
    status: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(RegistrationWaitlist)
    if status:
        normalized = status.strip().lower()
        if normalized not in {"pending", "approved", "rejected"}:
            raise HTTPException(status_code=400, detail="Invalid status filter")
        query = query.filter(RegistrationWaitlist.status == normalized)

    return (
        query.order_by(RegistrationWaitlist.last_attempted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.patch("/registration-waitlist/{entry_id}", response_model=AdminRegistrationWaitlistResponse)
def update_registration_waitlist_status(
    entry_id: int,
    payload: AdminRegistrationWaitlistStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    entry = db.query(RegistrationWaitlist).filter(RegistrationWaitlist.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")

    old_status = entry.status
    new_status = payload.status.strip().lower()
    entry.status = new_status
    db.add(entry)

    # Activate / deactivate the corresponding user account
    linked_user = db.query(User).filter(User.email == entry.email).first()
    if linked_user:
        if new_status == "approved" and not linked_user.is_active:
            linked_user.is_active = True
            db.add(linked_user)
        elif new_status == "rejected" and linked_user.is_active and linked_user.role not in (
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        ):
            linked_user.is_active = False
            db.add(linked_user)

    _log_admin_action(
        db,
        admin_user_id=admin_user.id,
        action="waitlist_status_updated",
        details=f"{entry.email}: {old_status} -> {new_status}",
    )
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/user-activity", response_model=list[AdminUserActivityResponse])
def list_user_activity(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(UserActivityLog)
        .order_by(UserActivityLog.occurred_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------------------------
# Platform overview
# ---------------------------------------------------------------------------

@router.get("/overview", response_model=AdminPlatformOverviewResponse)
def get_platform_overview(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    today = date.today()

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_admins = db.query(User).filter(User.role.in_((UserRole.ADMIN, UserRole.SUPER_ADMIN))).count()

    total_batches = db.query(LearningBatch).count()
    active_batches = 0
    for batch in db.query(LearningBatch).all():
        if batch.start_date <= today <= batch.start_date + timedelta(days=120):
            active_batches += 1

    total_jobs_open = db.query(JobPost).filter(JobPost.status == JobPostStatus.OPEN).count()
    total_jobs_closed = db.query(JobPost).filter(JobPost.status == JobPostStatus.CLOSED).count()
    total_job_applications = db.query(JobApplication).count()
    total_hires = db.query(JobApplication).filter(JobApplication.status == JobApplicationStatus.HIRED).count()

    try:
        catalog_quizzes = db.query(QuizCatalog).count()
    except Exception:
        catalog_quizzes = 0
    try:
        catalog_projects = db.query(ProjectCatalog).count()
    except Exception:
        catalog_projects = 0

    waitlist_pending = 0
    waitlist_approved = 0
    waitlist_rejected = 0
    try:
        waitlist_pending = db.query(RegistrationWaitlist).filter(RegistrationWaitlist.status == "pending").count()
        waitlist_approved = db.query(RegistrationWaitlist).filter(RegistrationWaitlist.status == "approved").count()
        waitlist_rejected = db.query(RegistrationWaitlist).filter(RegistrationWaitlist.status == "rejected").count()
    except Exception:
        db.rollback()

    return AdminPlatformOverviewResponse(
        total_users=total_users,
        active_users=active_users,
        total_admins=total_admins,
        total_batches=total_batches,
        active_batches=active_batches,
        total_jobs_open=total_jobs_open,
        total_jobs_closed=total_jobs_closed,
        total_job_applications=total_job_applications,
        total_hires=total_hires,
        catalog_quizzes=catalog_quizzes,
        catalog_projects=catalog_projects,
        waitlist_pending=waitlist_pending,
        waitlist_approved=waitlist_approved,
        waitlist_rejected=waitlist_rejected,
    )


# ---------------------------------------------------------------------------
# Batch CRUD
# ---------------------------------------------------------------------------

@router.post("/batches", response_model=BatchListResponse)
def create_batch(
    payload: BatchCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    try:
        start = date.fromisoformat(payload.start_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid start_date (use YYYY-MM-DD)")

    batch = LearningBatch(
        name=payload.name,
        track=payload.track,
        days=payload.days,
        time_ist=payload.time_ist,
        mode=BatchMode(payload.mode),
        mentor_user_id=admin_user.id,
        start_date=start,
        seats_total=payload.seats_total,
        seats_filled=0,
    )
    db.add(batch)
    db.flush()
    _log_admin_action(db, admin_user.id, "batch_created", details=f"Created batch {batch.name}")
    db.commit()
    db.refresh(batch)
    return _to_batch_response(batch)


@router.patch("/batches/{batch_id}", response_model=BatchListResponse)
def update_batch(
    batch_id: int,
    payload: BatchUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    batch = db.query(LearningBatch).filter(LearningBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    updates = payload.model_dump(exclude_unset=True)
    changed: list[str] = []

    if "mode" in updates and updates["mode"] is not None:
        batch.mode = BatchMode(updates.pop("mode"))
        changed.append("mode")

    if "start_date" in updates and updates["start_date"] is not None:
        try:
            batch.start_date = date.fromisoformat(updates.pop("start_date"))
            changed.append("start_date")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date (use YYYY-MM-DD)")

    for field, value in updates.items():
        if value is not None:
            setattr(batch, field, value)
            changed.append(field)

    db.add(batch)
    _log_admin_action(db, admin_user.id, "batch_updated", details=f"Updated batch {batch.name}: {', '.join(changed)}")
    db.commit()
    db.refresh(batch)
    return _to_batch_response(batch)


@router.delete("/batches/{batch_id}")
def delete_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    batch = db.query(LearningBatch).filter(LearningBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    name = batch.name
    db.delete(batch)
    _log_admin_action(db, admin_user.id, "batch_deleted", details=f"Deleted batch {name}")
    db.commit()
    return {"detail": f"Batch '{name}' deleted"}


# ---------------------------------------------------------------------------
# Job update / delete
# ---------------------------------------------------------------------------

@router.patch("/jobs/{job_id}", response_model=JobPostResponse)
def update_job(
    job_id: int,
    payload: JobPostUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    job = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    updates = payload.model_dump(exclude_unset=True)
    changed: list[str] = []

    if "status" in updates and updates["status"] is not None:
        job.status = JobPostStatus(updates.pop("status"))
        changed.append("status")

    if "eligible_batch_id" in updates:
        bid = updates.pop("eligible_batch_id")
        if bid is not None:
            if not db.query(LearningBatch).filter(LearningBatch.id == bid).first():
                raise HTTPException(status_code=404, detail="Eligible batch not found")
        job.eligible_batch_id = bid
        changed.append("eligible_batch_id")

    if "is_fixture" in updates:
        job.is_fixture = bool(updates.pop("is_fixture"))
        changed.append("is_fixture")

    if "sort_order" in updates and updates["sort_order"] is not None:
        job.sort_order = int(updates.pop("sort_order"))
        changed.append("sort_order")

    for field, value in updates.items():
        if value is not None:
            setattr(job, field, value)
            changed.append(field)

    db.add(job)
    _log_admin_action(db, admin_user.id, "job_updated", details=f"Updated job {job.title}: {', '.join(changed)}")
    db.commit()
    db.refresh(job)

    return _job_post_response(db, job)


@router.put("/jobs/reorder", response_model=list[JobPostResponse])
def reorder_jobs(
    payload: JobReorderRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    for index, job_id in enumerate(payload.ordered_job_ids):
        job = db.query(JobPost).filter(JobPost.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        job.sort_order = index

    _log_admin_action(
        db,
        admin_user.id,
        "jobs_reordered",
        details=f"Reordered {len(payload.ordered_job_ids)} jobs",
    )
    db.commit()
    jobs = (
        db.query(JobPost)
        .order_by(JobPost.sort_order.asc(), JobPost.created_at.desc())
        .all()
    )
    return [_job_post_response(db, job) for job in jobs]


@router.post("/jobs/seed-fixture", response_model=JobFixtureSeedResult)
def admin_seed_fixture_jobs(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    upserted = seed_fixture_job_board(db, created_by_user_id=admin_user.id)
    _log_admin_action(db, admin_user.id, "fixture_jobs_seeded", details=f"Upserted {upserted} fixture jobs")
    db.commit()
    return JobFixtureSeedResult(
        upserted=upserted,
        message=f"Loaded {upserted} fixture job listings (students see them as normal roles).",
    )


@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    job = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    title = job.title
    db.delete(job)
    _log_admin_action(db, admin_user.id, "job_deleted", details=f"Deleted job {title}")
    db.commit()
    return {"detail": f"Job '{title}' deleted"}


# ---------------------------------------------------------------------------
# Student delete
# ---------------------------------------------------------------------------

@router.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    email = student.email
    student.is_active = False
    db.add(student)
    _log_admin_action(db, admin_user.id, "student_deactivated", target_user_id=student.id, details=f"Deactivated {email}")
    db.commit()
    return {"detail": f"Student '{email}' deactivated"}


# ---------------------------------------------------------------------------
# Class session management
# ---------------------------------------------------------------------------

@router.post("/batches/{batch_id}/sessions", response_model=ClassSessionResponse, status_code=201)
def create_session(
    batch_id: int,
    payload: ClassSessionCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    batch = db.query(LearningBatch).filter(LearningBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    session = ClassSession(
        batch_id=batch_id,
        title=payload.title,
        topic=payload.topic,
        session_date=payload.session_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=ClassSessionStatus.SCHEDULED,
        created_by_user_id=admin_user.id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/batches/{batch_id}/sessions", response_model=list[ClassSessionResponse])
def list_sessions(
    batch_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return (
        db.query(ClassSession)
        .filter(ClassSession.batch_id == batch_id)
        .order_by(ClassSession.session_date.asc(), ClassSession.start_time.asc())
        .all()
    )


@router.patch("/sessions/{session_id}", response_model=ClassSessionResponse)
def update_session(
    session_id: int,
    payload: ClassSessionUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for field in ("title", "topic", "session_date", "start_time", "end_time"):
        val = getattr(payload, field, None)
        if val is not None:
            setattr(session, field, val)
    if payload.status is not None:
        try:
            session.status = ClassSessionStatus(payload.status)
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Invalid status: {payload.status}")
    db.commit()
    db.refresh(session)
    return session


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
