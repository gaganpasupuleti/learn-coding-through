from datetime import date, datetime, time, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import require_admin
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import (
    AdminActivityLog,
    BatchEnrollment,
    BatchMode,
    EnrollmentRole,
    JobApplication,
    JobApplicationStatus,
    JobPost,
    JobPostStatus,
    LearningBatch,
    ProjectWorkStatus,
    User,
    UserRole,
)
from app.schemas.admin import (
    AdminActivityLogResponse,
    AdminMetricsResponse,
    AdminMonthlyKpiResponse,
    AdminStudentCreateRequest,
    AdminStudentResponse,
    AdminStudentUpdateRequest,
    BatchListResponse,
    ClassInsightsResponse,
    ClassStudentDetailResponse,
    JobPostCreateRequest,
    JobPostResponse,
    PieSliceResponse,
    RoleInsightItem,
    RoleSplitInsightsResponse,
)


router = APIRouter(prefix="/admin", tags=["Admin"])


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

    jobs = [
        JobPost(
            title="Junior Python Developer",
            company_name="TechWave Labs",
            location="Hyderabad",
            employment_type="Full-time",
            description="Backend API and SQL fundamentals",
            status=JobPostStatus.OPEN,
            eligible_batch_id=batches[0].id,
            created_by_user_id=admin_user.id,
        ),
        JobPost(
            title="Data Analyst Intern",
            company_name="InsightStack",
            location="Bengaluru",
            employment_type="Internship",
            description="SQL, dashboards and reporting",
            status=JobPostStatus.OPEN,
            eligible_batch_id=batches[1].id,
            created_by_user_id=admin_user.id,
        ),
    ]
    db.add_all(jobs)
    db.flush()

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
    if role_value not in {UserRole.STUDENT.value, UserRole.ADMIN.value}:
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
        if role_value not in {UserRole.STUDENT.value, UserRole.ADMIN.value}:
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
    total_admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
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
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    _ensure_learning_ops_demo_data(db, admin_user)
    jobs = db.query(JobPost).order_by(JobPost.created_at.desc()).all()

    responses: list[JobPostResponse] = []
    for job in jobs:
        applications_count = db.query(JobApplication).filter(JobApplication.job_post_id == job.id).count()
        responses.append(
            JobPostResponse(
                id=job.id,
                title=job.title,
                company_name=job.company_name,
                location=job.location,
                employment_type=job.employment_type,
                description=job.description,
                status=job.status.value,
                eligible_batch_id=job.eligible_batch_id,
                eligible_batch_name=job.eligible_batch.name if job.eligible_batch else None,
                applications_count=applications_count,
                created_at=job.created_at,
            )
        )
    return responses


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

    job = JobPost(
        title=payload.title,
        company_name=payload.company_name,
        location=payload.location,
        employment_type=payload.employment_type,
        description=payload.description,
        status=JobPostStatus.OPEN,
        eligible_batch_id=payload.eligible_batch_id,
        created_by_user_id=admin_user.id,
    )
    db.add(job)
    db.flush()
    _log_admin_action(db, admin_user.id, "job_created", details=f"Created job {job.title}")
    db.commit()
    db.refresh(job)

    return JobPostResponse(
        id=job.id,
        title=job.title,
        company_name=job.company_name,
        location=job.location,
        employment_type=job.employment_type,
        description=job.description,
        status=job.status.value,
        eligible_batch_id=job.eligible_batch_id,
        eligible_batch_name=job.eligible_batch.name if job.eligible_batch else None,
        applications_count=0,
        created_at=job.created_at,
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
