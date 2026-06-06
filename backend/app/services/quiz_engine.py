"""Catalog quiz attempt lifecycle: shuffle, grade, persist."""

from __future__ import annotations

import json
import random
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.models import QuizCatalog, QuizCatalogAttempt, QuizCatalogQuestion
from app.schemas.quiz import (
    QuizAttemptSubmitResponse,
    QuizWrongAnswer,
    NormalizedQuestionType,
)

PASS_PERCENTAGE = 60

QUESTION_TYPE_ALIASES: dict[str, NormalizedQuestionType] = {
    "mcq": "multiple-choice",
    "multiple_choice": "multiple-choice",
    "multiple-choice": "multiple-choice",
    "true_false": "true-false",
    "true-false": "true-false",
    "fill_blank": "fill-blank",
    "fill_in_the_blank": "fill-blank",
    "fill-blank": "fill-blank",
    "code_output": "code-output",
    "code-output": "code-output",
    "code_completion": "code-completion",
    "code-completion": "code-completion",
    "sql_query": "sql-query",
    "sql-query": "sql-query",
    "python_debug": "python-debug",
    "python_debugging": "python-debug",
    "python-debug": "python-debug",
    "scenario": "scenario",
    "scenario_based": "scenario",
}


def normalize_question_type(raw: str) -> NormalizedQuestionType | None:
    key = raw.strip().lower().replace(" ", "_")
    return QUESTION_TYPE_ALIASES.get(key)


def normalize_text(value: str) -> str:
    return value.strip().replace("\r\n", "\n")


def split_pipe_list(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [part.strip() for part in str(raw).split("|") if part.strip()]


def start_catalog_attempt(db: Session, *, user_id: int, quiz_slug: str) -> dict[str, Any]:
    quiz = db.query(QuizCatalog).filter_by(slug=quiz_slug).first()
    if not quiz:
        raise ValueError("Quiz not found")

    questions = (
        db.query(QuizCatalogQuestion)
        .filter_by(quiz_id=quiz.id)
        .order_by(QuizCatalogQuestion.order)
        .all()
    )
    if not questions:
        raise ValueError("Quiz has no questions")

    question_order = [question.id for question in questions]
    random.shuffle(question_order)

    option_orders: dict[str, list[int]] = {}
    for question in questions:
        qtype = normalize_question_type(question.question_type) or question.question_type
        if qtype not in {"multiple-choice", "true-false", "scenario"}:
            continue
        options = json.loads(question.options_json) if question.options_json else []
        if len(options) < 2:
            continue
        indices = list(range(len(options)))
        random.shuffle(indices)
        option_orders[str(question.id)] = indices

    attempt_id = str(uuid.uuid4())
    attempt = QuizCatalogAttempt(
        id=attempt_id,
        user_id=user_id,
        quiz_id=quiz.id,
        quiz_slug=quiz.slug,
        question_order_json=json.dumps(question_order),
        option_orders_json=json.dumps(option_orders),
        status="in_progress",
        created_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "quiz_slug": quiz.slug,
        "question_order": question_order,
        "option_orders": option_orders,
    }


def _grade_answer(question: QuizCatalogQuestion, raw_answer: Any, option_order: list[int] | None) -> tuple[bool, str, str]:
    qtype = normalize_question_type(question.question_type) or question.question_type
    answer_text = normalize_text(str(raw_answer))

    if qtype in {"multiple-choice", "true-false", "scenario"} and question.options_json:
        try:
            selected_index = int(float(raw_answer))
        except (TypeError, ValueError):
            return False, answer_text, ""

        options = json.loads(question.options_json)
        correct_index = question.correct_index if question.correct_index is not None else -1
        if option_order and len(option_order) == len(options):
            if selected_index < 0 or selected_index >= len(option_order):
                return False, answer_text, options[correct_index] if 0 <= correct_index < len(options) else ""
            original_selected = option_order[selected_index]
            is_correct = original_selected == correct_index
            user_label = options[original_selected] if 0 <= original_selected < len(options) else answer_text
            correct_label = options[correct_index] if 0 <= correct_index < len(options) else ""
            return is_correct, user_label, correct_label

        correct_index = question.correct_index if question.correct_index is not None else -1
        is_correct = selected_index == correct_index
        user_label = options[selected_index] if 0 <= selected_index < len(options) else answer_text
        correct_label = (
            options[correct_index] if 0 <= correct_index < len(options) else ""
        )
        return is_correct, user_label, correct_label

    if qtype in {"fill-blank", "code-completion", "sql-query", "python-debug", "scenario"}:
        acceptable = []
        if question.acceptable_answers_json:
            acceptable = json.loads(question.acceptable_answers_json)
        if question.answer:
            acceptable.append(question.answer)
        acceptable_normalized = {normalize_text(item) for item in acceptable if item}
        is_correct = answer_text in acceptable_normalized
        correct_label = question.answer or (acceptable[0] if acceptable else "")
        return is_correct, answer_text, correct_label

    if qtype == "code-output":
        expected = normalize_text(question.expected_output or "")
        is_correct = answer_text == expected
        return is_correct, answer_text, expected

    return False, answer_text, question.answer or ""


def submit_catalog_attempt(
    db: Session,
    *,
    attempt_id: str,
    user_id: int,
    answers: list[dict[str, Any]],
    time_taken_seconds: int,
) -> QuizAttemptSubmitResponse:
    attempt = db.query(QuizCatalogAttempt).filter_by(id=attempt_id, user_id=user_id).first()
    if not attempt:
        raise ValueError("Attempt not found")
    if attempt.status == "submitted":
        raise ValueError("Attempt already submitted")

    quiz = db.query(QuizCatalog).filter_by(id=attempt.quiz_id).first()
    if not quiz:
        raise ValueError("Quiz not found")

    questions = db.query(QuizCatalogQuestion).filter_by(quiz_id=quiz.id).all()
    question_map = {question.id: question for question in questions}
    option_orders = json.loads(attempt.option_orders_json or "{}")
    answer_map = {int(item["question_id"]): item["answer"] for item in answers}

    correct_count = 0
    wrong_answers: list[QuizWrongAnswer] = []
    serialized_answers: list[dict[str, Any]] = []

    for question_id, question in question_map.items():
        if question_id not in answer_map:
            continue
        raw_answer = answer_map[question_id]
        option_order = option_orders.get(str(question_id))
        is_correct, user_label, correct_label = _grade_answer(question, raw_answer, option_order)
        serialized_answers.append({"question_id": question_id, "answer": raw_answer, "is_correct": is_correct})
        if is_correct:
            correct_count += 1
        else:
            wrong_answers.append(
                QuizWrongAnswer(
                    question_id=question_id,
                    question_type=question.question_type,
                    title=question.title,
                    prompt=question.prompt,
                    user_answer=user_label,
                    correct_answer=correct_label,
                    explanation=question.explanation,
                    code_snippet=question.code_snippet,
                    language=question.language,
                )
            )

    total_questions = len(question_map)
    score = int((correct_count / total_questions) * 100) if total_questions else 0
    passed = score >= PASS_PERCENTAGE

    attempt.score = score
    attempt.passed = passed
    attempt.time_taken_seconds = time_taken_seconds
    attempt.answers_json = json.dumps(serialized_answers)
    attempt.wrong_answers_json = json.dumps([item.model_dump() for item in wrong_answers])
    attempt.status = "submitted"
    attempt.submitted_at = datetime.now(timezone.utc)
    db.add(attempt)
    db.commit()

    return QuizAttemptSubmitResponse(
        attempt_id=attempt.id,
        score=score,
        passed=passed,
        correct_count=correct_count,
        total_questions=total_questions,
        time_taken_seconds=time_taken_seconds,
        wrong_answers=wrong_answers,
    )


def validate_quiz_bank_row(row: dict[str, Any], row_number: int) -> tuple[QuizCatalogQuestion | None, str | None]:
    from app.schemas.quiz import QuizBankRow

    try:
        parsed = QuizBankRow.model_validate(row)
    except Exception as exc:
        return None, str(exc)

    qtype = normalize_question_type(parsed.question_type)
    if not qtype:
        return None, f"Unsupported question_type '{parsed.question_type}'"

    options = split_pipe_list(parsed.options)
    acceptable = split_pipe_list(parsed.acceptable_answers)

    if qtype in {"multiple-choice", "true-false", "scenario"} and options:
        if parsed.correct_index is None:
            return None, "correct_index is required for choice questions"
        if parsed.correct_index < 0 or parsed.correct_index >= len(options):
            return None, "correct_index is out of range for options"

    if qtype in {"fill-blank", "code-completion", "sql-query", "python-debug"} and not (parsed.answer or acceptable):
        return None, "answer or acceptable_answers is required for text-answer questions"

    if qtype == "code-output" and not parsed.expected_output:
        return None, "expected_output is required for code-output questions"

    if qtype == "scenario" and not options and not (parsed.answer or acceptable):
        return None, "scenario questions need options or an expected answer"

    if not re.fullmatch(r"[a-z0-9-]+", parsed.quiz_slug):
        return None, "quiz_slug must be lowercase letters, numbers, and hyphens"

    question = QuizCatalogQuestion(
        order=parsed.order,
        question_type=qtype,
        title=parsed.title,
        prompt=parsed.prompt,
        explanation=parsed.explanation,
        options_json=json.dumps(options) if options else None,
        correct_index=parsed.correct_index,
        answer=parsed.answer,
        acceptable_answers_json=json.dumps(acceptable) if acceptable else None,
        expected_output=parsed.expected_output,
        code_snippet=parsed.code_snippet,
        language=parsed.language,
    )
    return question, None
