from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Project, ProjectReviewStatus, User


router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectSubmitRequest(BaseModel):
    stage_id: int
    title: str
    description: str
    github_link: str | None = None


@router.post("/submit")
def submit_project(
    payload: ProjectSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        user_id=current_user.id,
        stage_id=payload.stage_id,
        title=payload.title,
        description=payload.description,
        github_link=payload.github_link,
        review_status=ProjectReviewStatus.SUBMITTED,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"id": project.id, "status": project.review_status.value}


@router.get("/me")
def my_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return [
        {
            "id": item.id,
            "stage_id": item.stage_id,
            "title": item.title,
            "status": item.review_status.value,
            "github_link": item.github_link,
        }
        for item in projects
    ]
