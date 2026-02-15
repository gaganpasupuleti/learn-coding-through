from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.models import User


router = APIRouter(prefix="/interview", tags=["Interview"])


class InterviewAnswer(BaseModel):
    question_id: int
    answer: str


class InterviewSubmit(BaseModel):
    answers: list[InterviewAnswer]


HR_QUESTIONS = [
    {"id": 1, "question": "Tell me about yourself in 60 seconds."},
    {"id": 2, "question": "Describe a challenge you solved in a team."},
]


@router.get("/questions")
def get_questions(_: User = Depends(get_current_user)):
    return {"questions": HR_QUESTIONS}


@router.post("/submit")
def submit_interview(payload: InterviewSubmit, _: User = Depends(get_current_user)):
    score = min(100, len(payload.answers) * 25)
    return {
        "score": score,
        "feedback": "Strong foundation. Add more structured STAR examples for higher impact.",
    }
