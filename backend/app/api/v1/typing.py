from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import TypingAttempt, TypingMode, TypingTestType, User


router = APIRouter(prefix="/typing", tags=["Typing"])


TypingModeLiteral = Literal["sentence", "code"]
TypingTestTypeLiteral = Literal["timed", "length"]


class TypingAttemptCreateRequest(BaseModel):
    mode: TypingModeLiteral
    test_type: TypingTestTypeLiteral
    test_option: str = Field(min_length=1, max_length=20)
    language: str | None = Field(default=None, max_length=30)
    prompt_text: str = Field(min_length=1)
    typed_text: str = Field(default="")
    wpm: float = Field(ge=0, le=500)
    raw_wpm: float = Field(ge=0, le=500)
    accuracy: float = Field(ge=0, le=100)
    error_count: int = Field(ge=0)
    elapsed_seconds: int = Field(ge=0, le=86400)


class TypingAttemptResponse(BaseModel):
    id: int
    mode: TypingModeLiteral
    test_type: TypingTestTypeLiteral
    test_option: str
    language: str | None
    wpm: float
    raw_wpm: float
    accuracy: float
    error_count: int
    elapsed_seconds: int
    created_at: str


def _to_float(value: Decimal | float) -> float:
    return float(value)


def _serialize_attempt(record: TypingAttempt) -> TypingAttemptResponse:
    return TypingAttemptResponse(
        id=record.id,
        mode=record.mode.value,
        test_type=record.test_type.value,
        test_option=record.test_option,
        language=record.language,
        wpm=_to_float(record.wpm),
        raw_wpm=_to_float(record.raw_wpm),
        accuracy=_to_float(record.accuracy),
        error_count=record.error_count,
        elapsed_seconds=record.elapsed_seconds,
        created_at=record.created_at.isoformat(),
    )


@router.post("/attempts", response_model=TypingAttemptResponse)
def create_typing_attempt(
    payload: TypingAttemptCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = TypingAttempt(
        user_id=current_user.id,
        mode=TypingMode(payload.mode),
        test_type=TypingTestType(payload.test_type),
        test_option=payload.test_option,
        language=payload.language,
        prompt_text=payload.prompt_text,
        typed_text=payload.typed_text,
        wpm=round(payload.wpm, 2),
        raw_wpm=round(payload.raw_wpm, 2),
        accuracy=round(payload.accuracy, 2),
        error_count=payload.error_count,
        elapsed_seconds=payload.elapsed_seconds,
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return _serialize_attempt(record)


@router.get("/attempts", response_model=list[TypingAttemptResponse])
def list_typing_attempts(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(TypingAttempt)
        .filter(TypingAttempt.user_id == current_user.id)
        .order_by(TypingAttempt.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_serialize_attempt(record) for record in records]
