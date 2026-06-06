"""Parse and validate quiz bank spreadsheets for admin upload."""

from __future__ import annotations

import io
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.models.models import QuizCatalog, QuizCatalogQuestion
from app.schemas.quiz import QuizBankImportResult, QuizBankRowError
from app.services.quiz_engine import validate_quiz_bank_row

KNOWN_COLUMNS = (
    "quiz_slug",
    "order",
    "question_type",
    "title",
    "prompt",
    "explanation",
    "options",
    "correct_index",
    "answer",
    "acceptable_answers",
    "expected_output",
    "code_snippet",
    "language",
)

_HEADER_ALIASES: dict[str, str] = {
    "quiz": "quiz_slug",
    "slug": "quiz_slug",
    "type": "question_type",
    "question": "title",
    "question_title": "title",
    "text": "prompt",
    "question_prompt": "prompt",
    "correct_answer": "answer",
    "expected": "expected_output",
    "code": "code_snippet",
}


def _normalize_header(value: Any) -> str:
    key = str(value or "").strip().lower().replace(" ", "_").replace("-", "_")
    while "__" in key:
        key = key.replace("__", "_")
    return _HEADER_ALIASES.get(key, key)


def _coerce_row(record: dict[str, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}
    for key, value in record.items():
        if key not in KNOWN_COLUMNS:
            continue
        if pd.isna(value):
            cleaned[key] = None
            continue
        if key in {"order", "correct_index"}:
            try:
                cleaned[key] = int(value)
            except (TypeError, ValueError):
                cleaned[key] = value
            continue
        cleaned[key] = str(value).strip() if isinstance(value, str) else value
    return cleaned


def parse_quiz_bank_file(raw: bytes, filename: str) -> list[dict[str, Any]]:
    lower = filename.lower()
    if lower.endswith(".csv"):
        frame = pd.read_csv(io.BytesIO(raw))
    elif lower.endswith(".xlsx") or lower.endswith(".xls"):
        frame = pd.read_excel(io.BytesIO(raw))
    else:
        raise ValueError("Unsupported file type. Upload .csv or .xlsx")

    if frame.empty:
        raise ValueError("Spreadsheet is empty")

    frame.columns = [_normalize_header(col) for col in frame.columns]
    missing = [col for col in ("quiz_slug", "order", "question_type", "title", "prompt", "explanation") if col not in frame.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    rows: list[dict[str, Any]] = []
    for record in frame.to_dict(orient="records"):
        rows.append(_coerce_row(record))
    return rows


def import_quiz_bank_rows(db: Session, rows: list[dict[str, Any]]) -> QuizBankImportResult:
    errors: list[QuizBankRowError] = []
    inserted = 0
    quiz_cache: dict[str, QuizCatalog] = {}

    for index, row in enumerate(rows, start=2):
        slug = str(row.get("quiz_slug") or "").strip()
        if not slug:
            errors.append(QuizBankRowError(row=index, detail="quiz_slug is required"))
            continue

        question, error = validate_quiz_bank_row(row, index)
        if error or question is None:
            errors.append(QuizBankRowError(row=index, detail=error or "Invalid row"))
            continue

        quiz = quiz_cache.get(slug)
        if quiz is None:
            quiz = db.query(QuizCatalog).filter_by(slug=slug).first()
            if quiz is None:
                quiz = QuizCatalog(
                    slug=slug,
                    title=slug.replace("-", " ").title(),
                    description=f"Imported quiz bank for {slug}",
                    difficulty="beginner",
                    estimated_time="10 min",
                )
                db.add(quiz)
                db.flush()
            quiz_cache[slug] = quiz

        question.quiz_id = quiz.id
        db.add(question)
        inserted += 1

    if inserted:
        db.commit()

    return QuizBankImportResult(inserted=inserted, rejected=len(errors), errors=errors)
