import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import (
    Quiz,
    QuizCatalog,
    QuizCatalogQuestion,
    QuizQuestion,
    Submission,
    SubmissionStatus,
    User,
)


router = APIRouter(prefix="/quiz", tags=["Quiz"])


# ── Public catalog endpoints (no auth required) ───────────────────────────────

@router.get("/catalog")
def list_quiz_catalog(db: Session = Depends(get_db)):
    """Return all quizzes available in the catalog."""
    quizzes = db.query(QuizCatalog).order_by(QuizCatalog.id).all()
    return [
        {
            "id": q.slug,
            "title": q.title,
            "description": q.description,
            "difficulty": q.difficulty,
            "estimatedTime": q.estimated_time,
            "questionCount": db.query(QuizCatalogQuestion).filter_by(quiz_id=q.id).count(),
        }
        for q in quizzes
    ]


@router.get("/catalog/{slug}")
def get_quiz_catalog(slug: str, db: Session = Depends(get_db)):
    """Return a specific catalog quiz with all its questions."""
    quiz = db.query(QuizCatalog).filter_by(slug=slug).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = (
        db.query(QuizCatalogQuestion)
        .filter_by(quiz_id=quiz.id)
        .order_by(QuizCatalogQuestion.order)
        .all()
    )
    return {
        "id": quiz.slug,
        "title": quiz.title,
        "description": quiz.description,
        "difficulty": quiz.difficulty,
        "estimatedTime": quiz.estimated_time,
        "questions": [
            {
                "id": q.id,
                "type": q.question_type,
                "title": q.title,
                "prompt": q.prompt,
                "options": json.loads(q.options_json) if q.options_json else None,
                "correctIndex": q.correct_index,
                "answer": q.answer,
                "acceptableAnswers": json.loads(q.acceptable_answers_json) if q.acceptable_answers_json else None,
                "expectedOutput": q.expected_output,
                "code": q.code_snippet,
                "language": q.language,
                "explanation": q.explanation,
            }
            for q in questions
        ],
    }


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
def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    """Return a quiz by catalog slug or legacy integer ID."""
    # Try catalog slug first (public, no auth)
    catalog = db.query(QuizCatalog).filter_by(slug=quiz_id).first()
    if catalog:
        return get_quiz_catalog(quiz_id, db)

    # Fall back to legacy integer ID
    try:
        qid = int(quiz_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz = db.query(Quiz).filter(Quiz.id == qid).first()
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
