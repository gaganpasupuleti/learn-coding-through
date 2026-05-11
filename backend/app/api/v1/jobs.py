from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import JobApplication, JobApplicationStatus, JobPost, JobPostStatus, User, UserRole
from app.schemas.jobs import JobApplyResponse, StudentJobOpenResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/open", response_model=list[StudentJobOpenResponse])
def list_open_jobs(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    jobs = (
        db.query(JobPost)
        .filter(JobPost.status == JobPostStatus.OPEN)
        .order_by(JobPost.created_at.desc())
        .all()
    )
    return [
        StudentJobOpenResponse(
            id=j.id,
            title=j.title,
            company_name=j.company_name,
            location=j.location,
            employment_type=j.employment_type,
            description=j.description,
            external_apply_url=j.external_apply_url,
            listing_metadata=j.listing_metadata,
            eligible_batch_id=j.eligible_batch_id,
            eligible_batch_name=j.eligible_batch.name if j.eligible_batch else None,
            created_at=j.created_at,
        )
        for j in jobs
    ]


@router.post("/{job_id}/apply", response_model=JobApplyResponse)
def apply_to_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply to jobs")

    job = db.query(JobPost).filter(JobPost.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobPostStatus.OPEN:
        raise HTTPException(status_code=400, detail="This job is not accepting applications")

    existing = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_post_id == job_id,
            JobApplication.student_user_id == current_user.id,
        )
        .first()
    )
    if existing:
        return JobApplyResponse(
            job_id=job_id,
            status=existing.status.value,
            message="You have already applied to this job.",
        )

    application = JobApplication(
        job_post_id=job_id,
        student_user_id=current_user.id,
        status=JobApplicationStatus.APPLIED,
    )
    db.add(application)
    db.commit()

    return JobApplyResponse(
        job_id=job_id,
        status=JobApplicationStatus.APPLIED.value,
        message="Application submitted.",
    )
