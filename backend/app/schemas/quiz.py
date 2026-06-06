"""Pydantic schemas for catalog quiz engine."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


QuestionTypeAlias = Literal[
    "mcq",
    "multiple-choice",
    "true_false",
    "true-false",
    "fill_blank",
    "fill-blank",
    "code_output",
    "code-output",
    "code_completion",
    "code-completion",
    "sql_query",
    "sql-query",
    "python_debug",
    "python-debug",
    "scenario",
]

NormalizedQuestionType = Literal[
    "multiple-choice",
    "true-false",
    "fill-blank",
    "code-output",
    "code-completion",
    "sql-query",
    "python-debug",
    "scenario",
]


class QuizBankRow(BaseModel):
    quiz_slug: str = Field(..., min_length=1, max_length=120)
    order: int = Field(..., ge=1)
    question_type: str = Field(..., min_length=1, max_length=40)
    title: str = Field(..., min_length=1, max_length=255)
    prompt: str = Field(..., min_length=1)
    explanation: str = Field(..., min_length=1)
    options: str | None = None
    correct_index: int | None = None
    answer: str | None = None
    acceptable_answers: str | None = None
    expected_output: str | None = None
    code_snippet: str | None = None
    language: str | None = None

    @field_validator("quiz_slug", "title", "prompt", "explanation", mode="before")
    @classmethod
    def strip_required_text(cls, value: Any) -> Any:
        if value is None:
            return value
        return str(value).strip()


class QuizBankRowError(BaseModel):
    row: int
    detail: str


class QuizBankImportResult(BaseModel):
    inserted: int
    rejected: int
    errors: list[QuizBankRowError]


class QuizAttemptAnswer(BaseModel):
    question_id: int
    answer: str | int | float | bool


class QuizAttemptStartResponse(BaseModel):
    attempt_id: str
    quiz_slug: str
    question_order: list[int]
    option_orders: dict[str, list[int]]


class QuizAttemptSubmitRequest(BaseModel):
    answers: list[QuizAttemptAnswer]
    time_taken_seconds: int = Field(..., ge=0, le=7200)


class QuizWrongAnswer(BaseModel):
    question_id: int
    question_type: str
    title: str
    prompt: str
    user_answer: str
    correct_answer: str
    explanation: str
    code_snippet: str | None = None
    language: str | None = None


class QuizAttemptSubmitResponse(BaseModel):
    attempt_id: str
    score: int
    passed: bool
    correct_count: int
    total_questions: int
    time_taken_seconds: int
    wrong_answers: list[QuizWrongAnswer]
