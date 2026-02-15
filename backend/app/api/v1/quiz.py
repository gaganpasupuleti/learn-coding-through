from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Quiz, QuizQuestion, Submission, SubmissionStatus, User


router = APIRouter(prefix="/quiz", tags=["Quiz"])


class QuizAnswer(BaseModel):
    question_id: int
    answer: str


class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: list[QuizAnswer]


class QuizSubmitResponse(BaseModel):
    score: int
    passed: bool


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
    return {
        "id": quiz.id,
        "title": quiz.title,
        "timer_seconds": quiz.timer_seconds,
        "pass_percentage": quiz.pass_percentage,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options_json": q.options_json,
            }
            for q in questions
        ],
    }


@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = db.query(Quiz).filter(Quiz.id == payload.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
    question_map = {question.id: question.correct_answer for question in questions}
    total_questions = len(questions)

    if total_questions == 0:
        raise HTTPException(status_code=400, detail="Quiz has no questions")

    correct = 0
    for item in payload.answers:
        if question_map.get(item.question_id) == item.answer:
            correct += 1

    score = int((correct / total_questions) * 100)
    passed = score >= quiz.pass_percentage

    submission = Submission(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        status=SubmissionStatus.PASSED if passed else SubmissionStatus.FAILED,
    )
    db.add(submission)
    db.commit()

    return QuizSubmitResponse(score=score, passed=passed)
