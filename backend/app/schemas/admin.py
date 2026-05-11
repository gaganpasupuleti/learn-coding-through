from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AdminStudentResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    xp_points: int
    streak_days: int
    credit_balance: int
    selected_role_id: int | None
    cohort_name: str | None
    batch_name: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminStudentCreateRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="student")
    xp_points: int = Field(default=0, ge=0)
    streak_days: int = Field(default=0, ge=0)
    credit_balance: int = Field(default=100, ge=0)
    selected_role_id: int | None = None
    cohort_name: str | None = Field(default=None, max_length=120)
    batch_name: str | None = Field(default=None, max_length=120)
    is_active: bool = True


class AdminStudentUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    role: str | None = None
    xp_points: int | None = Field(default=None, ge=0)
    streak_days: int | None = Field(default=None, ge=0)
    credit_balance: int | None = Field(default=None, ge=0)
    selected_role_id: int | None = None
    cohort_name: str | None = Field(default=None, max_length=120)
    batch_name: str | None = Field(default=None, max_length=120)
    is_active: bool | None = None


class AdminMetricsResponse(BaseModel):
    total_students: int
    total_admins: int
    active_students: int
    inactive_students: int
    average_credits: float
    average_xp_points: float


class AdminMonthlyKpiResponse(BaseModel):
    month_label: str
    total_enrolled_students: int
    enquiries_this_month: int
    classes_starting_this_month: int
    classes_completing_this_month: int
    active_classes_running: int
    open_jobs: int
    hires_this_month: int


class AdminActivityLogResponse(BaseModel):
    id: int
    admin_user_id: int
    target_user_id: int | None
    action: str
    details: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class PieSliceResponse(BaseModel):
    label: str
    value: int


class BatchListResponse(BaseModel):
    id: int
    name: str
    track: str
    days: str
    time_ist: str
    mode: str
    mentor_name: str | None
    start_date: str
    seats_total: int
    seats_filled: int


class ClassStudentDetailResponse(BaseModel):
    user_id: int
    full_name: str
    enrollment_role: str
    college_info: str | None
    year_or_grad: str | None
    attendance_pct: int
    project_title: str | None
    project_status: str


class ClassInsightsResponse(BaseModel):
    batch: BatchListResponse
    attendance_pie: list[PieSliceResponse]
    project_status_pie: list[PieSliceResponse]
    students: list[ClassStudentDetailResponse]


class JobPostCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    company_name: str = Field(..., min_length=2, max_length=180)
    location: str = Field(..., min_length=2, max_length=120)
    employment_type: str = Field(default="Full-time", min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=2000)
    eligible_batch_id: int | None = None


class JobPostResponse(BaseModel):
    id: int
    title: str
    company_name: str
    location: str
    employment_type: str
    description: str | None
    external_apply_url: str | None = None
    listing_metadata: dict | None = None
    status: str
    eligible_batch_id: int | None
    eligible_batch_name: str | None
    applications_count: int
    created_at: datetime


class RoleInsightItem(BaseModel):
    label: str
    value: int


class RoleSplitInsightsResponse(BaseModel):
    student_insights: list[RoleInsightItem]
    faculty_insights: list[RoleInsightItem]


class AdminRegistrationWaitlistResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    source: str
    status: str
    attempt_count: int
    first_attempted_at: datetime
    last_attempted_at: datetime

    class Config:
        from_attributes = True


class AdminRegistrationWaitlistStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|approved|rejected)$")


class AdminUserActivityResponse(BaseModel):
    id: int
    user_id: int | None
    event_type: str
    route: str
    method: str | None
    status_code: int | None
    duration_ms: int | None
    metadata_json: str | None
    occurred_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Platform overview
# ---------------------------------------------------------------------------

class AdminPlatformOverviewResponse(BaseModel):
    total_users: int
    active_users: int
    total_admins: int
    total_batches: int
    active_batches: int
    total_jobs_open: int
    total_jobs_closed: int
    total_job_applications: int
    total_hires: int
    catalog_quizzes: int
    catalog_projects: int
    waitlist_pending: int
    waitlist_approved: int
    waitlist_rejected: int


# ---------------------------------------------------------------------------
# Batch CRUD
# ---------------------------------------------------------------------------

class BatchCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=180)
    track: str = Field(..., min_length=2, max_length=180)
    days: str = Field(..., min_length=2, max_length=80)
    time_ist: str = Field(..., min_length=2, max_length=80)
    mode: str = Field(default="online", pattern="^(online|hybrid)$")
    start_date: str = Field(..., min_length=10, max_length=10)
    seats_total: int = Field(default=30, ge=1, le=500)


class BatchUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=180)
    track: str | None = Field(default=None, min_length=2, max_length=180)
    days: str | None = Field(default=None, min_length=2, max_length=80)
    time_ist: str | None = Field(default=None, min_length=2, max_length=80)
    mode: str | None = Field(default=None, pattern="^(online|hybrid)$")
    start_date: str | None = Field(default=None, min_length=10, max_length=10)
    seats_total: int | None = Field(default=None, ge=1, le=500)


# ---------------------------------------------------------------------------
# Job update
# ---------------------------------------------------------------------------

class JobPostUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    company_name: str | None = Field(default=None, min_length=2, max_length=180)
    location: str | None = Field(default=None, min_length=2, max_length=120)
    employment_type: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=2000)
    status: str | None = Field(default=None, pattern="^(open|closed)$")
    eligible_batch_id: int | None = None
